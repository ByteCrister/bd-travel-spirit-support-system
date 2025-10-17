
export default function ModernSelect<T extends string>({
    value,
    onChange,
    options,
}: {
    value: T | "";
    onChange: (v: T) => void;
    options: readonly T[] | T[];
}) {
    return (
        <select
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value as T)}
        >
            <option value="" disabled>
                Select an option…
            </option>
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
    );
}