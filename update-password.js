// Script to update password for gavasques@gmail.com
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function updatePassword() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });
  
  try {
    const email = 'gavasques@gmail.com';
    const newPassword = 'F836GlKyiH99xqmja4@';
    
    // Hash the password with same settings as AuthService
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔐 Updating password for:', email);
    console.log('🔐 New password hash:', hashedPassword);
    
    // Update password in database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Password updated successfully');
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await pool.end();
  }
}

updatePassword();