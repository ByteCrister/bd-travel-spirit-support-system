// /users/companies/[companyId]/page.tsx

import CompanyOverviewPage from "@/components/users/companies/company-details/company-details-page/CompanyOverviewPage";

interface PageProps {
    params: Promise<{ companyId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { companyId } = await params;

    return <CompanyOverviewPage companyId={companyId} />;
}
