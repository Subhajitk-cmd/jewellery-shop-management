# Jewelry Shop Management System

A comprehensive Next.js application for managing a jewelry shop with order management, gold loan services, and real-time pricing.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing

### Landing Page
- Real-time gold and silver prices
- Public access (no login required)
- Clean, professional interface

### Order Management
- **New Orders**: Create jwellery orders with customer details
- **Booked Orders**: View and edit pending orders with search functionality
- **Closed Orders**: View completed orders with delivery information
- Automatic order ID generation
- Status tracking (Booked/Closed)

### Gold Loan Services
- Submit items for gold loan applications
- Search and manage deposited gold items
- Interest calculation and total amount computation
- Editable loan records

### Dashboard Features
- User-specific dashboard after login
- Four main service blocks
- Intuitive navigation
- Responsive design

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - Install MongoDB locally or use MongoDB Atlas
   - Update the connection string in `.env.local`

3. Configure environment variables:
   - Copy `.env.local` and update values
   - Set your MongoDB URI
   - Set a secure JWT secret

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Collections

### Users
- User authentication and profile information

### Orders
- Jwellery orders with customer details
- Status tracking (booked/closed)
- Pricing and delivery information

### Gold Loans
- Gold loan applications
- Item details and loan amounts
- Interest calculations

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Orders
- `POST /api/orders/new` - Create new order
- `GET /api/orders/booked` - Get booked orders
- `PUT /api/orders/booked/[id]` - Update booked order
- `GET /api/orders/closed` - Get closed orders

### Gold Loans
- `POST /api/goldloan/new` - Submit gold loan application
- `GET /api/goldloan/search` - Get all gold loans
- `PUT /api/goldloan/search/[id]` - Update gold loan

### Prices
- `GET /api/prices` - Get current gold and silver prices

## Usage

1. **First Time Users**: Sign up with name, email, and password
2. **Returning Users**: Login with email and password
3. **View Prices**: Gold and silver prices are visible on the homepage
4. **Create Orders**: Use "New Order" to create jwellery orders
5. **Manage Orders**: View and edit orders in "Existing Orders"
6. **Gold Loans**: Submit and manage gold loan applications
7. **Search**: Use search functionality to find orders by ID or customer name

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- Secure database operations

## Technologies Used

- **Frontend**: Next.js 14, React 18
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **Styling**: CSS3
- **HTTP Client**: Axios

## Development

The application uses Next.js App Router with:
- Server-side API routes
- Client-side React components
- MongoDB for data persistence
- JWT for authentication
- Responsive CSS styling

## Production Deployment

1. Set up production MongoDB instance
2. Update environment variables
3. Build the application: `npm run build`
4. Start production server: `npm start`

## Support

For issues or questions, please check the code comments and API documentation within the source files.