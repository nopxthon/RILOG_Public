// utils/sendEmail.js
'use strict';

const nodemailer = require('nodemailer');

// ==========================================
// 📧 LOAD EMAIL ACCOUNTS FROM .ENV
// ==========================================
const EMAIL_ACCOUNTS = (() => {
  const users = process.env.EMAIL_USER?.split(',').map(e => e.trim()) || [];
  const passwords = process.env.EMAIL_PASS?.split(',').map(p => p.trim()) || [];

  if (users.length !== passwords.length) {
    console.error('❌ EMAIL_USER and EMAIL_PASS count mismatch!');
    return [];
  }

  const accounts = users.map((user, i) => ({
    user,
    pass: passwords[i]
  }));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 EMAIL ACCOUNTS LOADED:');
  accounts.forEach((acc, i) => {
    console.log(`   ${i + 1}. ${acc.user} (pass length: ${acc.pass?.length || 0})`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return accounts;
})();

let currentAccountIndex = 0;

// Helper function: delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 📧 SEND EMAIL FUNCTION WITH AUTO-ROTATION
// ==========================================
async function sendEmail(to, subject, html) {
  // ✅ CHECK DEVELOPMENT MODE FIRST
  if (process.env.SEND_REAL_EMAIL === 'false') {
    console.log('\n⚠️  EMAIL SENDING DISABLED (Development Mode)');
    console.log(`   📧 To: ${to}`);
    console.log(`   📋 Subject: ${subject}`);
    return { 
      success: true, 
      messageId: 'mock-' + Date.now(),
      message: 'Email sending disabled in development',
      mock: true 
    };
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 SENDING REAL EMAIL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   📧 To: ${to}`);
  console.log(`   📋 Subject: ${subject}`);

  if (!EMAIL_ACCOUNTS || EMAIL_ACCOUNTS.length === 0) {
    console.error('❌ No email accounts configured!');
    throw new Error('No email accounts available');
  }

  const maxAttempts = EMAIL_ACCOUNTS.length;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const account = EMAIL_ACCOUNTS[currentAccountIndex];
    
    console.log(`\n🔄 Attempt ${attempt + 1}/${maxAttempts}`);
    console.log(`   📧 Using: ${account.user}`);
    console.log(`   🔑 Pass: ${account.pass.substring(0, 4)}...${account.pass.substring(account.pass.length - 4)}`);

    try {
      // ✅ Create transporter with timeout settings
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: account.user,
          pass: account.pass,
        },
        // Add connection timeout
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      console.log('   🔌 Verifying connection...');
      
      // ✅ Verify connection
      await transporter.verify();
      console.log('   ✅ Connection verified');

      console.log('   📨 Sending email...');

      // ✅ Send email
      const info = await transporter.sendMail({
        from: `"RILOG System" <${account.user}>`,
        to,
        subject,
        html,
      });

      console.log('   ✅ Email sent successfully!');
      console.log(`   📬 Message ID: ${info.messageId}`);
      console.log(`   📊 Response: ${info.response}`);

      // ✅ Rotate to next account
      currentAccountIndex = (currentAccountIndex + 1) % EMAIL_ACCOUNTS.length;
      console.log(`   🔄 Next email will use account #${currentAccountIndex + 1}`);

      return info;

    } catch (error) {
      lastError = error;
      console.error(`   ❌ Failed with ${account.user}`);
      console.error(`   📛 Error Code: ${error.code}`);
      console.error(`   📛 Error Message: ${error.message}`);
      
      // Log full error for debugging
      if (error.code === 'EAUTH') {
        console.error(`   ⚠️  Authentication failed - Check App Password!`);
        console.error(`   💡 Make sure:`);
        console.error(`      1. 2-Step Verification is enabled`);
        console.error(`      2. App Password is generated correctly`);
        console.error(`      3. No spaces in the password`);
      }

      // ✅ Rotate to next account
      currentAccountIndex = (currentAccountIndex + 1) % EMAIL_ACCOUNTS.length;
      
      // Add delay before next attempt to avoid rate limiting
      if (attempt < maxAttempts - 1) {
        console.log(`   ⏳ Waiting 2 seconds before next attempt...`);
        await delay(2000);
      }
    }
  }

  // ❌ All accounts failed
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ ALL EMAIL ACCOUNTS FAILED');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Last Error:', lastError?.message);
  console.error('\n💡 Troubleshooting Steps:');
  console.error('   1. Regenerate all App Passwords in Google Account');
  console.error('   2. Make sure 2-Step Verification is ON');
  console.error('   3. Check for spaces in EMAIL_PASS');
  console.error('   4. Try with SEND_REAL_EMAIL=false for development');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  throw lastError || new Error('Failed to send email with all accounts');
}

module.exports = sendEmail;