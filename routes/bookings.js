// routes/bookings.js
import express from 'express';
import Booking from '../models/Booking.js';
import Lounge from '../models/Lounge.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { createBookingValidator, updateBookingStatusValidator } from '../middleware/validation.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authenticate, bookingLimiter, createBookingValidator, asyncHandler(async (req, res) => {
  const { loungeId, startTime, endTime, numberOfGuests, specialRequests } = req.body;

  // Verify lounge exists
  const lounge = await Lounge.findById(loungeId);
  if (!lounge) {
    return res.status(404).json({ error: 'Lounge not found' });
  }

  // Check if lounge is available
  if (!lounge.isBookable()) {
    return res.status(400).json({ error: 'Lounge is currently unavailable for booking' });
  }

  // Check capacity
  if (numberOfGuests > lounge.capacity) {
    return res.status(400).json({
      error: `Number of guests (${numberOfGuests}) exceeds lounge capacity (${lounge.capacity})`
    });
  }

  // Check for conflicting bookings
  const conflictingBookings = await Booking.find({
    loungeId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
      { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
      { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } }
    ]
  });

  if (conflictingBookings.length > 0) {
    return res.status(400).json({
      error: 'Lounge is not available for the selected time slot',
      conflicts: conflictingBookings
    });
  }

  // Calculate total price
  const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  const totalPrice = hours * lounge.pricePerHour;

  // Create booking
  const booking = new Booking({
    userId: req.user._id,
    loungeId,
    startTime,
    endTime,
    numberOfGuests,
    totalPrice,
    specialRequests
  });

  await booking.save();
  await booking.populate(['loungeId', 'userId']);

  res.status(201).json({
    message: 'Booking created successfully',
    booking
  });
}));

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get('/my-bookings', authenticate, asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;
  
  let query = { userId: req.user._id };
  
  if (status) query.status = status;
  if (upcoming === 'true') {
    query.startTime = { $gte: new Date() };
    query.status = { $in: ['pending', 'confirmed'] };
  }
  
  const bookings = await Booking.find(query)
    .populate('loungeId')
    .sort({ startTime: -1 });

  res.json({
    count: bookings.length,
    bookings
  });
}));

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('loungeId userId');

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check if user owns this booking or is admin
  if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(booking);
}));

// @route   GET /api/bookings
// @desc    Get all bookings (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  const { status, loungeId, date } = req.query;
  
  let query = {};
  
  if (status) query.status = status;
  if (loungeId) query.loungeId = loungeId;
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  const bookings = await Booking.find(query)
    .populate('loungeId userId')
    .sort({ createdAt: -1 });

  res.json({
    count: bookings.length,
    bookings
  });
}));

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.patch('/:id/status', authenticate, updateBookingStatusValidator, asyncHandler(async (req, res) => {
  const { status } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check permissions
  const isOwner = booking.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Customers can only cancel their bookings
  if (!isAdmin && status !== 'cancelled') {
    return res.status(403).json({ error: 'You can only cancel your bookings' });
  }

  // Check if booking can be cancelled (24 hours before)
  if (status === 'cancelled' && !booking.canBeCancelled()) {
    return res.status(400).json({
      error: 'Bookings can only be cancelled at least 24 hours before the start time'
    });
  }

  // Update status
  booking.status = status;
  await booking.save();
  await booking.populate(['loungeId', 'userId']);

  res.json({
    message: `Booking ${status} successfully`,
    booking
  });
}));

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  await booking.deleteOne();

  res.json({ message: 'Booking deleted successfully' });
}));

export default router;