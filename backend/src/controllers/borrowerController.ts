import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PersonalDetails } from '../models/PersonalDetails';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { validateBRE, calculateLoanDetails } from '../utils/bre';
import { LoanStatus } from '../types';

export const submitPersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;

    if (!fullName || !pan || !dateOfBirth || !monthlySalary || !employmentMode) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const breResult = validateBRE({
      pan,
      dateOfBirth: new Date(dateOfBirth),
      monthlySalary,
      employmentMode
    });

    if (!breResult.isValid) {
      res.status(400).json({
        message: 'Application rejected due to eligibility criteria',
        errors: breResult.errors
      });
      return;
    }

    const existingDetails = await PersonalDetails.findOne({ userId });
    if (existingDetails) {
      const updatedDetails = await PersonalDetails.findOneAndUpdate(
        { userId },
        { fullName, pan, dateOfBirth, monthlySalary, employmentMode },
        { new: true }
      );
      res.status(200).json({
        message: 'Personal details updated successfully',
        personalDetails: updatedDetails
      });
      return;
    }

    const personalDetails = await PersonalDetails.create({
      userId,
      fullName,
      pan,
      dateOfBirth,
      monthlySalary,
      employmentMode
    });

    res.status(201).json({
      message: 'Personal details submitted successfully',
      personalDetails
    });
  } catch (error) {
    console.error('Submit personal details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    if (!req.file) {
      res.status(400).json({ message: 'Salary slip file is required' });
      return;
    }

    const personalDetails = await PersonalDetails.findOne({ userId });
    if (!personalDetails) {
      res.status(400).json({ message: 'Please submit personal details first' });
      return;
    }

    personalDetails.tempSalarySlipData = req.file.buffer;
    personalDetails.tempSalarySlipContentType = req.file.mimetype;
    await personalDetails.save();

    res.status(200).json({
      message: 'Salary slip uploaded successfully',
      salarySlipUrl: 'uploaded-to-db'
    });
  } catch (error) {
    console.error('Upload salary slip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const calculateLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanAmount, tenure } = req.body;

    if (!loanAmount || !tenure) {
      res.status(400).json({ message: 'Loan amount and tenure are required' });
      return;
    }

    if (loanAmount < 50000 || loanAmount > 500000) {
      res.status(400).json({ message: 'Loan amount must be between ₹50,000 and ₹5,00,000' });
      return;
    }

    if (tenure < 30 || tenure > 365) {
      res.status(400).json({ message: 'Tenure must be between 30 and 365 days' });
      return;
    }

    const loanDetails = calculateLoanDetails(loanAmount, tenure);

    res.status(200).json({
      loanAmount,
      tenure,
      interestRate: 12,
      ...loanDetails
    });
  } catch (error) {
    console.error('Calculate loan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { loanAmount, tenure } = req.body;

    if (!loanAmount || !tenure) {
      res.status(400).json({ message: 'Loan amount and tenure are required' });
      return;
    }

    const personalDetails = await PersonalDetails.findOne({ userId });
    if (!personalDetails) {
      res.status(400).json({ message: 'Please submit personal details first' });
      return;
    }

    if (!personalDetails.tempSalarySlipData) {
      res.status(400).json({ message: 'Please upload a salary slip first' });
      return;
    }

    const existingLoan = await Loan.findOne({
      userId,
      status: { $in: [LoanStatus.PENDING, LoanStatus.APPLIED, LoanStatus.SANCTIONED, LoanStatus.DISBURSED] }
    });

    if (existingLoan) {
      res.status(400).json({ message: 'You already have an active loan application' });
      return;
    }

    const loanDetails = calculateLoanDetails(loanAmount, tenure);

    const loan = await Loan.create({
      userId,
      personalDetailsId: personalDetails._id,
      loanAmount,
      tenure,
      interestRate: 12,
      simpleInterest: loanDetails.simpleInterest,
      totalRepayment: loanDetails.totalRepayment,
      status: LoanStatus.APPLIED,
      salarySlipData: personalDetails.tempSalarySlipData,
      salarySlipContentType: personalDetails.tempSalarySlipContentType,
      appliedAt: new Date()
    });

    // Clear temp buffer to save space
    personalDetails.tempSalarySlipData = undefined;
    personalDetails.tempSalarySlipContentType = undefined;
    await personalDetails.save();

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loan
    });
  } catch (error) {
    console.error('Apply loan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;

    const totalLoans = await Loan.countDocuments({ userId });
    const totalPages = Math.ceil(totalLoans / limit);

    const loans = await Loan.find({ userId })
      .select('-salarySlipData')
      .populate('personalDetailsId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const loansWithPayments = await Promise.all(
      loans.map(async (loan) => {
        const payments = await Payment.find({ loanId: loan._id }).sort({ paymentDate: -1 });
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const outstandingBalance = loan.totalRepayment - totalPaid;

        return {
          ...loan.toObject(),
          payments,
          totalPaid,
          outstandingBalance
        };
      })
    );

    res.status(200).json({ loans: loansWithPayments, totalPages, currentPage: page, totalLoans });
  } catch (error) {
    console.error('Get my loans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const personalDetails = await PersonalDetails.findOne({ userId });

    res.status(200).json({ personalDetails });
  } catch (error) {
    console.error('Get personal details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { loanId } = req.params;

    const loan = await Loan.findOne({ _id: loanId, userId });
    
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (loan.status !== LoanStatus.APPLIED) {
      res.status(400).json({ message: 'Only applied loans can be deleted' });
      return;
    }

    await Loan.deleteOne({ _id: loanId });
    res.status(200).json({ message: 'Loan application cancelled successfully' });
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { loanId } = req.params;
    const { loanAmount, tenure } = req.body;

    if (!loanAmount || !tenure) {
      res.status(400).json({ message: 'Loan amount and tenure are required' });
      return;
    }

    if (loanAmount < 50000 || loanAmount > 500000) {
      res.status(400).json({ message: 'Loan amount must be between ₹50,000 and ₹5,00,000' });
      return;
    }

    if (tenure < 30 || tenure > 365) {
      res.status(400).json({ message: 'Tenure must be between 30 and 365 days' });
      return;
    }

    const loan = await Loan.findOne({ _id: loanId, userId });
    
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (loan.status !== LoanStatus.APPLIED) {
      res.status(400).json({ message: 'Only applied loans can be updated' });
      return;
    }

    const loanDetails = calculateLoanDetails(loanAmount, tenure);

    loan.loanAmount = loanAmount;
    loan.tenure = tenure;
    loan.simpleInterest = loanDetails.simpleInterest;
    loan.totalRepayment = loanDetails.totalRepayment;
    
    await loan.save();

    res.status(200).json({ message: 'Loan application updated successfully', loan });
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
