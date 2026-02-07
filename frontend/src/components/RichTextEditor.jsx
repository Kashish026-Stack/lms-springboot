import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { 
  Bold, Italic, List, ListOrdered, 
  Heading1, Heading2, Quote, Code, 
  Link as LinkIcon, Image as ImageIcon,
  Youtube as YoutubeIcon, Undo, Redo 
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const MenuBar = ({ editor }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addYoutube = () => {
    const url = window.prompt('YouTube URL')
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const buttons = [
    {
      icon: <Heading1 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Heading 1'
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Heading 2'
    },
    {
      icon: <Bold className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold'
    },
    {
      icon: <Italic className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic'
    },
    {
      icon: <List className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List'
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Ordered List'
    },
    {
      icon: <Quote className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Quote'
    },
    {
      icon: <Code className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Code Block'
    },
    {
      icon: <LinkIcon className="w-4 h-4" />,
      onClick: addLink,
      isActive: editor.isActive('link'),
      title: 'Link'
    },
    {
      icon: <ImageIcon className="w-4 h-4" />,
      onClick: addImage,
      isActive: false,
      title: 'Image'
    },
    {
      icon: <YoutubeIcon className="w-4 h-4" />,
      onClick: addYoutube,
      isActive: false,
      title: 'YouTube Video'
    }
  ]

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          className={cn(
            "p-2 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600",
            btn.isActive && "bg-white text-primary-600 shadow-sm"
          )}
          title={btn.title}
          type="button"
        >
          {btn.icon}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600 disabled:opacity-30"
        title="Undo"
        type="button"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600 disabled:opacity-30"
        title="Redo"
        type="button"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  )
}

const RichTextEditor = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4 shadow-sm',
        },
      }),
      Youtube.configure({
        controls: false,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-4 shadow-sm',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4 max-w-none',
      },
    },
  })

  // Update content if it changes externally
  // useEffect(() => {
  //   if (editor && content !== editor.getHTML()) {
  //     editor.commands.setContent(content)
  //   }
  // }, [content, editor])

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-white rounded-b-lg" />
    </div>
  )
}

export default RichTextEditor
