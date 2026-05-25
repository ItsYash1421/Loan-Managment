import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentDocument extends Document {
  loanId: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true
    },
    utrNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
