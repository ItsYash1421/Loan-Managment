const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  fullName: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({
      email: {
        $in: [
          'admin@lms.com',
          'sales@lms.com',
          'sanction@lms.com',
          'disbursement@lms.com',
          'collection@lms.com',
          'borrower@lms.com'
        ]
      }
    });

    const users = [
      {
        email: 'admin@lms.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        fullName: 'Admin User'
      },
      {
        email: 'sales@lms.com',
        password: await bcrypt.hash('sales123', 10),
        role: 'SALES',
        fullName: 'Sales Executive'
      },
      {
        email: 'sanction@lms.com',
        password: await bcrypt.hash('sanction123', 10),
        role: 'SANCTION',
        fullName: 'Sanction Executive'
      },
      {
        email: 'disbursement@lms.com',
        password: await bcrypt.hash('disbursement123', 10),
        role: 'DISBURSEMENT',
        fullName: 'Disbursement Executive'
      },
      {
        email: 'collection@lms.com',
        password: await bcrypt.hash('collection123', 10),
        role: 'COLLECTION',
        fullName: 'Collection Executive'
      },
      {
        email: 'borrower@lms.com',
        password: await bcrypt.hash('borrower123', 10),
        role: 'BORROWER',
        fullName: 'Test Borrower'
      }
    ];

    await User.insertMany(users);

    console.log('\n✅ Test accounts created successfully!\n');
    console.log('Login credentials:');
    console.log('Admin: admin@lms.com / admin123');
    console.log('Sales: sales@lms.com / sales123');
    console.log('Sanction: sanction@lms.com / sanction123');
    console.log('Disbursement: disbursement@lms.com / disbursement123');
    console.log('Collection: collection@lms.com / collection123');
    console.log('Borrower: borrower@lms.com / borrower123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAccounts();
