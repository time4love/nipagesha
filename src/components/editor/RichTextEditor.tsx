"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageViaApi } from "@/app/(app)/create-card/upload-api";
import { getSignedUrl } from "@/app/(app)/view/actions";

const PRIVATE_PREFIX = "private://";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Called when image upload fails (e.g. show toast). */
  onUploadError?: (message: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  "aria-label": ariaLabel,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  "aria-label": string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={active}
    >
      {children}
    </Button>
  );
}

function EditorToolbar({
  editor,
  onImageClick,
  uploadInProgress,
}: {
  editor: Editor | null;
  onImageClick: () => void;
  uploadInProgress: boolean;
}) {
  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 border-input bg-muted/40 p-1"
      role="toolbar"
      aria-label="כלי עיצוב"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="מודגש"
        aria-label="מודגש"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="נטוי"
        aria-label="נטוי"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="כותרת"
        aria-label="כותרת"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="רשימת תבליטים"
        aria-label="רשימת תבליטים"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="רשימה ממוספרת"
        aria-label="רשימה ממוספרת"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onImageClick}
        disabled={uploadInProgress}
        title="הוספת תמונה"
        aria-label="הוספת תמונה"
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "כתבו כאן את המסר. הוא יוצפן לפני שליחה.",
  disabled = false,
  onUploadError,
}: RichTextEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { dir: "rtl" } }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] w-full rounded-b-md border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none prose prose-sm max-w-none dark:prose-invert",
        dir: "rtl",
      },
      handleDrop(_view, event) {
        const files = event.dataTransfer?.files;
        const currentEditor = editorRef.current;
        if (files?.length && files[0].type.startsWith("image/") && currentEditor) {
          event.preventDefault();
          handleFile(files[0], currentEditor, onUploadError, setUploadInProgress);
          return true;
        }
      },
      handlePaste(_view, event) {
        const files = event.clipboardData?.files;
        const currentEditor = editorRef.current;
        if (files?.length && files[0].type.startsWith("image/") && currentEditor) {
          event.preventDefault();
          handleFile(files[0], currentEditor, onUploadError, setUploadInProgress);
          return true;
        }
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => onChange(editor.getHTML());
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, onChange]);

  const handleImageClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      handleFile(file, editor, onUploadError, setUploadInProgress);
      e.target.value = "";
    },
    [editor, onUploadError]
  );

  return (
    <div className="rounded-md">
      <EditorToolbar
        editor={editor}
        onImageClick={handleImageClick}
        uploadInProgress={uploadInProgress}
      />
      <EditorContent editor={editor} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={handleFileInput}
      />
    </div>
  );
}

async function handleFile(
  file: File,
  editor: Editor,
  onUploadError: ((msg: string) => void) | undefined,
  setUploadInProgress: (v: boolean) => void
) {
  setUploadInProgress(true);
  try {
    const { path, error } = await uploadImageViaApi(file);
    if (error || !path) {
      onUploadError?.(error ?? "שגיאה בהעלאת התמונה");
      return;
    }
    const { url } = await getSignedUrl(path);
    const src = url ?? `${PRIVATE_PREFIX}${path}`;
    editor.chain().focus().setImage({ src }).run();
  } finally {
    setUploadInProgress(false);
  }
}
