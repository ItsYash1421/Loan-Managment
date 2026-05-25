import { Router } from 'express';
import {
  submitPersonalDetails,
  uploadSalarySlip,
  calculateLoan,
  applyLoan,
  getMyLoans,
  getPersonalDetails,
  deleteLoan,
  updateLoan
} from '../controllers/borrowerController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.BORROWER));

router.post('/personal-details', submitPersonalDetails);
router.get('/personal-details', getPersonalDetails);
router.post('/upload-salary-slip', upload.single('salarySlip'), uploadSalarySlip);
router.post('/calculate-loan', calculateLoan);
router.post('/apply-loan', applyLoan);
router.get('/my-loans', getMyLoans);
router.delete('/loans/:loanId', deleteLoan);
router.put('/loans/:loanId', updateLoan);

export default router;
