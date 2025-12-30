// next-auth.d.ts
import { USER_ROLE } from "@/constants/user.const";
import { DefaultUser, DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            email: string;
            role: `${USER_ROLE.ADMIN}` | `${USER_ROLE.SUPPORT}`;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        email: string;
        role: `${USER_ROLE.ADMIN}` | `${USER_ROLE.SUPPORT}`;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        role: `${USER_ROLE.ADMIN}` | `${USER_ROLE.SUPPORT}`;
        exp?: number;
    }
}