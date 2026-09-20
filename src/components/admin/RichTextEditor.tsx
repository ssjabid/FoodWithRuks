"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/adminFetch";
import { PHOTO_WIDTHS, prepareVariants } from "@/lib/imageResize";

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Upload folder for photos inserted into the text */
  folder?: "lifestyle" | "misc";
  minHeight?: number;
  hint?: string;
}

/**
 * Word-processor style editor for long text (lifestyle posts, About page).
 * Stores plain HTML, so existing content keeps working and the public site
 * renders it through `.prose` as before.
 */
export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Start writing…",
  folder = "lifestyle",
  minHeight = 320,
  hint,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose rte-content focus:outline-none px-4 py-3",
        style: `min-height:${minHeight}px`,
      },
    },
  });

  return (
    <div className="space-y-1.5">
      {label && <span className="block text-sm font-medium text-[var(--color-text-primary)]">{label}</span>}
      <div className="rte rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] focus-within:border-[var(--color-primary)] transition-colors">
        {editor && <Toolbar editor={editor} folder={folder} />}
        <EditorContent editor={editor} />
      </div>
      {hint && <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>}
    </div>
  );
}

function Toolbar({ editor, folder }: { editor: Editor; folder: "lifestyle" | "misc" }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      quote: editor.isActive("blockquote"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (leave empty to remove the link)", previous ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed || trimmed === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  const insertPhoto = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const variants = await prepareVariants(file);
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          folder,
          variants: variants.map((v, i) => ({ width: PHOTO_WIDTHS[i], dataUrl: v.dataUrl })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; preview?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      // Show the raw GitHub copy now (the site copy exists after the next deploy);
      // the form rewrites it to the site path on save.
      editor.chain().focus().setImage({ src: data.preview ?? data.url, alt: "" }).run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const btn = (active: boolean, disabled = false) =>
    cn(
      "h-8 min-w-8 px-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors",
      active ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]",
      disabled && "opacity-40 pointer-events-none"
    );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--color-border)] px-2 py-1.5">
      <button type="button" title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} className={btn(!state.h2 && !state.h3)}>
        Text
      </button>
      <button type="button" title="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(state.h2)}>
        H2
      </button>
      <button type="button" title="Sub-heading" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(state.h3)}>
        H3
      </button>
      <span className="mx-1 h-5 w-px bg-[var(--color-border)]" aria-hidden="true" />
      <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={cn(btn(state.bold), "font-bold")}>
        B
      </button>
      <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn(btn(state.italic), "italic font-heading")}>
        I
      </button>
      <button type="button" title="Link" onClick={setLink} className={btn(state.link)}>
        Link
      </button>
      <span className="mx-1 h-5 w-px bg-[var(--color-border)]" aria-hidden="true" />
      <button type="button" title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(state.bullet)}>
        • List
      </button>
      <button type="button" title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(state.ordered)}>
        1. List
      </button>
      <button type="button" title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(state.quote)}>
        Quote
      </button>
      <span className="mx-1 h-5 w-px bg-[var(--color-border)]" aria-hidden="true" />
      <button type="button" title="Insert photo" onClick={() => fileRef.current?.click()} className={btn(false, uploading)}>
        {uploading ? "Uploading…" : "Photo"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void insertPhoto(f);
        }}
      />
      <span className="ml-auto flex items-center gap-1">
        <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} className={btn(false, !state.canUndo)}>
          ↶
        </button>
        <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} className={btn(false, !state.canRedo)}>
          ↷
        </button>
      </span>
      {error && <p className="w-full text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
