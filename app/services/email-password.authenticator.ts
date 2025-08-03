import bcrypt from "bcrypt";
import { FormStrategy } from "remix-auth-form";
import type { User } from "../generated/prisma";
import prisma from "../lib/prisma";

async function login(email: string, password: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Usuário e/ou Senha inválidos");
  }

  const match = await bcrypt.compare(password, user.password || "");

  if (!match) {
    throw new Error("Usuário e/ou Senha inválidos");
  }

  return user;
}

export const emailPasswordStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }

  return await login(email, password);
})
