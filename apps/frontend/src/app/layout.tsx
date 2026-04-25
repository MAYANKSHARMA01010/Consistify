import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layouts/Navbar";
import VerificationBanner from "@/components/ui/VerificationBanner";
import { Background } from "@/components/ui/Background";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consistify - Build Consistency That Lasts",
  description: "Track tasks, build streaks, review weekly progress, and stay consistent with an intelligent habit system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="YrcRM1P9DxnjzH9EU9MEZzvXIg_aUbaAFyJHvHEfe5Y"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <ReactQueryProvider>
          <AuthProvider>
            <Background />
            <Navbar />
            <VerificationBanner />
            <main className="min-h-screen">{children}</main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 2000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }}
              containerStyle={{
                top: 20,
                left: 20,
                bottom: 20,
                right: 20,
              }}
              gutter={8}
            />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
