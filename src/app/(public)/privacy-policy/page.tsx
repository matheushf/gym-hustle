import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy | Gym Hustle",
  description: "Read our privacy policy to understand how we handle your data at Gym Hustle.",
};

export default function PrivacyPolicyPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 text-base">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">
          <strong>Last updated:</strong> June 2024
        </p>
        <p className="mb-4">
          Welcome to Gym Hustle! Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our app to track your workouts and progress.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Account information (email, name, authentication provider)</li>
          <li>Workout and fitness data you log in the app</li>
          <li>Device and usage information (for analytics and improvement)</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide and improve Gym Hustle features</li>
          <li>To personalize your experience</li>
          <li>To communicate updates and support</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">3. Data Sharing</h2>
        <p className="mb-4">
          We do <strong>not</strong> sell your personal data. We may share data with trusted service providers (like authentication and analytics) only as necessary to operate the app.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">4. Data Security</h2>
        <p className="mb-4">
          We use industry-standard security measures to protect your data. However, no method of transmission or storage is 100% secure.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">5. Your Rights</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Access, update, or delete your account data at any time</li>
          <li>Contact us for privacy-related questions: <a href="mailto:hffmatheus@gmail.com" className="underline">support@gymhustle.app</a></li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">6. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you of significant changes via the app or email.
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Gym Hustle. All rights reserved.
        </p>
      </main>
      <Toaster />
    </ThemeProvider>
  );
} 