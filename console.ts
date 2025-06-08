import prisma from "./app/lib/prisma";
import repl from "node:repl";

console.log("Prisma loaded:", Boolean(prisma))

repl.start();