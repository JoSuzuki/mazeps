import { createCookieSessionStorage } from "react-router";
import { Authenticator } from "remix-auth";
import type { User } from "../generated/prisma";
import { googleStrategy } from "./google.authenticator";
import { emailPasswordStrategy } from "./email-password.authenticator";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not defined");
}

export const sessionStorage = createCookieSessionStorage<{ user: User }>({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const authenticator = new Authenticator<User>();

authenticator.use(googleStrategy, "google");
authenticator.use(emailPasswordStrategy, "user-password");

