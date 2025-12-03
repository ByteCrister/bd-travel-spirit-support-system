// src/lib/helpers/auth-options.ts
import { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { Types } from "mongoose";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { authRateLimit } from "../redis/auth-rate-limit";

interface MyJWT extends DefaultJWT {
    id: string;
    exp?: number;
}

const ONE_DAY = 60 * 60 * 24;
const ONE_MONTH = ONE_DAY * 30;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                const ip =
                    req?.headers?.["x-forwarded-for"] ||
                    req?.headers?.["x-real-ip"] ||
                    "unknown";

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                // ---- RATE LIMIT BY IP ----
                const ipAllowed = await authRateLimit({
                    identifier: `ip:${ip}`,
                    limit: 10,      // 10 requests / 1 minute
                    window: 60,
                });

                if (!ipAllowed) {
                    throw new Error("Too many attempts. Try again in a minute.");
                }

                // ---- RATE LIMIT BY EMAIL ----
                const emailAllowed = await authRateLimit({
                    identifier: `email:${credentials.email}`,
                    limit: 5,       // 5 attempts / 1 minute
                    window: 60,
                });

                if (!emailAllowed) {
                    throw new Error("Too many attempts on this account. Try again soon.");
                }

                await ConnectDB();
                const user = await UserModel.findOne({ email: credentials.email }).select("+password");
                console.log(user);
                if (!user) throw new Error("Invalid email or password");

                if (!user.password) {
                    throw new Error(
                        "Your account was created with Google. Please sign in with Google or reset your password."
                    );
                }

                const isPasswordCorrect = await compare(credentials.password, user.password);
                if (!isPasswordCorrect) throw new Error("Invalid email or password");

                return { id: (user._id as Types.ObjectId).toString() };
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
                if (!existingUser) return false; // prevent signup via Google
                user.id = (existingUser._id as Types.ObjectId).toString();
            }
            return true;
        },

        async jwt({ token, user }) {
            // initial login
            if (user) {
                token.id = user.id;
                token.exp = Math.floor(Date.now() / 1000) + ONE_MONTH;
            }

            return token;
        },

        async session({ session, token }: { session: Session; token: MyJWT }) {
            if (session.user) {
                session.user.id = token.id ?? "";
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

    cookies: {
        sessionToken: {
            name:
                process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.session-token"
                    : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },

    pages: {
        signIn: "/signin",
    },

    secret: process.env.NEXTAUTH_SECRET,
};