/**
 * Product Channels API Routes
 * Clean, modular API endpoints following REST principles
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../security';
// Simple validation middleware
const validateRequest = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.error.errors
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid request data'
      });
    }
  };
};
import { ResponseHandler } from '../utils/ResponseHandler';
import { storage } from '../storage';

const router = Router();

// Channel update schema
const channelUpdateSchema = z.object({
  channels: z.array(z.object({
    type: z.string(),
    isActive: z.boolean(),
    data: z.object({
      price: z.number().min(0),
      commissionPercent: z.number().min(0).max(50).optional(),
      commissionUpToValue: z.number().min(0).optional(),
      commissionAboveValue: z.number().min(0).optional(),
      commissionMinValue: z.number().min(0).optional(),
      commissionMaxValue: z.number().min(0).optional(),
      packagingCostValue: z.number().min(0),
      fixedCostPercent: z.number().min(0).max(20),
      marketingCostPercent: z.number().min(0).max(30),
      financialCostPercent: z.number().min(0).optional(),
      shippingCostValue: z.number().min(0).optional(),
      prepCenterCostValue: z.number().min(0).optional(),
      rebateValue: z.number().min(0).optional(),
      productCodes: z.object({
        fnsku: z.string().optional(),
        asin: z.string().optional(),
        mlb: z.string().optional(),
        mlbCatalog: z.string().optional(),
        idProduto: z.string().optional(),
        skuMgl: z.string().optional(),
        codigoSite: z.string().optional(),
      }).optional(),
    }),
  })),
});

/**
 * PUT /api/products/:id/channels
 * Update product channels configuration
 */
router.put(
  '/:id/channels',
  requireAuth,
  validateRequest(channelUpdateSchema),
  async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { channels } = req.body;
      const userId = req.user!.id;

      console.log(`🔄 [CHANNELS] Updating channels for product ${productId} by user ${userId}`);

      // Verify product ownership
      const existingProduct = await storage.getProductById(productId);
      if (!existingProduct) {
        return ResponseHandler.notFound(res, 'Product not found');
      }

      if (existingProduct.userId !== userId) {
        return ResponseHandler.forbidden(res, 'Access denied');
      }

      // Update product with new channels
      const updatedProduct = await storage.updateProduct(productId, {
        channels: channels,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ [CHANNELS] Updated ${channels.length} channels for product ${productId}`);
      console.log(`🔍 [CHANNELS] Active channels: ${channels.filter((ch: any) => ch.isActive).length}`);

      ResponseHandler.success(res, updatedProduct, 'Channels updated successfully');
    } catch (error) {
      console.error('❌ [CHANNELS] Error updating channels:', error);
      ResponseHandler.error(res, 'Failed to update channels', 500);
    }
  }
);

/**
 * GET /api/products/:id/channels
 * Get product channels configuration
 */
router.get(
  '/:id/channels',
  requireAuth,
  async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.user!.id;

      console.log(`📊 [CHANNELS] Getting channels for product ${productId} by user ${userId}`);
      console.log(`📊 [CHANNELS] Full URL path: ${req.path}`);

      // Get product with ownership verification
      const product = await storage.getProductById(productId);
      if (!product) {
        console.log(`❌ [CHANNELS] Product ${productId} not found in storage`);
        return ResponseHandler.notFound(res, 'Product not found');
      }

      if (product.userId !== userId) {
        return ResponseHandler.forbidden(res, 'Access denied');
      }

      // Return only channels data
      const channelsData = {
        productId: product.id,
        productName: product.name,
        costItem: product.costItem,
        taxPercent: product.taxPercent,
        channels: product.channels || [],
      };

      console.log(`✅ [CHANNELS] Returned channels for product ${productId}`);

      ResponseHandler.success(res, channelsData, 'Channels retrieved successfully');
    } catch (error) {
      console.error('❌ [CHANNELS] Error getting channels:', error);
      ResponseHandler.error(res, 'Failed to get channels', 500);
    }
  }
);

export { router as productChannelsRouter };