import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { ChatStats } from '@/types/dashboard/statistics.types';

export async function GET() {
  const data: ChatStats = {
    messagesOverTime: Array.from({ length: 30 }, () => ({
      date: faker.date.recent().toISOString(),
      value: faker.number.int({ min: 100, max: 1000 }),
    })),
    readVsUnread: {
      read: 800,
      unread: 200,
      readRate: 80,
    },
    topConversations: Array.from({ length: 5 }, () => ({
      id: faker.string.uuid(),
      label: faker.person.fullName(),
      value: faker.number.int({ min: 100, max: 1000 }),
      change: faker.number.int({ min: -10, max: 10 }),
    })),
    avgResponseTime: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
  };

  return NextResponse.json(data);
}
