# HostifyBackEnd-Modalities
Hostify Backend API
A comprehensive RESTful API for managing lounge bookings, customer feedback, orders, and more. Built with Node.js, Express, and MongoDB.
Features
•	User Authentication & Authorization: Secure JWT-based authentication with role-based access control (Admin, Staff, Customer)
•	Lounge Management: Full CRUD operations for lounge spaces with real-time availability checking
•	Booking System: Advanced booking management with conflict detection and status tracking
•	Customer Feedback: Rating and review system for lounges with response capabilities
•	Order Management: Food and beverage ordering system with status tracking
•	Menu Management: Dynamic menu with categories and availability controls
•	Analytics Dashboard: Admin dashboard with key metrics and statistics
•	Security: Rate limiting, input validation, helmet security headers, password hashing
•	Data Validation: Comprehensive input validation using express-validator
Prerequisites
•	Node.js (v14 or higher)
•	MongoDB (v4.4 or higher)
•	npm package manager
 Installation
1.	Clone the repository
git clone <repository-url>
cd lounge-management-backend
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
Make sure MongoDB is running on your system:
# For MongoDB installed locally mongodb

5.	Seed the database (optional)
Populate the database with sample data:
node seed.js
6.	Start the server
# Development mode with auto-reload
npm run dev

# Production mode
npm start
The server will start on http://localhost:5000
 API Documentation
Base URL
http://localhost:5000/api
Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
Authorization: Bearer <your-jwt-token>
Available Endpoints
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
For detailed API documentation, see API_DOCS.md
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
Testing
Test Credentials (After seeding)
Admin:
Email: admin@lounge.com
Password: Admin****

Staff:
Email: staff@lounge.com
Password: Staff****

Customer:
Email: john@example.com
Password: User****
Example API Calls
Register a new user:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password****",
    "phone": "+1234567890"
  }'
Login:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lounge.com",
    "password": "Admin****"
  }'

Get all lounges:
curl -X GET http://localhost:5000/api/lounges
Create a booking (requires authentication):
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "loungeId": "LOUNGE_ID",
    "startTime": "2025-10-25T14:00:00Z",
    "endTime": "2025-10-25T18:00:00Z",
    "numberOfGuests": 10,
    "specialRequests": "Need projector"
  }'
 Project Structure
lounge-management-backend/
├── server.js              # Main application file
├── middleware.js          # Custom middleware and validators
├── seed.js               # Database seeding script
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── README.md             # This file
└── API_DOCS.md          # Detailed API documentation
 Security Features
•	Password Hashing: Passwords are hashed using bcryptjs before storage
•	JWT Authentication: Stateless authentication using JSON Web Tokens
•	Rate Limiting: Prevents brute force attacks (100 requests per 15 minutes)
•	Input Validation: All inputs are validated and sanitized
•	Helmet: Security headers to protect against common vulnerabilities
•	CORS: Configurable Cross-Origin Resource Sharing
•	Role-Based Access Control: Different permissions for different user roles
Database Schema
User
•	name, email, password (hashed), phone, role, createdAt
Lounge
•	name, description, capacity, pricePerHour, amenities, images, status, createdAt
Booking
•	userId, loungeId, startTime, endTime, numberOfGuests, totalPrice, status, specialRequests, createdAt
Feedback
•	userId, loungeId, bookingId, rating, serviceRating, cleanlinessRating, comment, response, createdAt
Order
•	userId, bookingId, loungeId, items[], totalAmount, status, specialInstructions, createdAt
MenuItem
•	name, description, category, price, available, image, createdAt
API Status Codes
•	200 - Success
•	201 - Created
•	400 - Bad Request / Validation Error
•	401 - Unauthorized / Authentication Required
•	403 - Forbidden / Insufficient Permissions
•	404 - Not Found
•	429 - Too Many Requests
•	500 - Internal Server Error
Booking Status Flow
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

##Environment Variables
Variable	Description	Default
PORT	Server port	5000
MONGODB_URI	MongoDB connection string	mongodb://localhost:27017/lounge_management
JWT_SECRET	Secret key for JWT	(required)
JWT_EXPIRE	JWT expiration time	7d
NODE_ENV	Environment mode	development

##Features Roadmap
•	[ ] Email notifications for bookings
•	[ ] File upload for lounge images
•	[ ] Advanced search and filtering
•	[ ] Booking reminders
•	[ ] Loyalty program
•	[ ] Real-time notifications (WebSockets)
•	[ ] Multi-language support
•	[ ] Export reports (PDF/Excel)
•	[ ] Calendar integration

##Contributing
1.	clone the repository https://github.com/oelimuyah/Hostify
2.	Create a feature branch (git checkout -b feature/AmazingFeature)
3.	Commit your changes (git commit -m 'Add some AmazingFeature')
4.	Push to the branch (git push origin feature/AmazingFeature)
5.	Open a Pull Request
Acknowledgments
•	Express.js for the web framework
•	MongoDB for the database
•	JWT for authentication
•	All contributors and supporters


