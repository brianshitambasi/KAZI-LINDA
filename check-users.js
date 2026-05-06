const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = require('./models/User');
    const users = await User.find();
    console.log('=== All Users ===');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`);
    });
    console.log(`\nTotal: ${users.length} users`);
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit();
  });
