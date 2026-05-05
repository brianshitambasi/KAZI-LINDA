const mongoose = require('mongoose');
require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Missing');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const Employer = require('./models/Employer');
    const User = require('./models/User');
    const Job = require('./models/Job');
    
    const users = await User.find();
    console.log('\n=== USERS ===');
    console.log(JSON.stringify(users, null, 2));
    
    const employers = await Employer.find();
    console.log('\n=== EMPLOYERS ===');
    console.log(JSON.stringify(employers, null, 2));
    
    const jobs = await Job.find();
    console.log('\n=== JOBS ===');
    console.log(JSON.stringify(jobs, null, 2));
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit();
  });
