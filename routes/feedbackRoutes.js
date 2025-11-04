// routes/feedback.js
import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { createFeedbackValidator } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  submitFeedback,
  getFeedbackForLounge,
  getMyFeedback,
  getAllFeedback,
  respondToFeedback,
  deleteFeedback,
} from '../controllers/feedbackController.js';

const router = express.Router();

// Public routes
router.get('/lounge/:loungeId', asyncHandler(getFeedbackForLounge));

// Authenticated user routes
router.post('/', authenticate, createFeedbackValidator, asyncHandler(submitFeedback));
router.get('/my-feedback', authenticate, asyncHandler(getMyFeedback));

// Admin-only routes
router.get('/', authenticate, authorizeAdmin, asyncHandler(getAllFeedback));
router.patch('/:id/respond', authenticate, authorizeAdmin, asyncHandler(respondToFeedback));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(deleteFeedback));

export default router;
