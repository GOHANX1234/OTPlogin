import mongoose from 'mongoose';
import { Admin } from './models/Admin';

const MONGODB_URI = process.env.MONGODB_URI;

async function seedDefaultAdmin(): Promise<void> {
  try {
    // Check if admin with username "admin" already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      // Get the next ID for the admin
      const lastAdmin = await Admin.findOne().sort({ id: -1 });
      const nextId = lastAdmin ? lastAdmin.id + 1 : 1;
      
      // Create default admin user
      const defaultAdmin = new Admin({
        id: nextId,
        username: 'admin',
        password: 'admin123', // This will be automatically encrypted by the pre-save hook
        email: 'mohansuchil4@gmail.com'
      });
      
      await defaultAdmin.save();
      console.log('✅ Default admin user created ');
    } else {
      // Backfill email for existing admin if missing or incorrect
      if (!existingAdmin.email || existingAdmin.email !== 'mohansuchil4@gmail.com') {
        await Admin.updateOne(
          { _id: existingAdmin._id }, 
          { $set: { email: 'mohansuchil4@gmail.com' } }
        );
        console.log('✅ Default admin email updated.');
      } else {
        console.log('✅ Default admin user already exists with correct email');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding default admin:', error);
    // Don't throw error here to avoid breaking the app startup
  }
}

export async function connectDatabase(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }
  
  try {
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Seed default admin user after successful connection
    await seedDefaultAdmin();
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
}
