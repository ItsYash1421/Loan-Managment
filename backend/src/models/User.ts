import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IUserDocument extends Document {
  email: string;
  password: string;
  role: UserRole;
  isBlocked?: boolean;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BORROWER
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    fullName: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
