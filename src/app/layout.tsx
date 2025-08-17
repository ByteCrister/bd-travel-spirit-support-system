import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BD TravelSpirit Support System",
  description: "Customer support system of BDTravelSpirit.com",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
