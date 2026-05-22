import { toast } from "sonner";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

// ── Style tokens (neu design system) ──────────────────────────
const ICON_STYLES = {
    success: "text-[#00A63D]",
    error: "text-[#FF2157]",
    info: "text-[#006666]",
    warning: "text-[#FE9900]",
} as const;

const ICON_SIZE = 18;

export const showToast = {
    success: (message: string, description?: string) =>
        toast.success(message, {
            description,
            icon: (
                <FiCheckCircle
                    className={ICON_STYLES.success}
                    size={ICON_SIZE}
                    aria-hidden="true"
                />
            ),
        }),

    error: (message: string, description?: string) =>
        toast.error(message, {
            description,
            icon: (
                <FiXCircle
                    className={ICON_STYLES.error}
                    size={ICON_SIZE}
                    aria-hidden="true"
                />
            ),
        }),

    info: (message: string, description?: string) =>
        toast(message, {
            description,
            icon: (
                <FiInfo
                    className={ICON_STYLES.info}
                    size={ICON_SIZE}
                    aria-hidden="true"
                />
            ),
        }),

    warning: (message: string, description?: string) =>
        toast(message, {
            description,
            icon: (
                <FiAlertTriangle
                    className={ICON_STYLES.warning}
                    size={ICON_SIZE}
                    aria-hidden="true"
                />
            ),
        }),
};