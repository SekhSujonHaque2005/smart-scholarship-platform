# 🛠️ Pre-Flight Checklist: Testing & Validation

Before you push your code to GitHub and deploy to Google Cloud, follow these steps to ensure "Zero-Error" production.

## 1. Local Build Validation (Critical)
The most common cause of deployment failure is code that "works in dev" but "fails to build."
Run these commands in your terminals:

### Frontend
```bash
cd frontend
npm run build
```
*If this finishes without errors, your TypeScript and Imports are 100% safe.*

### Backend
```bash
cd backend
npx prisma generate
npx prisma validate
```
*This ensures your database schema is perfectly synchronized with your code.*

---

## 2. Functional Smoke Tests (Manual)
Perform these 5 actions locally while all 3 services are running:
1. **Login Flow**: Log in as a student. Ensure the "Establishing Secure Session" loader appears and disappears correctly.
2. **Data Fetching**: Go to the "Scholarships" page. Ensure the list loads from the API.
3. **Navigation**: Click "Dashboard" in the sidebar from different tabs to ensure it resets to Overview.
4. **Resources**: Visit `/community` and `/guides` via the Navbar dropdown.
5. **Search**: Type in the scholarship search bar to verify the Redis/Search logic isn't crashing.

---

## 3. Environment Variable Audit
Check your `.env` files. Ensure:
- No real passwords or keys are committed to Git (use `.gitignore`).
- `NEXT_PUBLIC_API_URL` is set correctly for local testing (`http://localhost:5000/api`).
- `SENTRY_DSN` is either empty or valid.

---

## 4. Final Git Workflow
Once tests pass, follow this exact sequence to push to GitHub:

1. **Stage Changes**:
   ```bash
   git add .
   ```
2. **Commit**:
   ```bash
   git commit -m "feat: production-ready build with docker and gcp ci-cd"
   ```
3. **Push to Main**:
   ```bash
   git push origin main
   ```

---

## 5. Deployment Monitoring
After pushing, go to your GitHub repository -> **Actions** tab:
- **Green Checkmark ✅**: The build and deployment succeeded!
- **Red X ❌**: Click on it to see the logs. It will tell you exactly which line failed.

**Pro-Tip**: If the build fails on GitHub but worked locally, it's usually because a "Secret" (like `DATABASE_URL`) is missing from your GitHub Settings.
