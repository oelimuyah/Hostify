# Hostify Backend API
A comprehensive RESTful API for managing lounge bookings, customer feedback, orders, and more. Built with Node.js, Express, and MongoDB.

# Installation
1.	Clone the repository
git clone <https://github.com/oelimuyah/Hostify>
cd Hostify
2.	Install dependencies
npm install
3.	Set up environment variables
Create a .env file in the root directory and copy the contents from .env.example:
cp .env.example .env
Edit the .env file with your configuration:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lounge_management
JWT_SECRET=your-super-secret-jwt-key-change-this

4.	Start MongoDB
Make sure MongoDB is running on your system: (For MongoDB installed locally mongodb)

5.	Seed the database (optional)
Populate the database with sample data:
node utils/seed.js

7.	Start the server [Development mode with auto-reload]
npm run dev

# Production mode
npm start [The server will start on http://localhost:5000]

# API Documentation
Base URL: http://localhost:5000/api
Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header: Authorization: Bearer <your-jwt-token>

Authentication
•	POST /api/auth/register - Register new user
•	POST /api/auth/login - Login user
•	GET /api/auth/me - Get current user profile

Lounges
•	GET /api/lounges - Get all lounges (with filters)
•	GET /api/lounges/:id - Get single lounge
•	POST /api/lounges - Create lounge (Admin)
•	PUT /api/lounges/:id - Update lounge (Admin)
•	DELETE /api/lounges/:id - Delete lounge (Admin)
•	POST /api/lounges/:id/check-availability - Check availability

Bookings
•	POST /api/bookings - Create booking
•	GET /api/bookings/my-bookings - Get user's bookings
•	GET /api/bookings - Get all bookings (Admin)
•	PATCH /api/bookings/:id/status - Update booking status

Feedback
•	POST /api/feedback - Submit feedback
•	GET /api/feedback/lounge/:loungeId - Get lounge feedback
•	GET /api/feedback - Get all feedback (Admin)
•	PATCH /api/feedback/:id/respond - Respond to feedback (Admin)

Menu
•	GET /api/menu - Get menu items
•	POST /api/menu - Create menu item (Admin)
•	PUT /api/menu/:id - Update menu item (Admin)

Orders
•	POST /api/orders - Create order
•	GET /api/orders/my-orders - Get user's orders
•	GET /api/orders - Get all orders (Admin/Staff)
•	PATCH /api/orders/:id/status - Update order status (Admin/Staff)

Analytics
•	GET /api/analytics/dashboard - Get dashboard statistics (Admin)

User Roles
Customer
•	View lounges and availability
•	Create and manage own bookings
•	Submit feedback
•	Place orders
•	View order history
Staff
•	All customer permissions
•	View all orders
•	Update order status
•	View all bookings
Admin
•	All staff permissions
•	Manage lounges (CRUD)
•	Manage menu items (CRUD)
•	View all bookings and manage status
•	View all feedback and respond
•	Access analytics dashboard
•	Manage users

# Testing
Test Credentials (After seeding)
Admin: Email: admin@lounge.com [Password: Admin****]
Staff: Email: staff@lounge.com [Password: Staff****]
Customer: Email: john@example.com [Password: User****]

Example API Calls
Register a new user:
POST http://localhost:5000/api/auth/register
"Content-Type: application/json"
'{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password****",
    "phone": "+1234567890"
  }'
Login:
POST http://localhost:5000/api/auth/login
"Content-Type: application/json"
'{  
    "email": "admin@lounge.com",
    "password": "Admin****"
  }'

Get all lounges:
GET http://localhost:5000/api/lounges
Create a booking (requires authentication):
POST http://localhost:5000/api/bookings
"Content-Type: application/json"
"Authorization: Bearer YOUR_JWT_TOKEN"
'{"loungeId": "LOUNGE_ID",
    "startTime": "2025-10-25T14:00:00Z",
    "endTime": "2025-10-25T18:00:00Z",
    "numberOfGuests": 10,
    "specialRequests": "Need projector"
  }'
  
# Project Structure
lounge-management-backend/
├── server.js              # Main application file
├── middleware.js          # Custom middleware and validators
├── seed.js               # Database seeding script
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── README.md             # This file
└── API_DOCS.md          # Detailed API documentation

# Security Features
•	Password Hashing: Passwords are hashed using bcryptjs before storage
•	JWT Authentication: Stateless authentication using JSON Web Tokens
•	Rate Limiting: Prevents brute force attacks (100 requests per 15 minutes)
•	Input Validation: All inputs are validated and sanitized
•	Helmet: Security headers to protect against common vulnerabilities
•	CORS: Configurable Cross-Origin Resource Sharing
•	Role-Based Access Control: Different permissions for different user roles

# Database Schema
User[name, email, password (hashed), phone, role, createdAt]
Lounge [name, description, capacity, pricePerHour, amenities, images, status, createdAt]
Booking [userId, loungeId, startTime, endTime, numberOfGuests, totalPrice, status, specialRequests, createdAt]
Feedback [userId, loungeId, bookingId, rating, serviceRating, cleanlinessRating, comment, response, createdAt]
Order [userId, bookingId, loungeId, items[], totalAmount, status, specialInstructions, createdAt]
MenuItem [name, description, category, price, available, image, createdAt]

# API Status Codes
•	200 - Success •	201 - Created •	400 - Bad Request / Validation Error •	401 - Unauthorized / Authentication Required
•	403 - Forbidden / Insufficient Permissions •	404 - Not Found •	429 - Too Many Requests •	500 - Internal Server Error

# Booking Status Flow
pending → confirmed → completed
         ↓
      cancelled
Order Status Flow
pending → preparing → ready → delivered
         ↓
      cancelled
Error Handling
All errors follow a consistent format:
{
  "error": "Error message description"
}

# Features Roadmap
Email notifications for bookings, File upload for lounge images, Advanced search and filtering, Booking reminders, Loyalty program, Real-time notifications (WebSockets), Multi-language support, Export reports (PDF/Excel), Calendar integration

# Contributing
1.	clone the repository https://github.com/oelimuyah/Hostify
2.	Create a feature branch (git checkout -b feature/AmazingFeature)
3.	Commit your changes (git commit -m 'Add some AmazingFeature')
4.	Push to the branch (git push origin feature/AmazingFeature)
5.	Open a Pull Request

# Acknowledgments
•	All Group 8 TechCrush Capstone BackEnd Dev.










