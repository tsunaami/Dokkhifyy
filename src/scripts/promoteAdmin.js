import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

const promoteToAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const email = '85isgreat@gmail.com';
    const password = 'aust_ke_valobashi';
    
    let user = await User.findOne({ email });

    if (user) {
      console.log(`Found existing user: ${user.name}. Promoting to admin...`);
      user.role = 'admin';
      // Also update password to what the user requested
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      console.log('✅ User updated to Admin with new password.');
    } else {
      console.log('User not found. Creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = new User({
        name: 'Super Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      await user.save();
      console.log('✅ New Admin user created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
    process.exit(1);
  }
};

promoteToAdmin();
