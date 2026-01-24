// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
  ArticleDetail,
  ArticleDetailApi,
  DestinationBlock,
  FaqItem,
  FoodRecommendation,
  ImageUrl,
  LocalFestival,
  RichTextBlock,
  UserRef,
} from "@/types/article.types";
import { Division, District, TOUR_CATEGORIES, DIVISION, DISTRICT } from "@/constants/tour.const";
import { ARTICLE_STATUS, ARTICLE_TYPE, FAQ_CATEGORY, FOOD_RECO_SPICE_TYPE } from "@/constants/article.const";

/**
 * GET /api/articles/:id
 * Returns ArticleDetailApi => { ok: true, data: ArticleDetail } or error envelope
 */

/* -------------------------------------------------------------------------- */
/* Utility helpers                                                            */
/* -------------------------------------------------------------------------- */

function randChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stringHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function makeImageRef(): ImageUrl {
  return faker.image.urlLoremFlickr({ category: "travel" });
}

function makeUserRef(seed?: string): UserRef {
  if (seed) faker.seed(stringHashCode(seed));
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
  };
}

/* -------------------------------------------------------------------------- */
/* Rich text block factory                                                    */
/* -------------------------------------------------------------------------- */

function makeRichTextBlocks(count: number = 3): RichTextBlock[] {
  const blocks: RichTextBlock[] = [];
  const types: RichTextBlock['type'][] = ['paragraph', 'heading', 'important', 'link'];
  
  for (let i = 0; i < count; i++) {
    const type = randChoice(types);
    const block: RichTextBlock = { type };
    
    if (type === 'paragraph' || type === 'heading' || type === 'important') {
      block.text = faker.lorem.paragraph();
    }
    
    if (type === 'link') {
      block.text = faker.lorem.sentence();
      block.href = faker.internet.url();
    }
    
    blocks.push(block);
  }
  
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Food recommendation factory                                                */
/* -------------------------------------------------------------------------- */

function makeFoodRecommendation(): FoodRecommendation {
  return {
    dishName: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    bestPlaceToTry: faker.company.name(),
    approximatePrice: `${faker.number.int({ min: 50, max: 500 })} BDT`,
    spiceLevel: randChoice(Object.values(FOOD_RECO_SPICE_TYPE)),
  };
}

/* -------------------------------------------------------------------------- */
/* Local festival factory                                                     */
/* -------------------------------------------------------------------------- */

function makeLocalFestival(): LocalFestival {
  return {
    name: faker.lorem.words(2),
    description: faker.lorem.paragraph(),
    timeOfYear: faker.date.month(),
    location: faker.location.city(),
    significance: faker.lorem.sentence(),
  };
}

/* -------------------------------------------------------------------------- */
/* Destination block factory                                                  */
/* -------------------------------------------------------------------------- */

function makeDestinationBlock(): DestinationBlock {
  // Sample Bangladesh divisions and districts
  const bangladeshDivisions: Division[] = Object.values(DIVISION);
  
  const bangladeshDistricts: District[] = Object.values(DISTRICT);
  
  return {
    id: faker.string.uuid(),
    division: randChoice(bangladeshDivisions),
    district: randChoice(bangladeshDistricts),
    area: faker.location.streetAddress(),
    description: faker.lorem.paragraph(),
    content: makeRichTextBlocks(),
    highlights: faker.helpers.arrayElements(
      [
        "Beautiful scenery", "Local cuisine", "Cultural heritage", 
        "Adventure activities", "Historical sites", "Friendly locals"
      ],
      faker.number.int({ min: 2, max: 5 })
    ),
    foodRecommendations: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => 
      makeFoodRecommendation()
    ),
    localFestivals: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => 
      makeLocalFestival()
    ),
    localTips: faker.helpers.arrayElements(
      [
        "Carry cash as ATMs are limited", 
        "Bargain in local markets", 
        "Respect local customs and dress modestly",
        "Try the local street food",
        "Hire a local guide for better experience"
      ],
      faker.number.int({ min: 2, max: 4 })
    ),
    transportOptions: faker.helpers.arrayElements(
      ["Bus from Dhaka", "Train", "Domestic Flight", "Local Rickshaw", "CNG Auto"],
      faker.number.int({ min: 1, max: 3 })
    ),
    accommodationTips: faker.helpers.arrayElements(
      [
        "Book in advance during peak season", 
        "Stay near the city center for convenience",
        "Consider homestays for authentic experience",
        "Check for AC availability in summer"
      ],
      faker.number.int({ min: 1, max: 3 })
    ),
    coordinates: {
      lat: Number(faker.location.latitude({ min: 20.5, max: 26.5 })),
      lng: Number(faker.location.longitude({ min: 88, max: 92.5 })),
    },
    imageAsset: {
      title: faker.lorem.words(2),
      assetId: faker.string.uuid(),
      url: makeImageRef(),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* FAQ factory                                                                */
/* -------------------------------------------------------------------------- */

function makeFaqItem(): FaqItem {
  return {
    question: faker.lorem.sentence(),
    answer: faker.lorem.paragraph(),
    category: randChoice(Object.values(FAQ_CATEGORY)),
  };
}

/* -------------------------------------------------------------------------- */
/* Core data factory                                                          */
/* -------------------------------------------------------------------------- */

function makeDetail(idSeed: string): ArticleDetail {
  faker.seed(stringHashCode(idSeed));

  const title = faker.lorem.sentence();
  const hero = Math.random() > 0.4 ? makeImageRef() : undefined;
  const createdAt = faker.date.past({ years: 3 }).toISOString();
  const updatedAt = faker.date.recent().toISOString();
  const publishedAt =
    Math.random() > 0.4
      ? faker.date.past({ years: 2 }).toISOString()
      : undefined;

  const destinations: DestinationBlock[] | undefined =
    Math.random() > 0.3
      ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => 
          makeDestinationBlock()
        )
      : undefined;

  const faqs: FaqItem[] | undefined =
    Math.random() > 0.6
      ? Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => 
          makeFaqItem()
        )
      : undefined;

  const seo: ArticleDetail["seo"] = {
    metaTitle: `${title} — Bangladesh Travel Guide`,
    metaDescription: faker.lorem.sentence(),
    ogImage: hero ?? faker.image.urlLoremFlickr({ category: "landscape" }),
  };

  const detail: ArticleDetail = {
    id: idSeed,
    title,
    banglaTitle: Math.random() > 0.5 ? faker.lorem.sentence() : '',
    slug: faker.helpers.slugify(title).toLowerCase(),
    status: randChoice(Object.values(ARTICLE_STATUS)),
    articleType: randChoice(Object.values(ARTICLE_TYPE)),
    author: makeUserRef(`${idSeed}-author`),
    authorBio: Math.random() > 0.5 ? faker.person.bio() : undefined,
    summary: faker.lorem.paragraph(),
    heroImage: hero,
    categories:
      Math.random() > 0.5
        ? faker.helpers.arrayElements(
            Object.values(TOUR_CATEGORIES),
            faker.number.int({ min: 1, max: 3 })
          )
        : undefined,
    tags: faker.helpers.arrayElements(
      [
        "beach", "city", "food", "budget", "luxury", "family", 
        "adventure", "cultural", "historical", "nature", "hiking"
      ],
      faker.number.int({ min: 1, max: 4 })
    ),
    publishedAt,
    readingTime: faker.number.int({ min: 3, max: 20 }),
    wordCount: faker.number.int({ min: 400, max: 3500 }),
    viewCount: faker.number.int({ min: 0, max: 100_000 }),
    likeCount: faker.number.int({ min: 0, max: 10_000 }),
    shareCount: faker.number.int({ min: 0, max: 2_000 }),
    allowComments: Math.random() > 0.2,
    createdAt,
    updatedAt,
    seo,
    destinations,
    faqs,
    commentCount: faker.number.int({ min: 0, max: 500 }),
    pendingCommentCount: faker.number.int({ min: 0, max: 20 }),
  };

  return detail;
}

/* -------------------------------------------------------------------------- */
/* Route handler                                                              */
/* -------------------------------------------------------------------------- */

export async function GET(
  _req: NextRequest,
  context: { params: { id?: string } }
): Promise<NextResponse<ArticleDetailApi>> {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id param", status: 400 },
        { status: 400 }
      );
    }

    const detail = makeDetail(id);
    return NextResponse.json({ ok: true, data: detail });
  } catch (error) {
    console.error("[GET /api/articles/:id] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate article detail", status: 500 },
      { status: 500 }
    );
  }
}