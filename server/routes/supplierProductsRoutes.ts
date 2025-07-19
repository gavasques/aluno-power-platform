import { Router } from 'express';
import { SupplierProductsController } from '../controllers/SupplierProductsController';
import { requireAuth } from '../security';
import multer from 'multer';

const router = Router();

// Configurar multer para upload de arquivos Excel
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'));
    }
  },
});

// Aplicar autenticação a todas as rotas
router.use(requireAuth);

// Rotas para produtos do fornecedor
router.get('/:supplierId/products', SupplierProductsController.getSupplierProducts);
router.post('/:supplierId/products', SupplierProductsController.createSupplierProduct);
router.put('/:supplierId/products/:productId', SupplierProductsController.updateSupplierProduct);
router.delete('/:supplierId/products/:productId', SupplierProductsController.deleteSupplierProduct);

// Rotas especiais para importação e sincronização
router.post('/:supplierId/products/import', upload.single('xlsxFile'), SupplierProductsController.importProducts);
router.post('/:supplierId/products/sync', SupplierProductsController.syncProducts);

export default router;