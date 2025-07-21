import { Link } from "react-router";
import type { Route } from "./+types/_index";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Mazeps" },
    { name: "description", content: "Bem vindo ao Mazeps!" },
  ];
}

export const loader = async ({ context }: Route.LoaderArgs) => {
  return { currentUser: context.currentUser };
};

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      {loaderData.currentUser ? (
        <div>Bem vindo <Link to="/profile">{loaderData.currentUser.name}</Link></div>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </main>
  );
}
