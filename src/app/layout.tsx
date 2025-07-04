import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Viewport } from "next";
import { getCurrentUser } from "@/app/actions/auth";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/context/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gym Hustle",
  description: "Track your workouts and progress",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gym Hustle",
  },
  icons: {
    apple: [
      { url: "/icons/ios/192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/ios/512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html
      suppressHydrationWarning
      lang="en"
      translate="no"
      className="notranslate"
    >
      <head>
        <meta name="googlebot" content="notranslate" />
        <meta name="google" content="notranslate" />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/ios/192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/icons/ios/512.png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className={user ? "md:ml-64 pt-[60px]" : ""}>
          <AuthProvider user={user}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <main>{children}</main>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
