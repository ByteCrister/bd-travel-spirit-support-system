export default function InfoCard({
    icon: Icon,
    title,
    children,
    className = ""
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}