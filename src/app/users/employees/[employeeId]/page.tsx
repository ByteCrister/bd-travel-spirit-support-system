// /users/employees/[employeeId]/page.tsx
import EmployeeDetailPage from "@/components/users/employees/details/EmployeeDetailPage";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ employeeId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { employeeId } = await params;

    const decodedId = decodeId(decodeURIComponent(employeeId));

    if (!decodedId) return notFound();

    return <EmployeeDetailPage employeeId={decodedId} />;
}
