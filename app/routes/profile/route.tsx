import { Form, redirect } from "react-router";
import type { Route } from "./+types/route";

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect("/login");

  return {
    currentUser: context.currentUser,
  };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Profile</h1>
      <div>
        <h2>Name</h2>
        <p>{loaderData.currentUser.name}</p>
      </div>
      <div>
        <h2>Email</h2>
        <p>{loaderData.currentUser.email}</p>
      </div>
      <div>
        <Form method="post" action="/logout">
          <button type="submit">Logout</button>
        </Form>
      </div>
    </div>
  );
}
