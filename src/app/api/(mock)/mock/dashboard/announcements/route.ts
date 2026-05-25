// app/api/mock/dashboard/announcements/route.ts
import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import { successResponse } from '@/lib/mocks/dashboard.mock';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const announcements = Array.from({ length: 5 }, () => ({
    id: faker.string.uuid(),
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
  }));
  
  return NextResponse.json(successResponse(announcements));
}