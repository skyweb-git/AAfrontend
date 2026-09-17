# Art Marketplace - Dynamic Setup Guide

## Overview
This guide shows how to set up the Art Marketplace with Firebase authentication, MongoDB database, and Cloudinary media management.

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Firebase and API URL

# Start the frontend
npm start
```

## 🔧 Configuration Required

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google providers)
3. Go to Project Settings > Service Accounts
4. Generate a new private key
5. Download the JSON file
6. Copy the credentials to `server/.env`

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Get the connection string
3. Update `MONGODB_URI` in `server/.env`

### Cloudinary Setup
1. Create an account at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret
3. Update the Cloudinary variables in `server/.env`

## 📁 Project Structure

```
art-marketplace/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth, Cart)
│   │   ├── services/       # API services
│   │   └── ...
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── ...
└── README.md
```

## 🎯 Features Implemented

### Authentication
- Firebase Authentication (Google, Email/Password)
- JWT token management
- Protected routes
- User profiles

### Database Models
- **Users**: Artist profiles, preferences, social links
- **Products**: Art listings with images, pricing, reviews
- **Events**: Art exhibitions, workshops, meetups

### Media Management
- Cloudinary integration for image uploads
- Automatic image optimization
- Multiple image support
- Image deletion

### API Endpoints
- `/api/auth/*` - Authentication
- `/api/products/*` - Product management
- `/api/events/*` - Event management
- `/api/users/*` - User management
- `/api/upload/*` - File uploads

## 🔐 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/artmarketplace
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
JWT_SECRET=your-super-secret-jwt-key
```

### Client (.env)
```env
REACT_APP_API_URL=https://sverxiioo.nanoprofiles.com/api
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## 🛠 Development Commands

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
```

### Frontend
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## 📱 Usage

1. **Sign Up/Login**: Use Firebase authentication
2. **Create Profile**: Complete your artist profile
3. **Upload Art**: Add products with Cloudinary images
4. **Create Events**: Organize exhibitions and workshops
5. **Connect**: Join the art community

## 🔍 Testing the API

```bash
# Health check
curl https://sverxiioo.nanoprofiles.com/api/health

# Get products
curl https://sverxiioo.nanoprofiles.com/api/products

# Get events
curl https://sverxiioo.nanoprofiles.com/api/events
```

## 🚀 Deployment

### Backend (Heroku/Render)
1. Set environment variables
2. Deploy to your platform
3. Update frontend API URL

### Frontend (Netlify/Vercel)
1. Build the project
2. Deploy to your platform
3. Set environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For setup issues:
1. Check environment variables
2. Verify Firebase configuration
3. Ensure MongoDB is running
4. Check Cloudinary credentials

## 🎨 Next Steps

- Add real Firebase SDK integration
- Implement real-time features
- Add payment processing
- Create admin dashboard
- Add mobile app support

---

**Note**: This is a complete full-stack setup with modern web technologies. Make sure to configure all environment variables before running the application.
