import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { SocialLinkDTO } from "@/types/site-settings/footer-settings.types";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // Use the id if present; otherwise return not found
    const { id } = await params ?? {};
    if (!id) {
        return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    faker.seed(Number(id.slice(-6).split("").reduce((s, ch) => s + ch.charCodeAt(0), 0)) || 777);

    const item: SocialLinkDTO = {
        id,
        key: faker.helpers.slugify(faker.lorem.word()).toLowerCase(),
        label: faker.helpers.arrayElement([faker.company.name(), null]),
        url: faker.internet.url(),
        active: faker.datatype.boolean(),
        order: faker.number.int({ min: 1, max: 20 }),
        createdAt: faker.date.past().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(item);
}
