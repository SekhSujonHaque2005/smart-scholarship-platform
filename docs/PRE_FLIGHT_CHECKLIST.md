# ✅ Pre-Flight Checklist — ScholarHub

> Use this checklist before deploying to production or presenting the platform.

---

## 🔐 Security

- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong, unique values (≥32 chars)
- [ ] `SCRAPER_KEY` is set and not a default value
- [ ] `NEXTAUTH_SECRET` is generated (`openssl rand -base64 32`)
- [ ] All `.env` files are excluded from Git (check `.gitignore`)
- [ ] Rate limiting is active on all API routes
- [ ] Helmet is enabled for security headers
- [ ] CORS is configured with specific allowed origins (not `*` in production)
- [ ] 2FA is functional and sending OTP emails correctly
- [ ] Password reset tokens expire after 1 hour
- [ ] Google OAuth credentials are configured for the production domain

---

## 🗄️ Database

- [ ] `DATABASE_URL` points to production PostgreSQL (Supabase)
- [ ] Prisma migrations are applied (`npx prisma migrate deploy`)
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] Full-Text Search preview feature is enabled in schema
- [ ] All indexes are created (check `@@index` directives in schema)
- [ ] A system admin user exists in the database
- [ ] The "Government & External Agencies" system provider is created (auto-created on first scraper sync)

---

## 🤖 AI Service

- [ ] `HF_API_TOKEN` is set with a valid HuggingFace API token
- [ ] AI service is accessible from the backend (`AI_SERVICE_URL`)
- [ ] Fallback matching algorithm works when AI service is unavailable
- [ ] AI service has ≥2GB RAM allocated (for model loading)
- [ ] AI service timeout is set to ≥300s

---

## 📧 Email

- [ ] `EMAIL_USER` and `EMAIL_PASS` are set (Gmail app password, not account password)
- [ ] `EMAIL_FROM` has a proper sender name
- [ ] `FRONTEND_URL` is set correctly for email CTA links
- [ ] Test emails are being delivered (check spam folder)
- [ ] All 5 email templates render correctly in major email clients

---

## ☁️ File Storage

- [ ] Cloudinary credentials are configured (`CLOUD_NAME`, `API_KEY`, `API_SECRET`)
- [ ] File upload size limit is appropriate (10MB in Express config)
- [ ] Supported file types are validated (PDF, JPG, JPEG, PNG)

---

## 🚀 Deployment

- [ ] Docker images build successfully for all 3 services
- [ ] GitHub Secrets are configured for CI/CD
- [ ] GCP Artifact Registry repository exists
- [ ] Cloud Run services are deployed and accessible
- [ ] Service wiring is complete (CORS, NextAuth URLs, inter-service connections)
- [ ] `NODE_ENV=production` is set on backend and frontend

---

## 🖥️ Frontend

- [ ] `NEXT_PUBLIC_API_URL` points to the production backend
- [ ] `NEXT_PUBLIC_AI_URL` points to the production AI service
- [ ] Next.js builds without errors (`npm run build`)
- [ ] Dark mode and light mode both render correctly
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] SEO meta tags are present (title, description, keywords)
- [ ] `sitemap.ts` and `robots.ts` generate correct output
- [ ] Custom 404 page displays correctly

---

## 🕵️ Scraper

- [ ] Scraper runs successfully in `--dry-run` mode
- [ ] Scraper syncs data correctly in `--live` mode
- [ ] Cron job is scheduled (6 AM daily)
- [ ] Deduplication via `externalId` prevents duplicate entries
- [ ] Newsletter notifications trigger after successful sync

---

## 🧪 Testing

- [ ] Frontend tests pass (`npm run test` in `frontend/`)
- [ ] Backend tests pass (`npm run test` in `backend/`)
- [ ] API smoke test passes
- [ ] Auth flow works end-to-end (register → login → 2FA → refresh)
- [ ] Application submission with fraud check works
- [ ] Document upload/download works
- [ ] Provider scholarship creation and management works
- [ ] Admin dashboard loads with correct statistics

---

## 📊 Monitoring

- [ ] Sentry DSN is configured for production error tracking
- [ ] Health check endpoints respond correctly (`/` and `/health`)
- [ ] Cloud Run logs are accessible
- [ ] Rate limit responses return correct headers
