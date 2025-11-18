import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { ApiResponse, FooterSettingsDTO, LocationEntryDTO } from "@/types/footer-settings.types";

export async function GET() {
    // Seed faker for consistent mock data
    faker.seed(12345);

    // Mock social links
    const socialLinks = Array.from({ length: 5 }).map(() => {
        const id = faker.database.mongodbObjectId();
        return {
            id,
            key: faker.helpers.slugify(faker.lorem.word()).toLowerCase(),
            label: faker.helpers.arrayElement([faker.company.name(), null]),
            url: faker.internet.url(),
            active: faker.datatype.boolean(),
            order: faker.number.int({ min: 1, max: 10 }),
            createdAt: faker.date.past().toISOString(),
            updatedAt: faker.date.recent().toISOString(),
        };
    });

    // Mock locations
    const locations: LocationEntryDTO[] = Array.from({ length: 3 }).map(() => {
        const lat = faker.location.latitude();
        const lng = faker.location.longitude();
        const city = faker.location.city();
        const region = faker.location.state();
        const country = faker.location.country();
        return {
            key: faker.helpers.slugify(`${city}-${region}`).toLowerCase(),
            country,
            region,
            city,
            slug: faker.helpers.slugify(city).toLowerCase(),
            lat: Number(lat),
            lng: Number(lng),
            active: faker.datatype.boolean(),
            location: {
                type: "Point",
                coordinates: [Number(lng), Number(lat)],
            },
        };
    });

    const dto: FooterSettingsDTO = {
        id: faker.database.mongodbObjectId(),
        socialLinks,
        locations,
        version: faker.number.int({ min: 1, max: 10 }),
        createdAt: faker.date.past().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const res: ApiResponse<FooterSettingsDTO> = {
        meta: { ok: true, message: "Mock footer settings" },
        data: dto,
    };

    return NextResponse.json(res);
}
