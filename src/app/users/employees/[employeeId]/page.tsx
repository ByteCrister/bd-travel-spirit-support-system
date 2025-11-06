// /users/employees/[employeeId]/page.tsx
import EmployeeDetailPage from "@/components/users/employees/details/EmployeeDetailPage";

interface PageProps {
    params: { employeeId: string };
}

export default async function Page({ params }: PageProps) {
    const { employeeId } = await params;

    return <EmployeeDetailPage employeeId={employeeId} />;
}
