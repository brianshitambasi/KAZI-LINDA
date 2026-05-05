const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: `"KAZI LINDA" <${process.env.EMAIL_USER}>`,
  to: 'brianshitambasi270@gmail.com',
  subject: 'Test Email from KAZI LINDA',
  html: '<h1>✅ Email working!</h1><p>Your Gmail configuration is correct.</p>'
})
.then(() => console.log('✅ Email sent!'))
.catch(err => console.error('❌ Email error:', err.message));
