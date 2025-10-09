// components/ui/FormField.tsx
import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

export function FormFieldWrapper({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>{children}</FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
        </FormItem>
    );
}
