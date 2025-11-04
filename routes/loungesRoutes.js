// routes/lounges.js
import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { createLoungeValidator, updateLoungeValidator } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAllLounges,
  getLoungeById,
  createLounge,
  updateLounge,
  deleteLounge,
  checkLoungeAvailability,
} from '../controllers/loungeController.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getAllLounges));
router.get('/:id', asyncHandler(getLoungeById));
router.post('/:id/check-availability', asyncHandler(checkLoungeAvailability));

// Admin routes
router.post('/', authenticate, authorizeAdmin, createLoungeValidator, asyncHandler(createLounge));
router.put('/:id', authenticate, authorizeAdmin, updateLoungeValidator, asyncHandler(updateLounge));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(deleteLounge));

export default router;
