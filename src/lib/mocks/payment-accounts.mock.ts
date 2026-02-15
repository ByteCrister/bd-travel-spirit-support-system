// lib/mocks/payment-accounts.mock.ts
import { faker } from "@faker-js/faker";
import {
    PaymentAccount,
    SafeCardInfo,
} from "@/types/site-settings/stripe-payment-account.type";
import {
    PAYMENT_OWNER_TYPE,
    PAYMENT_PURPOSE,
    CARD_BRAND,
} from "@/constants/payment.const";

// Generate a fixed set of mock accounts (e.g., 3 items)
const TOTAL_MOCK_ACCOUNTS = 3;
faker.seed(123);

function generateMockCard(): SafeCardInfo {
    return {
        brand: faker.helpers.enumValue(CARD_BRAND),
        last4: faker.finance.creditCardNumber().slice(-4),
        expMonth: faker.number.int({ min: 1, max: 12 }),
        expYear: faker.number.int({ min: 2025, max: 2030 }),
    };
}

function generateMockAccount(): PaymentAccount {
    return {
        id: faker.string.uuid(),
        ownerType: faker.helpers.enumValue(PAYMENT_OWNER_TYPE),
        ownerId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }) ?? null,
        purpose: faker.helpers.enumValue(PAYMENT_PURPOSE),
        isActive: faker.datatype.boolean(0.8), // 80% active
        isBackup: faker.datatype.boolean(0.2),
        createdAt: faker.date.past({ years: 2 }).toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        label: faker.helpers.maybe(() => faker.lorem.words(2)) ?? undefined,
        stripeCustomerId: faker.string.alphanumeric(16),
        stripePaymentMethodId: faker.string.alphanumeric(24),
        stripeConnectedAccountId: faker.helpers.maybe(() => faker.string.alphanumeric(24)),
        card: faker.helpers.maybe(generateMockCard, { probability: 0.9 }),
        isDeleted: false,
        deletedAt: null,
    };
}

// Generate once and reuse to keep pagination stable
export const mockAccounts: PaymentAccount[] = Array.from(
    { length: TOTAL_MOCK_ACCOUNTS },
    generateMockAccount
);

// Helper to paginate
export function paginateAccounts(page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
        items: mockAccounts.slice(start, end),
        total: mockAccounts.length,
        page,
        pageSize,
    };
}

// Helper to find by id
export function findAccountById(id: string): PaymentAccount | undefined {
    return mockAccounts.find((acc) => acc.id === id);
}