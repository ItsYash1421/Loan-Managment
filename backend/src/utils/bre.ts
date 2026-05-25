import { EmploymentMode } from '../types';

export interface BREInput {
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface BREResult {
  isValid: boolean;
  errors: string[];
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const validateBRE = (input: BREInput): BREResult => {
  const errors: string[] = [];

  if (!PAN_REGEX.test(input.pan)) {
    errors.push('Invalid PAN format. PAN must be in format: ABCDE1234F');
  }

  const age = calculateAge(input.dateOfBirth);
  if (age < 23 || age > 50) {
    errors.push('Age must be between 23 and 50 years');
  }

  if (input.monthlySalary < 25000) {
    errors.push('Monthly salary must be at least ₹25,000');
  }

  if (input.employmentMode === EmploymentMode.UNEMPLOYED) {
    errors.push('Unemployed applicants are not eligible for loans');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const calculateLoanDetails = (loanAmount: number, tenure: number, interestRate: number = 12) => {
  const simpleInterest = (loanAmount * interestRate * tenure) / (365 * 100);
  const totalRepayment = loanAmount + simpleInterest;
  
  return {
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100
  };
};
