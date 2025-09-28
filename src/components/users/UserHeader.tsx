import { motion } from 'framer-motion'
import CountUp from 'react-countup';
import { Users, UserCheck, Crown } from 'lucide-react';

interface UserHeaderTypes {
    total: number;
    verifiedCount: number;
    organizerCount: number;
}

const UserHeader = ({ total, verifiedCount, organizerCount }: UserHeaderTypes) => {
    const kpiData = [
        {
            label: "Total Users",
            value: total ?? 0,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            label: "Verified Users",
            value: verifiedCount,
            icon: UserCheck,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200"
        },
        {
            label: "Organizers",
            value: organizerCount,
            icon: Crown,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kpiData.map((kpi, index) => {
                const IconComponent = kpi.icon;

                return (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: "easeOut"
                        }}
                        whileHover={{
                            y: -2,
                            transition: { duration: 0.2 }
                        }}
                        className={`relative overflow-hidden rounded-xl bg-white border ${kpi.borderColor} shadow-sm hover:shadow-md transition-all duration-200 p-4 group`}
                    >
                        {/* Background gradient overlay */}
                        <div className={`absolute inset-0 ${kpi.bgColor} opacity-30 group-hover:opacity-40 transition-opacity duration-200`} />

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-lg ${kpi.bgColor} ${kpi.borderColor} border`}>
                                    <IconComponent className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${kpi.color.replace('text-', 'bg-')} opacity-60`} />
                            </div>

                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {kpi.label}
                                </p>
                                <div className="text-2xl font-bold text-gray-900">
                                    <CountUp
                                        end={kpi.value}
                                        duration={1.2}
                                        delay={index * 0.2}
                                        separator=","
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subtle pattern overlay */}
                        <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                            <div className={`w-full h-full ${kpi.color.replace('text-', 'bg-')} rounded-full transform translate-x-12 -translate-y-12`} />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default UserHeader;
