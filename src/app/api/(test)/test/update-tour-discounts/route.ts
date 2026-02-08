// app/api/test/update-tour-discounts/route.ts
import { NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import { TOUR_DISCOUNT_TYPE, TOUR_DISCOUNT } from "@/constants/tour.const";
import TourModel from "@/models/tours/tour.model";

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function PATCH() {
    await ConnectDB();

    // Fetch all tours that have discounts
    const tours = await TourModel.find({ discounts: { $exists: true, $ne: [] } });

    let modifiedCount = 0;

    for (const tour of tours) {
        let updated = false;

        // Iterate over discounts and mutate in place
        for (const d of tour.discounts ?? []) {
            const randomType = getRandomItem(Object.values(TOUR_DISCOUNT_TYPE));
            const randomDiscount = getRandomItem(Object.values(TOUR_DISCOUNT));

            if (d.type !== randomType || d.discount !== randomDiscount) {
                d.type = randomType;
                d.discount = randomDiscount;
                updated = true;
            }
        }

        if (updated) {
            await tour.save(); // triggers validators
            modifiedCount++;
        }
    }

    return NextResponse.json({
        success: true,
        matchedTours: tours.length,
        modifiedTours: modifiedCount,
    });
}