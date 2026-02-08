// types/join-as-guide.types.ts

// hero sections type
export interface HeroContentType {
    totalGuides: number;
    monthlyVisitors: number;
    totalDestinations: number;
    heroCarouselImages?: string[]; // image urls for carousel
};

// why partner sections types
export interface WhyPartnerType {
    monthlyVisitors: number;
    bookingProcessed: number;
    activeGuides: number;
}

// testimonial sections types
export type Testimonial = {
    id: string;
    name: string; //"Rahim Hassan"
    location: string; //"Cox's Bazar, Bangladesh"
    role: string; //"Adventure Tour Guide"
    quote: string; //"The booking management system is incredibly intuitive. I can handle multiple tours simultaneously, communicate with guests seamlessly, and the payout process is lightning fast. Highly recommended!"
    rating: number; // 1-5
}

export interface TestimonialsType {
    testimonials: Testimonial[];
    averageRating: number;
    satisfactionRage: number;
    happyGuides: number;
}


// Footer types
export type SocialLinkType = {
    icon: string;
    name: string; // Facebook -> Twitter -> Instagram -> LinkedIn -> YouTube ->
    href: string;
}

export type FooterStatType = {
    active_guides: number;
    destinations: number;
    average_rating: number; // 1-5
    secure_payment: number; // percentage
    global_research_countries: number,
}

export interface FooterTypes {
    socialLinks: SocialLinkType[]
    stats: FooterStatType
}

export type LandingPageData = {
    hero: HeroContentType;
    whyPartner: WhyPartnerType;
    testimonials: TestimonialsType;
    footer: FooterTypes;
};
