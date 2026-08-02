import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "WanderAI - AI Powered Travel Itinerary Planner",
    template: "%s | WanderAI",
  },
  description:
    "Generate customized day-by-day travel itineraries, hotels, restaurants, and interactive Google Maps instantly powered by AI.",
  keywords: [
    "AI Travel Planner",
    "Itinerary Generator",
    "Trip Planner",
    "OpenAI Travel",
    "Google Maps Itinerary",
    "Vacation Planner",
    "AI Vacation",
  ],
  authors: [{ name: "WanderAI Team" }],
  creator: "WanderAI",
  publisher: "WanderAI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://wanderai.vercel.app"),
  openGraph: {
    title: "WanderAI - AI Powered Travel Itinerary Planner",
    description:
      "Plan your dream trip in seconds with custom AI itineraries, hotel picks, and interactive Google Maps.",
    url: "https://wanderai.vercel.app",
    siteName: "WanderAI",
    images: [
      {
        url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
        width: 1200,
        height: 630,
        alt: "WanderAI Travel Planner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WanderAI - AI Powered Travel Itinerary Planner",
    description:
      "Plan your dream trip in seconds with custom AI itineraries, hotel picks, and interactive Google Maps.",
    images: ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
