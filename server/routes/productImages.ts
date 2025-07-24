import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { productImages, importedProducts } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'product-images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado. Use JPG, JPEG, PNG ou WebP.'));
    }
  }
});

// Upload de nova imagem
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { productId, position } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID do produto é obrigatório'
      });
    }

    // Verificar se o produto pertence ao usuário
    const product = await db.query.importedProducts.findFirst({
      where: and(
        eq(importedProducts.id, productId),
        eq(importedProducts.userId, req.user!.id)
      )
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Verificar limite de 10 imagens
    const existingImages = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId)
    });

    if (existingImages.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Limite de 10 imagens por produto atingido'
      });
    }

    // Validar dimensões da imagem
    const metadata = await sharp(file.path).metadata();
    
    if (!metadata.width || !metadata.height) {
      fs.unlinkSync(file.path); // Remover arquivo
      return res.status(400).json({
        success: false,
        message: 'Não foi possível obter as dimensões da imagem'
      });
    }

    if (metadata.width > 2000 || metadata.height > 3000) {
      fs.unlinkSync(file.path); // Remover arquivo
      return res.status(400).json({
        success: false,
        message: `Dimensões muito grandes. Máximo 2000x3000px. Recebido: ${metadata.width}x${metadata.height}px`
      });
    }

    // Gerar URL para a imagem
    const imageUrl = `/uploads/product-images/${file.filename}`;

    // Inserir no banco de dados
    const newImage = await db.insert(productImages).values({
      productId,
      filename: file.filename,
      originalName: file.originalname,
      url: imageUrl,
      position: parseInt(position) || existingImages.length + 1,
      size: file.size,
      mimeType: file.mimetype,
      width: metadata.width,
      height: metadata.height,
    }).returning();

    res.json({
      success: true,
      data: newImage[0],
      message: 'Imagem enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    
    // Remover arquivo se houver erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao remover arquivo:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar imagens de um produto
router.get('/product/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar se o produto pertence ao usuário
    const product = await db.query.importedProducts.findFirst({
      where: and(
        eq(importedProducts.id, productId),
        eq(importedProducts.userId, req.user!.id)
      )
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Buscar imagens ordenadas por posição
    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
      orderBy: (productImages, { asc }) => [asc(productImages.position)]
    });

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Mover imagem (reordenar)
router.put('/:imageId/move', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { direction } = req.body;

    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: 'Direção deve ser "up" ou "down"'
      });
    }

    // Buscar a imagem e verificar propriedade
    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, imageId),
      with: {
        product: true
      }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada'
      });
    }

    if (image.product.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Buscar todas as imagens do produto ordenadas
    const allImages = await db.query.productImages.findMany({
      where: eq(productImages.productId, image.productId),
      orderBy: (productImages, { asc }) => [asc(productImages.position)]
    });

    const currentIndex = allImages.findIndex(img => img.id === imageId);
    
    if (currentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada na lista'
      });
    }

    let targetIndex;
    if (direction === 'up') {
      targetIndex = currentIndex - 1;
    } else {
      targetIndex = currentIndex + 1;
    }

    // Verificar limites
    if (targetIndex < 0 || targetIndex >= allImages.length) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível mover a imagem nesta direção'
      });
    }

    // Trocar posições
    const currentImage = allImages[currentIndex];
    const targetImage = allImages[targetIndex];

    await db.transaction(async (tx) => {
      // Atualizar posições
      await tx.update(productImages)
        .set({ position: targetImage.position })
        .where(eq(productImages.id, currentImage.id));

      await tx.update(productImages)
        .set({ position: currentImage.position })
        .where(eq(productImages.id, targetImage.id));
    });

    res.json({
      success: true,
      message: 'Posições atualizadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao mover imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Excluir imagem
router.delete('/:imageId', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;

    // Buscar a imagem e verificar propriedade
    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, imageId),
      with: {
        product: true
      }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada'
      });
    }

    if (image.product.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Remover arquivo físico
    const filePath = path.join(process.cwd(), 'uploads', 'product-images', image.filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Erro ao remover arquivo físico:', fileError);
    }

    // Remover do banco de dados
    await db.delete(productImages).where(eq(productImages.id, imageId));

    // Reordenar posições das imagens restantes
    const remainingImages = await db.query.productImages.findMany({
      where: eq(productImages.productId, image.productId),
      orderBy: (productImages, { asc }) => [asc(productImages.position)]
    });

    if (remainingImages.length > 0) {
      await db.transaction(async (tx) => {
        for (let i = 0; i < remainingImages.length; i++) {
          await tx.update(productImages)
            .set({ position: i + 1 })
            .where(eq(productImages.id, remainingImages[i].id));
        }
      });
    }

    res.json({
      success: true,
      message: 'Imagem removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;