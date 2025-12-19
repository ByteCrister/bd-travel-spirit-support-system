import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { Inter, Poppins } from "next/font/google";
import GlobalProvider from "@/components/wrappers/GlobalProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN || "http://localhost:3000"),

  title: {
    default: "BD Travel Spirit Support System",
    template: "%s | BD Travel Spirit Support",
  },

  description: "Customer support system of bd-travel-spirit.vercel.app",

  openGraph: {
    type: "website",
    siteName: "BD Travel Spirit Support",
  },

  twitter: {
    card: "summary_large_image",
    creator: "@bdtravelspirit",
  },
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
