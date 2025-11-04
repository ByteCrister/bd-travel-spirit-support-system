// app/companies/[companyId]/page.tsx

import CompanyOverviewPage from "@/components/company-details/company-details-page/CompanyOverviewPage";

interface PageProps {
    params: { companyId: string };
}

export default async function Page({ params }: PageProps) {
    const { companyId } = await params;

    return <CompanyOverviewPage companyId={companyId} />;
}
