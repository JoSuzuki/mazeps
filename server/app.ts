import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { PrismaClient } from '@prisma/client'; // Added import

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
    prisma: PrismaClient; // Added prisma to context
  }
}

export const app = express();
const prisma = new PrismaClient(); // Instantiated PrismaClient

// Test route for database
app.get("/test-db", async (req, res) => {
  try {
    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email: `testuser-${Date.now()}@example.com`,
        name: "Test User",
      },
    });

    // Fetch all users
    const allUsers = await prisma.user.findMany();

    res.json({
      message: "Database test successful!",
      newUser,
      allUsers,
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      message: "Database test failed.",
      error: error.message,
    });
  }
});

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
        prisma, // Passed prisma instance to context
      };
    },
  }),
);
