"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout/DashboardLayout";

// Define the admin routes that should use the dashboard layout
const ADMIN_ROUTES = [
  "/dashboard",
  "/statistics",
  "/users",
  "/guide",
  "/companies",
  "/employees",
  "/customer-support",
  "/articles",
  "/article-comments",
  "/social/banner",
  "/social/promotions",
  "/setting/guide-banner",
  "/setting/guide-footer",
];

interface DashboardProviderProps {
  children: React.ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const pathname = usePathname();

  // Check if the current route should use the dashboard layout
  const shouldUseDashboardLayout =
    ADMIN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    ) || /^\/companies\/[^/]+$/.test(pathname); // matches /companies/[companyId]

  if (shouldUseDashboardLayout) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <>{children}</>;
}
