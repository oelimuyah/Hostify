// controllers/menuController.js
import MenuItem from '../models/MenuItem.js';

// @desc Get all menu items
export const getAllMenuItems = async (req, res) => {
  const { category, available } = req.query;

  let query = {};
  if (category) query.category = category;
  if (available !== undefined) query.available = available === 'true';

  const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

  res.json({
    count: menuItems.length,
    menuItems,
  });
};

// @desc Get a single menu item
export const getMenuItemById = async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  res.json(menuItem);
};

// @desc Create a new menu item
export const createMenuItem = async (req, res) => {
  const menuItem = new MenuItem(req.body);
  await menuItem.save();

  res.status(201).json({
    message: 'Menu item created successfully',
    menuItem,
  });
};

// @desc Update a menu item
export const updateMenuItem = async (req, res) => {
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
    menuItem,
  });
};

// @desc Delete a menu item
export const deleteMenuItem = async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  await menuItem.deleteOne();

  res.json({ message: 'Menu item deleted successfully' });
};
