// next-learn/src/app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth/options.auth";

export const { GET, POST } = handlers;