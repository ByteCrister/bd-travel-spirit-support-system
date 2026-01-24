import { showToast } from "@/components/global/showToast";
import { FormikErrors } from "formik";

type ErrorValue =
    | string
    | FormikErrors<unknown>
    | Array<FormikErrors<unknown> | string | undefined>
    | undefined;

export function flattenErrors<T>(
    errors: FormikErrors<T>,
    prefix = ''
): string[] {
    const result: string[] = [];

    for (const key in errors) {
        const value = errors[key] as ErrorValue;
        const path = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'string') {
            result.push(`${path}: ${value}`);
        }
        else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (!item) return;
                result.push(
                    ...flattenErrors(
                        item as FormikErrors<unknown>,
                        `${path}[${index}]`
                    )
                );
            });
        }
        else if (typeof value === 'object' && value !== null) {
            result.push(
                ...flattenErrors(
                    value as FormikErrors<unknown>,
                    path
                )
            );
        }
    }

    return result;
}

export function showFormikSubmitErrors<T>(errors: FormikErrors<T>) {
    const messages = flattenErrors(errors);

    if (!messages.length) return;

    // Console (dev)
    // console.group('Formik validation errors');
    messages.forEach(msg => console.error(msg));
    console.groupEnd();

    // UI (toast)
    showToast.error(
        'Form validation failed',
        messages.slice(0, 3).join('\n') + (messages.length > 3 ? '\n...' : '')
    );
}