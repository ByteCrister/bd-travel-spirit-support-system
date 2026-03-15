import TravelerDetails from '@/components/users/travelers/traveler-details/TravelerDetails';
import { decodeId } from '@/utils/helpers/mongodb-id-conversions';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TravelerDetailsPage({ params }: PageProps) {
    const { id } = await params;
    if (!id) notFound();
    return <TravelerDetails id={decodeId(decodeURIComponent(id)) ?? ''} />;
}