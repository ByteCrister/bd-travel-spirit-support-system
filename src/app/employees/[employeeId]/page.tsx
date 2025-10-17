import EmployeeDetailPage from "@/components/employees/details/EmployeeDetailPage";

// /employees/[employeeId]/page.tsx
interface PageProps {
    params: { employeeId: string };
}

export default async function Page({ params }: PageProps) {
    const { employeeId } = await params;

    return <EmployeeDetailPage employeeId={employeeId} />;
}
