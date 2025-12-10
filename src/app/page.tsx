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
    const fallbackFilename = "amphitheater-fortaleza-san-felipe-puerta-plata-dominican-republic.jpg";
    const imagePath = pageData?.hero?.heroCarouselImages?.[0] ?? `/${fallbackFilename}`;

    return {
      metadataBase,
      title: `Join As Guide - ${pageData.hero.totalGuides} Guides`,
      description: `Become a guide and join our ${pageData.hero.totalGuides} guides with ${pageData.hero.monthlyVisitors} monthly visitors.`,

      openGraph: {
        title: `Join As Guide - ${pageData.hero.totalGuides} Guides`,
        description: `Become a guide and join our ${pageData.hero.totalGuides} guides.`,
        url: process.env.DOMAIN,
        images: [
          {
            url: imagePath,
            width: 1200,
            height: 630,
            alt: "Join As Guide - BD Travel Spirit"
          }
        ]
      },

      twitter: {
        card: "summary_large_image",
        images: [imagePath]
      }
    };
  } catch {
    return {
      metadataBase,
      title: "Join As Guide",
      description: "Become a guide and join our community of travelers."
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