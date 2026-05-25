import { Router } from 'express';
import {
  getSalesLeads,
  getSanctionLoans,
  sanctionLoan,
  getDisbursementLoans,
  disburseLoan,
  getCollectionLoans,
  recordPayment,
  getLoanDetails,
  getLoanDocument
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/sales/leads', authorize(UserRole.SALES, UserRole.ADMIN), getSalesLeads);

router.get('/sanction/loans', authorize(UserRole.SANCTION, UserRole.ADMIN), getSanctionLoans);
router.post('/sanction/loans/:loanId', authorize(UserRole.SANCTION, UserRole.ADMIN), sanctionLoan);
router.get('/sanction/loans/:loanId/document', authorize(UserRole.SANCTION, UserRole.ADMIN), getLoanDocument);

router.get('/disbursement/loans', authorize(UserRole.DISBURSEMENT, UserRole.ADMIN), getDisbursementLoans);
router.post('/disbursement/loans/:loanId', authorize(UserRole.DISBURSEMENT, UserRole.ADMIN), disburseLoan);

router.get('/collection/loans', authorize(UserRole.COLLECTION, UserRole.ADMIN), getCollectionLoans);
router.post('/collection/loans/:loanId/payment', authorize(UserRole.COLLECTION, UserRole.ADMIN), recordPayment);

router.get('/loans/:loanId', authorize(UserRole.SALES, UserRole.SANCTION, UserRole.DISBURSEMENT, UserRole.COLLECTION, UserRole.ADMIN), getLoanDetails);

export default router;
