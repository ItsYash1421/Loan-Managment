import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { UserRole } from '../types';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    await User.deleteMany({ email: { $in: [
      'admin@lms.com',
      'sales@lms.com',
      'sanction@lms.com',
      'disbursement@lms.com',
      'collection@lms.com',
      'borrower@lms.com'
    ]}});

    const users = [
      {
        email: 'admin@lms.com',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
        fullName: 'Admin User'
      },
      {
        email: 'sales@lms.com',
        password: await bcrypt.hash('sales123', 10),
        role: UserRole.SALES,
        fullName: 'Sales Executive'
      },
      {
        email: 'sanction@lms.com',
        password: await bcrypt.hash('sanction123', 10),
        role: UserRole.SANCTION,
        fullName: 'Sanction Executive'
      },
      {
        email: 'disbursement@lms.com',
        password: await bcrypt.hash('disbursement123', 10),
        role: UserRole.DISBURSEMENT,
        fullName: 'Disbursement Executive'
      },
      {
        email: 'collection@lms.com',
        password: await bcrypt.hash('collection123', 10),
        role: UserRole.COLLECTION,
        fullName: 'Collection Executive'
      },
      {
        email: 'borrower@lms.com',
        password: await bcrypt.hash('borrower123', 10),
        role: UserRole.BORROWER,
        fullName: 'Test Borrower'
      }
    ];

    await User.insertMany(users);

    console.log('Seed data created successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@lms.com / admin123');
    console.log('Sales: sales@lms.com / sales123');
    console.log('Sanction: sanction@lms.com / sanction123');
    console.log('Disbursement: disbursement@lms.com / disbursement123');
    console.log('Collection: collection@lms.com / collection123');
    console.log('Borrower: borrower@lms.com / borrower123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
