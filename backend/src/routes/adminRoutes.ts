import express from 'express';
import { getUsers, createUser, toggleBlockStatus } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/block', toggleBlockStatus);

export default router;
