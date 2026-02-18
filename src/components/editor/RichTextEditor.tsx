"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageViaApi, uploadPublicImageViaApi } from "@/app/(app)/create-card/upload-api";
import { getSignedUrl } from "@/app/(app)/view/actions";
import { cn } from "@/lib/utils";

const PRIVATE_PREFIX = "private://";

export type RichTextEditorMode = "private" | "public";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 'private' = secure-media + private:// ; 'public' = public-media + real URL. Default 'private'. */
  mode?: RichTextEditorMode;
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
      className={cn(
        "h-8 w-8 text-muted-foreground hover:text-foreground",
        active && "bg-muted text-foreground"
      )}
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
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="כותרת 1"
        aria-label="כותרת 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="כותרת 2"
        aria-label="כותרת 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="כותרת 3"
        aria-label="כותרת 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
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
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="קו חוצה"
        aria-label="קו חוצה"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="יישור לימין"
        aria-label="יישור לימין"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="מרכוז"
        aria-label="מרכוז"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="יישור לשמאל"
        aria-label="יישור לשמאל"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
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
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="ציטוט"
        aria-label="ציטוט"
      >
        <Quote className="h-4 w-4" />
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
  mode = "private",
  onUploadError,
}: RichTextEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const handleFile = useCallback(
    async (file: File, currentEditor: Editor) => {
      setUploadInProgress(true);
      try {
        if (mode === "public") {
          const { url, error } = await uploadPublicImageViaApi(file);
          if (error || !url) {
            onUploadError?.(error ?? "שגיאה בהעלאת התמונה");
            return;
          }
          currentEditor.chain().focus().setImage({ src: url }).run();
        } else {
          const { path, error } = await uploadImageViaApi(file);
          if (error || !path) {
            onUploadError?.(error ?? "שגיאה בהעלאת התמונה");
            return;
          }
          const { url } = await getSignedUrl(path);
          const src = url ?? `${PRIVATE_PREFIX}${path}`;
          currentEditor.chain().focus().setImage({ src }).run();
        }
      } finally {
        setUploadInProgress(false);
      }
    },
    [mode, onUploadError]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { dir: "rtl" } }),
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote"],
        alignments: ["left", "center", "right"],
      }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] w-full rounded-b-md border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none prose prose-sm max-w-none dark:prose-invert",
        dir: "rtl",
      },
      handleDrop(_view, event) {
        const files = event.dataTransfer?.files;
        const currentEditor = editorRef.current;
        if (files?.length && files[0].type.startsWith("image/") && currentEditor) {
          event.preventDefault();
          handleFile(files[0], currentEditor);
          return true;
        }
      },
      handlePaste(_view, event) {
        const files = event.clipboardData?.files;
        const currentEditor = editorRef.current;
        if (files?.length && files[0].type.startsWith("image/") && currentEditor) {
          event.preventDefault();
          handleFile(files[0], currentEditor);
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
      handleFile(file, editor);
      e.target.value = "";
    },
    [editor, handleFile]
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
