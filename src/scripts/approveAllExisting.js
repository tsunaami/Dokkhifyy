import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

const approveAll = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const result = await Course.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );
    
    const result2 = await Course.updateMany(
      { isApproved: false },
      { $set: { isApproved: true } }
    );

    console.log(`✅ Migration complete. ${result.modifiedCount + result2.modifiedCount} courses approved.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

approveAll();
