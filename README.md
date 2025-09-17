# AFH Management System

A comprehensive Adult Family Home management application designed to streamline operations, improve resident care, and ensure regulatory compliance.

## 🏥 Overview

The AFH Management System is a full-stack web application built to manage Adult Family Homes efficiently. It provides tools for resident management, medication tracking (eMARs), inventory management, staff scheduling, and regulatory compliance reporting.

## ✨ Features

### Completed Features
- ✅ **User Authentication & Authorization**
  - Secure login/logout system
  - Role-based access control (Admin, Provider, Caregiver)
  - JWT token-based authentication

- ✅ **Resident Management**
  - Add, edit, and view resident profiles
  - Track personal information and medical history
  - Room assignments and occupancy tracking

- ✅ **Dashboard**
  - Overview of facility statistics
  - Quick access to important functions
  - Real-time occupancy rates

### In Progress
- 🚧 **eMARs System (Electronic Medication Administration Records)**
  - Medication scheduling and reminders
  - Administration tracking
  - PRN medication management
  - Overdue medication alerts

### Planned Features
- 📋 **Inventory Management**
  - Track food, toiletries, and medical supplies
  - Low stock alerts
  - Usage tracking and reporting

- 👥 **Staff Management**
  - Employee profiles and scheduling
  - Payroll tracking
  - Training records

- 📊 **Reporting & Compliance**
  - Generate regulatory reports
  - Export data to PDF/CSV
  - Audit trails

- 📱 **Progressive Web App (PWA)**
  - Offline functionality
  - Mobile-responsive design
  - Push notifications for reminders

## 🛠 Technology Stack

### Frontend
- **React.js** (v18.x) with TypeScript
- **Material-UI** (MUI) for component library
- **React Router** for navigation
- **Axios** for API calls
- **date-fns** for date manipulation

### Backend
- **Node.js** with Express.js
- **SQLite** for development database
- **PostgreSQL** for production (ready)
- **Knex.js** for database migrations and queries
- **JWT** for authentication
- **Bcrypt** for password hashing

### Development Tools
- **Concurrently** for running frontend and backend simultaneously
- **Nodemon** for backend hot-reloading
- **ESLint** for code quality
- **Git** for version control

## 📁 Project Structure

```
afh-management-mvp/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── medications/ # Medication management components
│   │   │   ├── residents/   # Resident management components
│   │   │   └── common/      # Shared components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main application component
│   └── package.json
│
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── db/            # Database configuration
│   │   └── server.js      # Express server setup
│   ├── migrations/         # Database migrations
│   ├── seeds/             # Database seed files
│   └── package.json
│
├── docs/                   # Documentation
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- VS Code (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/afh-management-mvp.git
   cd afh-management-mvp
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (for running both frontend and backend)
   npm install

   # Install all project dependencies
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `.env` file in the backend folder:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_here
   DB_CLIENT=sqlite3
   DB_FILENAME=./afh_management.sqlite
   FRONTEND_URL=http://localhost:3000
   ```

   Create `.env` file in the frontend folder:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME=AFH Management System
   ```

4. **Run database migrations**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Frontend on http://localhost:3000
   - Backend on http://localhost:5000

## 📝 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for both frontend and backend

### Backend Directory
- `npm run dev` - Start backend with nodemon
- `npm run start` - Start backend in production mode
- `npm run migrate` - Run database migrations
- `npm run rollback` - Rollback last migration
- `npm run seed` - Seed the database with sample data

### Frontend Directory
- `npm start` - Start frontend development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔑 Default Login Credentials

For development/testing:
- **Admin:** admin@example.com / password123
- **Caregiver:** caregiver@example.com / password123

⚠️ **Important:** Change these credentials in production!

## 📊 Database Schema

### Main Tables
- `users` - System users (staff)
- `residents` - Resident information
- `medications` - Medication database
- `medication_schedules` - Medication scheduling
- `medication_administration` - Administration records
- `medication_reminders` - Reminder system
- `inventory` - Inventory tracking
- `homes` - AFH facility information

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 🚢 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Backend Deployment (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure build and start commands
4. Deploy with automatic builds

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📈 Roadmap

### Phase 1 (Weeks 1-6) - Foundation ✅
- [x] Project setup
- [x] Authentication system
- [x] Basic resident management
- [x] Dashboard
- [x] eMARs system structure

### Phase 2 (Weeks 7-8) - Core Features 🚧
- [ ] Complete medication scheduling
- [ ] Medication reminders
- [ ] Administration recording
- [ ] Resident Appointment scheduling
- [ ] Basic reporting

### Phase 3 (Weeks 9-10) - Inventory & Reports
- [ ] Inventory management
- [ ] Advanced reporting
- [ ] Data export (PDF/CSV)

### Phase 4 (Weeks 11-12) - PWA & Polish
- [ ] PWA configuration
- [ ] Offline functionality
- [ ] Performance optimization
- [ ] UI/UX improvements

## 🐛 Known Issues

- Medication reminders need manual refresh (auto-refresh in progress)
- Date picker component needs better mobile support
- Some forms need better validation

## 📞 Support

For support, email: your-email@example.com

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for Adult Family Homes in Washington State
- Inspired by industry needs and regulatory requirements
- Thanks to all beta testers and early adopters

---

**Project Status:** 🚧 Under Active Development

**Last Updated:** September 2025

**Version:** 1.0.0-beta
