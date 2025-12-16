// src/lib/auth/session.auth.ts

import { auth } from "./options.auth"


/**
 * Retrieves the user ID from the NextAuth session.
 */

export async function getUserIdFromSession(): Promise<string | null> {
    const session = await auth()
    return session?.user?.id ?? null
}