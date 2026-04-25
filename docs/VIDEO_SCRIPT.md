# 🎬 ScholarHub — Full Platform Demo Video Script

> **Estimated Duration**: 18–22 minutes  
> **Format**: Screen recording with voiceover  
> **Tools Needed**: Screen recorder (OBS/Loom), microphone, browser (Chrome), VS Code  

---

## 🎯 Video Structure Overview

| # | Section | Duration | Focus |
|---|---------|----------|-------|
| 1 | [Intro & Hook](#1--intro--hook) | 1 min | What is ScholarHub, why it matters |
| 2 | [Architecture & Tech Stack](#2--architecture--tech-stack) | 2 min | System diagram, services, tech choices |
| 3 | [Codebase Walkthrough](#3--codebase-walkthrough) | 3 min | Project structure, key files |
| 4 | [Landing Page Demo](#4--landing-page-demo) | 2 min | UI/UX, animations, design system |
| 5 | [Auth Flow Demo](#5--authentication-flow) | 2 min | Register, login, 2FA, Google OAuth |
| 6 | [Student Dashboard](#6--student-dashboard) | 4 min | Profile, scholarships, AI matching, applications |
| 7 | [Provider Dashboard](#7--provider-dashboard) | 3 min | Create scholarship, Kanban, AI features |
| 8 | [Admin Dashboard](#8--admin-dashboard) | 2 min | Stats, user management, fraud alerts |
| 9 | [AI & Scraper Services](#9--ai--scraper-services) | 2 min | FastAPI docs, matching, fraud, LLM |
| 10 | [DevOps & Deployment](#10--devops--deployment) | 1 min | Docker, CI/CD, GCP |
| 11 | [Closing](#11--closing) | 30 sec | Summary, call to action |

---

## 1. 🎤 Intro & Hook

**[SCREEN: Black screen with ScholarHub logo fade-in]**

### Voiceover Script

> "Hey everyone! In this video, I'm going to walk you through **ScholarHub** — a full-stack, AI-powered scholarship intelligence platform that I built from scratch.
>
> ScholarHub solves a real problem — students in India spend hours searching across fragmented government portals for scholarships, with no way to know which ones they actually qualify for.
>
> ScholarHub fixes this by **automatically scraping** scholarships from 4 government sources, **matching students with AI** based on their academic profile, and providing a complete **application lifecycle** — from discovery to approval — all in one platform.
>
> The platform serves **three user roles** — Students, Scholarship Providers, and Administrators — each with dedicated dashboards and AI-powered workflows.
>
> Let me show you how it all works."

**[TRANSITION: Slide to architecture diagram]**

---

## 2. 🏗️ Architecture & Tech Stack

**[SCREEN: Show the README.md architecture Mermaid diagram, or a prepared diagram image]**

### Voiceover Script

> "ScholarHub is built as a **microservices architecture** with four independent services communicating over REST APIs.
>
> **First, the Frontend** — built with **Next.js 16** and **React 19** using the App Router. It uses **TypeScript**, **Tailwind CSS 4**, **Shadcn/UI** components, **Zustand** for state management, and **Framer Motion** for animations.
>
> **Second, the Backend API** — an **Express.js 5** server with **Prisma 7** ORM talking to a **PostgreSQL** database hosted on **Supabase**. It handles authentication with **JWT tokens** and optional **two-factor authentication**, has a **Redis** caching layer, **Cloudinary** for file storage, and **Nodemailer** for transactional emails.
>
> **Third, the AI Service** — a **Python FastAPI** microservice that powers scholarship matching with a weighted scoring algorithm, fraud detection with an 8-point heuristic engine, and 5 different LLM-powered features using **HuggingFace's Qwen 72B** model.
>
> **And finally, the Scraper Service** — a Python service that automatically scrapes scholarships from **NSP, AICTE, UGC, and Buddy4Study** portals daily, deduplicates them, and syncs to the backend.
>
> Everything is containerized with **Docker**, deployed to **Google Cloud Run** via a **GitHub Actions CI/CD pipeline**."

### Screen Actions
1. Show the architecture diagram from README
2. Briefly scroll through the tech stack tables
3. Show the `docker-compose.yml` file quickly

---

## 3. 📁 Codebase Walkthrough

**[SCREEN: VS Code with the project root open]**

### Voiceover Script

> "Let me walk through the codebase structure.
>
> At the root level, we have four main directories — `frontend`, `backend`, `ai_service`, and `scraper_service` — plus Docker Compose for local development and a GitHub Actions workflow for CI/CD.
>
> **In the backend**, the `src` folder follows a clean MVC pattern — 13 controllers, 13 route modules, middleware for auth and file uploads, services for AI proxy and notifications, and utility modules for caching and matching. The Prisma schema defines **14 database models** and **6 enums** with **22+ indexes** for performance.
>
> **The frontend** uses Next.js App Router with route groups — `(auth)` for login and registration pages, `dashboard` with sub-routes for student, provider, and admin views. The `components` directory has **43+ components** organized by feature — landing page, dashboard, application forms, and provider tools.
>
> **The AI service** has a clean structure — routers define the endpoints, services contain the business logic for matching, fraud detection, and LLM generation, and models define Pydantic schemas for validation.
>
> **The scraper** uses an abstract base class pattern — each government source has its own scraper class that extends `BaseScraper` and implements a `scrape()` method."

### Screen Actions
1. Expand project tree in VS Code showing all four service directories
2. Open `backend/src/` and show the folder structure (controllers, routes, middleware, services)
3. Open `prisma/schema.prisma` — scroll through a few models quickly
4. Open `frontend/app/` — show the route structure
5. Open `frontend/components/` — show the component categories
6. Open `ai_service/services/` — show the three service files
7. Open `scraper_service/scrapers/` — show the four scraper files

---

## 4. 🖥️ Landing Page Demo

**[SCREEN: Browser at http://localhost:3000]**

### Voiceover Script

> "Let's start with the landing page. The design system is dark-mode-first with a pure black background, amber accent colors, sharp zero-radius edges for that brutalist design-engineer aesthetic, and a subtle grid-line background pattern.
>
> The **Navbar** is responsive with auth-aware menu items — it shows Login and Register buttons for guests, and a dashboard link for authenticated users.
>
> The **Hero section** features animated typography with Framer Motion — notice the smooth fade-ins and the typing animation effect.
>
> Scrolling down, we have **How It Works** — a 3-step visual guide showing the user journey from profile creation to AI matching to application tracking.
>
> The **Target Audience** section shows three user personas — Students, Providers, and Institutions.
>
> **Features** showcases the platform's capabilities with an interactive card grid.
>
> **Security Promise** builds trust by highlighting JWT auth, 2FA, encryption, and fraud detection.
>
> **Stats** shows animated counters that increment as you scroll — these pull from real platform data.
>
> **Testimonials** uses a horizontal marquee carousel.
>
> **FAQ** is an accessible accordion component.
>
> And at the bottom, a **Newsletter subscription** form and a comprehensive **Footer** with navigation links.
>
> The entire page uses **Lenis** for buttery smooth scrolling and **GSAP** for scroll-triggered animations."

### Screen Actions
1. Load the landing page — let it animate in
2. Slowly scroll through each section, pausing briefly at each
3. Hover over interactive elements (cards, buttons) to show micro-animations
4. Toggle dark/light mode if available
5. Resize browser to show responsive design
6. Click the newsletter subscription to show the form
7. Scroll back up to the Navbar

---

## 5. 🔐 Authentication Flow

**[SCREEN: Browser at /register page]**

### Voiceover Script

> "Let's register a new student account. The registration form asks for your name, email, password, and role — either Student or Provider.
>
> **[Type in details and submit]**
>
> On successful registration, the backend creates a User record and a linked Student profile in a **database transaction** — ensuring atomicity. It returns a JWT access token that expires in 15 minutes and a refresh token valid for 7 days. The frontend stores these in Zustand state and silently refreshes the access token before expiry.
>
> **[Navigate to login page]**
>
> Now let me show the login flow. I'll log in with an account that has **Two-Factor Authentication** enabled.
>
> **[Enter credentials and submit]**
>
> Notice it returns a `requires2FA: true` response. The backend generates a 6-digit OTP, hashes it with bcrypt, stores it in the database with a 10-minute expiry, and sends it via a professional HTML email template through Gmail SMTP.
>
> **[Show the OTP input, enter code]**
>
> After verification, the real JWT tokens are issued and we're redirected to the dashboard.
>
> The platform also supports **Google OAuth** via NextAuth.js — clicking 'Sign in with Google' auto-creates an account if one doesn't exist, and also respects 2FA if the user has it enabled.
>
> For **password resets**, we use SHA-256 hashed tokens with 1-hour expiry and anti-enumeration responses — the API always returns 200 regardless of whether the email exists, to prevent attackers from discovering valid emails."

### Screen Actions
1. Navigate to `/register` — fill in the form and submit
2. Show the success response / redirect to dashboard
3. Log out, navigate to `/login`
4. Log in with a 2FA-enabled account
5. Show the OTP email (if possible) or the OTP input screen
6. Enter the OTP and show successful login
7. Briefly show the forgot-password page

---

## 6. 🎓 Student Dashboard

**[SCREEN: Browser at /dashboard/student]**

### Voiceover Script — Profile

> "Welcome to the Student Dashboard. The sidebar navigation shows all available sections — Scholarships, Applications, Documents, Notifications, and Settings.
>
> Let's start with the **Profile** page. This shows the student's profile with a **Profile Strength Meter** — it's a gamified percentage that increases as you fill in fields like CGPA, Field of Study, Location, Income Level, and upload documents like transcripts and ID proofs.
>
> **[Click edit profile]**
>
> I can update my academic details here — let me add my CGPA and field of study. Watch the profile strength meter update in real-time.
>
> There's also an **AI Profile Suggestions** button — clicking it calls the FastAPI AI service, which sends a prompt to the Qwen 72B LLM with my current profile data, and returns personalized suggestions for improving my profile to get better scholarship matches."

### Screen Actions — Profile
1. Show the profile page with strength meter
2. Edit a few fields (CGPA, field of study)
3. Save and show the strength update
4. Click the AI suggestions button and show the response

### Voiceover Script — Scholarship Discovery

> "Now let's look at **Scholarship Discovery** — this is the heart of the platform.
>
> The scholarship list shows all active scholarships with **AI Match Scores** personalized to my profile. Each card shows the scholarship title, amount, deadline, provider trust score, and a match percentage with reasons — like 'Excellent CGPA of 9.2' or 'Perfect field match: Computer Science'.
>
> The matching algorithm uses a **weighted multi-factor scoring system** — CGPA contributes 30%, income level 25%, field of study 25%, and location 20%. The backend first checks a Redis cache for results, and if not cached, calls the Python AI service, then stores the results for 30 minutes.
>
> I can **search** scholarships using **PostgreSQL Full-Text Search** — it splits the query into tokens and searches across title and description columns with tsquery syntax.
>
> There are also **filters** for amount range, status, and provider.
>
> Let me click on a scholarship to see its details page — it shows the full description, eligibility criteria, requirements, deadline, provider information with trust score, and an **AI Eligibility Check** button that gives me an instant verdict on whether I qualify.
>
> And there's an **AI Application Tips** button that generates personalized advice based on my profile vs. the scholarship criteria."

### Screen Actions — Scholarships
1. Show the scholarship list with match scores
2. Point out the match percentage and reasons on a card
3. Use the search bar to search for a scholarship
4. Apply filters
5. Click on a scholarship card to open the detail page
6. Click the AI Eligibility Check button
7. Click the AI Application Tips button

### Voiceover Script — Application Flow

> "Let me now apply for a scholarship. Clicking 'Apply Now' opens a **5-step application wizard**.
>
> **Step 1 — Personal Information**: Name, email, phone, address.
>
> **Step 2 — Academic Details**: Institution, degree, CGPA, field of study — pre-filled from my profile.
>
> **Step 3 — Financial Information**: Annual income, employment status, dependents.
>
> **Step 4 — Documents**: Upload supporting documents — transcripts, ID proof, income certificate. These go to **Cloudinary** via the backend's Multer middleware.
>
> **Step 5 — Review**: A complete summary of everything I've entered, with the ability to go back and edit.
>
> **[Click Submit]**
>
> When I submit, the backend runs an **AI Fraud Check** before creating the application. The fraud detection system analyzes 8 risk factors — income anomalies, missing fields, suspicious keywords, CGPA validation, gender eligibility, document placeholders, image content detection, and file format validation. It returns a risk score from 0-100. If the score is above 70, the application is **blocked**. Between 40-70, it's **flagged** for admin review. Below 40, it's clean.
>
> The response shows me the risk score and whether my application is clean. It also triggers an in-app notification and a professional HTML email confirming my submission."

### Screen Actions — Application
1. Click "Apply Now" on a scholarship
2. Fill in each step of the form
3. Upload a document in Step 4
4. Review everything in Step 5
5. Submit and show the success response with AI check result

### Voiceover Script — Application Tracker

> "The **Application Tracker** shows all my submitted applications with real-time status tracking. Each application moves through a pipeline — Pending → Under Review → Shortlisted → Interviewing → Approved or Rejected.
>
> I can click on any application to see detailed status, provider remarks, and even a **message thread** where I can communicate directly with the scholarship provider."

### Screen Actions — Tracker
1. Open the Applications section
2. Show the list of applications with different statuses
3. Click one to show details and message history

### Voiceover Script — Document Vault & Notifications

> "The **Document Vault** is a secure file manager backed by Cloudinary. I can upload and organize my documents by type — Transcript, ID Proof, Resume, Letter of Recommendation — and these are automatically used when applying for scholarships.
>
> **Notifications** shows all my alerts — application status changes, deadline reminders, new scholarship matches. Each notification type has a different icon and color. I can mark individual ones as read or mark all as read.
>
> In **Settings**, I can change my password, toggle Two-Factor Authentication on or off, and update my notification preferences."

### Screen Actions — Vault & Notifications
1. Open Document Vault — show uploaded files
2. Upload a new document
3. Open Notifications — show the feed with different types
4. Open Settings — show 2FA toggle

---

## 7. 🏢 Provider Dashboard

**[SCREEN: Browser at /dashboard/provider (logged in as Provider)]**

### Voiceover Script

> "Now let me switch to the **Provider Dashboard**. This is where scholarship organizations manage their listings and review applications.
>
> The **Scholarship Form** lets providers create new scholarships with a rich editor — title, description, category, amount, deadline, and dynamic eligibility criteria like minimum CGPA, allowed fields of study, and location restrictions.
>
> There's an **AI Description Generator** button — clicking it sends the title and category to the Qwen 72B LLM and auto-generates a professional 3-4 sentence description. This saves providers significant time.
>
> **[Create a scholarship and show the AI generation]**
>
> After a scholarship is created with status 'Pending Review', an admin must approve it before it goes live.
>
> The **Kanban Board** is a drag-and-drop interface for managing applications. Columns represent statuses — Pending, Under Review, Shortlisted, Interviewing, Approved, Rejected. Providers can drag application cards between columns to update their status, powered by the `@hello-pangea/dnd` library.
>
> **[Drag an application card from Pending to Under Review]**
>
> Clicking on an application card opens the **Review Modal** which shows the student's full profile, submitted form data, uploaded documents, and fraud flag if any.
>
> There's an **AI Review Summary** button that auto-generates an assessment with strengths, concerns, and a recommendation (Approve/Defer/Reject).
>
> If rejecting, there's an **AI Rejection Drafting** feature that generates a professional, empathetic rejection reason.
>
> Providers also have a **Trust Score** breakdown showing their credibility score visible to students, and a **Billing Dashboard** tracking deposits and disbursements."

### Screen Actions
1. Show the provider sidebar and navigation
2. Open the Scholarship Form — fill in details
3. Click AI Generate Description — show the LLM response
4. Submit the scholarship
5. Open the Kanban Board — show applications in columns
6. Drag a card between columns
7. Click an application card — show the Review Modal
8. Click AI Review Summary
9. Show the Trust Score breakdown
10. Show the messaging feature

---

## 8. 🛡️ Admin Dashboard

**[SCREEN: Browser at /dashboard/admin (logged in as Admin)]**

### Voiceover Script

> "The **Admin Dashboard** is the control center for the entire platform.
>
> The **Analytics Overview** shows real-time metrics — total users, students, providers, scholarships, applications, fraud alerts, total disbursed amount, and a 7-day application trend chart built with Recharts.
>
> **User Management** lets admins create, activate, deactivate, or delete users across all three roles.
>
> **Provider Verification** shows pending provider registrations — admins can approve or reject them, which triggers a notification email to the provider.
>
> **Scholarship Moderation** lets admins approve, reject, or edit any scholarship. Approving changes the status from 'Pending Review' to 'Active', making it visible to students. Every admin action is logged in the **Audit Trail** with the actor, action, timestamp, and before/after values.
>
> The **Fraud Alerts** panel shows all AI-flagged applications with their risk scores, reasons, and links to the full application.
>
> And there's a **Manual Scraper Trigger** button that lets admins run the web scraper on-demand, instead of waiting for the daily 6 AM cron job."

### Screen Actions
1. Show the admin dashboard with analytics cards and chart
2. Open User Management — show user list with roles
3. Open Provider Verification — approve a provider
4. Open Scholarship Moderation — approve a pending scholarship
5. Show the Fraud Alerts panel
6. Show the Audit Log
7. Click the Scraper Trigger button

---

## 9. 🤖 AI & Scraper Services

**[SCREEN: Browser at http://localhost:8000/docs (FastAPI Swagger UI)]**

### Voiceover Script

> "Let me now show the AI microservice directly. FastAPI auto-generates interactive Swagger documentation at `/docs`.
>
> The **Matching endpoint** takes a student profile and a list of scholarships, and returns match scores using a weighted algorithm — CGPA at 30%, Income at 25%, Field of Study at 25%, and Location at 20%.
>
> **[Execute the matching endpoint with sample data]**
>
> The **Fraud Detection endpoint** runs an 8-point heuristic analysis on application data and returns a risk score from 0-100 with reasons.
>
> **[Execute the fraud endpoint with both clean and suspicious data]**
>
> The **Generate endpoints** call the HuggingFace Inference API using the Qwen 2.5 72B Instruct model with automatic fallback to Llama 3.1 8B. There are five generation features — scholarship descriptions, application tips, review summaries, profile suggestions, and eligibility checks.
>
> **[Execute one of the generate endpoints]**
>
> Now let me show the **Scraper Service**. It's a command-line tool with two modes — `--dry-run` prints scraped data to stdout for testing, and `--live` pushes data to the backend API.
>
> **[Run `python main.py --dry-run --source nsp` in terminal]**
>
> Each scraper extends an abstract `BaseScraper` class and returns standardized `ScrapedScholarship` objects validated by Pydantic. The `--live` mode calls the backend's `/api/scholarships/bulk` endpoint, which upserts scholarships using the `externalId` as a deduplication key, and triggers email notifications to students and newsletter subscribers."

### Screen Actions
1. Open FastAPI Swagger docs at localhost:8000/docs
2. Execute the matching endpoint with sample data
3. Execute the fraud endpoint with clean data, then suspicious data
4. Execute one of the generate endpoints
5. Switch to terminal — run scraper in dry-run mode
6. Show the JSON output
7. Briefly show the scraper source code (base.py, nsp.py)

---

## 10. 🚀 DevOps & Deployment

**[SCREEN: VS Code showing deploy.yml, then Docker files]**

### Voiceover Script

> "For deployment, I use a fully automated CI/CD pipeline with **GitHub Actions** deploying to **Google Cloud Run**.
>
> On every push to the `main` branch, the pipeline builds Docker images for all three services, pushes them to GCP Artifact Registry, deploys them as serverless containers on Cloud Run, and then wires the services together — updating CORS origins, NextAuth URLs, and inter-service connections.
>
> The backend Dockerfile is a multi-stage build — it installs Node.js dependencies, generates the Prisma client, bundles the Python scraper service, installs its pip dependencies, and produces a lean production image.
>
> For local development, `docker-compose up` starts all four services with a single command.
>
> Monitoring is handled by **Sentry** for error tracking and performance profiling in production."

### Screen Actions
1. Open `.github/workflows/deploy.yml` — scroll through the pipeline
2. Show `backend/Dockerfile` briefly
3. Show `docker-compose.yml`
4. Show a Sentry dashboard screenshot if available

---

## 11. 🎬 Closing

**[SCREEN: Split view — landing page on left, architecture diagram on right]**

### Voiceover Script

> "So that's ScholarHub — a production-grade, AI-powered scholarship platform with:
>
> - A **Next.js 16** frontend with 43+ components, smooth animations, and a premium design system
> - An **Express.js 5** backend with 50+ API endpoints, JWT auth with 2FA, Redis caching, and PostgreSQL Full-Text Search
> - A **FastAPI AI service** with weighted matching, 8-point fraud detection, and 5 LLM-powered features using Qwen 72B
> - An **automated web scraper** aggregating scholarships from 4 government sources
> - Full **Docker containerization** with **CI/CD to Google Cloud Run**
>
> If you found this helpful, please give it a star on GitHub. Thanks for watching!"

---

## 📋 Recording Checklist

### Before Recording
- [ ] All 4 services running locally (frontend, backend, AI, scraper)
- [ ] Database seeded with sample data (users, scholarships, applications)
- [ ] At least 3 test accounts ready (Student, Provider, Admin)
- [ ] 2FA enabled on one test account with email access
- [ ] Some documents already uploaded in the vault
- [ ] Some applications in various statuses (pending, approved, rejected)
- [ ] Fraud-flagged application in the database
- [ ] Browser in dark mode, full screen, zoom at 100%
- [ ] VS Code with the project open, all folders collapsed initially
- [ ] Terminal ready for scraper demo

### Test Accounts to Prepare

| Role | Email | Details |
|------|-------|---------|
| Student | `student@test.com` | Profile filled, documents uploaded, 2+ applications |
| Student (New) | `new@test.com` | For live registration demo |
| Provider | `provider@test.com` | Verified, 3+ scholarships, applications received |
| Admin | `admin@test.com` | Full admin access |

### Sample Data to Seed

```javascript
// Quick seed checklist:
// 1. Create admin user
// 2. Create system provider ("Government & External Agencies")
// 3. Create 5+ scholarships (mix of ACTIVE, PENDING_REVIEW, DRAFT)
// 4. Create student with complete profile
// 5. Submit 3+ applications (PENDING, APPROVED, REJECTED)
// 6. Create 1 fraud-flagged application
// 7. Add notifications for the student
// 8. Upload 3+ documents to student vault
// 9. Add some provider reviews
// 10. Create newsletter subscribers
```

---

## 🎨 Video Production Tips

### Presentation Quality
- Use **1920x1080** resolution for recording
- Set browser zoom to **100%** (Ctrl+0)
- Use **dark mode** throughout for visual consistency
- Close unnecessary tabs and notifications
- Use a **clean desktop** if showing terminal

### Voiceover Tips
- Speak at a **moderate pace** — not too fast for technical content
- **Pause** briefly when transitioning between sections
- Emphasize **key technical terms** (JWT, Prisma, FastAPI, etc.)
- Mention **why** you made certain design decisions, not just what you built

### Editing Suggestions
- Add **chapter markers** for YouTube navigation
- Add **text overlays** for tech stack names when first mentioned
- Use **zoom-in** effects when showing small UI details
- Add **transition slides** between major sections
- Consider adding **background music** at low volume (lo-fi or ambient)

### Thumbnail Ideas
- Split-screen: dark landing page + code + architecture diagram
- Text: "Full-Stack AI Scholarship Platform | Next.js + FastAPI + PostgreSQL"
- Include key tech logos (Next.js, FastAPI, PostgreSQL, Docker)

---

## 📝 Suggested YouTube Metadata

### Title Options
1. "I Built an AI-Powered Scholarship Platform — Full Stack Demo | Next.js 16 + FastAPI + PostgreSQL"
2. "ScholarHub: Full-Stack Project Walkthrough — AI Matching, Fraud Detection, CI/CD to GCP"
3. "Production-Grade Web App in 2026 — Next.js, Express, FastAPI, Docker, GitHub Actions"

### Description Template
```
🎓 ScholarHub — An AI-powered scholarship intelligence platform built with modern web technologies.

In this video, I walk through the complete platform — from architecture and codebase to live demo of all features including AI-powered scholarship matching, fraud detection, multi-step application forms, role-based dashboards, and automated web scraping.

⏱️ Timestamps:
0:00 - Introduction
1:00 - Architecture & Tech Stack
3:00 - Codebase Walkthrough
6:00 - Landing Page Demo
8:00 - Authentication Flow (JWT, 2FA, Google OAuth)
10:00 - Student Dashboard (AI Matching, Applications, Document Vault)
14:00 - Provider Dashboard (Kanban, AI Review, Scholarship Builder)
17:00 - Admin Dashboard (Analytics, Fraud Alerts, Audit Logs)
19:00 - AI Service & Scraper Demo
21:00 - DevOps (Docker, CI/CD, GCP Cloud Run)

🛠️ Tech Stack:
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI, Zustand, Framer Motion
- Backend: Express.js 5, Prisma 7, PostgreSQL, Redis, JWT, Nodemailer
- AI: FastAPI, HuggingFace (Qwen 72B), scikit-learn
- Scraper: Python, httpx, BeautifulSoup4
- DevOps: Docker, GitHub Actions, Google Cloud Run

🔗 GitHub: [your-repo-link]
🌐 Live Demo: [your-demo-link]

#nextjs #fullstack #ai #webdevelopment #portfolio
```

### Tags
```
next.js, react, full stack project, portfolio project, ai project, fastapi, express.js, prisma, postgresql, tailwind css, typescript, docker, github actions, google cloud run, scholarship platform, web scraping, fraud detection, jwt authentication, 2fa, zustand, framer motion
```
