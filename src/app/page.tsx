// app/page.tsx
import JoinAsGuide from "@/components/join-guide/JoinAsGuide";
import fetchLandingData from "@/lib/mocks/fetchLandingData.mock";

// ----------------------------
// Generate metadata using the same fetch
// ----------------------------
export async function generateMetadata() {
  const metadataBase = new URL(process.env.DOMAIN!);

  try {
    const pageData = await fetchLandingData();
    const fallbackImage = "/og-image.png";
    const heroImage = pageData?.hero?.heroCarouselImages?.[0]
      ? `/${pageData.hero.heroCarouselImages[0]}`
      : fallbackImage;

    const { totalGuides, monthlyVisitors, totalDestinations } = pageData.hero;
    const { averageRating, satisfactionRage, happyGuides } = pageData.testimonials;

    return {
      metadataBase,

      // ── Title ──────────────────────────────────────────────────────────────  
      title: `Join as a Tour Guide in Bangladesh | ${totalGuides.toLocaleString()}+ Guides | BD Travel Spirit`,

      // ── Description ────────────────────────────────────────────────────────  
      description:
        `Join BD Travel Spirit — Bangladesh's leading tour guide platform with ${totalGuides.toLocaleString()}+ professional guides, ` +
        `${monthlyVisitors.toLocaleString()} monthly visitors, and ${totalDestinations}+ destinations. ` +
        `Register as a guide in Cox's Bazar, Sylhet, Dhaka, Chittagong, Sundarbans & more. ` +
        `${satisfactionRage}% guide satisfaction rate. Start earning today.`,

      // ── Keywords (page-specific, supplements layout keywords) ──────────────  
      keywords: [
        "join as tour guide Bangladesh",
        "become a travel guide Bangladesh",
        "tour guide registration Bangladesh",
        "BD Travel Spirit guide",
        `${totalGuides} tour guides Bangladesh`,
        "Cox's Bazar tour guide",
        "Sylhet tea garden guide",
        "Sundarbans expedition guide",
        "Dhaka city tour guide",
        "Chittagong travel guide",
        "Bandarban adventure guide",
        "Rangamati tour operator",
        "Bangladesh travel platform",
        "earn as tour guide",
        "professional guide platform Bangladesh",
        "travel guide community Bangladesh",
      ],

      // ── Robots ─────────────────────────────────────────────────────────────  
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

      // ── Canonical & Alternates ─────────────────────────────────────────────  
      alternates: {
        canonical: process.env.DOMAIN,
        languages: {
          "en-BD": `${process.env.DOMAIN}/en`,
          "bn-BD": `${process.env.DOMAIN}/bn`,
        },
      },

      // ── Open Graph ─────────────────────────────────────────────────────────  
      openGraph: {
        type: "website",
        locale: "en_BD",
        alternateLocale: ["en_US", "bn_BD"],
        url: process.env.DOMAIN,
        siteName: "BD Travel Spirit Support System",
        title: `Join as a Tour Guide in Bangladesh | ${totalGuides.toLocaleString()}+ Guides | BD Travel Spirit`,
        description:
          `Bangladesh's #1 tour guide platform. ${totalGuides.toLocaleString()}+ guides, ` +
          `${monthlyVisitors.toLocaleString()} monthly visitors, ${totalDestinations}+ destinations. ` +
          `Rated ${averageRating}/5 by ${happyGuides.toLocaleString()}+ happy guides.`,
        images: [
          {
            url: heroImage,
            width: 1200,
            height: 630,
            alt: `Join BD Travel Spirit — ${totalGuides.toLocaleString()}+ Tour Guides Across Bangladesh`,
            type: "image/jpeg",
          },
          {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: "BD Travel Spirit Support System - Professional Tour Management Platform",
            type: "image/png",
          },
          {
            url: "/og-image-square.png",
            width: 1200,
            height: 1200,
            alt: "BD Travel Spirit - Bangladesh Tourism Platform",
            type: "image/png",
          },
        ],
      },

      // ── Twitter / X Card ───────────────────────────────────────────────────  
      twitter: {
        card: "summary_large_image",
        site: "@bdtravelspirit",
        creator: "@ByteCrister",
        title: `Join as a Tour Guide | ${totalGuides.toLocaleString()}+ Guides | BD Travel Spirit`,
        description:
          `${totalGuides.toLocaleString()}+ guides, ${monthlyVisitors.toLocaleString()} monthly visitors, ` +
          `${totalDestinations}+ destinations. ${satisfactionRage}% satisfaction rate. Join today.`,
        images: [
          {
            url: heroImage,
            alt: "BD Travel Spirit — Join as a Tour Guide in Bangladesh",
          },
        ],
      },

      // ── Verification ───────────────────────────────────────────────────────  
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      },

      // ── Geo & Other ────────────────────────────────────────────────────────  
      other: {
        "application-name": "BD Travel Spirit Support System",
        "geo.region": "BD",
        "geo.placename": "Bangladesh",
        coverage: "Bangladesh",
        distribution: "global",
        rating: "general",
        "revisit-after": "7 days",
        // Schema.org hint for crawlers  
        "og:locale:alternate": "bn_BD",
      },
    };
  } catch {
    return {
      metadataBase,
      title: "Join as a Tour Guide in Bangladesh | BD Travel Spirit",
      description:
        "Join BD Travel Spirit — Bangladesh's leading tour guide platform. Register as a professional guide and connect with thousands of travelers.",
      robots: { index: true, follow: true },
    };
  }
}


// ----------------------------
// Server component
// ----------------------------
export default async function Page() {
  const pageData = await fetchLandingData(); // Same fetch as metadata

  return <JoinAsGuide pageData={pageData} />;
}