import type { Metadata } from "next";
import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "next-themes";
import { GlobalLoaderProvider } from "@/components/providers/global-loader";
import { Suspense } from "react";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-plus-jakarta",
  display: 'swap',
});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable}`}>
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
