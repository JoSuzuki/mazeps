// eslint-disable
import repl from "node:repl";
import prisma from "./app/lib/prisma";

console.log("Prisma loaded:", Boolean(prisma))

repl.start();