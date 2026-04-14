# Smart Scholarship Marketplace & Management Platform

## 🚀 Overview

A comprehensive scholarship management platform that connects students with scholarship providers through an intelligent matching system. The platform features a modern frontend, a robust backend with AI integration, and a dedicated scraping service to aggregate scholarship opportunities from across the web.

## 📂 Project Structure

```
smart-scholarship-platform/
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # External services (email, AI)
│   │   ├── utils/          # Helpers
│   │   └── app.js          # Express app
│   ├── prisma/             # Database models
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   ├── contexts/       # State management
│   │   ├── assets/         # Images, fonts
│   │   └── App.js          # Main application
│   ├── public/
│   └── package.json
├── ai_service/               # AI/ML service
│   ├── app.py              # FastAPI application
│   ├── models/             # ML models
│   ├── data/               # Training data
│   └── requirements.txt
├── scraper_service/          # Web scraping service
│   ├── app.py              # FastAPI application
│   ├── scrapers/           # Scraping logic
│   ├── data/               # Scraped data
│   └── requirements.txt
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, bcrypt
- **AI Integration**: Gemini API
- **Notifications**: Nodemailer (Email)
- **Validation**: Joi

### Frontend
- **Framework**: React
- **State Management**: React Context API
- **Styling**: Tailwind CSS, Shadcn UI
- **Routing**: React Router
- **HTTP Client**: Axios

### Services
- **AI Service**: FastAPI (Python) with Gemini API for scholarship matching
- **Scraper Service**: FastAPI (Python) for web scraping

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. AI Service Setup

```bash
cd ai_service

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start server
uvicorn app.main:app --reload
```

### 4. Scraper Service Setup

```bash
cd scraper_service

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start server
uvicorn app.main:app --reload
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Scholarships
- `GET /api/scholarships` - List scholarships (with filters)
- `GET /api/scholarships/:id` - Get scholarship details
- `POST /api/scholarships/:id/apply` - Apply for scholarship
- `GET /api/scholarships/recommended` - AI-recommended scholarships

### User Profile
- `PUT /api/users/me/profile` - Update profile
- `PUT /api/users/me/password` - Change password
- `PUT /api/users/me/preferences` - Update preferences

### Admin
- `POST /api/admin/scholarships` - Create scholarship (provider)
- `PUT /api/admin/scholarships/:id` - Update scholarship (provider)
- `DELETE /api/admin/scholarships/:id` - Delete scholarship (provider)
- `GET /api/admin/users` - List all users (admin)
- `PUT /api/admin/users/:id/status` - Activate/deactivate user (admin)

## 🎨 Features

### For Students
- ✅ **Smart Matching**: AI-powered recommendations based on profile
- ✅ **Comprehensive Search**: Filter by eligibility, location, amount, etc.
- ✅ **One-Click Application**: Streamlined application process
- ✅ **Profile Management**: Track applications and achievements
- ✅ **Notifications**: Real-time updates on application status

### For Providers
- ✅ **Scholarship Management**: Create and manage scholarship listings
- ✅ **Applicant Tracking**: View and manage applicants
- ✅ **Analytics**: Track application metrics
- ✅ **Verification**: Verify student eligibility

### Platform Features
- ✅ **Multi-Role System**: Student, Provider, Admin roles
- ✅ **Two-Factor Authentication**: Enhanced security
- ✅ **Email Notifications**: OTP, application updates, alerts
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **AI-Powered**: Intelligent matching and recommendations
- ✅ **Web Scraping**: Aggregates scholarships from multiple sources

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Database Schema

### Key Tables
- **Users**: Authentication and user management
- **Students**: Student-specific information
- **Providers**: Provider/organization details
- **Scholarships**: Scholarship listings
- **Applications**: Student applications to scholarships
- **Notifications**: Email and in-app notifications
- **AIRecommendations**: Generated recommendations

## 🔐 Security

- JWT-based authentication with short expiry times
- Refresh tokens for secure session management
- Two-factor authentication (2FA)
- Password hashing with bcrypt
- Input validation on all endpoints
- Role-based access control
- HTTPS recommended for production

## ☁️ Deployment

### Backend Deployment
```bash
# Build
npm run build

# Start production
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm run serve
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## 📚 Documentation

For detailed API documentation and usage instructions, see the [docs/](docs/) directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
