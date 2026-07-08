import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Section from '../models/Section';
import Field from '../models/Field';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/arham_diamonds';
    console.log(`Connecting to MongoDB at: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully.');

    // Seed admin user if it doesn't exist
    // const adminCount = await User.countDocuments({ role: 'admin' });
    // if (adminCount === 0) {
    //   console.log('No admin users found. Seeding default admin...');
    //   const passwordHash = await bcrypt.hash('admin123', 10);
    //   const defaultAdmin = new User({ username: 'admin', passwordHash, role: 'admin' });
    //   await defaultAdmin.save();
    //   console.log('Default admin seeded successfully (username: admin, password: admin123).');
    // }

    // Seed default "Diamond Media" section + fields if none exist
    const sectionCount = await Section.countDocuments();
    if (sectionCount === 0) {
      console.log('No sections found. Seeding default Diamond Media section...');
      const defaultSection = new Section({ name: 'Diamond Media', order: 0 });
      await defaultSection.save();

      await Field.create([
        {
          name: 'diamond_video',
          label: 'Diamond Video',
          type: 'video',
          required: false,
          options: [],
          section: defaultSection._id,
          order: 0,
        },
        {
          name: 'diamond_image',
          label: 'Diamond Image',
          type: 'image',
          required: false,
          options: [],
          section: defaultSection._id,
          order: 1,
        },
      ]);
      console.log('Default Diamond Media section and fields seeded.');
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};
