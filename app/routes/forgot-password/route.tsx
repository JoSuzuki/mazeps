import { data, redirect } from "react-router";
import type { Route } from "./+types/route";

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect("/");

  return data(null);
}

export default function Component() {
  return (
    <div>
      <h1>Esqueci minha senha</h1>
      <div>🚧 Em construção, por enquanto entre em contato com o time do Mazeps 🚧</div>
    </div>
  );
}
