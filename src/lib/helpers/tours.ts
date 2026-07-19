// =============== STANDALONE HELPER FUNCTIONS ===============

import { IDiscount, IPrice, ITour } from "@/models/tours/tour.model";

/**
 * Export standalone helper functions for use in services/controllers
 */
export const tourHelpers = {

    /**
     * Calculate available seats for a tour
     */
    calculateAvailableSeats(tour: ITour): {
        totalSeats: number;
        bookedSeats: number;
        availableSeats: number;
        departure?: {
            date: Date;
            total: number;
            booked: number;
            available: number;
        }
    } {
        const result = {
            totalSeats: 0,
            bookedSeats: 0,
            availableSeats: 0,
            departure: undefined as {
                date: Date;
                total: number;
                booked: number;
                available: number;
            } | undefined
        };

        if (tour.departure) {
            result.totalSeats = tour.departure.seatsTotal;
            result.bookedSeats = tour.departure.seatsBooked;
            result.availableSeats = result.totalSeats - result.bookedSeats;
            result.departure = {
                date: tour.departure.date,
                total: tour.departure.seatsTotal,
                booked: tour.departure.seatsBooked,
                available: result.availableSeats
            };
        }

        return result;
    },

    /**
     * Apply discount to price
     */
    applyDiscount(
        price: IPrice,
        discount?: IDiscount
    ): { original: IPrice; discounted: IPrice; discountAmount: number } {
        if (!discount || discount.value <= 0) {
            return {
                original: price,
                discounted: price,
                discountAmount: 0
            };
        }

        const discountAmount = (price.amount * discount.value) / 100;
        const discountedAmount = Math.max(0, price.amount - discountAmount);

        return {
            original: price,
            discounted: { ...price, amount: discountedAmount },
            discountAmount
        };
    }
};