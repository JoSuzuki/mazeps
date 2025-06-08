import type { Route } from "./+types/_index";
import { Welcome } from "../welcome/welcome";
import prisma from "~/lib/prisma";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = async ({ context }: Route.LoaderArgs) => {
  const users = await prisma.user.findMany();
  return { message: context.VALUE_FROM_EXPRESS, users };
};

export default function Route({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} users={loaderData.users} />;
}
