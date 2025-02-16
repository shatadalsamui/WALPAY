  import GoogleProvider from "next-auth/providers/google";
import db from "@repo/db/client";
import type { NextAuthOptions } from "next-auth";
import type { User, Account, Profile } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    callbacks: {
      async signIn(params) {
        const { user, account, profile } = params;
        
        if (!user?.email) {
          return false;
        }

        await db.merchant.upsert({
          select: {
            id: true
          },
          where: {
            email: user.email
          },
          create: {
            email: user.email,
            name: user.name || profile?.name || "",
            auth_type: account?.provider === "google" ? "Google" : "Github"
          },
          update: {
            name: user.name || profile?.name || "",
            auth_type: account?.provider === "google" ? "Google" : "Github"
          }
        });

        return true;
      }
    },
    secret: process.env.NEXTAUTH_SECRET || "secret"
  }