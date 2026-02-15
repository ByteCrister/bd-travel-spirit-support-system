import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { Inter, Poppins } from "next/font/google";
import GlobalProvider from "@/components/wrappers/GlobalProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN || "http://localhost:3000"),

  // Basic Information  
  title: {
    default: "BD Travel Spirit Support System | Professional Tour Management Platform",
    template: "BD Travel Spirit Support System | %s",
  },

  description: "Comprehensive travel platform support system for Bangladesh tourism. Manage tours, guides, bookings, and customer support. Discover Bangladesh's beauty through professional tour operators across all divisions including Dhaka, Chittagong, Sylhet, Cox's Bazar, and more.",

  applicationName: "BD Travel Spirit Support System",

  authors: [
    { name: "ByteCrister", url: "https://github.com/ByteCrister" }
  ],

  creator: "ByteCrister",
  publisher: "BD Travel Spirit",

  keywords: [
    // Core Platform Keywords  
    "BD Travel Spirit",
    "Bangladesh travel",
    "Bangladesh tourism",
    "tour management system",
    "travel support platform",

    // Location-based Keywords  
    "Bangladesh tour guide",
    "Cox's Bazar tours",
    "Sylhet tourism",
    "Bandarban travel",
    "Dhaka city tours",
    "Chittagong travel guide",
    "Rangamati tours",
    "Sundarbans expedition",

    // Service Keywords  
    "professional tour operators Bangladesh",
    "travel guide registration",
    "tour booking platform",
    "Bangladesh travel articles",
    "tour company management",
    "travel support system",
    "tour itinerary planner",
    "Bangladesh tourism support",

    // Feature Keywords  
    "tour review system",
    "travel FAQ platform",
    "real-time tour booking",
    "Bangladesh travel analytics",
    "tour guide directory",
    "travel content management",
  ],

  // Open Graph (Facebook, LinkedIn, etc.)  
  openGraph: {
    type: "website",
    locale: "en_BD",
    alternateLocale: ["en_US", "bn_BD"],
    url: process.env.DOMAIN,
    siteName: "BD Travel Spirit Support System",
    title: "BD Travel Spirit Support | Professional Tour Management Platform for Bangladesh",
    description: "Comprehensive support system for Bangladesh tourism. Professional tour guides, travel companies, and support staff platform. Discover, manage, and book authentic Bangladesh travel experiences.",
    images: [
      {
        url: "/og-image.png", // Create this image (1200x630px recommended)  
        width: 1200,
        height: 630,
        alt: "BD Travel Spirit Support System - Professional Tour Management Platform",
        type: "image/png",
      },
      {
        url: "/og-image-square.png", // Square variant (1200x1200px)  
        width: 1200,
        height: 1200,
        alt: "BD Travel Spirit - Bangladesh Tourism Platform",
        type: "image/png",
      },
    ],
  },

  // Twitter Card  
  twitter: {
    card: "summary_large_image",
    site: "@bdtravelspirit",
    creator: "@ByteCrister",
    title: "BD Travel Spirit Support | Bangladesh Tour Management Platform",
    description: "Professional tour management and support system for Bangladesh tourism. Connect with expert guides, manage tours, and explore Bangladesh's natural beauty.",
    images: ["/twitter-image.png"], // Create this image (1200x600px recommended)  
  },

  // Robots & Indexing  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons  
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#10b981", // Your brand color  
      },
    ],
  },

  // Manifest  
  manifest: "/site.webmanifest",

  // Verification (Add these to your environment variables)  
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,  
    // bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,  
  },

  // Category  
  category: "Travel & Tourism",

  // Additional Metadata  
  other: {
    "application-name": "BD Travel Spirit Support System",
    "contact:email": "support@bd-travel-spirit.com", // Update with actual email  
    "contact:phone": "+880-XXX-XXXXXX", // Update with actual phone  
    "geo.region": "BD",
    "geo.placename": "Bangladesh",
    "coverage": "Bangladesh",
    "distribution": "global",
    "rating": "general",
    "revisit-after": "7 days",
  },

  // Alternate Languages (if you add multilingual support)  
  alternates: {
    canonical: process.env.DOMAIN,
    languages: {
      "en-BD": `${process.env.DOMAIN}/en`,
      "bn-BD": `${process.env.DOMAIN}/bn`,
    },
  },
};

// Theme & Colors  
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <GlobalProvider>
          {/* App content */}
          {children}

          {/* Global toast notifications */}
          <Toaster
            position="bottom-right"
            richColors
            duration={5000}
          />
        </GlobalProvider>
      </body>
    </html>
  );
}
