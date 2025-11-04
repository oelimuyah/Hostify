// models/Lounge.js
import mongoose from 'mongoose';

const loungeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lounge name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: {
      values: ['available', 'maintenance', 'unavailable'],
      message: '{VALUE} is not a valid status'
    },
    default: 'available'
  },
  location: {
    type: String,
    trim: true
  },
  floor: {
    type: Number
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

// Update timestamp before saving
loungeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for displaying capacity status
loungeSchema.virtual('capacityStatus').get(function() {
  if (this.capacity <= 10) return 'Small';
  if (this.capacity <= 30) return 'Medium';
  return 'Large';
});

// Static method to find available lounges
loungeSchema.statics.findAvailable = function() {
  return this.find({ status: 'available' });
};

// Instance method to check if lounge is bookable
loungeSchema.methods.isBookable = function() {
  return this.status === 'available';
};

export default mongoose.model('Lounge', loungeSchema);