# ScholarHub — Frontend Documentation (INT219)

Welcome to the frontend architecture guide for ScholarHub. This document outlines the technical stack, design philosophy, and core implementation details of the platform.

## 🚀 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Industrial/Design Engineer Aesthetic)
- **State Management**: Zustand (Global Auth & User State)
- **Animations**: Framer Motion & GSAP
- **API Client**: Axios with custom interceptors
- **Icons**: Lucide React

## 🏗️ Component Architecture
The project follows a modular, atomic design-inspired structure:
- **/app**: Routing and page-level logic.
- **/components/ui**: Reusable, low-level components (Buttons, Inputs, Loaders).
- **/components/landing**: High-level sections for the home page.
- **/components/dashboard**: Specialized components for student/provider views.
- **/utils**: Functional utilities (Closures, FetchData, Event Delegation).

## 🔐 Authentication Flow
1. **Login**: User submits credentials via `Axios`.
2. **Persistence**: NextAuth handles session tokens.
3. **Global State**: `useAuthStore` (Zustand) synchronizes the user profile across the app.
4. **Guards**: Role-based redirection logic in `layout.tsx` ensures students and providers access the correct dashboards.

## 🎨 Design System
- **Aesthetic**: Zero-radius geometry, dark mode by default, structural grids.
- **Micro-interactions**: Orbital loaders for auth states, hover-glitch effects on buttons.
- **Responsive**: Fully optimized for mobile, tablet, and desktop views using Tailwind's grid/flex system.

## 🛠️ Advanced JavaScript Utilities
Located in `/utils`:
- **Closures**: Encapsulated state for performance-sensitive counters.
- **FetchData**: Standardized API wrapper with error handling.
- **Event Delegation**: Efficient event management for dynamic scholarship lists.

## 📦 Deployment
Deploying to **Vercel**:
1. Connect GitHub repository.
2. Configure environment variables (`NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`).
3. Auto-deploy on every push to `main`.
