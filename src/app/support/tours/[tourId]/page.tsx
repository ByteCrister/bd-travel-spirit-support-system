import TourDetailPage from "@/components/support/tours/details/TourDetailPage";

interface PageProps {
    params: Promise<{ tourId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { tourId } = await params;

    return <TourDetailPage tourId={tourId} />
}
