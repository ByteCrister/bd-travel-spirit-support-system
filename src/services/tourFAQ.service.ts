// services/tourFAQ.service.ts
import { Types } from "mongoose";
import { TourFAQModel, ITourFAQ } from "@/models/tourFAQ.model";
import {
  TourFAQVoteModel,
  ITourFAQVote,
  FAQ_VOTE_TYPE,
} from "@/models/tourFAQVote.model";
import { FAQ_REPORT_REASON } from "@/constants/faqReport.const";
import { MODERATION_STATUS } from "@/constants/tour.const";

type ObjectId = Types.ObjectId | string;

export async function askQuestion(params: {
  tourId: ObjectId;
  askedBy: ObjectId;
  question: string;
}): Promise<ITourFAQ> {
  const faq = await TourFAQModel.create({
    tour: new Types.ObjectId(params.tourId),
    askedBy: new Types.ObjectId(params.askedBy),
    question: params.question.trim(),
    status: MODERATION_STATUS.PENDING,
  });
  return faq;
}

export async function answerQuestion(params: {
  faqId: ObjectId;
  answeredBy: ObjectId;
  answer: string;
  autoApprove?: boolean;
}): Promise<ITourFAQ | null> {
  const update: Partial<ITourFAQ> = {
    answeredBy: new Types.ObjectId(params.answeredBy),
    answer: params.answer.trim(),
    answeredAt: new Date(),
  };
  if (params.autoApprove) {
    update.status = MODERATION_STATUS.APPROVED;
  }
  return TourFAQModel.findByIdAndUpdate(
    params.faqId,
    { $set: update },
    { new: true }
  );
}

export async function editAnswer(params: {
  faqId: ObjectId;
  editorId: ObjectId;
  answer: string;
}): Promise<ITourFAQ | null> {
  return TourFAQModel.findByIdAndUpdate(
    params.faqId,
    {
      $set: {
        answer: params.answer.trim(),
        editedAt: new Date(),
        editedBy: new Types.ObjectId(params.editorId),
      },
    },
    { new: true }
  );
}

export async function approveFAQ(faqId: ObjectId): Promise<ITourFAQ | null> {
  return TourFAQModel.findByIdAndUpdate(
    faqId,
    { $set: { status: MODERATION_STATUS.APPROVED } },
    { new: true }
  );
}

export async function rejectFAQ(faqId: ObjectId): Promise<ITourFAQ | null> {
  return TourFAQModel.findByIdAndUpdate(
    faqId,
    { $set: { status: MODERATION_STATUS.REJECTED } },
    { new: true }
  );
}

export async function hideFAQ(faqId: ObjectId): Promise<ITourFAQ | null> {
  return TourFAQModel.findByIdAndUpdate(
    faqId,
    { $set: { isActive: false } },
    { new: true }
  );
}

export async function restoreFAQ(faqId: ObjectId): Promise<ITourFAQ | null> {
  return TourFAQModel.findByIdAndUpdate(
    faqId,
    { $set: { isActive: true } },
    { new: true }
  );
}

export async function softDeleteFAQ(faqId: ObjectId): Promise<ITourFAQ | null> {
  return TourFAQModel.findByIdAndUpdate(
    faqId,
    { $set: { deletedAt: new Date() } },
    { new: true }
  );
}

// Voting with one-vote-per-user enforcement
export async function likeFAQ(params: {
  faqId: ObjectId;
  userId: ObjectId;
}): Promise<ITourFAQ | null> {
  return applyVote({ ...params, type: "like" });
}

export async function dislikeFAQ(params: {
  faqId: ObjectId;
  userId: ObjectId;
}): Promise<ITourFAQ | null> {
  return applyVote({ ...params, type: "dislike" });
}

export async function undoVoteFAQ(params: {
  faqId: ObjectId;
  userId: ObjectId;
}): Promise<ITourFAQ | null> {
  const existing = await TourFAQVoteModel.findOne({
    faqId: new Types.ObjectId(params.faqId),
    userId: new Types.ObjectId(params.userId),
  });

  if (!existing) return TourFAQModel.findById(params.faqId);

  const inc = existing.type === "like" ? { likes: -1 } : { dislikes: -1 };

  await TourFAQVoteModel.deleteOne({ _id: existing._id });
  return TourFAQModel.findByIdAndUpdate(
    params.faqId,
    { $inc: inc },
    { new: true }
  );
}

async function applyVote(params: {
  faqId: ObjectId;
  userId: ObjectId;
  type: FAQ_VOTE_TYPE;
}): Promise<ITourFAQ | null> {
  const faqObjectId = new Types.ObjectId(params.faqId);
  const userObjectId = new Types.ObjectId(params.userId);

  const existing = await TourFAQVoteModel.findOne({
    faqId: faqObjectId,
    userId: userObjectId,
  });

  if (!existing) {
    await TourFAQVoteModel.create({
      faqId: faqObjectId,
      userId: userObjectId,
      type: params.type,
    });
    const inc = params.type === "like" ? { likes: 1 } : { dislikes: 1 };
    return TourFAQModel.findByIdAndUpdate(
      faqObjectId,
      { $inc: inc },
      { new: true }
    );
  }

  if (existing.type === params.type) {
    // no-op: already voted same way
    return TourFAQModel.findById(faqObjectId);
  }

  // switch vote
  existing.type = params.type;
  await existing.save();

  const inc =
    params.type === "like"
      ? { likes: 1, dislikes: -1 }
      : { likes: -1, dislikes: 1 };

  return TourFAQModel.findByIdAndUpdate(
    faqObjectId,
    { $inc: inc },
    { new: true }
  );
}

// Reporting with predefined reason OR customReason (no OTHER enum)
export async function reportFAQ(params: {
  faqId: ObjectId;
  reportedBy: ObjectId;
  reason?: FAQ_REPORT_REASON;
  customReason?: string; // required when no enum reason
  explanation?: string;
}): Promise<ITourFAQ | null> {
  if (!params.reason && (!params.customReason || !params.customReason.trim())) {
    throw new Error("Provide either a predefined reason or a customReason.");
  }

  return TourFAQModel.findByIdAndUpdate(
    params.faqId,
    {
      $push: {
        reports: {
          reportedBy: new Types.ObjectId(params.reportedBy),
          reason: params.reason,
          customReason: params.customReason?.trim(),
          explanation: params.explanation?.trim(),
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );
}

// Query helpers
export async function listTourFAQs(params: {
  tourId: ObjectId;
  status?: MODERATION_STATUS;
  limit?: number;
  skip?: number;
}): Promise<ITourFAQ[]> {
  const query: any = { tour: new Types.ObjectId(params.tourId) };
  if (params.status) query.status = params.status;
  return TourFAQModel.find(query)
    .sort({ createdAt: -1 })
    .skip(params.skip ?? 0)
    .limit(params.limit ?? 20)
    .exec();
}

export async function getFAQById(faqId: ObjectId): Promise<ITourFAQ | null> {
  return TourFAQModel.findById(faqId);
}
