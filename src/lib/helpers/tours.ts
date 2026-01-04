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
        byDeparture: Array<{
            date: Date;
            total: number;
            booked: number;
            available: number;
        }>
    } {
        const result = {
            totalSeats: 0,
            bookedSeats: 0,
            availableSeats: 0,
            byDeparture: [] as Array<{
                date: Date;
                total: number;
                booked: number;
                available: number;
            }>
        };

        if (tour.departures && tour.departures.length > 0) {
            tour.departures.forEach(departure => {
                result.totalSeats += departure.seatsTotal;
                result.bookedSeats += departure.seatsBooked;

                result.byDeparture.push({
                    date: departure.date,
                    total: departure.seatsTotal,
                    booked: departure.seatsBooked,
                    available: departure.seatsTotal - departure.seatsBooked
                });
            });

            result.availableSeats = result.totalSeats - result.bookedSeats;
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