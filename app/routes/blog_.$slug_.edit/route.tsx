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

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (!context.currentUser.isWriter && context.currentUser.role !== Role.ADMIN) {
    return redirect('/blog')
  }

  const post = await context.prisma.blogPost.findUnique({
    where: { slug: params.slug },
  })

  if (!post) return redirect('/blog')
  if (post.authorId !== context.currentUser.id && context.currentUser.role !== Role.ADMIN) {
    return redirect(`/blog/${post.slug}`)
  }

  return { post }
}

export default function Route({ loaderData, actionData }: Route.ComponentProps) {
  const { post } = loaderData
  const values = actionData?.values ?? {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    content: post.content,
  }

  return (
    <>
      <BackButtonPortal to={`/blog/${post.slug}`} />
      <Center>
        <div className="blog-editor-form mx-auto w-full max-w-2xl px-6 py-10">
          <h1 className="font-brand mb-6 text-2xl tracking-wide">Editar post</h1>
          <Form method="post">
            <TextInput
              id="title"
              name="title"
              label="Título"
              type="text"
              required={true}
              defaultValue={values.title}
            />
            <Spacer size="sm" />
            <TextInput
              id="slug"
              name="slug"
              label="Slug (URL)"
              type="text"
              required={true}
              defaultValue={values.slug}
            />
            <Spacer size="sm" />
            <label className="block" htmlFor="excerpt">
              Resumo (opcional)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              className="mt-1 w-full rounded-md border border-foreground/20 bg-white p-2 text-black"
              rows={2}
              defaultValue={values.excerpt}
            />
            <Spacer size="sm" />
            <label className="block" htmlFor="content">
              Conteúdo
            </label>
            <RichTextEditor
              name="content"
              id="content"
              initialContent={values.content}
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
                Salvar como rascunho
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

export async function action({ context, request, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (!context.currentUser.isWriter && context.currentUser.role !== Role.ADMIN) {
    return redirect('/blog')
  }

  const post = await context.prisma.blogPost.findUnique({
    where: { slug: params.slug },
  })

  if (!post) return redirect('/blog')
  if (post.authorId !== context.currentUser.id && context.currentUser.role !== Role.ADMIN) {
    return redirect(`/blog/${post.slug}`)
  }

  const formData = await request.formData()
  const title = (formData.get('title') as string)?.trim()
  const slug = slugify((formData.get('slug') as string)?.trim() || '')
  const excerpt = (formData.get('excerpt') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const actionType = formData.get('action') as string

  const isEmptyContent = !content || content.trim() === '' || content.trim() === '<p></p>'
  if (!title || !slug || isEmptyContent) {
    return data({
      error: 'Título, slug e conteúdo são obrigatórios.',
      values: { title, slug: formData.get('slug'), excerpt, content },
    })
  }

  const publishedAt = actionType === 'publish' ? new Date() : null

  try {
    const updated = await context.prisma.blogPost.update({
      where: { id: post.id },
      data: { title, slug, excerpt, content, publishedAt },
    })
    return redirect(`/blog/${updated.slug}`)
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return data({
        error: `O slug "${slug}" já está em uso. Escolha outro.`,
        values: { title, slug, excerpt, content },
      })
    }
    throw e
  }
}
