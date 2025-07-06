import { db } from '../db';
import { coupons, userSubscriptions, userPlans } from '../../shared/schema';
import { eq, and, gte, lte, arrayContains } from 'drizzle-orm';

interface CouponValidationResult {
  valid: boolean;
  coupon?: any;
  error?: string;
  discount?: {
    type: string;
    value: number;
    amount: number;
  };
}

class CouponService {
  // Validar cupom
  async validateCoupon(
    code: string, 
    userId: number, 
    planId?: number, 
    amount?: number
  ): Promise<CouponValidationResult> {
    try {
      // Buscar cupom pelo código
      const coupon = await db.select()
        .from(coupons)
        .where(eq(coupons.code, code.toUpperCase()))
        .limit(1);

      if (coupon.length === 0) {
        return { valid: false, error: 'Cupom não encontrado' };
      }

      const coup = coupon[0];

      // Verificar se está ativo
      if (!coup.isActive) {
        return { valid: false, error: 'Cupom inativo' };
      }

      // Verificar se está dentro do período válido
      const now = new Date();
      if (now < coup.validFrom || now > coup.validTo) {
        return { valid: false, error: 'Cupom fora do período válido' };
      }

      // Verificar se atingiu o limite de uso
      if (coup.maxUses && coup.currentUses >= coup.maxUses) {
        return { valid: false, error: 'Cupom esgotado' };
      }

      // Verificar se o usuário já usou este cupom
      if (coup.usedByUserId && coup.usedByUserId.includes(userId)) {
        return { valid: false, error: 'Cupom já foi usado por este usuário' };
      }

      // Verificar valor mínimo de compra
      if (coup.minPurchaseAmount && amount && amount < parseFloat(coup.minPurchaseAmount)) {
        return { 
          valid: false, 
          error: `Valor mínimo de compra: R$ ${coup.minPurchaseAmount}` 
        };
      }

      // Calcular desconto
      let discountAmount = 0;
      if (coup.type === 'percentage' && amount) {
        discountAmount = (amount * parseFloat(coup.value)) / 100;
      } else if (coup.type === 'fixed_amount') {
        discountAmount = parseFloat(coup.value);
      }

      return {
        valid: true,
        coupon: coup,
        discount: {
          type: coup.type,
          value: parseFloat(coup.value),
          amount: discountAmount
        }
      };
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return { valid: false, error: 'Erro interno do servidor' };
    }
  }

  // Aplicar cupom (marcar como usado)
  async applyCoupon(code: string, userId: number): Promise<boolean> {
    try {
      const coupon = await db.select()
        .from(coupons)
        .where(eq(coupons.code, code.toUpperCase()))
        .limit(1);

      if (coupon.length === 0) {
        return false;
      }

      const coup = coupon[0];
      const newUsedByUserId = coup.usedByUserId || [];
      
      if (!newUsedByUserId.includes(userId)) {
        newUsedByUserId.push(userId);
      }

      await db.update(coupons)
        .set({
          currentUses: coup.currentUses + 1,
          usedByUserId: newUsedByUserId,
          updatedAt: new Date()
        })
        .where(eq(coupons.id, coup.id));

      return true;
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      return false;
    }
  }

  // Criar novo cupom
  async createCoupon(couponData: {
    code: string;
    type: string;
    value: number;
    minPurchaseAmount?: number;
    maxUses?: number;
    validFrom: Date;
    validTo: Date;
    createdBy: number;
    metadata?: any;
  }): Promise<any> {
    try {
      const newCoupon = await db.insert(coupons)
        .values({
          code: couponData.code.toUpperCase(),
          type: couponData.type,
          value: couponData.value.toString(),
          minPurchaseAmount: couponData.minPurchaseAmount?.toString(),
          maxUses: couponData.maxUses,
          validFrom: couponData.validFrom,
          validTo: couponData.validTo,
          createdBy: couponData.createdBy,
          metadata: couponData.metadata,
        })
        .returning();

      return newCoupon[0];
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      throw error;
    }
  }

  // Listar cupons ativos
  async getActiveCoupons(): Promise<any[]> {
    try {
      const now = new Date();
      return await db.select()
        .from(coupons)
        .where(and(
          eq(coupons.isActive, true),
          lte(coupons.validFrom, now),
          gte(coupons.validTo, now)
        ));
    } catch (error) {
      console.error('Erro ao buscar cupons ativos:', error);
      return [];
    }
  }

  // Obter estatísticas de uso de cupons
  async getCouponStats(couponId: string): Promise<any> {
    try {
      const coupon = await db.select()
        .from(coupons)
        .where(eq(coupons.id, couponId))
        .limit(1);

      if (coupon.length === 0) {
        return null;
      }

      const coup = coupon[0];
      
      return {
        id: coup.id,
        code: coup.code,
        type: coup.type,
        value: coup.value,
        currentUses: coup.currentUses,
        maxUses: coup.maxUses,
        usagePercentage: coup.maxUses ? (coup.currentUses / coup.maxUses) * 100 : 0,
        isActive: coup.isActive,
        validFrom: coup.validFrom,
        validTo: coup.validTo,
        usersCount: coup.usedByUserId?.length || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do cupom:', error);
      return null;
    }
  }

  // Desativar cupom
  async deactivateCoupon(couponId: string): Promise<boolean> {
    try {
      await db.update(coupons)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(coupons.id, couponId));

      return true;
    } catch (error) {
      console.error('Erro ao desativar cupom:', error);
      return false;
    }
  }
}

export const couponService = new CouponService();