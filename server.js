// server.js - Main Application Entry Point
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// Import database connection
import './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import loungeRoutes from './routes/loungesRoutes.js';
import bookingRoutes from './routes/bookingsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import orderRoutes from './routes/ordersRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware (Development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api/', apiLimiter);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Hostify Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lounges', loungeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;