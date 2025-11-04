// controllers/orderController.js
import Order from '../models/Order.js';

// @desc Create a new order
export const createOrder = async (req, res) => {
  const { loungeId, bookingId, items, specialInstructions } = req.body;

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
};

// @desc Get current user's orders
export const getMyOrders = async (req, res) => {
  const { status } = req.query;
  const query = { userId: req.user._id };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('loungeId')
    .sort({ createdAt: -1 });

  res.json({
    count: orders.length,
    orders
  });
};

// @desc Get all orders (Staff/Admin)
export const getAllOrders = async (req, res) => {
  const { status, loungeId } = req.query;
  const query = {};
  if (status) query.status = status;
  if (loungeId) query.loungeId = loungeId;

  const orders = await Order.find(query)
    .populate(['userId', 'loungeId'])
    .sort({ createdAt: -1 });

  res.json({
    count: orders.length,
    orders
  });
};

// @desc Get single order
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate(['userId', 'loungeId']);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Restrict customers to their own orders
  if (order.userId._id.toString() !== req.user._id.toString() &&
      req.user.role === 'customer') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(order);
};

// @desc Update order status (Staff/Admin)
export const updateOrderStatus = async (req, res) => {
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
};
