// components/guide/GuideKPI.tsx
"use client";

import CountUp from "react-countup";
import { Card, CardContent } from "@/components/ui/card";
import { 
    FiFileText, 
    FiClock, 
    FiCheckCircle, 
    FiXCircle 
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Props = {
    title: string;
    value: number;
    variant?: "green" | "red" | "yellow" | "blue";
    loading?: boolean;
};

const variantConfig = {
    blue: {
        bgGradient: "from-blue-50 to-blue-100/50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700",
        iconBg: "bg-blue-500",
        icon: FiFileText,
        ringColor: "ring-blue-100",
    },
    yellow: {
        bgGradient: "from-amber-50 to-amber-100/50",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
        iconBg: "bg-amber-500",
        icon: FiClock,
        ringColor: "ring-amber-100",
    },
    green: {
        bgGradient: "from-emerald-50 to-emerald-100/50",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-700",
        iconBg: "bg-emerald-500",
        icon: FiCheckCircle,
        ringColor: "ring-emerald-100",
    },
    red: {
        bgGradient: "from-red-50 to-red-100/50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        iconBg: "bg-red-500",
        icon: FiXCircle,
        ringColor: "ring-red-100",
    },
};

export function GuideKPI({ title, value, variant = "blue", loading }: Props) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <Card 
            className={cn(
                "relative overflow-hidden border transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                config.borderColor,
                "bg-gradient-to-br",
                config.bgGradient
            )}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    {/* Left side - Text content */}
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-3">
                            {title}
                        </p>
                        <div className={cn(
                            "text-4xl font-bold tracking-tight",
                            config.textColor
                        )}>
                            {loading ? (
                                <div className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
                            ) : (
                                <CountUp 
                                    end={value} 
                                    duration={1.2} 
                                    separator="," 
                                    useEasing={true}
                                    easingFn={(t, b, c, d) => {
                                        // easeOutExpo easing
                                        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right side - Icon */}
                    <div className={cn(
                        "flex items-center justify-center",
                        "w-14 h-14 rounded-xl",
                        config.iconBg,
                        "shadow-lg ring-4",
                        config.ringColor,
                        "transition-transform duration-300 hover:scale-110"
                    )}>
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                </div>

                {/* Decorative background element */}
                <div className={cn(
                    "absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10",
                    config.iconBg
                )} />
            </CardContent>
        </Card>
    );
}