import mongoose, { Schema, Document } from 'mongoose';
import { LoanStatus } from '../types';

export interface ILoanDocument extends Document {
  userId: mongoose.Types.ObjectId;
  personalDetailsId: mongoose.Types.ObjectId;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  salarySlipUrl?: string; // Kept for backwards compatibility
  salarySlipData?: Buffer;
  salarySlipContentType?: string;
  rejectionReason?: string;
  appliedAt?: Date;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoanDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    personalDetailsId: {
      type: Schema.Types.ObjectId,
      ref: 'PersonalDetails',
      required: true
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 50000,
      max: 500000
    },
    tenure: {
      type: Number,
      required: true,
      min: 30,
      max: 365
    },
    interestRate: {
      type: Number,
      required: true,
      default: 12
    },
    simpleInterest: {
      type: Number,
      required: true
    },
    totalRepayment: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.PENDING
    },
    salarySlipUrl: {
      type: String
    },
    salarySlipData: {
      type: Buffer
    },
    salarySlipContentType: {
      type: String
    },
    rejectionReason: {
      type: String
    },
    appliedAt: {
      type: Date
    },
    sanctionedAt: {
      type: Date
    },
    disbursedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Loan = mongoose.model<ILoanDocument>('Loan', loanSchema);
