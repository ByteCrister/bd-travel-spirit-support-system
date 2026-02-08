// src/lib/build-responses/build-tour-details.ts
import { TOUR_STATUS } from "@/constants/tour.const";
import TourModel, { IAttraction, IDestinationBlock, ITour } from "@/models/tours/tour.model";
import { PopulatedAssetLean } from "@/types/common/populated-asset.types";
import { TourDetailDTO } from "@/types/tour/tour.types";
import { ClientSession, Types } from "mongoose";
import "@/models/assets/asset.model";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { ApiError } from "../helpers/withErrorHandler";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import GuideModel from "@/models/guide/guide.model";
import UserModel from "@/models/user.model";

type ObjectId = Types.ObjectId;


type IDestinationBlockLean =
    Omit<IDestinationBlock, "attractions" | "images"> & {
        attractions: (Omit<IAttraction, "images"> & {
            images: PopulatedAssetLean[];
        })[];
        images: PopulatedAssetLean[];
    };

type TourLeanPopulated =
    Omit<ITour,
        | "heroImage"
        | "gallery"
        | "destinations"
        | "companyId"
        | "authorId"
        | "suspension"
    > & {
        _id: ObjectId;
        heroImage: PopulatedAssetLean | null;
        gallery: PopulatedAssetLean[];
        destinations: IDestinationBlockLean[];
        companyId: {
            _id: ObjectId;
            companyName: string;
            createdAt: Date;
        };

        authorId: {
            _id: ObjectId;
            name: string;
            email: string;
            avatar: PopulatedAssetLean;
        };
        suspension?: {
            reason: string;
            suspendedBy: {
                _id: ObjectId;
                name: string;
                email: string;
                avatar: PopulatedAssetLean;
            };
            isAllTime: boolean;
            startAt: Date;
            endAt?: Date;
            notes?: string;
        };
    };

// Helper function to transform Mongoose document to TourDetailDTO
export async function buildTourDetailDTO(
    tourId: ObjectId,
    session?: ClientSession,
): Promise<TourDetailDTO> {
    if (!tourId) throw new Error("tourId is required");

    try {
        const baseQuery = TourModel.findById(tourId).session(session ?? null);

        const rawTour = await baseQuery
            .populate({
                path: "heroImage",
                select: "file deletedAt",
                model: AssetModel,
                populate: {
                    path: "file",
                    select: "publicUrl",
                    model: AssetFileModel,
                    options: { session }
                },
                options: { lean: true, session } // optional
            })
            .populate({
                path: "gallery",
                select: "file deletedAt",
                model: AssetModel,
                populate: {
                    path: "file",
                    select: "publicUrl",
                    model: AssetFileModel,
                    options: { session }
                },
                options: { session }
            })
            .populate({
                path: "destinations.images",
                select: "file deletedAt",
                model: AssetModel,
                populate: {
                    path: "file",
                    select: "publicUrl",
                    model: AssetFileModel,
                    options: { session }
                },
                options: { session }
            })
            .populate({
                path: "destinations.attractions.images",
                select: "file deletedAt",
                model: AssetModel,
                populate: {
                    path: "file",
                    select: "publicUrl",
                    model: AssetFileModel,
                    options: { session }
                },
                options: { session }
            })
            .populate({
                path: "companyId",
                select: "companyName createdAt",
                model: GuideModel,
                options: { session }
            })
            .populate({
                path: "authorId",
                select: "name email avatar",
                model: UserModel,
                populate: {
                    path: "avatar",
                    select: "file",
                    model: AssetModel,
                    populate: {
                        path: "file",
                        select: "publicUrl",
                        model: AssetFileModel,
                        options: { session }
                    }
                },
                options: { session }
            })
            .populate({
                path: "suspension.suspendedBy",
                select: "name email avatar",
                model: UserModel,
                populate: {
                    path: "avatar",
                    select: "file",
                    model: AssetModel,
                    populate: {
                        path: "file",
                        select: "publicUrl",
                        model: AssetFileModel,
                        options: { session }
                    }
                },
                options: { session }
            })
            .exec();

        if (!rawTour) {
            throw new ApiError(`Tour not found for id: ${tourId.toString()}`, 404);
        };

        const tour = rawTour.toObject() as unknown as TourLeanPopulated;

        // Calculate computed fields
        const bookingSummary = calculateBookingSummary(tour);
        const nextDeparture = calculateNextDeparture(tour);
        const hasActiveDiscount = checkActiveDiscount(tour.discounts);

        return {
            // =============== IDENTITY & BASIC INFO ===============
            id: tour._id.toString(),
            title: tour.title,
            slug: tour.slug,
            status: tour.status,
            summary: tour.summary,
            heroImage: tour.heroImage?.file?.publicUrl.toString() ?? undefined,
            gallery: tour.gallery?.map((asset) => asset?.file?.publicUrl ?? "") || [],
            seo: tour.seo,

            // =============== BANGLADESH-SPECIFIC FIELDS ===============
            tourType: tour.tourType,
            division: tour.division,
            district: tour.district,
            accommodationType: tour.accommodationType || [],
            guideIncluded: tour.guideIncluded,
            transportIncluded: tour.transportIncluded,
            emergencyContacts: tour.emergencyContacts || {},

            // =============== CONTENT & ITINERARY ===============
            destinations: transformDestinations(tour.destinations) || [],
            itinerary: tour.itinerary || [],
            inclusions: tour.inclusions || [],
            exclusions: tour.exclusions || [],
            difficulty: tour.difficulty,
            bestSeason: tour.bestSeason || [],
            audience: tour.audience || [],
            categories: tour.categories || [],
            translations: tour.translations || {},

            // =============== LOGISTICS ===============
            mainLocation: tour.mainLocation,
            transportModes: tour.transportModes || [],
            pickupOptions: tour.pickupOptions || [],
            meetingPoint: tour.meetingPoint || '',
            packingList: tour.packingList || [],

            // =============== PRICING & COMMERCE ===============
            basePrice: tour.basePrice,
            discounts: transformDiscounts(tour.discounts) || [],
            duration: tour.duration,
            operatingWindows: transformOperatingWindows(tour.operatingWindows) || [],
            departures: transformDepartures(tour.departures) || [],
            paymentMethods: tour.paymentMethods || [],

            // =============== COMPLIANCE & ACCESSIBILITY ===============
            licenseRequired: tour.licenseRequired || false,
            ageSuitability: tour.ageSuitability,
            accessibility: tour.accessibility || {},

            // =============== POLICIES ===============
            cancellationPolicy: tour.cancellationPolicy,
            refundPolicy: tour.refundPolicy,
            terms: tour.terms || '',

            // =============== ENGAGEMENT & RATINGS ===============
            ratings: tour.ratings || { average: 0, count: 0 },
            wishlistCount: tour.wishlistCount || 0,
            featured: tour.featured || false,

            // =============== MODERATION ===============
            moderationStatus: tour.moderationStatus,
            rejectionReason: tour.rejectionReason,
            completedAt: tour.completedAt?.toISOString(),
            reApprovalRequestedAt: tour.reApprovalRequestedAt?.toISOString(),

            // =============== COMPANY & AUTHOR INFO ===============
            companyInfo: {
                id: tour.companyId._id.toString(),
                name: tour.companyId.companyName,
                createdAt: tour.companyId.createdAt.toISOString(),
            },
            authorInfo: {
                id: tour.authorId._id.toString(),
                name: tour.authorId.name,
                email: tour.authorId.email,
                avatarUrl: tour.authorId.avatar?.file?.publicUrl ?? "",
            },

            // =============== SYSTEM FIELDS ===============
            tags: tour.tags || [],
            publishedAt: tour.publishedAt?.toISOString(),
            viewCount: tour.viewCount || 0,
            likeCount: tour.likeCount || 0,
            shareCount: tour.shareCount || 0,
            createdAt: tour.createdAt.toISOString(),
            updatedAt: tour.updatedAt.toISOString(),
            deletedAt: tour.deletedAt?.toISOString(),

            // =============== SUSPENSION INFO ===============
            suspension: tour.suspension && tour.suspension.suspendedBy ? {
                reason: tour.suspension.reason,
                suspendedBy: {
                    id: tour.suspension.suspendedBy._id.toString(),
                    name: tour.suspension.suspendedBy.name,
                    email: tour.suspension.suspendedBy.email,
                    avatarUrl: tour.suspension.suspendedBy.avatar?.file?.publicUrl ?? ""
                },
                isAllTime: tour.suspension.isAllTime,
                startAt: tour.suspension.startAt.toISOString(),
                endAt: tour.suspension.endAt?.toISOString(),
                notes: tour.suspension.notes
            } : undefined,

            // =============== COMPUTED/UI-ONLY FIELDS ===============
            bookingSummary,
            nextDeparture,
            isUpcoming: isTourUpcoming(tour),
            isExpired: isTourExpired(tour),
            hasActiveDiscount
        };
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        console.error("[buildTourDetailDTO Error]", message);
        throw new ApiError(
            `Failed to build tour details: ${message || error}`,
            500
        );
    }
}

// Helper function to transform destinations with image URLs
function transformDestinations(destinations: IDestinationBlockLean[] | undefined): TourDetailDTO['destinations'] {
    if (!destinations) return [];

    return destinations.map(({ _id, attractions, images, ...rest }) => ({
        ...rest,
        id: _id?.toString(),
        attractions: (attractions ?? []).map(({ _id, images, ...attRest }) => ({
            ...attRest,
            id: _id?.toString(),
            imageIds: images?.map(img => ({ id: img?._id.toString(), url: img?.file?.publicUrl ?? "" })) ?? [],
        })),
        imageIds: images?.map(img => ({ id: img?._id.toString(), url: img?.file?.publicUrl ?? "" })) ?? [],
    }));
}

// Helper function to transform discounts
function transformDiscounts(discounts: ITour["discounts"] | undefined): TourDetailDTO['discounts'] {
    if (!discounts) return [];

    return discounts.map(discount => ({
        ...discount,
        validFrom: discount.validFrom?.toISOString(),
        validUntil: discount.validUntil?.toISOString()
    }));
}

// Helper function to transform operating windows
function transformOperatingWindows(windows: ITour["operatingWindows"] | undefined): TourDetailDTO['operatingWindows'] {
    if (!windows) return [];

    return windows.map(win => ({
        ...win,
        startDate: win.startDate.toISOString(),
        endDate: win.endDate.toISOString()
    }));
}

// Helper function to transform departures
function transformDepartures(departures: ITour["departures"] | undefined): TourDetailDTO['departures'] {
    if (!departures) return [];

    return departures.map(dep => ({
        date: dep.date.toISOString(),
        seatsTotal: dep.seatsTotal,
        seatsBooked: dep.seatsBooked,
        meetingPoint: dep.meetingPoint,
        meetingCoordinates: dep.meetingCoordinates
    }));
}

// Calculate booking summary
function calculateBookingSummary(tour: TourLeanPopulated): TourDetailDTO['bookingSummary'] {
    const departures = tour.departures || [];

    const totalSeats = departures.reduce((sum, dep) =>
        sum + (dep.seatsTotal || 0), 0
    );

    const bookedSeats = departures.reduce((sum, dep) =>
        sum + (dep.seatsBooked || 0), 0
    );

    const availableSeats = totalSeats - bookedSeats;
    const isFull = availableSeats <= 0;
    const occupancyPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

    return {
        totalSeats,
        bookedSeats,
        availableSeats,
        isFull,
        occupancyPercentage
    };
}

// Calculate next departure
function calculateNextDeparture(tour: TourLeanPopulated): string | undefined {
    const departures = tour.departures || [];
    const now = new Date();

    const futureDepartures = departures
        .filter((dep) => new Date(dep.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return futureDepartures[0]?.date.toISOString();
}

// Check if tour has active discount
function checkActiveDiscount(discounts: ITour["discounts"] | undefined): boolean {
    if (!discounts) return false;

    const now = new Date();
    return discounts.some(discount =>
        (!discount.validFrom || new Date(discount.validFrom) <= now) &&
        (!discount.validUntil || new Date(discount.validUntil) >= now)
    );
}

// Check if tour is upcoming
function isTourUpcoming(tour: TourLeanPopulated): boolean {
    const now = new Date();

    // Check if any future departure exists
    const futureDepartures = tour.departures?.some((dep) =>
        new Date(dep.date) > now
    );

    // Check operating windows
    const futureWindows = tour.operatingWindows?.some((win) =>
        new Date(win.endDate) > now
    );

    return !!(futureDepartures || futureWindows);
}

// Check if tour is expired
function isTourExpired(tour: TourLeanPopulated): boolean {
    if (tour.status === TOUR_STATUS.COMPLETED ||
        tour.status === TOUR_STATUS.TERMINATED ||
        tour.status === TOUR_STATUS.ARCHIVED) {
        return true;
    }

    const now = new Date();

    // Check if all departures are in the past
    const allPastDepartures = tour.departures?.every((dep) =>
        new Date(dep.date) < now
    ) || false;

    // Check if all operating windows are in the past
    const allPastWindows = tour.operatingWindows?.every((win) =>
        new Date(win.endDate) < now
    ) || false;

    return !!(tour.departures?.length && allPastDepartures) ||
        !!(tour.operatingWindows?.length && allPastWindows);
}