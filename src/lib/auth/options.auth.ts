// src/lib/auth/auth-options.ts
import NextAuth, { Session, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { Types } from "mongoose";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { USER_ROLE } from "@/constants/user.const";

interface MyJWT extends DefaultJWT {
    id: string;
    exp?: number;
}

const ONE_DAY = 60 * 60 * 24;
const ONE_MONTH = ONE_DAY * 30;

export const authConfig: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {

                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                if (
                    typeof credentials?.email !== "string" ||
                    typeof credentials?.password !== "string"
                ) {
                    return null;
                }

                const { email, password } = credentials;

                await ConnectDB();
                const user = await UserModel.findOne({ email: email }).select(
                    "+password"
                );
                if (!user) return null;

                if (
                    user.role !== USER_ROLE.ADMIN &&
                    user.role !== USER_ROLE.SUPPORT
                ) {
                    return null;
                }

                const isPasswordCorrect = await compare(password, user.password);
                if (!isPasswordCorrect) return null;

                // Return all necessary user data
                return {
                    id: (user._id as Types.ObjectId).toString(),
                    email: user.email,
                    role: user.role,
                };
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await ConnectDB();

                const existingUser = await UserModel.findOne({ email: user.email });
                if (!existingUser) return false;

                user.id = (existingUser._id as Types.ObjectId).toString();
                user.role = existingUser.role as (USER_ROLE.ADMIN | USER_ROLE.SUPPORT);
                user.email = existingUser.email;
            }

            return true;
        },

        async jwt({ token, user }) {
            // initial login
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.exp = Math.floor(Date.now() / 1000) + ONE_MONTH;
            }

            return token;
        },

        async session({ session, token }: { session: Session; token: MyJWT }) {
            if (session.user) {
                session.user.id = token.id ?? "";
                session.user.email = token.email ?? "";
                session.user.role = token.role ?? "";
            }

            if (token.exp) {
                session.expires = new Date(token.exp * 1000).toISOString();
            }

            return session;
        },
    },

    session: {
        strategy: "jwt",
        maxAge: ONE_MONTH,
        updateAge: 60 * 60, // refresh every hour
    },

    pages: {
        signIn: "/",
        error: "/",
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
