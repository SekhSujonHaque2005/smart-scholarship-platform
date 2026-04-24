# 🚀 Google Cloud Deployment Guide (Beginner Friendly)

Since this is your first time deploying to Google Cloud (GCP), follow these steps to set up your infrastructure.

## Step 1: Initial GCP Setup
1. **Create a Project**: Go to the [GCP Console](https://console.cloud.google.com/) and create a new project named `ScholarHub`.
2. **Enable Billing**: Ensure billing is attached to your project (the Free Tier will cover your usage).
3. **Enable APIs**: Run these commands in the Google Cloud Shell or enable them in the console:
   - Cloud Run API
   - Artifact Registry API
   - Cloud Build API

## Step 2: Create Artifact Registry
We need a place to store your Docker images.
1. Go to **Artifact Registry** in the GCP Console.
2. Click **Create Repository**.
3. Name: `scholarhub`
4. Format: `Docker`
5. Location: `us-central1` (or your preferred region).

## Step 3: Create a Service Account for GitHub
This allows GitHub to deploy to your Google Cloud account securely.
1. Go to **IAM & Admin > Service Accounts**.
2. Click **Create Service Account** named `github-deployer`.
3. Grant these roles:
   - `Cloud Run Admin`
   - `Artifact Registry Administrator`
   - `Storage Admin`
   - `Service Account User`
4. Click on the account -> **Keys** -> **Add Key** -> **Create New Key (JSON)**.
5. **Download this file!** You will need it for GitHub.

## Step 4: Configure GitHub Secrets
Go to your GitHub Repository -> **Settings > Secrets and variables > Actions** and add:
- `GCP_PROJECT_ID`: Your project ID (e.g., `scholarhub-12345`).
- `GCP_SA_KEY`: Paste the entire content of the JSON key file you downloaded.
- `DATABASE_URL`: Your Supabase connection string.
- `JWT_SECRET`: A long random string for security.

## Step 5: Deploy!
Once you push your code to the `main` branch, GitHub Actions will automatically:
1. Build all 3 Docker containers.
2. Push them to Google Cloud.
3. Deploy them to Cloud Run.
4. Provide you with a public URL for each service.

---
**Tip**: After the first deployment, you will get a URL for your Backend. Make sure to update the `NEXT_PUBLIC_API_URL` in your Frontend settings to point to that new URL!
