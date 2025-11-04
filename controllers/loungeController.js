// controllers/loungeController.js
import Lounge from '../models/Lounge.js';
import Booking from '../models/Booking.js';

// @desc Get all lounges with optional filters
export const getAllLounges = async (req, res) => {
  const { status, minCapacity, maxPrice, sort } = req.query;

  let query = {};

  // Apply filters
  if (status) query.status = status;
  if (minCapacity) query.capacity = { ...query.capacity, $gte: parseInt(minCapacity) };
  if (maxPrice) query.pricePerHour = { $lte: parseFloat(maxPrice) };

  // Sorting
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (sort === 'price_asc') sortOption = { pricePerHour: 1 };
  if (sort === 'price_desc') sortOption = { pricePerHour: -1 };
  if (sort === 'capacity_asc') sortOption = { capacity: 1 };
  if (sort === 'capacity_desc') sortOption = { capacity: -1 };
  if (sort === 'name') sortOption = { name: 1 };

  const lounges = await Lounge.find(query).sort(sortOption);

  res.json({
    count: lounges.length,
    lounges,
  });
};

// @desc Get single lounge by ID
export const getLoungeById = async (req, res) => {
  const lounge = await Lounge.findById(req.params.id);

  if (!lounge) {
    return res.status(404).json({ error: 'Lounge not found' });
  }

  res.json(lounge);
};

// @desc Create a new lounge
export const createLounge = async (req, res) => {
  const lounge = new Lounge(req.body);
  await lounge.save();

  res.status(201).json({
    message: 'Lounge created successfully',
    lounge,
  });
};

// @desc Update lounge
export const updateLounge = async (req, res) => {
  const lounge = await Lounge.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!lounge) {
    return res.status(404).json({ error: 'Lounge not found' });
  }

  res.json({
    message: 'Lounge updated successfully',
    lounge,
  });
};

// @desc Delete lounge
export const deleteLounge = async (req, res) => {
  const lounge = await Lounge.findById(req.params.id);

  if (!lounge) {
    return res.status(404).json({ error: 'Lounge not found' });
  }

  // Prevent deleting lounges with future bookings
  const futureBookings = await Booking.countDocuments({
    loungeId: req.params.id,
    startTime: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] },
  });

  if (futureBookings > 0) {
    return res.status(400).json({
      error: 'Cannot delete lounge with active or future bookings',
    });
  }

  await lounge.deleteOne();

  res.json({ message: 'Lounge deleted successfully' });
};

// @desc Check if lounge is available for booking
export const checkLoungeAvailability = async (req, res) => {
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({ error: 'Start time and end time are required' });
  }

  const lounge = await Lounge.findById(req.params.id);
  if (!lounge) {
    return res.status(404).json({ error: 'Lounge not found' });
  }

  if (!lounge.isBookable()) {
    return res.status(400).json({
      available: false,
      message: 'Lounge is currently unavailable for booking',
    });
  }

  // Check for conflicting bookings
  const conflictingBookings = await Booking.find({
    loungeId: req.params.id,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
      { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
      { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } },
    ],
  });

  res.json({
    available: conflictingBookings.length === 0,
    conflicts: conflictingBookings,
    lounge: {
      name: lounge.name,
      capacity: lounge.capacity,
      pricePerHour: lounge.pricePerHour,
    },
  });
};
