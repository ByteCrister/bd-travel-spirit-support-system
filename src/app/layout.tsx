import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

import { Inter, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "BD Travel Spirit Support System",
  description: "Customer support system of bd-travel-spirit.vercel.app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
