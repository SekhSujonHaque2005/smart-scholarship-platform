# 📊 Platform Statistics & Metrics — ScholarHub

> Technical metrics and system specifications for the ScholarHub platform.

---

## Codebase Metrics

### Service Breakdown

| Service | Language | Files | Key Dependencies |
|---------|----------|-------|-----------------|
| **Frontend** | TypeScript / TSX | ~70+ components | Next.js 16, React 19, Tailwind 4 |
| **Backend** | JavaScript (Node.js) | ~30+ modules | Express.js 5, Prisma 7 |
| **AI Service** | Python | ~10 modules | FastAPI, scikit-learn, HuggingFace |
| **Scraper** | Python | ~8 modules | httpx, BeautifulSoup4 |

### Frontend Components

| Category | Count | Total Size |
|----------|-------|------------|
| Landing Page | 13 components | ~82 KB |
| Student Dashboard | 11 components | ~145 KB |
| Provider Dashboard | 8 components | ~83 KB |
| Application Form | 8 components | ~59 KB |
| UI Primitives | Multiple | ~20 KB |
| Animation Components | 3 components | ~14 KB |
| **Total** | **43+ components** | **~403 KB** |

### Backend Architecture

| Category | Count |
|----------|-------|
| Route Modules | 13 |
| Controllers | 13 |
| Middleware | 3 |
| Services | 2 |
| Database Models | 14 |
| Database Enums | 6 |
| Database Indexes | 22+ |
| Cron Jobs | 2 |

### AI Service Features

| Feature | Model | Endpoint |
|---------|-------|----------|
| Scholarship Matching | Custom weighted algorithm | `/api/matching` |
| Fraud Detection | 8-point heuristic engine | `/api/fraud/check` |
| Description Generation | Qwen2.5-72B-Instruct | `/api/generate/description` |
| Application Tips | Qwen2.5-72B-Instruct | `/api/generate/tips` |
| Review Summary | Qwen2.5-72B-Instruct | `/api/generate/review` |
| Profile Suggestions | Qwen2.5-72B-Instruct | `/api/generate/suggestions` |
| Eligibility Check | Qwen2.5-72B-Instruct | `/api/generate/eligibility` |

### Web Scraper Sources

| Source | Data Points | Frequency |
|--------|-------------|-----------|
| National Scholarship Portal (NSP) | Title, amount, deadline, category | Daily at 6 AM |
| AICTE | Title, amount, deadline, category | Daily at 6 AM |
| UGC | Title, amount, deadline, category | Daily at 6 AM |
| Buddy4Study | Title, amount, deadline, category | Daily at 6 AM |

---

## API Statistics

| Metric | Value |
|--------|-------|
| Total API Routes | 50+ endpoints |
| Authentication Endpoints | 12 |
| Rate Limit Tiers | 3 (Global, Auth, Task) |
| Max Request Size | 10 MB |
| JWT Access Token TTL | 15 minutes |
| JWT Refresh Token TTL | 7 days |
| Cache TTL (AI Results) | 30 minutes |

---

## Security Metrics

| Feature | Specification |
|---------|---------------|
| Password Hashing | bcrypt, 12 salt rounds |
| 2FA OTP Expiry | 10 minutes |
| Password Reset Token | SHA-256 hashed, 1-hour expiry |
| Rate Limit (Auth) | 10 requests/hour |
| Rate Limit (Global) | 300 requests/15 min |
| Rate Limit (Tasks) | 20 requests/hour |

---

## Infrastructure

| Component | Specification |
|-----------|---------------|
| Frontend Container | Node.js 20 Alpine, 1 GB RAM |
| Backend Container | Node.js 20 Alpine + Python 3, default RAM |
| AI Container | Python 3 Alpine, 2 GB RAM, 1 vCPU |
| Database | PostgreSQL (Supabase managed) |
| File Storage | Cloudinary CDN |
| Cache | Redis (with in-memory fallback) |
| Monitoring | Sentry (error + performance) |
| CI/CD | GitHub Actions → GCP Cloud Run |

---

## Technology Versions

### Frontend

| Package | Version |
|---------|---------|
| next | 16.1.6 |
| react | 19.2.3 |
| typescript | ^5 |
| tailwindcss | ^4 |
| zustand | 5.0.11 |
| @tanstack/react-query | 5.90.21 |
| framer-motion | 12.38.0 |
| react-hook-form | 7.71.2 |
| zod | 4.3.6 |
| next-auth | 4.24.13 |
| vitest | 4.1.5 |

### Backend

| Package | Version |
|---------|---------|
| express | 5.2.1 |
| @prisma/client | 7.4.2 |
| jsonwebtoken | 9.0.3 |
| bcryptjs | 3.0.3 |
| ioredis | 5.10.1 |
| @sentry/node | 10.50.0 |
| nodemailer | 8.0.2 |
| zod | 4.3.6 |
| jest | 30.3.0 |

### AI Service

| Package | Version |
|---------|---------|
| fastapi | ≥0.109.0 |
| scikit-learn | ≥1.4.0 |
| sentence-transformers | ≥2.3.1 |
| numpy | ≥1.26.3 |
| pandas | ≥2.1.4 |
| httpx | ≥0.26.0 |

### Scraper Service

| Package | Version |
|---------|---------|
| httpx | ≥0.27.0 |
| beautifulsoup4 | ≥4.12.0 |
| pydantic | ≥2.0.0 |
