// controllers/feedbackController.js
import Feedback from '../models/Feedback.js';

// @desc Submit feedback
export const submitFeedback = async (req, res) => {
  const { loungeId, bookingId, rating, serviceRating, cleanlinessRating, comment } = req.body;

  const feedback = new Feedback({
    userId: req.user._id,
    loungeId,
    bookingId,
    rating,
    serviceRating,
    cleanlinessRating,
    comment,
  });

  await feedback.save();
  await feedback.populate(['userId', 'loungeId']);

  res.status(201).json({
    message: 'Feedback submitted successfully',
    feedback,
  });
};

// @desc Get feedback for a specific lounge
export const getFeedbackForLounge = async (req, res) => {
  const feedback = await Feedback.find({ loungeId: req.params.loungeId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

  // Calculate average ratings
  const avgRating = feedback.length
    ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
    : 0;

  const avgServiceRating = feedback.filter(f => f.serviceRating).length
    ? feedback.filter(f => f.serviceRating)
        .reduce((sum, f) => sum + f.serviceRating, 0) / feedback.filter(f => f.serviceRating).length
    : 0;

  const avgCleanlinessRating = feedback.filter(f => f.cleanlinessRating).length
    ? feedback.filter(f => f.cleanlinessRating)
        .reduce((sum, f) => sum + f.cleanlinessRating, 0) / feedback.filter(f => f.cleanlinessRating).length
    : 0;

  res.json({
    feedback,
    statistics: {
      totalFeedback: feedback.length,
      avgRating: parseFloat(avgRating.toFixed(2)),
      avgServiceRating: parseFloat(avgServiceRating.toFixed(2)),
      avgCleanlinessRating: parseFloat(avgCleanlinessRating.toFixed(2)),
    },
  });
};

// @desc Get current user's feedback
export const getMyFeedback = async (req, res) => {
  const feedback = await Feedback.find({ userId: req.user._id })
    .populate('loungeId')
    .sort({ createdAt: -1 });

  res.json({
    count: feedback.length,
    feedback,
  });
};

// @desc Get all feedback (Admin only)
export const getAllFeedback = async (req, res) => {
  const { rating, hasResponse } = req.query;
  let query = {};

  if (rating) query.rating = parseInt(rating);
  if (hasResponse === 'true') query.response = { $exists: true, $ne: null };
  if (hasResponse === 'false') query.response = { $exists: false };

  const feedback = await Feedback.find(query)
    .populate(['userId', 'loungeId'])
    .sort({ createdAt: -1 });

  res.json({
    count: feedback.length,
    feedback,
  });
};

// @desc Respond to feedback (Admin only)
export const respondToFeedback = async (req, res) => {
  const { response } = req.body;

  if (!response) {
    return res.status(400).json({ error: 'Response text is required' });
  }

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    {
      response,
      respondedAt: new Date(),
    },
    { new: true }
  ).populate(['userId', 'loungeId']);

  if (!feedback) {
    return res.status(404).json({ error: 'Feedback not found' });
  }

  res.json({
    message: 'Response added successfully',
    feedback,
  });
};

// @desc Delete feedback (Admin only)
export const deleteFeedback = async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({ error: 'Feedback not found' });
  }

  await feedback.deleteOne();

  res.json({ message: 'Feedback deleted successfully' });
};
