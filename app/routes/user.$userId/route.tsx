import { redirect } from "react-router";
import Center from "../../components/center/center.component";
import Spacer from "../../components/spacer/spacer.component";
import type { Route } from "./+types/route";
import { Role } from "../../generated/prisma/enums";
import Link from "../../components/link/link.component";
import LinkButton from "../../components/link-button/link-button.component";

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect("/login");
  if (context.currentUser.role !== Role.ADMIN) return redirect('/');

  const user = await context.prisma.user.findUniqueOrThrow({
    where: { id: Number(params.userId) }
  })

  return { user };
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
      <Link to="/users" className="absolute top-2 left-2">← Voltar</Link>
      <h1 className="text-lg flex justify-center">{loaderData.user.name}</h1>
      <Spacer size="md" />
      <Field label="Nome" value={loaderData.user.name} />
      <Spacer size="sm" />
      <Field label="Nickname" value={loaderData.user.nickname} />
      <Spacer size="sm" />
      <Field label="Email" value={loaderData.user.email} />
      <Spacer size="sm" />
      <Field label="Role" value={loaderData.user.role} />
      <Spacer size="md" />
      <LinkButton to={`/user/${loaderData.user.id}/edit`} styleType="secondary" className="w-full">Editar</LinkButton>
    </Center>
  );
}
