// /users/companies/[companyId]/page.tsx

import CompanyOverviewPage from "@/components/users/companies/company-details/company-details-page/CompanyOverviewPage";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ companyId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { companyId } = await params;

    const decodedId = decodeId(decodeURIComponent(companyId));

    if (!decodedId) return notFound();

    return <CompanyOverviewPage companyId={companyId} />;
}
