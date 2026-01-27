import TourDetailPage from "@/components/support/tours/details/TourDetailPage";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ tourId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { tourId } = await params;

    const decodedId = decodeId(decodeURIComponent(tourId));

    if (!decodedId) return notFound();

    return <TourDetailPage tourId={decodedId} />
}
