import CountUp from "react-countup";
import { motion } from "framer-motion";
interface KpiProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    decimals?: number;
    color: string;
    bgColor: string;
    iconBg: string;
    delay?: number;
}

export default function Kpi({ icon: Icon, label, value, decimals = 0, color, bgColor, iconBg, delay = 0 }: KpiProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3 }}
            className={`relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br ${bgColor} p-4 hover:shadow-md transition-all duration-200 group hover:scale-105`}
        >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 blur-2xl" />
            <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                        <CountUp end={value} decimals={decimals} duration={1.5} separator="," />
                    </div>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight">
                    {label}
                </div>
            </div>
        </motion.div>
    );
}