// lib/mock/traveler.mock.ts
import { faker } from '@faker-js/faker';
import {
    TravelerListItem,
    TravelerDetail,
    TravelerSuspension,
    TravelerBooking,
    TravelerReview,
    TravelerReport,
    TravelerFAQ,
    TravelerLikedTour,
    TravelerSharedTour,
    TravelerViewedTour,
    TravelerViewedArticle,
} from '@/types/user/traveler.types';
import { ACCOUNT_STATUS, USER_ROLE } from '@/constants/user.const';
import { BOOKING_STATUS, BOOKING_PAYMENT_STATUS } from '@/constants/tour-booking.const';
import { REPORT_STATUS, REPORT_PRIORITY, REPORT_REASON } from '@/constants/report.const';
import { MODERATION_STATUS } from '@/constants/tour.const';

// Helper to pick a random enum value
function randomEnum<T extends object>(anEnum: T): T[keyof T] {
    const values = Object.values(anEnum);
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
}

export function generateTravelerListItem(): TravelerListItem {
    const createdAt = faker.date.past().toISOString();
    return {
        _id: faker.string.uuid(),
        userId: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: USER_ROLE.TRAVELER,
        accountStatus: randomEnum(ACCOUNT_STATUS),
        isVerified: faker.datatype.boolean(),
        createdAt,
        updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
        avatarUrl: faker.image.avatar(),
        phone: faker.phone.number(),
    };
}

export function generateTravelerDetail(id?: string): TravelerDetail {
    const createdAt = faker.date.past().toISOString();
    const accountStatus = randomEnum(ACCOUNT_STATUS);
    const isVerified = faker.datatype.boolean();
    const suspension: TravelerSuspension | undefined =
        accountStatus === ACCOUNT_STATUS.SUSPENDED
            ? {
                reason: faker.lorem.sentence(),
                suspendedBy: faker.string.uuid(),
                until: faker.date.future().toISOString(),
                createdAt: faker.date.recent().toISOString(),
            }
            : undefined;

    return {
        _id: id || faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: USER_ROLE.TRAVELER,
        createdAt,
        updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
        avatarUrl: faker.image.avatar(),
        phone: faker.phone.number(),
        address: {
            house: faker.location.buildingNumber(),
            road: faker.location.street(),
            area: faker.location.city(),
            district: faker.location.city(),
            division: faker.location.state(),
            country: 'Bangladesh',
            postalCode: faker.string.numeric(4),
        },
        dateOfBirth: faker.date.birthdate().toISOString(),
        location: {
            type: 'Point',
            coordinates: [
                faker.location.longitude(),
                faker.location.latitude(),
            ],
        },
        isVerified,
        accountStatus,
        loginAttempts: faker.number.int({ min: 0, max: 5 }),
        lastLogin: faker.date.recent().toISOString(),
        lockUntil: faker.datatype.boolean() ? faker.date.future().toISOString() : undefined,
        suspension,
        deletedAt: undefined,
        isLocked: faker.datatype.boolean(),
        isSuspended: accountStatus === ACCOUNT_STATUS.SUSPENDED,
        isActive: accountStatus === ACCOUNT_STATUS.ACTIVE,
    };
}

export function generateTourStub() {
    return {
        _id: faker.string.uuid(),
        title: faker.lorem.words(3),
        uniqueTourCode: faker.string.alphanumeric(8).toUpperCase(),
    };
}

export function generateArticleStub() {
    return {
        _id: faker.string.uuid(),
        title: faker.lorem.words(4),
        slug: faker.helpers.slugify(faker.lorem.words(3)),
    };
}

export function generateTravelerBooking(): TravelerBooking {
    const status = randomEnum(BOOKING_STATUS);
    const paymentStatus = randomEnum(BOOKING_PAYMENT_STATUS);
    const bookedAt = faker.date.past().toISOString();
    const cancellation = status === BOOKING_STATUS.CANCELLED ? {
        cancelledAt: faker.date.recent().toISOString(),
        reason: faker.lorem.sentence(),
        refundAmount: faker.number.int({ min: 0, max: 500 }),
    } : undefined;

    return {
        _id: faker.string.uuid(),
        bookingReference: faker.string.alphanumeric(10).toUpperCase(),
        tour: generateTourStub(),
        totalParticipants: faker.number.int({ min: 1, max: 10 }),
        totalPaid: faker.number.int({ min: 100, max: 2000 }),
        status,
        paymentStatus,
        bookedAt,
        cancellation,
    };
}

export function generateTravelerReview(): TravelerReview {
    return {
        _id: faker.string.uuid(),
        tour: generateTourStub(),
        rating: faker.number.int({ min: 1, max: 5 }),
        title: faker.lorem.sentence(),
        comment: faker.lorem.paragraph(),
        createdAt: faker.date.past().toISOString(),
        isApproved: faker.datatype.boolean(),
        helpfulCount: faker.number.int({ min: 0, max: 50 }),
    };
}

export function generateTravelerReport(): TravelerReport {
    return {
        _id: faker.string.uuid(),
        tour: generateTourStub(),
        reason: randomEnum(REPORT_REASON),
        message: faker.lorem.paragraph(),
        status: randomEnum(REPORT_STATUS),
        priority: randomEnum(REPORT_PRIORITY),
        createdAt: faker.date.past().toISOString(),
        resolvedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined,
    };
}

export function generateTravelerFAQ(): TravelerFAQ {
    const status = randomEnum(MODERATION_STATUS);
    return {
        _id: faker.string.uuid(),
        tour: generateTourStub(),
        question: faker.lorem.sentence(),
        answer: status === MODERATION_STATUS.APPROVED ? faker.lorem.paragraph() : undefined,
        status,
        createdAt: faker.date.past().toISOString(),
        answeredAt: status === MODERATION_STATUS.APPROVED ? faker.date.recent().toISOString() : undefined,
        likeCount: faker.number.int({ min: 0, max: 100 }),
        dislikeCount: faker.number.int({ min: 0, max: 20 }),
    };
}

export function generateTravelerLikedTour(): TravelerLikedTour {
    return {
        tour: generateTourStub(),
        likedAt: faker.date.past().toISOString(),
    };
}

export function generateTravelerSharedTour(): TravelerSharedTour {
    return {
        tour: generateTourStub(),
        sharedAt: faker.date.past().toISOString(),
        platform: faker.helpers.arrayElement(['facebook', 'twitter', 'whatsapp', 'email']),
    };
}

export function generateTravelerViewedTour(): TravelerViewedTour {
    return {
        tour: generateTourStub(),
        viewedAt: faker.date.past().toISOString(),
        durationSeconds: faker.number.int({ min: 10, max: 600 }),
    };
}

export function generateTravelerViewedArticle(): TravelerViewedArticle {
    return {
        article: generateArticleStub(),
        viewedAt: faker.date.past().toISOString(),
        durationSeconds: faker.number.int({ min: 30, max: 900 }),
    };
}