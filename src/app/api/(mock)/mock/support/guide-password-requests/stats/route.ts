// app/api/mock/support/guide-password-reset/stats/route.ts
import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import {
  PasswordRequestStats,
} from '@/types/guide/guide-forgot-password.types';

// A small typed response envelope so this route is consistent with your other APIs
interface StatsApiResponse {
  success: boolean;
  data: PasswordRequestStats;
  message: string;
}

// GET handler for stats
export async function GET(): Promise<NextResponse<StatsApiResponse>> {
  const mockDataLength = 87; // Simulating 87 total requests

  // (Same math as before — just explicitly typed)
  const pending = Math.floor(mockDataLength * 0.35);
  const approved = Math.floor(mockDataLength * 0.40);
  const rejected = Math.floor(mockDataLength * 0.15);
  const expired = Math.floor(mockDataLength * 0.10);

  const stats: PasswordRequestStats = {
    total: mockDataLength,
    pending,
    approved,
    rejected,
    expired,
    pendingPercentage: Math.round(
      (pending / mockDataLength) * 100
    ),
    approvalRate: Math.round(
      (approved / mockDataLength) * 100
    ),
    averageResponseTime: parseFloat(
      (Math.random() * 24 + 1).toFixed(2)
    ), // 1–25 hours
  };

  const response: StatsApiResponse = {
    success: true,
    data: stats,
    message: 'Stats fetched successfully',
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=600',
      ETag: `W/"${faker.string.uuid()}"`, // nice-to-have for consistency
    },
  });
}