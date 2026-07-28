import type { Metadata } from "next";
import RegisterAsGuide from "@/components/register-guide/RegisterAsGuide";

// ─── Page-level SEO Metadata ───────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Register as a Tour Guide | Join BD Travel Spirit & Grow Your Business",

  description:
    "Become a verified tour guide on BD Travel Spirit — Bangladesh's leading travel platform. Register your company, publish tours, reach thousands of travellers, and earn more without depending on Facebook or Instagram. Apply today.",

  keywords: [
    "register as tour guide Bangladesh",
    "become a tour guide Bangladesh",
    "join BD Travel Spirit as guide",
    "tour guide registration Bangladesh",
    "apply as tour operator Bangladesh",
    "professional tour management platform",
    "tour company registration Bangladesh",
    "online tour booking system Bangladesh",
    "tour guide revenue sharing",
    "travel platform for guides Bangladesh",
    "Cox's Bazar tour guide registration",
    "Sylhet tour operator platform",
    "Bandarban trekking guide join",
    "Sundarbans tour company register",
    "Dhaka city tour guide platform",
    "tour itinerary management tool",
    "independent tour operator platform",
    "travel business growth Bangladesh",
    "verified tour guide certification",
  ],

  openGraph: {
    type: "website",
    locale: "en_BD",
    url: `${process.env.DOMAIN}/register-as-guide`,
    siteName: "BD Travel Spirit Support System",
    title:
      "Register as a Tour Guide | BD Travel Spirit — Bangladesh's #1 Travel Platform",
    description:
      "Stop depending on social media for bookings. Join BD Travel Spirit's verified guide network, manage your company & tours professionally, and access thousands of eager travellers. Register your company now.",
    images: [
      {
        url: "/og-register-guide.png",
        width: 1200,
        height: 630,
        alt: "Register as a Tour Guide on BD Travel Spirit — Bangladesh Travel Platform",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@bdtravelspirit",
    creator: "@ByteCrister",
    title: "Become a Verified Guide on BD Travel Spirit | Bangladesh Travel",
    description:
      "Create your company profile, list your tours, and grow your travel business on Bangladesh's leading tourism platform. Professional tools, real bookings, revenue sharing.",
    images: ["/og-register-guide.png"],
  },

  alternates: {
    canonical: `${process.env.DOMAIN}/register-as-guide`,
    languages: {
      "en-BD": `${process.env.DOMAIN}/en/register-as-guide`,
    },
  },

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

  category: "Travel & Tourism",
};

// ─── JSON-LD Structured Data ───────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Register as a Tour Guide — BD Travel Spirit",
  description:
    "Join BD Travel Spirit as a verified tour guide or tour company. Manage tours, earn revenue, and reach thousands of travellers across Bangladesh.",
  url: `${process.env.DOMAIN}/register-as-guide`,
  inLanguage: "en-BD",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.DOMAIN,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Register as Guide",
        item: `${process.env.DOMAIN}/register-as-guide`,
      },
    ],
  },
  potentialAction: {
    "@type": "RegisterAction",
    target: `${process.env.DOMAIN}/register-as-guide`,
    name: "Register as a Tour Guide",
  },
};

import fetchRegisterGuideData from "@/lib/handlers/fetch-static/fetchRegisterGuideData";

// ─── Page Component ────────────────────────────────────────────────────────────
export default async function RegisterAsGuidePage() {
  const stats = await fetchRegisterGuideData();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RegisterAsGuide stats={stats} />
    </>
  );
}