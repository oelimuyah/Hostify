// routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import { authenticate, authorizeStaff } from '../middleware/auth.js';
import { createOrderValidator, updateOrderStatusValidator } from '../middleware/validation.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authenticate, orderLimiter, createOrderValidator, asyncHandler(async (req, res) => {
  const { loungeId, bookingId, items, specialInstructions } = req.body;

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const order = new Order({
    userId: req.user._id,
    loungeId,
    bookingId,
    items,
    totalAmount,
    specialInstructions
  });

  await order.save();
  await order.populate(['userId', 'loungeId']);

  res.status(201).json({
    message: 'Order created successfully',
    order
  });
}));

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', authenticate, asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let query = { userId: req.user._id };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('loungeId')
    .sort({ createdAt: -1 });

  res.json({
    count: orders.length,
    orders
  });
}));

// @route   GET /api/orders
// @desc    Get all orders (Staff/Admin only)
// @access  Private (Staff/Admin)
router.get('/', authenticate, authorizeStaff, asyncHandler(async (req, res) => {
  const { status, loungeId } = req.query;
  
  let query = {};
  if (status) query.status = status;
  if (loungeId) query.loungeId = loungeId;

  const orders = await Order.find(query)
    .populate(['userId', 'loungeId'])
    .sort({ createdAt: -1 });

  res.json({
    count: orders.length,
    orders
  });
}));

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate(['userId', 'loungeId']);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Check permissions
  if (order.userId._id.toString() !== req.user._id.toString() && 
      req.user.role === 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(order);
}));

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Staff/Admin)
router.patch('/:id/status', authenticate, authorizeStaff, updateOrderStatusValidator, asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  
  if (status === 'preparing' && !order.preparedAt) {
    order.preparedAt = new Date();
  }
  if (status === 'delivered' && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  await order.save();
  await order.populate(['userId', 'loungeId']);

  res.json({
    message: `Order status updated to ${status}`,
    order
  });
}));

export default router;