import { permissionService } from './services/permissionService';
import { pool } from './db';

/**
 * Test script to demonstrate the Permission System functionality
 * Run this to see how the permission verification and credit debiting works
 */

async function testPermissionSystem() {
  console.log('🧪 TESTING PERMISSION SYSTEM');
  console.log('=' .repeat(50));
  
  const userId = 2; // Guilherme Vasques (assigned to BASIC group)
  const featureKey = 'amazon-listing-optimizer';
  
  try {
    // 1. Test permission check only (no credit debit)
    console.log('\n📋 TEST 1: Permission Check Only');
    console.log('-'.repeat(30));
    
    const permissionCheck = await permissionService.checkFeatureAccess(userId, featureKey);
    console.log('Permission Check Result:', {
      hasAccess: permissionCheck.hasAccess,
      userGroup: permissionCheck.userGroup,
      featureName: permissionCheck.featureName,
      reason: permissionCheck.reason || 'Access granted'
    });
    
    // 2. Test permission check WITH credit debit
    console.log('\n💳 TEST 2: Permission Check + Credit Debit');
    console.log('-'.repeat(40));
    
    // Check initial balance
    const initialBalance = await pool.query(`
      SELECT current_balance, total_spent FROM user_credit_balance 
      WHERE user_id = $1
    `, [userId]);
    
    console.log('Initial Balance:', {
      credits: initialBalance.rows[0]?.current_balance || 0,
      totalSpent: initialBalance.rows[0]?.total_spent || 0
    });
    
    const creditDebitResult = await permissionService.debitCreditsWithPermissionCheck(userId, featureKey);
    console.log('Credit Debit Result:', {
      success: creditDebitResult.success,
      hasPermission: creditDebitResult.hasPermission,
      creditsDebited: creditDebitResult.creditsDebited,
      remainingCredits: creditDebitResult.remainingCredits,
      userGroup: creditDebitResult.userGroup,
      errorMessage: creditDebitResult.errorMessage || 'No errors'
    });
    
    // Check final balance
    const finalBalance = await pool.query(`
      SELECT current_balance, total_spent FROM user_credit_balance 
      WHERE user_id = $1
    `, [userId]);
    
    console.log('Final Balance:', {
      credits: finalBalance.rows[0]?.current_balance || 0,
      totalSpent: finalBalance.rows[0]?.total_spent || 0
    });
    
    // 3. Test refund functionality
    console.log('\n🔄 TEST 3: Credit Refund');
    console.log('-'.repeat(25));
    
    const refundResult = await permissionService.refundCredits(userId, 10);
    console.log('Refund Result:', {
      success: refundResult ? 'SUCCESS' : 'FAILED'
    });
    
    // Check balance after refund
    const refundBalance = await pool.query(`
      SELECT current_balance, total_spent FROM user_credit_balance 
      WHERE user_id = $1
    `, [userId]);
    
    console.log('Balance After Refund:', {
      credits: refundBalance.rows[0]?.current_balance || 0,
      totalSpent: refundBalance.rows[0]?.total_spent || 0
    });
    
    // 4. Test with invalid feature
    console.log('\n❌ TEST 4: Invalid Feature Test');
    console.log('-'.repeat(30));
    
    const invalidFeatureCheck = await permissionService.checkFeatureAccess(userId, 'non-existent-feature');
    console.log('Invalid Feature Result:', {
      hasAccess: invalidFeatureCheck.hasAccess,
      reason: invalidFeatureCheck.reason,
      userGroup: invalidFeatureCheck.userGroup
    });
    
    // 5. Test with user without enough credits
    console.log('\n💸 TEST 5: Insufficient Credits Test');
    console.log('-'.repeat(35));
    
    // Set user balance to 5 (less than feature cost of 10)
    await pool.query(`
      UPDATE user_credit_balance 
      SET current_balance = 5 
      WHERE user_id = $1
    `, [userId]);
    
    const insufficientCreditsResult = await permissionService.debitCreditsWithPermissionCheck(userId, featureKey);
    console.log('Insufficient Credits Result:', {
      success: insufficientCreditsResult.success,
      hasPermission: insufficientCreditsResult.hasPermission,
      errorMessage: insufficientCreditsResult.errorMessage
    });
    
    // Restore balance for future tests
    await pool.query(`
      UPDATE user_credit_balance 
      SET current_balance = 1000 
      WHERE user_id = $1
    `, [userId]);
    
    console.log('\n✅ PERMISSION SYSTEM TEST COMPLETED');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test immediately
testPermissionSystem()
  .then(() => {
    console.log('\n🎯 Test execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });

export { testPermissionSystem };