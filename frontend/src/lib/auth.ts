import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        // Override BetterAuth's default scrypt hashing with bcrypt
        // so it's compatible with our existing user passwords
        password: {
            hash: async (password: string) => {
                return bcrypt.hash(password, 12);
            },
            verify: async ({ hash, password }: { hash: string; password: string }) => {
                return bcrypt.compare(password, hash);
            },
        },
    },
});
