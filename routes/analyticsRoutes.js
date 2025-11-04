// routes/analytics.js
import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getDashboardAnalytics,
  getBookingAnalytics,
  getRevenueAnalytics,
  getCustomerAnalytics,
  getFeedbackAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorizeAdmin, asyncHandler(getDashboardAnalytics));
router.get('/bookings', authenticate, authorizeAdmin, asyncHandler(getBookingAnalytics));
router.get('/revenue', authenticate, authorizeAdmin, asyncHandler(getRevenueAnalytics));
router.get('/customers', authenticate, authorizeAdmin, asyncHandler(getCustomerAnalytics));
router.get('/feedback', authenticate, authorizeAdmin, asyncHandler(getFeedbackAnalytics));

export default router;
