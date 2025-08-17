// app/api/chat/users/route.ts
import { NextResponse } from 'next/server';
import { getChatMessageModel } from '@/models/ChatMessage';
import { getUserFromToken } from '@/utils/helper/getUserFromToken';
import ConnectUserDB from '@/config/ConnectUserDB';
import mongoose from 'mongoose';
import { z } from 'zod';

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
});

export async function GET(req: Request) {
  try {
    // 1. Auth check
    const user = await getUserFromToken().catch(() => null);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse + validate page & limit
    const { searchParams } = new URL(req.url, 'http://localhost');
    const parsed = querySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }
    const pageNumber = parseInt(parsed.data.page, 10);
    const pageSize = parseInt(parsed.data.limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // 3. Connect + build aggregation
    const dbConn = await ConnectUserDB();
    const ChatMessage = getChatMessageModel(dbConn);
    const me = new mongoose.Types.ObjectId(user.id);

    const results = await ChatMessage.aggregate([
      {
        $match: {
          isDraft: false,
          $or: [
            { sender: me },
            { receiver: me }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', me] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'chatmessages',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$sender', '$$userId'] },
                    { $eq: ['$receiver', me] },
                    { $eq: ['$isRead', false] },
                    { $eq: ['$isDraft', false] }
                  ]
                }
              }
            },
            { $count: 'unreadCount' }
          ],
          as: 'unreadData'
        }
      },
      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ['$unreadData.unreadCount', 0] }, 0]
          }
        }
      },
      {
        $lookup: {
          from: 'chatmessages',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$sender', me] },
                    { $eq: ['$receiver', '$$userId'] },
                    { $eq: ['$isDraft', true] }
                  ]
                }
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'draft'
        }
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar'
          },
          lastMessage: {
            message: '$lastMessage.message',
            timestamp: '$lastMessage.timestamp'
          },
          draftMessage: {
            $arrayElemAt: ['$draft.message', 0]
          },
          unreadCount: 1
        }
      },
      { $skip: skip },
      { $limit: pageSize }
    ]);

    // 4. Send back data + paging info
    return NextResponse.json({
      users: results,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        hasMore: results.length === pageSize
      }
    });
  } catch (err) {
    console.error('❌ Error GET /api/chat/users', err);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}