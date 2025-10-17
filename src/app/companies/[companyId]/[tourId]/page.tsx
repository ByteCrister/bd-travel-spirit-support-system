// app/companies/[companyId]/[tourId]/page.tsx
import TourDetailPage from "@/components/company-details/tours/details/TourDetailPage";

interface PageProps {
    params: { companyId: string; tourId: string };
}

export default async function Page({ params }: PageProps) {
    const { companyId, tourId } = await params;

    return <TourDetailPage companyId={companyId} tourId={tourId} />;
}
