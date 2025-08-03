import type { Route } from "./+types/route";
import LinkButton from "../../components/link-button/link-button.component";
import Title from "./title.component";
import Link from "../../components/link/link.component";

export const meta = ({ }: Route.MetaArgs) => {
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
    <>
      <nav className="flex items-center justify-center p-4">
        <div className="ml-auto">
          {loaderData.currentUser ? (
            <div>Bem vindo, <Link to="/profile" className="bg-primary text-on-primary rounded-md p-0.5">{loaderData.currentUser.name}</Link></div>
          ) : (
            <LinkButton to="/login">Login</LinkButton>
          )}
        </div>
      </nav>
      <main>
        <div className="flex justify-center">
          <Title />
        </div>
      </main>
    </>
  );
}
