import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context }: Route.LoaderArgs) {
  const posts = await context.prisma.blogPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { nickname: true, name: true } } },
  })

  return {
    posts,
    canWrite: Boolean(
      context.currentUser?.isWriter || context.currentUser?.role === Role.ADMIN,
    ),
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const { posts, canWrite } = loaderData

  return (
    <Center>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="font-brand mb-2 text-4xl tracking-wide">Blog</h1>
            <p className="text-foreground/60 text-sm uppercase tracking-[0.2em]">
              Histórias, táticas e novidades
            </p>
          </div>
          {canWrite && (
            <LinkButton to="/blog/new" styleType="secondary">
              Criar post
            </LinkButton>
          )}
        </header>

        {posts.length === 0 ? (
          <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 text-center shadow-sm">
            <p className="text-foreground/70 text-sm leading-relaxed">
              Em Breve... Em pouco tempo você vai encontrar aqui artigos sobre eventos, bastidores
              da CMBG, reviews de jogos e muito mais do nosso Labirinto Lúdico.
            </p>
          </section>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="block rounded-xl border border-foreground/10 p-6 transition-colors hover:border-foreground/20 hover:bg-foreground/5"
                  viewTransition
                >
                  <h2 className="font-brand mb-1 text-xl tracking-wide">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-foreground/70 mb-2 line-clamp-2 text-sm">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-foreground/50 text-xs">
                    {post.author.nickname || post.author.name} ·{' '}
                    {post.publishedAt &&
                      new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Center>
  )
}

