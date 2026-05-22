import { NextResponse } from 'next/server';
import generateTourCode from '@/lib/helpers/generate-tour-code';
import ConnectDB from '@/config/db';
import TourModel from '@/models/tours/tour.model';

export async function POST() {

    await ConnectDB();

    try {
        // Find tours without uniqueTourCode or with empty string
        const tours = await TourModel.find({
            $or: [
                { uniqueTourCode: { $exists: false } },
                { uniqueTourCode: null },
                { uniqueTourCode: '' }
            ]
        });

        let updated = 0;
        let failed = 0;

        for (const tour of tours) {
            let code: string = '';
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 5;

            while (!isUnique && attempts < maxAttempts) {
                code = generateTourCode(10);
                const existing = await TourModel.findOne({ uniqueTourCode: code, _id: { $ne: tour._id } });
                if (!existing) {
                    isUnique = true;
                }
                attempts++;
            }

            if (!isUnique) {
                failed++;
                console.error(`Failed to generate unique code for tour ${tour._id}`);
                continue;
            }

            tour.uniqueTourCode = code;
            await tour.save(); // triggers pre-save hook but we already set code, so it will skip generation
            updated++;
        }

        return NextResponse.json({
            message: 'Migration completed',
            total: tours.length,
            updated,
            failed
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}