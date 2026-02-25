import { Lucia } from "lucia";
import { DrizzleAdapter } from "@lucia-auth/adapter-drizzle";
import { db as drizzleDb } from "./db";
import { users, sessions } from "../drizzle/schema";

const adapter = new DrizzleAdapter(drizzleDb, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      openId: attributes.openId,
      name: attributes.name,
      email: attributes.email,
      loginMethod: attributes.loginMethod,
      lastSignedIn: attributes.lastSignedIn,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      openId: string;
      name: string | null;
      email: string | null;
      loginMethod: string | null;
      lastSignedIn: Date;
    };
  }
}
