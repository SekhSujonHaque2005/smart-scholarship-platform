import type { Metadata } from "next";
import "./globals.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "next-themes";
import { GlobalLoaderProvider } from "@/components/providers/global-loader";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "ScholarHub — AI-Powered Scholarship Matching Platform",
  description:
    "India's smartest scholarship marketplace. AI-powered matching, verified providers, real-time tracking. Find and apply for scholarships effortlessly.",
  keywords: [
    "scholarship",
    "scholarship platform",
    "AI scholarship matching",
    "India scholarships",
    "student funding",
    "ScholarHub",
  ],
  openGraph: {
    title: "ScholarHub — AI-Powered Scholarship Matching",
    description:
      "Find scholarships matched to your profile with AI. Verified providers, real-time tracking, and a trusted community.",
    type: "website",
    locale: "en_IN",
    siteName: "ScholarHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScholarHub — AI-Powered Scholarship Matching",
    description:
      "Find scholarships matched to your profile with AI. Verified providers, real-time tracking, and a trusted community.",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" richColors closeButton />
          <AuthProvider>
            <Suspense fallback={null}>
              <GlobalLoaderProvider>
                <LenisProvider>
                  {children}
                </LenisProvider>
              </GlobalLoaderProvider>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
