// middleware/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Authenticate user via JWT token
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ','').trim();
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided. Please authenticate.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found. Invalid token.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive. Please contact support.' });
    }
    
    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    res.status(500).json({ error: 'Authentication failed! Server error.' });
  }
};

// Authorize Admin role
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({error: 'Access denied. Admin privileges required.'});
  }
  next();
};

// Authorize Staff or Admin roles
export const authorizeStaff = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({error: 'Access denied. Staff or Admin privileges required.'});
  }
  next();
};

// Check if user owns the resource
export const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = (await import(`../models/${modelName}.js`)).default;
      const resource = await Model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ error: `${modelName} not found` });
      }
      
      // Admin can access everything
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }
      
      // Check if user owns the resource
      if (resource.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You do not own this resource.' });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};