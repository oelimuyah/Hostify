// seed.js - Database seeding script for development/testing
import { connect } from 'mongoose';
import { hash } from 'bcryptjs';
import dotenv from "dotenv";
dotenv.config();

// Import models (adjust path as needed)
import { deleteMany, insertMany } from '../models/User';
import { deleteMany as _deleteMany, insertMany as _insertMany } from '../models/Lounge';
import { deleteMany as __deleteMany, insertMany as __insertMany } from '../models/MenuItem';

// Connect to database
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lounge_management');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@lounge.com',
    password: 'Admin123!',
    phone: '+1234567890',
    role: 'admin'
  },
  {
    name: 'Staff Member',
    email: 'staff@lounge.com',
    password: 'Staff123!',
    phone: '+1234567891',
    role: 'staff'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'User123!',
    phone: '+1234567892',
    role: 'customer'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'User123!',
    phone: '+1234567893',
    role: 'customer'
  }
];

const lounges = [
  {
    name: 'Executive Lounge A',
    description: 'Premium executive lounge with stunning city views, perfect for business meetings and corporate events.',
    capacity: 30,
    pricePerHour: 150,
    amenities: ['High-speed WiFi', '4K TV', 'Video Conferencing', 'Whiteboard', 'Coffee Machine', 'Mini Bar'],
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c'],
    status: 'available'
  },
  {
    name: 'VIP Lounge',
    description: 'Luxurious VIP lounge with premium furnishings and exclusive amenities.',
    capacity: 15,
    pricePerHour: 250,
    amenities: ['Private Bar', 'DJ Setup', 'Dance Floor', 'Premium Sound System', 'Mood Lighting', 'Butler Service'],
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
    status: 'available'
  },
  {
    name: 'Casual Lounge B',
    description: 'Comfortable and affordable lounge space for casual gatherings and small parties.',
    capacity: 30,
    pricePerHour: 100,
    amenities: ['WiFi', 'TV', 'Gaming Console', 'Karaoke', 'Snack Bar'],
    images: ['https://images.unsplash.com/photo-1559329007-40df8a9345d8'],
    status: 'available'
  },
  {
    name: 'Rooftop Terrace',
    description: 'Open-air rooftop lounge with panoramic views, ideal for evening events.',
    capacity: 50,
    pricePerHour: 300,
    amenities: ['Outdoor Seating', 'Fire Pit', 'BBQ Grill', 'Bar', 'String Lights', 'Heaters'],
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'],
    status: 'available'
  },
  {
    name: 'Conference Room',
    description: 'Professional conference room with state-of-the-art presentation equipment.',
    capacity: 25,
    pricePerHour: 120,
    amenities: ['Projector', 'Conference Phone', 'Whiteboard', 'WiFi', 'Coffee Station'],
    images: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2'],
    status: 'available'
  },
  {
    name: 'Garden Lounge',
    description: 'Serene garden lounge surrounded by greenery, perfect for daytime events.',
    capacity: 40,
    pricePerHour: 180,
    amenities: ['Garden View', 'Outdoor Furniture', 'Shade Structures', 'Sound System', 'Catering Area'],
    images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205'],
    status: 'available'
  }
];

const menuItems = [
  // Food
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan',
    category: 'food',
    price: 12.99,
    available: true
  },
  {
    name: 'Chicken Wings',
    description: 'Crispy wings with your choice of sauce (BBQ, Buffalo, Honey Mustard)',
    category: 'food',
    price: 14.99,
    available: true
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, basil, and tomato sauce',
    category: 'food',
    price: 18.99,
    available: true
  },
  {
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce',
    category: 'food',
    price: 16.99,
    available: true
  },
  {
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
    category: 'food',
    price: 15.99,
    available: true
  },
  {
    name: 'Nachos Supreme',
    description: 'Loaded nachos with cheese, jalapeños, sour cream, and guacamole',
    category: 'food',
    price: 13.99,
    available: true
  },
  
  // Drinks
  {
    name: 'Mojito',
    description: 'Classic mint mojito with lime and rum',
    category: 'drink',
    price: 9.99,
    available: true
  },
  {
    name: 'Margarita',
    description: 'Tequila-based cocktail with lime and triple sec',
    category: 'drink',
    price: 10.99,
    available: true
  },
  {
    name: 'Cosmopolitan',
    description: 'Vodka cocktail with cranberry juice and lime',
    category: 'drink',
    price: 11.99,
    available: true
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    category: 'drink',
    price: 5.99,
    available: true
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee served over ice',
    category: 'drink',
    price: 4.99,
    available: true
  },
  {
    name: 'Craft Beer',
    description: 'Selection of local craft beers',
    category: 'drink',
    price: 7.99,
    available: true
  },
  
  // Snacks
  {
    name: 'French Fries',
    description: 'Crispy golden fries with sea salt',
    category: 'snack',
    price: 6.99,
    available: true
  },
  {
    name: 'Onion Rings',
    description: 'Beer-battered onion rings with dipping sauce',
    category: 'snack',
    price: 7.99,
    available: true
  },
  {
    name: 'Chips & Dip',
    description: 'Tortilla chips with salsa, guacamole, and cheese dip',
    category: 'snack',
    price: 8.99,
    available: true
  },
  {
    name: 'Mixed Nuts',
    description: 'Premium roasted and salted mixed nuts',
    category: 'snack',
    price: 5.99,
    available: true
  }
];

// Seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await deleteMany({});
    await _deleteMany({});
    await __deleteMany({});
    console.log('Cleared existing data');
    
    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await hash(user.password, 10)
      }))
    );
    
    const createdUsers = await insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create lounges
    const createdLounges = await _insertMany(lounges);
    console.log(`Created ${createdLounges.length} lounges`);
    
    // Create menu items
    const createdMenuItems = await __insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);
    
    console.log('\nDatabase seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@lounge.com / Admin123!');
    console.log('Staff: staff@lounge.com / Staff123!');
    console.log('Customer: john@example.com / User123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();