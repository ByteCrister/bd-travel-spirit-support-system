// /users/companies/[companyId]/[tourId]/history/page.tsx
import TourHistoryPage from "@/components/users/companies/company-details/tours/details/TourHistoryPage";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ companyId: string; tourId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { companyId, tourId } = await params;

    const decodedTourId = decodeId(decodeURIComponent(tourId));
    const decodedCompanyId = decodeId(decodeURIComponent(companyId));

    if (!decodedCompanyId || !decodedTourId) return notFound();

    return <TourHistoryPage companyId={decodedCompanyId} tourId={decodedTourId} />;
}
