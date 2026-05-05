const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const Employer = require('./models/Employer');
    
    // Check if employer already exists
    const existing = await Employer.findOne({ email: 'sarah@employer.com' });
    if (existing) {
      console.log('Employer already exists:', existing);
      process.exit();
    }
    
    const employer = await Employer.create({
      name: 'Sarah Employer',
      email: 'sarah@employer.com',
      phone: '0722334455',
      country: 'Saudi Arabia',
      companyName: 'Sarah Recruitment Agency',
      verified: false
    });
    
    console.log('✅ Employer created successfully!');
    console.log('Employer ID:', employer._id);
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit();
  });
