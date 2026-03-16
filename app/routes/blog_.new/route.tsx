import { Form, data, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import RichTextEditor from '~/components/rich-text-editor/rich-text-editor.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { Role } from '~/generated/prisma/enums'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (!context.currentUser.isWriter && context.currentUser.role !== Role.ADMIN) {
    return redirect('/blog')
  }
  return {}
}

export default function Route({ actionData }: Route.ComponentProps) {
  return (
    <>
      <BackButtonPortal to="/blog" />
      <Center>
        <div className="blog-editor-form mx-auto w-full max-w-2xl px-6 py-10">
          <h1 className="font-brand mb-6 text-center text-5xl tracking-wide sm:text-6xl">
            Novo post
          </h1>
          <Form method="post">
            <TextInput
              id="title"
              name="title"
              label="Título"
              type="text"
              required={true}
              defaultValue={actionData?.values?.title}
            />
            <Spacer size="sm" />
            <TextInput
              id="slug"
              name="slug"
              label="Slug (URL, ex: meu-post)"
              type="text"
              required={false}
              defaultValue={actionData?.values?.slug}
            />
            <p className="text-foreground/50 mt-1 text-xs">
              Deixe em branco para gerar automaticamente a partir do título.
            </p>
            <Spacer size="sm" />
            <label className="block" htmlFor="excerpt">
              Resumo (opcional)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              className="mt-1 w-full rounded-md border border-foreground/20 bg-white p-2 text-black"
              rows={2}
              defaultValue={actionData?.values?.excerpt}
            />
            <Spacer size="sm" />
            <label className="block" htmlFor="content">
              Conteúdo
            </label>
            <RichTextEditor
              name="content"
              id="content"
              initialContent={actionData?.values?.content}
              minHeight="20rem"
            />
            {actionData?.error ? (
              <>
                <Spacer size="sm" />
                <p className="text-error text-sm">{actionData.error}</p>
              </>
            ) : null}
            <Spacer size="md" />
            <div className="flex gap-3">
              <Button type="submit" name="action" value="draft" styleType="secondary">
                Salvar rascunho
              </Button>
              <Button type="submit" name="action" value="publish">
                Publicar
              </Button>
            </div>
          </Form>
        </div>
      </Center>
    </>
  )
}

export async function action({ context, request }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (!context.currentUser.isWriter && context.currentUser.role !== Role.ADMIN) {
    return redirect('/blog')
  }

  const formData = await request.formData()
  const title = (formData.get('title') as string)?.trim()
  const slugInput = (formData.get('slug') as string)?.trim()
  const excerpt = (formData.get('excerpt') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const actionType = formData.get('action') as string

  const isEmptyContent = !content || content.trim() === '' || content.trim() === '<p></p>'
  if (!title || isEmptyContent) {
    return data({
      error: 'Título e conteúdo são obrigatórios.',
      values: { title, slug: slugInput, excerpt, content },
    })
  }

  const slug = slugInput ? slugify(slugInput) : slugify(title)
  if (!slug) {
    return data({
      error: 'Não foi possível gerar um slug válido. Informe um slug manualmente.',
      values: { title, slug: slugInput, excerpt, content },
    })
  }

  const publishedAt = actionType === 'publish' ? new Date() : null

  try {
    const post = await context.prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        publishedAt,
        authorId: context.currentUser.id,
      },
    })
    return redirect(`/blog/${post.slug}`)
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return data({
        error: `O slug "${slug}" já está em uso. Escolha outro.`,
        values: { title, slug: slugInput, excerpt, content },
      })
    }
    throw e
  }
}
