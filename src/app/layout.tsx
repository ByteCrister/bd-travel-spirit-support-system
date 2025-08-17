import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/global/ToastProvider";
import { UserProvider } from "@/components/global/UserProvider";

export const metadata: Metadata = {
  title: "Support BDTravelSpirit",
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
        <ToastProvider>
          <UserProvider >
            {children}
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
