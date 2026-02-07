// /app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://bd-travel-spirit-support-system.vercel.app";
    return {
        rules: [{ userAgent: "*", allow: "/" }],
        sitemap: `${domain}/sitemap.xml`,
    };
}