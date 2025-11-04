// middleware/errorHandler.js

// Global Error Handler
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prevent double response
  if (res.headersSent) {
    // If headers already sent, let Express handle the rest
    return next(err);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: "Validation Error",
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(400).json({
      error: `${field} already exists. Please use a different value.`
    });
  }

  // Mongoose CastError (invalid ObjectId-CastError)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: 'Invalid token. Please login again.'
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: 'Token expired. Please login again.'
    });
  }

  // Default error
   res.status(err.status || 500).json({
    error: err.message || "Internal server error", ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

// 404 Not Found Handler
export const notFound = (req, res) => {
  res.status(404).json({error: "Route not found", path: req.originalUrl});
};

// Async Handler Wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};