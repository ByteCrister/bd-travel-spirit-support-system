import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { ApiResponse, SocialLinkDTO } from "@/types/footer-settings.types";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    // Use the id if present; otherwise return not found
    const { id } = params ?? {};
    if (!id) {
        return NextResponse.json({ meta: { ok: false, message: "Missing id" } } as ApiResponse<null>, { status: 400 });
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

    const res: ApiResponse<SocialLinkDTO> = {
        meta: { ok: true, message: "Mock social link" },
        data: item,
    };

    return NextResponse.json(res);
}
