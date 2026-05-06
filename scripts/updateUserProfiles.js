const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateUserProfiles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Add new fields to existing users
    const result = await User.updateMany(
      {},
      {
        $set: {
          profilePicture: '',
          birthday: null,
          gender: '',
          countryOfOrigin: 'Kenya',
          currentCountry: '',
          currentCity: '',
          homeTown: '',
          bio: '',
          education: [],
          certifications: [],
          languages: [],
          preferredCountries: [],
          preferredJobTypes: [],
          expectedSalary: { amount: 0, currency: 'KES' },
          socialLinks: { linkedin: '', twitter: '', facebook: '', instagram: '' },
          emailNotifications: true,
          smsNotifications: true,
          twoFactorEnabled: false,
          lastSeen: null,
          isOnline: false
        }
      },
      { multi: true }
    );
    
    console.log(`Updated ${result.modifiedCount} users with new profile fields`);
    mongoose.disconnect();
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration error:', error);
    mongoose.disconnect();
  }
};

updateUserProfiles();
