# ScholarHub — Backend Documentation (INT222)

This document details the server-side architecture, API structure, and database management of the ScholarHub platform.

## 🏗️ Architecture Overview
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL (Hosted on Supabase)
- **ORM**: Prisma (Type-safe database client)
- **Authentication**: JWT-based secure sessions
- **AI Service**: Python FastAPI bridge for smart matching

## 🗺️ API Structure
The API is divided into logical routers for modularity:
- `/api/auth`: Registration, Login, Profile Management.
- `/api/scholarships`: CRUD operations for scholarship listings.
- `/api/applications`: Tracking scholarship submissions.
- `/api/stats`: Real-time platform analytics.
- `/api/messages`: Communication between students and providers.

## 🗄️ Database Schema (Prisma)
Key entities include:
- **User**: Stores profiles, roles (STUDENT, PROVIDER, ADMIN).
- **Scholarship**: Details on awards, eligibility, and deadlines.
- **Application**: Tracks the status (PENDING, APPROVED, REJECTED) of student submissions.
- **Review**: Student feedback for providers.

## 🛡️ Security & Performance
- **Helmet**: Secures HTTP headers.
- **Rate Limiting**: Protects against brute-force and DDoS (300 req/15 mins).
- **Compression**: Gzip-enabled payloads for faster responses.
- **Redis Caching**: High-performance caching for scholarship directories.
- **Sentry**: Real-time error monitoring and profiling.

## ⚙️ Setup & Run
1. `npm install`
2. Configure `.env` with `DATABASE_URL` and `SENTRY_DSN`.
3. `npx prisma generate`
4. `npm run dev`

## 📦 Deployment
Deploying to **Railway**:
1. Link GitHub repository.
2. Set Environment Variables.
3. Railway handles automatic build and zero-downtime deployment.
