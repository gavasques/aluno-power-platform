const bcrypt = require('bcryptjs');
const { db } = require('./server/db');
const { users } = require('./shared/schema');
const { eq } = require('drizzle-orm');

async function updatePassword() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Update the user's password
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, 'gavasques@gmail.com'))
      .returning();
    
    console.log('Password updated successfully for user:', result[0].email);
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

updatePassword();