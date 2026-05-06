const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = require('./models/User');
    
    // Check if admin exists
    const existing = await User.findOne({ email: 'admin@kazilinda.com' });
    if (existing) {
      console.log('Admin already exists!');
      console.log(`Email: ${existing.email}, Role: ${existing.role}`);
      process.exit();
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);
    
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@kazilinda.com',
      phone: '0712345678',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: Admin123!`);
    console.log(`Role: ${admin.role}`);
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit();
  });
