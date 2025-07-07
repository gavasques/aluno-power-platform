import { db } from '../db';
import { 
  users, materials, partnerReviews, supplierReviews, toolReviews, 
  news, updates, partnerReviewReplies, toolReviewReplies,
  userGroupMembers, userSessions, aiGenerationLogs, toolUsageLogs,
  upscaledImages, aiImgGenerationLogs, supplierBrands, supplierContacts,
  supplierConversations, supportTickets, supportTicketMessages,
  supportTicketFiles, infographics,
  userSubscriptions, userCreditBalance, stripePaymentIntents,
  stripeCheckoutSessions, userPermissionGroups, creditTransactions
} from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class UserDeletionService {
  /**
   * Safely delete a user and all related data
   */
  static async deleteUserWithDependencies(userId: number): Promise<{ success: boolean; message: string; deletedRecords: Record<string, number> }> {
    const deletedRecords: Record<string, number> = {};
    
    try {
      console.log(`🗑️ Starting safe deletion of user ${userId}...`);

      // 1. Delete user sessions
      const sessions = await db.delete(userSessions).where(eq(userSessions.userId, userId)).returning();
      deletedRecords.sessions = sessions.length;

      // 2. Delete AI generation logs
      const aiLogs = await db.delete(aiGenerationLogs).where(eq(aiGenerationLogs.userId, userId)).returning();
      deletedRecords.aiLogs = aiLogs.length;

      // 3. Delete AI image generation logs
      const aiImgLogs = await db.delete(aiImgGenerationLogs).where(eq(aiImgGenerationLogs.userId, userId)).returning();
      deletedRecords.aiImgLogs = aiImgLogs.length;

      // 4. Delete tool usage logs
      const toolLogs = await db.delete(toolUsageLogs).where(eq(toolUsageLogs.userId, userId)).returning();
      deletedRecords.toolLogs = toolLogs.length;

      // 5. Delete upscaled images
      const upscaled = await db.delete(upscaledImages).where(eq(upscaledImages.userId, userId)).returning();
      deletedRecords.upscaledImages = upscaled.length;

      // 6. Delete infographics and generations
      const infographicsData = await db.delete(infographics).where(eq(infographics.userId, userId)).returning();
      deletedRecords.infographics = infographicsData.length;

      // infographicGenerations table doesn't exist - skipping

      // 7. Delete user reviews and replies
      const partnerRevs = await db.delete(partnerReviews).where(eq(partnerReviews.userId, userId)).returning();
      deletedRecords.partnerReviews = partnerRevs.length;

      const supplierRevs = await db.delete(supplierReviews).where(eq(supplierReviews.userId, userId)).returning();
      deletedRecords.supplierReviews = supplierRevs.length;

      const toolRevs = await db.delete(toolReviews).where(eq(toolReviews.userId, userId)).returning();
      deletedRecords.toolReviews = toolRevs.length;

      const partnerReplies = await db.delete(partnerReviewReplies).where(eq(partnerReviewReplies.userId, userId)).returning();
      deletedRecords.partnerReplies = partnerReplies.length;

      const toolReplies = await db.delete(toolReviewReplies).where(eq(toolReviewReplies.userId, userId)).returning();
      deletedRecords.toolReplies = toolReplies.length;

      // 8. Delete supplier-related data
      const supplierBrandsData = await db.delete(supplierBrands).where(eq(supplierBrands.userId, userId)).returning();
      deletedRecords.supplierBrands = supplierBrandsData.length;

      const supplierContactsData = await db.delete(supplierContacts).where(eq(supplierContacts.userId, userId)).returning();
      deletedRecords.supplierContacts = supplierContactsData.length;

      const supplierConvs = await db.delete(supplierConversations).where(eq(supplierConversations.userId, userId)).returning();
      deletedRecords.supplierConversations = supplierConvs.length;

      // 9. Delete support tickets and related data
      const supportFiles = await db.delete(supportTicketFiles).where(eq(supportTicketFiles.uploadedByUserId, userId)).returning();
      deletedRecords.supportFiles = supportFiles.length;

      const supportMessages = await db.delete(supportTicketMessages).where(eq(supportTicketMessages.userId, userId)).returning();
      deletedRecords.supportMessages = supportMessages.length;

      const supportTicketsCreated = await db.delete(supportTickets).where(eq(supportTickets.userId, userId)).returning();
      const supportTicketsAssigned = await db.delete(supportTickets).where(eq(supportTickets.assignedToUserId, userId)).returning();
      deletedRecords.supportTickets = supportTicketsCreated.length + supportTicketsAssigned.length;

      // 10. Delete permission groups
      const permissionGroups = await db.delete(userPermissionGroups).where(eq(userPermissionGroups.userId, userId)).returning();
      deletedRecords.permissionGroups = permissionGroups.length;

      // 11. Delete group memberships
      const groupMemberships = await db.delete(userGroupMembers).where(eq(userGroupMembers.userId, userId)).returning();
      deletedRecords.groupMemberships = groupMemberships.length;

      // 12. Delete financial data
      const creditTrans = await db.delete(creditTransactions).where(eq(creditTransactions.userId, userId)).returning();
      deletedRecords.creditTransactions = creditTrans.length;

      const creditBalance = await db.delete(userCreditBalance).where(eq(userCreditBalance.userId, userId)).returning();
      deletedRecords.creditBalance = creditBalance.length;

      const subscriptions = await db.delete(userSubscriptions).where(eq(userSubscriptions.userId, userId)).returning();
      deletedRecords.subscriptions = subscriptions.length;

      const paymentIntents = await db.delete(stripePaymentIntents).where(eq(stripePaymentIntents.userId, userId)).returning();
      deletedRecords.paymentIntents = paymentIntents.length;

      const checkoutSessions = await db.delete(stripeCheckoutSessions).where(eq(stripeCheckoutSessions.userId, userId)).returning();
      deletedRecords.checkoutSessions = checkoutSessions.length;

      // 13. Update materials uploaded by this user (set to null instead of deleting)
      const materialsUpdated = await db.update(materials)
        .set({ uploadedBy: null })
        .where(eq(materials.uploadedBy, userId))
        .returning();
      deletedRecords.materialsUpdated = materialsUpdated.length;

      // 14. Update news/updates authored by this user (set to null)
      const newsUpdated = await db.update(news)
        .set({ authorId: null })
        .where(eq(news.authorId, userId))
        .returning();
      deletedRecords.newsUpdated = newsUpdated.length;

      const updatesData = await db.update(updates)
        .set({ authorId: null })
        .where(eq(updates.authorId, userId))
        .returning();
      deletedRecords.updatesUpdated = updatesData.length;

      // 15. Finally, delete the user
      const deletedUser = await db.delete(users).where(eq(users.id, userId)).returning();
      
      if (deletedUser.length === 0) {
        throw new Error('Usuario não encontrado');
      }

      const totalDeleted = Object.values(deletedRecords).reduce((sum, count) => sum + count, 0);
      
      console.log(`✅ User ${userId} deleted successfully. Total records affected: ${totalDeleted}`);
      console.log('📊 Deletion summary:', deletedRecords);

      return {
        success: true,
        message: `Usuário deletado com sucesso. ${totalDeleted} registros relacionados foram removidos.`,
        deletedRecords
      };

    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return {
        success: false,
        message: `Erro ao deletar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        deletedRecords
      };
    }
  }

  /**
   * Delete multiple test users safely
   */
  static async deleteTestUsers(): Promise<{ success: boolean; message: string; results: Array<{ userId: number; name: string; result: any }> }> {
    try {
      // Get test users
      const testUsers = await db.select()
        .from(users)
        .where(eq(users.email, 'test@example.com'))
        .union(
          db.select().from(users).where(eq(users.email, 'teste2@teste.com')),
          db.select().from(users).where(eq(users.email, 'teste3@teste.com')),
          db.select().from(users).where(eq(users.email, 'teste4@teste.com'))
        );

      const results = [];
      let successCount = 0;

      for (const user of testUsers) {
        console.log(`🔄 Deleting test user: ${user.name} (${user.email})`);
        const result = await this.deleteUserWithDependencies(user.id);
        
        results.push({
          userId: user.id,
          name: user.name,
          result
        });

        if (result.success) {
          successCount++;
        }
      }

      return {
        success: successCount === testUsers.length,
        message: `${successCount}/${testUsers.length} usuários de teste deletados com sucesso`,
        results
      };

    } catch (error) {
      console.error('❌ Error deleting test users:', error);
      return {
        success: false,
        message: `Erro ao deletar usuários de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        results: []
      };
    }
  }
}