export enum UserRole {
  BORROWER = 'BORROWER',
  SALES = 'SALES',
  SANCTION = 'SANCTION',
  DISBURSEMENT = 'DISBURSEMENT',
  COLLECTION = 'COLLECTION',
  ADMIN = 'ADMIN'
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED'
}

export enum EmploymentMode {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED'
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPersonalDetails {
  userId: string;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoan {
  _id: string;
  userId: string;
  personalDetailsId: string;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  salarySlipUrl?: string;
  rejectionReason?: string;
  appliedAt?: Date;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}
