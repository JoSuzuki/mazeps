import { Form, data, redirect } from "react-router";
import type { Route } from "./+types/route";
import bcrypt from "bcrypt";
import { sessionStorage } from "~/services/session";
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace";

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect("/");

  return data(null);
}

export default function Component({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Sign Up</h1>
      {actionData?.error ? (
        <div className="error">{actionData.error}</div>
      ) : null}
      <Form method="post">
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </Form>
      <a href="/oauth/google">Sign Up with Google</a>
    </div>
  );
}

export async function action({ request, context }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await context.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    let session = await sessionStorage.getSession(request.headers.get("cookie"));

    session.set("user", user);

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return data({ error: "Email already in use" });
    }

    if (error instanceof Error) {
      return data({ error: error.message });
    }

    throw error;
  }
}
