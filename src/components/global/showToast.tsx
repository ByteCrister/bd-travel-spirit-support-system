import { toast } from "sonner";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

export const showToast = {
    success: (message: string, description?: string) =>
        toast.success(message, {
            description,
            icon: (
                <FiCheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={20}
                />
            ),
        }),

    error: (message: string, description?: string) =>
        toast.error(message, {
            description,
            icon: (
                <FiXCircle
                    className="text-red-600 dark:text-red-400"
                    size={20}
                />
            ),
        }),

    info: (message: string, description?: string) =>
        toast(message, {
            description,
            icon: (
                <FiInfo
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                />
            ),
        }),

    warning: (message: string, description?: string) =>
        toast(message, {
            description,
            icon: (
                <FiAlertTriangle
                    className="text-yellow-600 dark:text-yellow-400"
                    size={20}
                />
            ),
        }),
};
