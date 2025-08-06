import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { com360_product_images, importedProducts } from '@shared/schema';
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
    const existingImages = await db.query.com360_product_images.findMany({
      where: eq(com360_product_images.productId, productId)
    });

    if (existingImages.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Limite de 10 imagens por produto atingido'
      });
    }

    // Processar e comprimir a imagem
    const originalPath = file.path;
    const originalSize = file.size;
    const compressedFilename = `compressed-${file.filename}`;
    const compressedPath = path.join(path.dirname(originalPath), compressedFilename);

    // Obter metadados da imagem original
    const metadata = await sharp(originalPath).metadata();
    
    if (!metadata.width || !metadata.height) {
      fs.unlinkSync(originalPath);
      return res.status(400).json({
        success: false,
        message: 'Não foi possível obter as dimensões da imagem'
      });
    }

    // Criar pipeline de processamento
    let processedImage = sharp(originalPath);

    // Redimensionar se exceder dimensões máximas
    if (metadata.width > 2000 || metadata.height > 3000) {
      processedImage = processedImage.resize(2000, 3000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Aplicar compressão baseada no formato
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      processedImage = processedImage.jpeg({ quality: 80 });
    } else if (file.mimetype === 'image/png') {
      processedImage = processedImage.png({ quality: 80 });
    } else if (file.mimetype === 'image/webp') {
      processedImage = processedImage.webp({ quality: 80 });
    }

    // Salvar imagem comprimida
    await processedImage.toFile(compressedPath);

    // Obter metadados da imagem comprimida
    const compressedMetadata = await sharp(compressedPath).metadata();
    const compressedStats = await fs.promises.stat(compressedPath);

    // Remover arquivo original
    fs.unlinkSync(originalPath);

    // Gerar URL para a imagem comprimida
    const imageUrl = `/uploads/product-images/${compressedFilename}`;

    // Calcular taxa de compressão
    const compressionRatio = Math.round((1 - compressedStats.size / originalSize) * 100);

    // Inserir no banco de dados
    const newImage = await db.insert(com360_product_images).values({
      productId,
      filename: compressedFilename,
      originalName: file.originalname,
      url: imageUrl,
      position: parseInt(position) || existingImages.length + 1,
      size: compressedStats.size,
      mimeType: file.mimetype,
      width: compressedMetadata.width || 0,
      height: compressedMetadata.height || 0,
    }).returning();

    res.json({
      success: true,
      data: newImage[0],
      message: 'Imagem comprimida e enviada com sucesso',
      compressionInfo: {
        originalSize,
        compressedSize: compressedStats.size,
        compressionRatio
      }
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
    const images = await db.query.com360_product_images.findMany({
      where: eq(com360_product_images.productId, productId),
      orderBy: (com360_product_images, { asc }) => [asc(com360_product_images.position)]
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
    const image = await db.query.com360_product_images.findFirst({
      where: eq(com360_product_images.id, imageId),
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
    const allImages = await db.query.com360_product_images.findMany({
      where: eq(com360_product_images.productId, image.productId),
      orderBy: (com360_product_images, { asc }) => [asc(com360_product_images.position)]
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
      await tx.update(com360_product_images)
        .set({ position: targetImage.position })
        .where(eq(com360_product_images.id, currentImage.id));

      await tx.update(com360_product_images)
        .set({ position: currentImage.position })
        .where(eq(com360_product_images.id, targetImage.id));
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
    const image = await db.query.com360_product_images.findFirst({
      where: eq(com360_product_images.id, imageId),
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
    await db.delete(com360_product_images).where(eq(com360_product_images.id, imageId));

    // Reordenar posições das imagens restantes
    const remainingImages = await db.query.com360_product_images.findMany({
      where: eq(com360_product_images.productId, image.productId),
      orderBy: (com360_product_images, { asc }) => [asc(com360_product_images.position)]
    });

    if (remainingImages.length > 0) {
      await db.transaction(async (tx) => {
        for (let i = 0; i < remainingImages.length; i++) {
          await tx.update(com360_product_images)
            .set({ position: i + 1 })
            .where(eq(com360_product_images.id, remainingImages[i].id));
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

// Download de imagem
router.get('/:imageId/download', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;

    // Buscar a imagem e verificar propriedade
    const image = await db.query.com360_product_images.findFirst({
      where: eq(com360_product_images.id, imageId),
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

    // Caminho do arquivo
    const filePath = path.join(process.cwd(), 'uploads', 'product-images', image.filename);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado no servidor'
      });
    }

    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${image.originalName}"`);
    res.setHeader('Content-Type', image.mimeType);
    
    // Enviar arquivo
    res.sendFile(filePath);

  } catch (error) {
    console.error('Erro no download da imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;