// models/MenuItem.js
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['food', 'drink', 'snack', 'other'],
      message: '{VALUE} is not a valid category'
    },
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    trim: true
  },
  allergens: [{
    type: String,
    trim: true
  }],
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get available items by category
menuItemSchema.statics.findByCategory = function(category) {
  return this.find({ category, available: true });
};

export default mongoose.model('MenuItem', menuItemSchema);