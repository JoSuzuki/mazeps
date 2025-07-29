import { Form, Link, data, redirect } from "react-router";
import type { Route } from "./+types/route";
import { authenticator, sessionStorage } from "~/services/session";

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect("/");

  return data(null);
}

export default function Component({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Login</h1>

      {actionData?.error ? (
        <div className="error">{actionData.error}</div>
      ) : null}

      <Form method="post">
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </Form>
      <Form method="post" action="/oauth/google">
        <button type="submit">Login with Google</button>
      </Form>
      <Link to="/sign-up">Sign Up</Link>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  try {
    let user = await authenticator.authenticate("user-password", request);

    let session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );

    session.set("user", user);

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return data({ error: error.message });
    }

    throw error;
  }
}
