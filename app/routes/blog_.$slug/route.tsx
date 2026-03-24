import { data } from 'react-router'
import type { Route } from './+types/route'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  const post = await context.prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true, nickname: true, isSupporter: true } },
    },
  })

  if (!post) throw data(null, { status: 404 })

  const isAuthorOrAdmin =
    context.currentUser?.id === post.authorId ||
    context.currentUser?.role === Role.ADMIN

  if (!post.publishedAt && !isAuthorOrAdmin) {
    throw data(null, { status: 404 })
  }

  const canEdit =
    Boolean(
      context.currentUser?.isWriter || context.currentUser?.role === Role.ADMIN,
    ) && isAuthorOrAdmin

  return { post, canEdit }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const { post, canEdit } = loaderData
  const isPublished = !!post.publishedAt

  return (
    <article className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        {!isPublished && (
          <p className="text-accent mb-2 text-sm font-medium">Rascunho</p>
        )}
        <h1 className="font-brand mb-2 text-4xl tracking-wide">{post.title}</h1>
        <p className="text-foreground/60 text-sm">
          Por{' '}
          <SupporterNameDisplay
            name={post.author.nickname || post.author.name}
            isSupporter={post.author.isSupporter}
            className="inline-flex max-w-full align-baseline"
            nameClassName="text-foreground/60 text-sm"
          />{' '}
          ·{' '}
          {new Date(post.createdAt).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        {canEdit && (
          <div className="mt-4">
            <LinkButton to={`/blog/${post.slug}/edit`} styleType="secondary">
              Editar
            </LinkButton>
          </div>
        )}
      </header>

      {post.excerpt && (
        <p className="text-foreground/70 mb-6 text-lg leading-relaxed">
          {post.excerpt}
        </p>
      )}

      <div
        className="blog-post-content max-w-none"
        dangerouslySetInnerHTML={{
          __html: post.content.trim().startsWith('<')
            ? post.content
            : simpleMarkdownToHtml(post.content),
        }}
      />

      <footer className="mt-12 border-t border-foreground/10 pt-6">
        <Link to="/blog" viewTransition>
          ← Voltar ao blog
        </Link>
      </footer>
    </article>
  )
}

function simpleMarkdownToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const withHeaders = escaped
    .replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-2 text-xl font-semibold">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-6 mb-2 text-2xl font-semibold">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mt-6 mb-2 text-3xl font-semibold">$1</h1>')

  const withInline = withHeaders
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener noreferrer">$1</a>')

  const paragraphs = withInline.split(/\n\n+/).filter(Boolean)
  return paragraphs
    .map((p) => {
      const trimmed = p.trim()
      if (trimmed.startsWith('<h')) return trimmed
      return `<p class="mb-4">${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('')
}
