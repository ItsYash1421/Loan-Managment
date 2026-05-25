import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { PersonalDetails } from '../models/PersonalDetails';
import { LoanStatus } from '../types';

export const getSalesLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const search = req.query.search as string;

    let userQuery: any = { role: 'BORROWER' };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userQuery = {
        role: 'BORROWER',
        $or: [
          { email: searchRegex },
          { fullName: searchRegex }
        ]
      };
    }

    const totalLeads = await User.countDocuments(userQuery);
    const totalPages = Math.ceil(totalLeads / limit);
    const skip = (page - 1) * limit;

    const users = await User.find(userQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const leadsWithDetails = await Promise.all(
      users.map(async (user) => {
        const personalDetails = await PersonalDetails.findOne({ userId: user._id });
        const loans = await Loan.find({ userId: user._id });
        
        return {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt
          },
          hasPersonalDetails: !!personalDetails,
          hasApplied: loans.length > 0,
          totalApplications: loans.length
        };
      })
    );

    res.status(200).json({ 
      leads: leadsWithDetails,
      totalLeads,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Get sales leads error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSanctionLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5; // Default 5 for sleek UI
    const search = req.query.search as string;

    let loanQuery: any = { status: LoanStatus.APPLIED };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const users = await User.find({ email: searchRegex }).select('_id');
      const details = await PersonalDetails.find({ 
        $or: [{ fullName: searchRegex }, { pan: searchRegex }] 
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      const personalDetailsIds = details.map(d => d._id);

      loanQuery = {
        status: LoanStatus.APPLIED,
        $or: [
          { userId: { $in: userIds } },
          { personalDetailsId: { $in: personalDetailsIds } }
        ]
      };
    }

    const totalLoans = await Loan.countDocuments(loanQuery);
    const totalPages = Math.ceil(totalLoans / limit);
    const skip = (page - 1) * limit;

    const loans = await Loan.find(loanQuery)
      .select('-salarySlipData')
      .populate('userId', '-password')
      .populate('personalDetailsId')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      loans, 
      totalLoans, 
      totalPages, 
      currentPage: page 
    });
  } catch (error) {
    console.error('Get sanction loans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sanctionLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Invalid action. Must be approve or reject' });
      return;
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (loan.status !== LoanStatus.APPLIED) {
      res.status(400).json({ message: 'Loan is not in applied status' });
      return;
    }

    if (action === 'approve') {
      loan.status = LoanStatus.SANCTIONED;
      loan.sanctionedAt = new Date();
    } else {
      if (!rejectionReason) {
        res.status(400).json({ message: 'Rejection reason is required' });
        return;
      }
      loan.status = LoanStatus.REJECTED;
      loan.rejectionReason = rejectionReason;
    }

    await loan.save();

    res.status(200).json({
      message: `Loan ${action === 'approve' ? 'sanctioned' : 'rejected'} successfully`,
      loan
    });
  } catch (error) {
    console.error('Sanction loan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDisbursementLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const search = req.query.search as string;

    let loanQuery: any = { status: LoanStatus.SANCTIONED };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const users = await User.find({ email: searchRegex }).select('_id');
      const details = await PersonalDetails.find({ 
        $or: [{ fullName: searchRegex }, { pan: searchRegex }] 
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      const personalDetailsIds = details.map(d => d._id);

      loanQuery = {
        status: LoanStatus.SANCTIONED,
        $or: [
          { userId: { $in: userIds } },
          { personalDetailsId: { $in: personalDetailsIds } }
        ]
      };
    }

    const totalLoans = await Loan.countDocuments(loanQuery);
    const totalPages = Math.ceil(totalLoans / limit);
    const skip = (page - 1) * limit;

    const loans = await Loan.find(loanQuery)
      .select('-salarySlipData')
      .populate('userId', '-password')
      .populate('personalDetailsId')
      .sort({ sanctionedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      loans,
      totalLoans,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Get disbursement loans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const disburseLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (loan.status !== LoanStatus.SANCTIONED) {
      res.status(400).json({ message: 'Loan is not in sanctioned status' });
      return;
    }

    loan.status = LoanStatus.DISBURSED;
    loan.disbursedAt = new Date();
    await loan.save();

    res.status(200).json({
      message: 'Loan disbursed successfully',
      loan
    });
  } catch (error) {
    console.error('Disburse loan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollectionLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const search = req.query.search as string;

    let loanQuery: any = { status: LoanStatus.DISBURSED };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const users = await User.find({ email: searchRegex }).select('_id');
      const details = await PersonalDetails.find({ 
        $or: [{ fullName: searchRegex }, { pan: searchRegex }] 
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      const personalDetailsIds = details.map(d => d._id);

      loanQuery = {
        status: LoanStatus.DISBURSED,
        $or: [
          { userId: { $in: userIds } },
          { personalDetailsId: { $in: personalDetailsIds } }
        ]
      };
    }

    const totalLoans = await Loan.countDocuments(loanQuery);
    const totalPages = Math.ceil(totalLoans / limit);
    const skip = (page - 1) * limit;

    const loans = await Loan.find(loanQuery)
      .select('-salarySlipData')
      .populate('userId', '-password')
      .populate('personalDetailsId')
      .sort({ disbursedAt: -1 })
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

    res.status(200).json({ 
      loans: loansWithPayments,
      totalLoans,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Get collection loans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { utrNumber, amount, paymentDate } = req.body;

    if (!utrNumber || !amount || !paymentDate) {
      res.status(400).json({ message: 'UTR number, amount, and payment date are required' });
      return;
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (loan.status !== LoanStatus.DISBURSED) {
      res.status(400).json({ message: 'Loan is not in disbursed status' });
      return;
    }

    const existingPayment = await Payment.findOne({ utrNumber });
    if (existingPayment) {
      res.status(400).json({ message: 'UTR number already exists' });
      return;
    }

    const existingPayments = await Payment.find({ loanId });
    const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingBalance = loan.totalRepayment - totalPaid;

    if (amount > outstandingBalance) {
      res.status(400).json({
        message: `Payment amount exceeds outstanding balance of ₹${outstandingBalance}`
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ message: 'Payment amount must be greater than 0' });
      return;
    }

    const payment = await Payment.create({
      loanId,
      utrNumber,
      amount,
      paymentDate
    });

    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid >= loan.totalRepayment) {
      loan.status = LoanStatus.CLOSED;
      loan.closedAt = new Date();
      await loan.save();
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
      loanStatus: loan.status,
      totalPaid: newTotalPaid,
      outstandingBalance: loan.totalRepayment - newTotalPaid
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLoanDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId)
      .select('-salarySlipData')
      .populate('userId', '-password')
      .populate('personalDetailsId');

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    const payments = await Payment.find({ loanId }).sort({ paymentDate: -1 });
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingBalance = loan.totalRepayment - totalPaid;

    res.status(200).json({
      loan,
      payments,
      totalPaid,
      outstandingBalance
    });
  } catch (error) {
    console.error('Get loan details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLoanDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (!loan.salarySlipData) {
      res.status(404).json({ message: 'No document found for this loan' });
      return;
    }

    res.set('Content-Type', loan.salarySlipContentType || 'application/pdf');
    res.send(loan.salarySlipData);
  } catch (error) {
    console.error('Get loan document error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
