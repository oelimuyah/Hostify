// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  loungeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lounge",
    required: true,
  },
  startTime: {
    type: Date,
    required: true, 
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'completed'],
      message: '{VALUE} is not a valid booking status'
    },
    default: 'pending'
  },
  specialRequests: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
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

// Indexes for better query performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ loungeId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1 });

// Update timestamp before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set timestamps for status changes
  if (this.isModified('status')) {
    if (this.status === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = Date.now();
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = Date.now();
    }
  }
  
  next();
});

// Virtual for booking duration in hours
bookingSchema.virtual('durationHours').get(function() {
  return (this.endTime - this.startTime) / (1000 * 60 * 60);
});

// Static method to find upcoming bookings
bookingSchema.statics.findUpcoming = function(userId) {
  return this.find({
    userId,
    startTime: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  }).sort({ startTime: 1 });
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilStart = (this.startTime - now) / (1000 * 60 * 60);
  return hoursUntilStart >= 24 && this.status !== 'cancelled';
};

export default mongoose.model('Booking', bookingSchema);