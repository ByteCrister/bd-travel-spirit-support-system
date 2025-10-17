
export default function InfoField({
    icon: Icon,
    label,
    value
}: {
    icon?: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
            </div>
            <div className="text-base font-medium">{value}</div>
        </div>
    );
}