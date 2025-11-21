"use client";

import { create } from "zustand";

type State = {
    isLoginOpen: boolean;
    showForgotPassword: boolean;
    openLogin: () => void;
    closeLogin: () => void;
    openForgotPassword: () => void;
    backToLogin: () => void;
};

const useJoinAsGuideStore = create<State>((set) => ({
    isLoginOpen: false,
    showForgotPassword: false,
    openLogin: () => set({ isLoginOpen: true }),
    closeLogin: () => set({ isLoginOpen: false }),
    openForgotPassword: () => set({ showForgotPassword: true, isLoginOpen: false }),
    backToLogin: () => set({ showForgotPassword: false, isLoginOpen: true }),
}));

export default useJoinAsGuideStore;