import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/route";
import Center from "../../components/center/center.component";
import Button from "../../components/primary-button/primary-button.component";
import Spacer from "../../components/spacer/spacer.component";

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect("/login");

  return {
    currentUser: context.currentUser,
  };
}

interface FieldProps {
  label: string;
  value: string | null;
}

const Field = ({ label, value }: FieldProps) => <div className="flex align-baseline whitespace-pre-wrap">
  <h2>{label}: </h2>
  <span>{value}</span>
</div>

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <Center>
      <Link to="/" className="absolute top-2 left-2">← Voltar</Link>
      <h1 className="text-lg flex justify-center">Profile</h1>
      <Spacer size="md" />
      <Field label="Nome" value={loaderData.currentUser.name} />
      <Spacer size="sm" />
      <Field label="Email" value={loaderData.currentUser.email} />
      <Spacer size="md" />
      <Form method="post" action="/logout">
        <Button className="w-full" type="submit">Logout</Button>
      </Form>
    </Center>
  );
}
