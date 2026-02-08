import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { NotificationsStats } from '@/types/dashboard/statistics.types';

export async function GET() {
  const data: NotificationsStats = {
    sentVsRead: {
      sent: 1000,
      read: 750,
      readRate: 75,
    },
    byType: [
      { label: 'Email', count: 500 },
      { label: 'Push', count: 300 },
      { label: 'SMS', count: 200 },
    ],
    byPriority: [
      { label: 'High', count: 200 },
      { label: 'Medium', count: 500 },
      { label: 'Low', count: 300 },
    ],
    deliveryTimeline: Array.from({ length: 7 }, () => ({
      date: faker.date.recent().toISOString(),
      value: faker.number.int({ min: 50, max: 200 }),
    })),
  };

  return NextResponse.json(data);
}
