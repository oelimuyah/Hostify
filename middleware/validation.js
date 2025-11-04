// middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth Validators
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  validate
];

export const loginValidator = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// Lounge Validators
export const createLoungeValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Lounge name is required'),
  body('capacity')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('pricePerHour')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('amenities')
    .optional()
    .isArray().withMessage('Amenities must be an array'),
  body('status')
    .optional()
    .isIn(['available', 'maintenance', 'unavailable'])
    .withMessage('Invalid status'),
  validate
];

export const updateLoungeValidator = [
  param('id').isMongoId().withMessage('Invalid lounge ID'),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('pricePerHour')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  validate
];

// Booking Validators
export const createBookingValidator = [
  body('loungeId')
    .isMongoId().withMessage('Valid lounge ID is required'),
  body('startTime')
    .isISO8601().withMessage('Valid start time is required')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  body('endTime')
    .isISO8601().withMessage('Valid end time is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('numberOfGuests')
    .isInt({ min: 1 }).withMessage('At least 1 guest required'),
  validate
];

export const updateBookingStatusValidator = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid booking status'),
  validate
];

// Feedback Validators
export const createFeedbackValidator = [
  body('loungeId')
    .isMongoId().withMessage('Valid lounge ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('serviceRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Service rating must be between 1 and 5'),
  body('cleanlinessRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Cleanliness rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  validate
];

// Order Validators
export const createOrderValidator = [
  body('loungeId')
    .isMongoId().withMessage('Valid lounge ID is required'),
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.name')
    .trim()
    .notEmpty().withMessage('Item name is required'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price')
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('items.*.category')
    .isIn(['food', 'drink', 'snack', 'other'])
    .withMessage('Invalid category'),
  validate
];

export const updateOrderStatusValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .isIn(['pending', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  validate
];

// Menu Item Validators
export const createMenuItemValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Menu item name is required'),
  body('category')
    .isIn(['food', 'drink', 'snack', 'other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  validate
];