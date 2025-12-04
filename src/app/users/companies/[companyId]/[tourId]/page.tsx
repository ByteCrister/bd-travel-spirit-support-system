// /users/companies/[companyId]/[tourId]/page.tsx
import TourDetailPage from "@/components/users/companies/company-details/tours/details/TourDetailPage";

interface PageProps {
    params: Promise<{ companyId: string; tourId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { companyId, tourId } = await params;

    return <TourDetailPage companyId={companyId} tourId={tourId} />;
}
