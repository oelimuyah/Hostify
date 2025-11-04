// routes/analytics.js
import express from 'express';
import Lounge from '../models/Lounge.js';
import Booking from '../models/Booking.js';
import Order from '../models/Order.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  // Total counts
  const totalLounges = await Lounge.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalBookings = await Booking.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Revenue calculation
  const revenueData = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = revenueData[0]?.total || 0;

  const orderRevenue = await Order.aggregate([
    { $match: { status: { $in: ['delivered', 'ready'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalOrderRevenue = orderRevenue[0]?.total || 0;

  // Average ratings
  const avgRatingData = await Feedback.aggregate([
    { $group: { _id: null, avg: { $avg: '$rating' } } }
  ]);
  const avgRating = avgRatingData[0]?.avg || 0;

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate(['loungeId', 'userId'])
    .sort({ createdAt: -1 })
    .limit(10);

  // Booking status breakdown
  const bookingStats = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Popular lounges (most booked)
  const popularLounges = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    { $group: { _id: '$loungeId', bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'lounges',
        localField: '_id',
        foreignField: '_id',
        as: 'lounge'
      }
    },
    { $unwind: '$lounge' }
  ]);

  // Monthly revenue trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    overview: {
      totalLounges,
      totalUsers,
      totalBookings,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrderRevenue: parseFloat(totalOrderRevenue.toFixed(2)),
      combinedRevenue: parseFloat((totalRevenue + totalOrderRevenue).toFixed(2)),
      avgRating: parseFloat(avgRating.toFixed(2))
    },
    bookingStats,
    popularLounges,
    monthlyRevenue,
    recentBookings
  });
}));

// @route   GET /api/analytics/bookings
// @desc    Get booking analytics
// @access  Private (Admin)
router.get('/bookings', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // Bookings by status
  const byStatus = await Booking.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }
  ]);

  // Bookings by lounge
  const byLounge = await Booking.aggregate([
    { $match: query },
    { $group: { _id: '$loungeId', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
    {
      $lookup: {
        from: 'lounges',
        localField: '_id',
        foreignField: '_id',
        as: 'lounge'
      }
    },
    { $unwind: '$lounge' },
    { $sort: { count: -1 } }
  ]);

  // Daily bookings trend
  const dailyTrend = await Booking.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    byStatus,
    byLounge,
    dailyTrend
  });
}));

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private (Admin)
router.get('/revenue', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  let dateFilter = {};
  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
  }

  // Booking revenue
  const bookingRevenue = await Booking.aggregate([
    { $match: { ...dateFilter, status: { $in: ['confirmed', 'completed'] } } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 },
        avg: { $avg: '$totalPrice' }
      }
    }
  ]);

  // Order revenue
  const orderRevenue = await Order.aggregate([
    { $match: { ...dateFilter, status: { $in: ['delivered', 'ready'] } } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        avg: { $avg: '$totalAmount' }
      }
    }
  ]);

  res.json({
    bookingRevenue: bookingRevenue[0] || { total: 0, count: 0, avg: 0 },
    orderRevenue: orderRevenue[0] || { total: 0, count: 0, avg: 0 },
    combinedTotal: (bookingRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0)
  });
}));

// @route   GET /api/analytics/customers
// @desc    Get customer analytics
// @access  Private (Admin)
router.get('/customers', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  // Total customers
  const totalCustomers = await User.countDocuments({ role: 'customer' });

  // Active customers (with bookings)
  const activeCustomers = await Booking.distinct('userId');

  // Top customers by bookings
  const topCustomers = await Booking.aggregate([
    { $group: { _id: '$userId', bookings: { $sum: 1 }, spent: { $sum: '$totalPrice' } } },
    { $sort: { bookings: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ]);

  // New customers this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newCustomersThisMonth = await User.countDocuments({
    role: 'customer',
    createdAt: { $gte: startOfMonth }
  });

  res.json({
    totalCustomers,
    activeCustomers: activeCustomers.length,
    newCustomersThisMonth,
    topCustomers
  });
}));

// @route   GET /api/analytics/feedback
// @desc    Get feedback analytics
// @access  Private (Admin)
router.get('/feedback', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  // Average ratings
  const avgRatings = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        avgOverall: { $avg: '$rating' },
        avgService: { $avg: '$serviceRating' },
        avgCleanliness: { $avg: '$cleanlinessRating' },
        total: { $sum: 1 }
      }
    }
  ]);

  // Rating distribution
  const ratingDistribution = await Feedback.aggregate([
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Feedback by lounge
  const byLounge = await Feedback.aggregate([
    {
      $group: {
        _id: '$loungeId',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    },
    {
      $lookup: {
        from: 'lounges',
        localField: '_id',
        foreignField: '_id',
        as: 'lounge'
      }
    },
    { $unwind: '$lounge' },
    { $sort: { avgRating: -1 } }
  ]);

  // Low Ratings (<=3)
  const lowRatings = await Feedback.find({ rating: { $lte: 3 } })
    .populate(['userId', 'loungeId'])
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    averageRatings: avgRatings[0] || { avgOverall: 0, avgService: 0, avgCleanliness: 0, total: 0 },
    ratingDistribution,
    byLounge,
    lowRatings
  });
}));

export default router;