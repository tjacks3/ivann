"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Bold, Italic, List } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex size-7 cursor-pointer items-center justify-center rounded transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const [isEmpty, setIsEmpty] = useState(true);

  // Keep onChange ref current without triggering re-renders
  onChangeRef.current = onChange;

  // Set initial content only once on mount
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
      setIsEmpty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncToParent = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const empty = !html || html === "<br>" || html === "<div><br></div>";
      setIsEmpty(empty);
      onChangeRef.current(html);
    }
  }, []);

  const execCommand = useCallback((command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    syncToParent();
  }, [syncToParent]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    syncToParent();
  }, [syncToParent]);

  return (
    <div
      className={cn(
        "rounded-lg border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b px-2 py-1">
        <ToolbarButton onClick={() => execCommand("bold")}>
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("italic")}>
          <Italic className="size-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton onClick={() => execCommand("insertUnorderedList")}>
          <List className="size-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-2.5 top-2 text-sm text-muted-foreground">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={syncToParent}
          onPaste={handlePaste}
          className="min-h-24 w-full bg-transparent px-2.5 py-2 text-sm outline-none [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-0.5"
        />
      </div>
    </div>
  );
}
