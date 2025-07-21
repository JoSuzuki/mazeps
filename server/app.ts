import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import prisma from "../app/lib/prisma";
import type { PrismaClient, User } from "../app/generated/prisma";
import { sessionStorage } from "../app/services/session";

declare module "react-router" {
  interface AppLoadContext {
    prisma: PrismaClient;
    currentUser?: User;
  }
}

export const app = express();

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    async getLoadContext(request, _response) {
      let session = await sessionStorage.getSession(request.headers.cookie);
      let currentUser = session.get("user");
      return {
        prisma,
        currentUser,
      };
    },
  }),
);
