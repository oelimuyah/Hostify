// routes/menu.js
import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { createMenuItemValidator } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getAllMenuItems));
router.get('/:id', asyncHandler(getMenuItemById));

// Admin routes
router.post('/', authenticate, authorizeAdmin, createMenuItemValidator, asyncHandler(createMenuItem));
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(updateMenuItem));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(deleteMenuItem));

export default router;
