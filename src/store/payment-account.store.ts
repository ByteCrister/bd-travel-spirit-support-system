// stores/payment-account.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce, enableMapSet } from "immer";
import type {
    PaymentAccount,
    PaymentAccountMap,
    PaymentAccountState,
    PaymentAccountActions,
    Paginated,
    CreateStripePaymentMethodDTO,
    PaymentAccountUpdateDTO,
} from "@/types/payment-account.type";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { showToast } from "@/components/global/showToast";
import { PAYMENT_PROVIDER } from "@/constants/payment.const";

enableMapSet();

// const URL_AFTER_API = "/mock/payment-accounts";
const URL_AFTER_API = "/payment-accounts";

/** ------------------------
 * Initial state
 * ------------------------ */
const initialState = (): PaymentAccountState => ({
    byId: {} as PaymentAccountMap,
    allIds: [] as string[],
    listTotal: 0,
    page: 1,
    pageSize: 5,
    fetchStatus: "idle",
    createStatus: "idle",
    updateStatus: "idle",
    deleteStatus: "idle",
    error: null,
});

/** ------------------------
 * AbortController for fetchList
 * ------------------------ */
let currentListAbortController: AbortController | null = null;

/** ------------------------
 * Store type
 * ------------------------ */
type Store = PaymentAccountState & PaymentAccountActions;

/** ------------------------
 * Zustand Store
 * ------------------------ */
export const usePaymentAccountStore = create<Store>()(
    devtools((set, get) => ({
        ...initialState(),

        /** ------------------------
         * INTERNAL HELPERS
         * ------------------------ */
        _mergePage: (pageData: Paginated<PaymentAccount>) =>
            set(
                produce((state: PaymentAccountState) => {
                    pageData.items.forEach((item) => {
                        state.byId[item.id] = item;
                        if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
                    });
                    state.allIds.sort((a, b) =>
                        state.byId[b].createdAt.localeCompare(state.byId[a].createdAt)
                    );
                    state.listTotal = pageData.total;
                })
            ),

        _upsertOne: (account: PaymentAccount) =>
            set(
                produce((state: PaymentAccountState) => {
                    state.byId[account.id] = account;
                    if (!state.allIds.includes(account.id)) state.allIds.unshift(account.id);
                })
            ),

        _removeOne: (id: string) =>
            set(
                produce((state: PaymentAccountState) => {
                    if (state.byId[id]) {
                        delete state.byId[id];
                        state.allIds = state.allIds.filter((x) => x !== id);
                        state.listTotal = Math.max(0, state.listTotal - 1);
                    }
                })
            ),

        /** ------------------------
         * API ACTIONS
         * ------------------------ */

        fetchList: async (page = 1, pageSize = 5) => {
            if (currentListAbortController) currentListAbortController.abort();
            currentListAbortController = new AbortController();
            const signal = currentListAbortController.signal;

            set(
                produce((s) => {
                    s.fetchStatus = "loading";
                    s.error = null;
                    s.page = page;
                    s.pageSize = pageSize;
                })
            );

            try {
                const res = await api.get(URL_AFTER_API, {
                    params: { page, pageSize },
                    signal,
                });
                const pageData = res.data as Paginated<PaymentAccount>;
                if (signal.aborted) return;
                get()._mergePage(pageData);
                set(
                    produce((s) => {
                        s.fetchStatus = "success";
                        s.error = null;
                    })
                );
            } catch (err: unknown) {
                const message = extractErrorMessage(err);
                set(
                    produce((s) => {
                        s.fetchStatus = "error";
                        s.error = message;
                    })
                );
                showToast.error("Failed to load payment accounts", message);
            } finally {
                currentListAbortController = null;
            }
        },

        fetchById: async (id: string) => {
            set(
                produce((s) => {
                    s.fetchStatus = "loading";
                    s.error = null;
                })
            );
            try {
                const res = await api.get(`${URL_AFTER_API}/${id}`);
                const account = res.data as PaymentAccount;
                get()._upsertOne(account);
                set(
                    produce((s) => {
                        s.fetchStatus = "success";
                        s.error = null;
                    })
                );
            } catch (err: unknown) {
                const message = extractErrorMessage(err);
                set(
                    produce((s) => {
                        s.fetchStatus = "error";
                        s.error = message;
                    })
                );
                showToast.error("Failed to load account", message);
            }
        },

        // createBankAccount: async (payload: CreateBankAccountDTO) => {
        //     set(
        //         produce((s) => {
        //             s.createStatus = "loading";
        //             s.error = null;
        //         })
        //     );

        //     const tempId = `temp_${Date.now()}`;
        //     const optimistic: PaymentAccount = {
        //         id: tempId,
        //         ownerType: payload.ownerType,
        //         ownerId: payload.ownerId ?? null,
        //         provider: payload.provider,
        //         purpose: payload.purpose,
        //         isActive: true,
        //         isBackup: !!payload.isBackup,
        //         createdAt: new Date().toISOString(),
        //         updatedAt: new Date().toISOString(),
        //         label: payload.label,
        //         providerMeta: {
        //             provider: PAYMENT_PROVIDER.BANK,
        //             meta: {
        //                 // token used to create/link
        //                 stripeExternalBankId: payload.bankToken ?? undefined,
        //                 bank: {
        //                     bankToken: payload.bankToken,
        //                     bankName: payload.bankName,
        //                     country: payload.country,
        //                     currency: payload.currency,
        //                     last4: payload.last4,
        //                 },
        //             },
        //         } as ProviderMeta,
        //     };

        //     get()._upsertOne(optimistic);

        //     try {
        //         const res = await api.post(URL_AFTER_API, payload);
        //         const created = res.data as PaymentAccount;

        //         set(
        //             produce((s: PaymentAccountState) => {
        //                 delete s.byId[tempId];
        //                 s.allIds = s.allIds.filter((x) => x !== tempId);
        //                 s.byId[created.id] = created;
        //                 if (!s.allIds.includes(created.id)) s.allIds.unshift(created.id);
        //                 s.createStatus = "success";
        //                 s.error = null;
        //             })
        //         );
        //         showToast.success("Bank account added");
        //         return created;
        //     } catch (err: unknown) {
        //         const message = extractErrorMessage(err);
        //         set(
        //             produce((s: PaymentAccountState) => {
        //                 delete s.byId[tempId];
        //                 s.allIds = s.allIds.filter((x) => x !== tempId);
        //                 s.createStatus = "error";
        //                 s.error = message;
        //             })
        //         );
        //         showToast.error("Failed to add bank account", message);
        //         return null;
        //     }
        // },

        createStripePaymentMethod: async (payload: CreateStripePaymentMethodDTO) => {
            set(
                produce((s) => {
                    s.createStatus = "loading";
                    s.error = null;
                })
            );

            const tempId = `temp_${Date.now()}`;
            const optimistic: PaymentAccount = {
                id: tempId,
                ownerType: payload.ownerType,
                ownerId: payload.ownerId ?? null,
                provider: PAYMENT_PROVIDER.STRIPE,
                purpose: payload.purpose,
                isActive: true,
                isBackup: !!payload.isBackup,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                label: payload.label,
                card: payload.card, // optional, frontend-safe copy
                providerMeta: {
                    provider: PAYMENT_PROVIDER.STRIPE,
                    meta: {
                        stripeCustomerId: payload.stripeCustomerId,
                        stripePaymentMethodId: payload.stripePaymentMethodId,
                        card: payload.card,
                    },
                },
            };


            get()._upsertOne(optimistic);

            try {
                const res = await api.post(URL_AFTER_API, payload);
                const created = res.data as PaymentAccount;

                set(
                    produce((s: PaymentAccountState) => {
                        delete s.byId[tempId];
                        s.allIds = s.allIds.filter((x) => x !== tempId);
                        s.byId[created.id] = created;
                        if (!s.allIds.includes(created.id)) s.allIds.unshift(created.id);
                        s.createStatus = "success";
                        s.error = null;
                    })
                );
                showToast.success("Payment method added");
                return created;
            } catch (err: unknown) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: PaymentAccountState) => {
                        delete s.byId[tempId];
                        s.allIds = s.allIds.filter((x) => x !== tempId);
                        s.createStatus = "error";
                        s.error = message;
                    })
                );
                showToast.error("Failed to add payment method", message);
                return null;
            }
        },

        updateAccount: async (id: string, payload: PaymentAccountUpdateDTO) => {
            const prev = get().byId[id];
            if (!prev) {
                const msg = "Account not found";
                set(
                    produce((s) => {
                        s.updateStatus = "error";
                        s.error = msg;
                    })
                );
                showToast.error(msg);
                return null;
            }

            get()._upsertOne({ ...prev, ...payload, updatedAt: new Date().toISOString() });

            try {
                const res = await api.patch(`${URL_AFTER_API}/${id}`, payload);
                const updated = res.data as PaymentAccount;
                get()._upsertOne(updated);
                set(
                    produce((s) => {
                        s.updateStatus = "success";
                        s.error = null;
                    })
                );
                showToast.success("Account updated");
                return updated;
            } catch (err: unknown) {
                const message = extractErrorMessage(err);
                set(
                    produce((s) => {
                        s.byId[id] = prev;
                        s.updateStatus = "error";
                        s.error = message;
                    })
                );
                showToast.error("Failed to update account", message);
                return null;
            }
        },

        deleteAccount: async (id: string) => {
            const prev = get().byId[id];
            if (!prev) {
                const msg = "Account not found";
                set(
                    produce((s) => {
                        s.deleteStatus = "error";
                        s.error = msg;
                    })
                );
                showToast.error(msg);
                return false;
            }

            get()._removeOne(id);

            try {
                const res = await api.delete(`${URL_AFTER_API}/${id}`);
                const success = res.data?.success ?? true;
                if (!success) throw new Error("Delete failed");
                set(
                    produce((s) => {
                        s.deleteStatus = "success";
                        s.error = null;
                    })
                );
                showToast.success("Account deleted");
                return true;
            } catch (err: unknown) {
                const message = extractErrorMessage(err);
                set(
                    produce((s) => {
                        s.byId[id] = prev;
                        if (!s.allIds.includes(id)) s.allIds.unshift(id);
                        s.deleteStatus = "error";
                        s.error = message;
                    })
                );
                showToast.error("Failed to delete account", message);
                return false;
            }
        },

        setActive: async (id: string, active: boolean) => {
            const prev = get().byId[id];
            if (!prev) return null;

            get()._upsertOne({ ...prev, isActive: active, updatedAt: new Date().toISOString() });

            try {
                const res = await api.patch(`${URL_AFTER_API}/${id}/active`, { isActive: active });
                const updated = res.data as PaymentAccount;
                get()._upsertOne(updated);
                showToast.success(active ? "Account activated" : "Account deactivated");
                return updated;
            } catch (err: unknown) {
                const message = extractErrorMessage(err);
                get()._upsertOne(prev);
                showToast.error("Failed to change active state", message);
                return null;
            }
        },

        setBackup: async (id: string, isBackup: boolean) => {
            const prev = get().byId[id];
            if (!prev) return null;

            get()._upsertOne({ ...prev, isBackup, updatedAt: new Date().toISOString() });

            try {
                const res = await api.patch(`${URL_AFTER_API}/${id}/backup`, { isBackup });
                const updated = res.data as PaymentAccount;
                get()._upsertOne(updated);
                showToast.success(isBackup ? "Marked as backup" : "Unmarked backup");
                return updated;
            } catch (err: unknown) {
                const message = extractErrorMessage(err);
                get()._upsertOne(prev);
                showToast.error("Failed to change backup state", message);
                return null;
            }
        },

        clearError: () =>
            set(
                produce((s) => {
                    s.error = null;
                    s.fetchStatus = s.fetchStatus === "error" ? "idle" : s.fetchStatus;
                    s.createStatus = s.createStatus === "error" ? "idle" : s.createStatus;
                    s.updateStatus = s.updateStatus === "error" ? "idle" : s.updateStatus;
                    s.deleteStatus = s.deleteStatus === "error" ? "idle" : s.deleteStatus;
                })
            ),
    }))
);