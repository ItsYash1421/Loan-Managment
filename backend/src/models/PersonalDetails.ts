import mongoose, { Schema, Document } from 'mongoose';
import { EmploymentMode } from '../types';

export interface IPersonalDetailsDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  tempSalarySlipData?: Buffer;
  tempSalarySlipContentType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const personalDetailsSchema = new Schema<IPersonalDetailsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    pan: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    monthlySalary: {
      type: Number,
      required: true
    },
    employmentMode: {
      type: String,
      enum: Object.values(EmploymentMode),
      required: true
    },
    tempSalarySlipData: {
      type: Buffer
    },
    tempSalarySlipContentType: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const PersonalDetails = mongoose.model<IPersonalDetailsDocument>('PersonalDetails', personalDetailsSchema);
