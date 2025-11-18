// hooks/useEditorContext.ts
import { useMemo } from "react";
import type { ID } from "@/types/guide-subscription-settings.types";

/**
 * Simple editor context hook.
 * Currently returns undefined editorId; replace with auth integration later.
 */
export function useEditorContext() {
    // If you have auth, return actual admin ID here.
    const ctx = useMemo(() => ({ editorId: undefined as ID | undefined }), []);
    return ctx;
}