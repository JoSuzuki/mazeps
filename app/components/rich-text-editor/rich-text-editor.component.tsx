'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  name: string
  id?: string
  initialContent?: string
  minHeight?: string
}

export default function RichTextEditor({
  name,
  id = 'content',
  initialContent = '',
  minHeight = '16rem',
}: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: initialContent || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-w-0 focus:outline-none px-3 py-2 text-base bg-white text-black',
      },
    },
  })

  useEffect(() => {
    if (!editor || !hiddenInputRef.current) return

    const syncToInput = () => {
      if (hiddenInputRef.current) {
        const html = editor.getHTML()
        hiddenInputRef.current.value = html === '<p></p>' ? '' : html
      }
    }

    syncToInput()
    editor.on('update', syncToInput)

    return () => {
      editor.off('update', syncToInput)
    }
  }, [editor])

  if (!editor) {
    return (
      <div
        className="rounded-md border border-foreground/20 bg-white"
        style={{ minHeight }}
      >
        <div className="flex items-center justify-center p-8 text-black/60">
          Carregando editor...
        </div>
      </div>
    )
  }

  return (
    <div className="rich-text-editor rich-text-editor-light">
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        id={id}
        defaultValue={initialContent}
      />
      <div
        className="flex flex-col rounded-md border border-foreground/20 bg-white"
        style={{ minHeight }}
      >
        <MenuBar editor={editor} />
        <div className="rich-text-editor-content min-h-0 flex-1">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)
    if (url !== null) {
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    }
  }

  const btnBase = 'rounded px-2 py-1 text-sm transition-colors border'
  const btnActiveStyle: React.CSSProperties = {
    backgroundColor: '#1e3a5f',
    color: '#ffffff',
    borderColor: '#1e3a5f',
  }
  const btnInactiveStyle: React.CSSProperties = {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    borderColor: '#d1d5db',
  }

  const Btn = ({
    active,
    children,
    onClick,
  }: {
    active: boolean
    children: React.ReactNode
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={btnBase}
      style={active ? btnActiveStyle : btnInactiveStyle}
    >
      {children}
    </button>
  )

  return (
    <div
      className="flex flex-wrap gap-1 border-b p-2"
      style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
    >
      <Btn
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </Btn>
      <Btn
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </Btn>
      <Btn
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <s>S</s>
      </Btn>
      <span
        className="mx-1 w-px self-stretch"
        style={{ backgroundColor: '#9ca3af' }}
      />
      <Btn
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Btn>
      <Btn
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Btn>
      <Btn
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Btn>
      <span
        className="mx-1 w-px self-stretch"
        style={{ backgroundColor: '#9ca3af' }}
      />
      <Btn
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        Lista
      </Btn>
      <Btn
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        Lista n°
      </Btn>
      <Btn
        active={editor.isActive('link')}
        onClick={setLink}
      >
        Link
      </Btn>
    </div>
  )
}
