import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { UserRole } from '../types';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Optional: filter out borrowers if admin only manages staff, but let's just show all for now
    // Or just show staff by default
    const query = { role: { $nin: [UserRole.BORROWER, UserRole.ADMIN] } };

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({ 
      users, 
      totalPages, 
      currentPage: page, 
      totalUsers 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ message: 'Email, password, and role are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      fullName
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleBlockStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role === UserRole.ADMIN) {
      res.status(400).json({ message: 'Administrators cannot be blocked' });
      return;
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({ 
      message: `User access ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Toggle block status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
