import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type {  SocialLinkDTO } from "@/types/site-settings/footer-settings.types";

export async function GET() {
  faker.seed(54321);

  const items: SocialLinkDTO[] = Array.from({ length: 6 }).map(() => {
    const id = faker.database.mongodbObjectId();
    return {
      id,
      key: faker.helpers.slugify(faker.lorem.word()).toLowerCase(),
      label: faker.helpers.arrayElement([faker.company.name(), null]),
      url: faker.internet.url(),
      active: faker.datatype.boolean(),
      order: faker.number.int({ min: 1, max: 20 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
  });


  return NextResponse.json(items);
}
