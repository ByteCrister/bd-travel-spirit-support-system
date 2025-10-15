import { GUIDE_STATUS } from "@/constants/guide.const";
import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import { User } from "@/types/user.types";

export const demoUsers: User[] = Array.from({ length: 30 }).map((_, i) => {
    const numId = i + 1; // keep as number for math
    const id = numId.toString(); // keep as string for _id, email, etc.

    const roles = [
        USER_ROLE.TRAVELER,
        USER_ROLE.GUIDE,
        USER_ROLE.ASSISTANT,
        USER_ROLE.SUPPORT,
        USER_ROLE.ADMIN,
    ] as const;

    const statuses = [
        ACCOUNT_STATUS.ACTIVE,
        ACCOUNT_STATUS.SUSPENDED,
        ACCOUNT_STATUS.BANNED,
        ACCOUNT_STATUS.PENDING,
    ] as const;

    const rand = <T>(arr: readonly T[]): T =>
        arr[Math.floor(Math.random() * arr.length)];

    return {
        _id: id,
        name: `Demo User ${id}`,
        email: `demo${id}@example.com`,
        role: rand(roles),
        avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? "men" : "women"
            }/${i}.jpg`,
        phone: `+1-555-000${id.padStart(2, "0")}`,
        address: {
            street: `${numId * 10} Demo Street`,
            city: "Demo City",
            state: "Demo State",
            country: "USA",
            zip: `100${id}`,
        },
        dateOfBirth: `199${i % 10}-0${(i % 9) + 1}-15`,
        isVerified: i % 3 === 0,
        accountStatus: rand(statuses),
        bookingHistory: [],
        cart: [],
        wishlist: [],
        paymentMethods: [
            {
                cardType: "Visa",
                last4: `42${id.padStart(2, "0")}`,
                expiryMonth: (i % 12) + 1,
                expiryYear: 2025 + (i % 5),
                cardHolder: `Demo User ${id}`,
                billingAddress: {
                    street: `${numId * 10} Demo Street`, // 🔥 fixed here too
                    city: "Demo City",
                    state: "Demo State",
                    country: "USA",
                    zip: `100${id}`,
                },
            },
        ],
        preferences: { language: "en", currency: "USD" },
        loginAttempts: i % 5,
        lastLogin: new Date(
            Date.now() - Math.floor(Math.random() * 1000000000)
        ).toISOString(),
        isActive: i % 7 !== 0,
        deletedAt: undefined,
        suspension: undefined,
        guideProfile:
            i % 10 === 0
                ? {
                    companyName: `Company ${id}`,
                    bio: `Organizer bio for user ${id}`,
                    social: `https://twitter.com/demo${id}`,
                    documents: [
                        {
                            name: "Business License",
                            url: "https://example.com/license.pdf",
                            uploadedAt: new Date().toISOString(),
                        },
                    ],
                    status: GUIDE_STATUS.PENDING,
                    appliedAt: new Date().toISOString(),
                }
                : undefined,
        toursCreated: [],
        createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 2000000000)
        ).toISOString(),
        updatedAt: new Date().toISOString(),
    };
});
