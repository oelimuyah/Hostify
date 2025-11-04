// routes/orders.js
import express from 'express';
import { authenticate, authorizeStaff } from '../middleware/auth.js';
import { createOrderValidator, updateOrderStatusValidator } from '../middleware/validation.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

// Customer routes
router.post('/', authenticate, orderLimiter, createOrderValidator, asyncHandler(createOrder));
router.get('/my-orders', authenticate, asyncHandler(getMyOrders));
router.get('/:id', authenticate, asyncHandler(getOrderById));

// Staff/Admin routes
router.get('/', authenticate, authorizeStaff, asyncHandler(getAllOrders));
router.patch('/:id/status', authenticate, authorizeStaff, updateOrderStatusValidator, asyncHandler(updateOrderStatus));

export default router;
