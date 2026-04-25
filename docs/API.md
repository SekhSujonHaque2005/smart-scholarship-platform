# 📡 API Reference — ScholarHub

> **Base URL**: `http://localhost:5000/api` · **Auth**: Bearer JWT · **Format**: JSON

---

## Authentication

All protected endpoints require the `Authorization: Bearer <accessToken>` header.

### Rate Limits

| Route Group | Window | Max Requests |
|-------------|--------|--------------|
| `/api/auth/*` | 1 hour | 10 |
| `/api/scraper/*` | 1 hour | 20 |
| All other `/api/*` | 15 minutes | 300 |

---

## 🔐 Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | No | Create student or provider account |
| `POST` | `/login` | No | Login with email/password (triggers 2FA if enabled) |
| `POST` | `/google` | No | Google OAuth sign-in / auto-registration |
| `POST` | `/verify-2fa` | No | Verify 6-digit OTP for 2FA login |
| `POST` | `/refresh` | No | Exchange refresh token for new token pair |
| `GET` | `/me` | Yes | Get current user, profile, and profile strength |
| `PUT` | `/profile` | Yes | Update student profile fields |
| `PUT` | `/password` | Yes | Change password (requires current password) |
| `PUT` | `/preferences` | Yes | Update user preferences (JSON) |
| `POST` | `/forgot-password` | No | Request password reset email |
| `POST` | `/reset-password` | No | Reset password with token |
| `POST` | `/2fa/toggle` | Yes | Enable or disable two-factor auth |

### Register — `POST /api/auth/register`

**Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "role": "STUDENT",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": "clx...", "email": "student@example.com", "role": "STUDENT", "name": "John Doe" }
}
```

### Login — `POST /api/auth/login`

**Body:**
```json
{ "email": "student@example.com", "password": "securePassword123" }
```

**Response (200) — Standard:**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": "clx...", "email": "...", "role": "STUDENT", "name": "John Doe" }
}
```

**Response (200) — 2FA Required:**
```json
{
  "message": "2FA required",
  "requires2FA": true,
  "tempToken": "eyJhbG...",
  "email": "student@example.com"
}
```

---

## 🎓 Scholarship Routes (`/api/scholarships`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Optional | List scholarships with search, filter, pagination, AI matching |
| `GET` | `/:id` | Yes | Get single scholarship with provider info |
| `POST` | `/` | Provider | Create new scholarship (requires verified provider) |
| `PUT` | `/:id` | Provider | Update own scholarship |
| `DELETE` | `/:id` | Provider | Delete own scholarship |
| `PUT` | `/:id/status` | Admin | Approve/reject scholarship (ACTIVE, CLOSED, DRAFT) |
| `POST` | `/bulk` | Admin/System | Bulk upsert external scholarships |

### List Scholarships — `GET /api/scholarships`

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Full-text search on title and description |
| `status` | string | `ACTIVE` | Filter by status (`ALL` for no filter) |
| `providerId` | string | — | Filter by provider |
| `minAmount` | number | — | Minimum scholarship amount |
| `maxAmount` | number | — | Maximum scholarship amount |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Results per page |

**Response (200):**
```json
{
  "scholarships": [
    {
      "id": "clx...",
      "title": "Merit Scholarship 2026",
      "amount": 50000,
      "deadline": "2026-06-30T00:00:00.000Z",
      "status": "ACTIVE",
      "matchScore": 85.5,
      "matchReasons": ["Excellent CGPA of 9.2", "Perfect field match: Computer Science"],
      "provider": { "orgName": "Tech Foundation", "trustScore": 85 },
      "_count": { "applications": 24 }
    }
  ],
  "pagination": { "total": 45, "page": 1, "limit": 10, "totalPages": 5 }
}
```

---

## 📝 Application Routes (`/api/applications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Student | Submit application (includes AI fraud check) |
| `GET` | `/mine` | Student | Get student's applications with match scores |
| `GET` | `/provider` | Provider | Get all applications for provider's scholarships |
| `GET` | `/:id` | Yes | Get application details with documents |
| `PUT` | `/:id/review` | Provider | Update application status with remarks |
| `GET` | `/all` | Admin | All applications (paginated) |
| `GET` | `/:scholarshipId/applications` | Provider | Applications for a specific scholarship |

### Submit Application — `POST /api/applications`

**Body:**
```json
{
  "scholarshipId": "clx...",
  "formData": {
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "institution": "IIT Delhi",
    "annualIncome": 350000,
    "cgpa": 8.5
  }
}
```

**Response (201):**
```json
{
  "message": "Application submitted successfully",
  "application": { "id": "clx...", "status": "PENDING" },
  "aiCheck": { "riskScore": 5.0, "clean": true }
}
```

**Response (403) — Fraud Blocked:**
```json
{
  "message": "Application flagged by fraud detection system",
  "riskScore": 75.0,
  "reasons": ["Suspicious content in name", "Invalid CGPA value"]
}
```

---

## 🏢 Provider Routes (`/api/providers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/me` | Provider | Get provider profile |
| `PUT` | `/me` | Provider | Update provider profile |
| `GET` | `/:id` | Yes | Get provider public profile |

---

## 📄 Document Routes (`/api/documents`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/upload` | Yes | Upload document to Cloudinary |
| `GET` | `/my` | Yes | List user's documents |
| `DELETE` | `/:id` | Yes | Delete document |

---

## 💬 Message Routes (`/api/messages`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Yes | Send message on an application |
| `GET` | `/:applicationId` | Yes | Get message thread for application |

---

## 🔔 Notification Routes (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Yes | Get all notifications |
| `PUT` | `/:id/read` | Yes | Mark notification as read |
| `PUT` | `/read-all` | Yes | Mark all as read |

---

## ⭐ Review Routes (`/api/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Student | Create provider review |
| `GET` | `/provider/:providerId` | Yes | Get reviews for a provider |
| `PUT` | `/:id/moderate` | Admin | Moderate a review |

---

## 📊 Stats Routes (`/api/stats`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/student` | Student | Student-specific analytics |
| `GET` | `/provider` | Provider | Provider-specific analytics |

---

## 📧 Newsletter Routes (`/api/newsletter`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/subscribe` | No | Subscribe email to newsletter |
| `POST` | `/unsubscribe` | No | Unsubscribe from newsletter |

---

## 💰 Billing Routes (`/api/billing`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/transactions` | Provider | Get provider's transaction history |

---

## 🛡️ Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/stats` | Admin | Global platform statistics |
| `GET` | `/users` | Admin | All users with profiles |
| `POST` | `/users` | Admin | Create user (any role) |
| `PUT` | `/users/:userId/toggle` | Admin | Activate/deactivate user |
| `DELETE` | `/users/:userId` | Admin | Delete user permanently |
| `GET` | `/providers/pending` | Admin | Pending provider verifications |
| `PUT` | `/providers/:providerId/verify` | Admin | Approve/reject provider |
| `GET` | `/scholarships` | Admin | All scholarships |
| `PUT` | `/scholarships/:id` | Admin | Edit any scholarship |
| `PUT` | `/scholarships/:id/moderate` | Admin | Approve/reject scholarship |
| `DELETE` | `/scholarships/:id` | Admin | Delete scholarship |
| `GET` | `/fraud` | Admin | All fraud alerts |
| `GET` | `/transactions` | Admin | All transactions |
| `GET` | `/audit` | Admin | Audit logs (last 100) |
| `POST` | `/scraper/trigger` | Admin | Manually trigger web scraper |

---

## 🕵️ Scraper Routes (`/api/scraper`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/sync` | System (Scraper Key) | Bulk upsert scraped scholarships |

---

## 🤖 AI Service Routes (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/matching` | Calculate match scores for student-scholarship pairs |
| `POST` | `/api/fraud/check` | Run fraud detection on application data |
| `POST` | `/api/generate/description` | Generate scholarship description via LLM |
| `POST` | `/api/generate/tips` | Generate application tips for students |
| `POST` | `/api/generate/review` | Generate application review summary |
| `POST` | `/api/generate/suggestions` | Generate profile improvement suggestions |
| `POST` | `/api/generate/eligibility` | Check student eligibility for scholarship |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive Swagger documentation |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "stack": "..." // Only in development
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient permissions or fraud block) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
