// types/tour/tour-detail-booking.types.ts

// ---------- User info embedded in a booking ----------
export interface BookingUserInfo {
    _id: string;                  // user id
    name: string;
    email: string;
    avatarUrl?: string; // optional if not always present
}

// ---------- Single booking item in a list ----------
export interface BookingListItemDTO {
    _id: string;                  // booking id
    user: BookingUserInfo;        // who booked
    bookingTime: string;          // ISO date string
    totalParticipants: number;
    totalPaid: number;            // or amount, currency assumed
    // add any other fields returned by your API, e.g.:
    // status?: 'confirmed' | 'pending' | 'cancelled';
    // paymentMethod?: string;
}

// ---------- Paginated API response for bookings ----------
export interface TourBookingsResponseDTO {
    docs: BookingListItemDTO[];
    total: number;
    page: number;
    pages: number;
}

// ---------- Query params for tour bookings list ----------
export interface TourBookingFilterParams {
    page: number;
    limit: number;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
}