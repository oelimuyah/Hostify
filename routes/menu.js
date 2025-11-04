// routes/menu.js
import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { createMenuItemValidator } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category, available } = req.query;
  
  let query = {};
  if (category) query.category = category;
  if (available !== undefined) query.available = available === 'true';

  const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

  res.json({
    count: menuItems.length,
    menuItems
  });
}));

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  res.json(menuItem);
}));

// @route   POST /api/menu
// @desc    Create menu item
// @access  Private (Admin)
router.post('/', authenticate, authorizeAdmin, createMenuItemValidator, asyncHandler(async (req, res) => {
  const menuItem = new MenuItem(req.body);
  await menuItem.save();

  res.status(201).json({
    message: 'Menu item created successfully',
    menuItem
  });
}));

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private (Admin)
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  res.json({
    message: 'Menu item updated successfully',
    menuItem
  });
}));

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private (Admin)
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  await menuItem.deleteOne();

  res.json({ message: 'Menu item deleted successfully' });
}));

export default router;