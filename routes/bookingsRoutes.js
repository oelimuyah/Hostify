// routes/bookings.js
import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { createBookingValidator, updateBookingStatusValidator } from '../middleware/validation.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.js';

const router = express.Router();

// User routes
router.post('/', authenticate, bookingLimiter, createBookingValidator, asyncHandler(createBooking));
router.get('/my-bookings', authenticate, asyncHandler(getMyBookings));
router.get('/:id', authenticate, asyncHandler(getBookingById));
router.patch('/:id/status', authenticate, updateBookingStatusValidator, asyncHandler(updateBookingStatus));

// Admin routes
router.get('/', authenticate, authorizeAdmin, asyncHandler(getAllBookings));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(deleteBooking));

export default router;
