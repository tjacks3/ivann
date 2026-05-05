"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_MAX_LENGTH = 200;

interface DynamicListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  hint?: string;
  minLength?: number;
  maxLength?: number;
}

export function DynamicListInput({
  items,
  onChange,
  placeholder = "Add an item...",
  addLabel = "Add",
  hint,
  minLength = DEFAULT_MIN_LENGTH,
  maxLength = DEFAULT_MAX_LENGTH,
}: DynamicListInputProps) {
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const isValidLength = (text: string) => {
    const len = text.trim().length;
    return len >= minLength && len <= maxLength;
  };

  const handleAdd = () => {
    const text = newItem.trim();
    if (!text || !isValidLength(text)) return;
    onChange([...items, text]);
    setNewItem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const handleEditSave = () => {
    if (editingIndex === null) return;
    const text = editValue.trim();
    if (!text || !isValidLength(text)) return;
    const updated = [...items];
    updated[editingIndex] = text;
    onChange(updated);
    setEditingIndex(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const newItemLen = newItem.trim().length;
  const newItemTooShort = newItemLen > 0 && newItemLen < minLength;
  const newItemTooLong = newItemLen > maxLength;
  const newItemInvalid = newItemTooShort || newItemTooLong;

  const editLen = editValue.trim().length;
  const editTooShort = editLen > 0 && editLen < minLength;
  const editTooLong = editLen > maxLength;
  const editInvalid = editTooShort || editTooLong;

  return (
    <div className="space-y-2">
      {/* Hint */}
      {hint && (
        <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2">
          <Info className="mt-0.5 size-3.5 shrink-0 text-foreground" />
          <p className="text-xs text-foreground">{hint}</p>
        </div>
      )}

      {/* Add new item — always at the top */}
      <div className="space-y-1">
        <div className="flex gap-2 items-end">
          <Textarea
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "min-h-9 flex-1 resize-none py-1.5",
              newItemInvalid && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            )}
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAdd}
            disabled={!newItem.trim() || newItemInvalid}
            className="cursor-pointer shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            {addLabel}
          </Button>
        </div>
        {newItemLen > 0 && (
          <div className="flex items-center justify-between px-0.5">
            {newItemInvalid ? (
              <p className="text-[11px] text-destructive">
                {newItemTooShort
                  ? `Min ${minLength} characters`
                  : `Max ${maxLength} characters`}
              </p>
            ) : (
              <span />
            )}
            <p className={cn(
              "text-[11px] text-muted-foreground",
              newItemTooLong && "text-destructive",
            )}>
              {newItemLen}/{maxLength}
            </p>
          </div>
        )}
      </div>

      {/* Item list */}
      {items.length > 0 && (
        <ul className="mb-2 space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 py-1"
            >
              {editingIndex === index ? (
                <div className="flex-1 space-y-1">
                  <div className="flex gap-2 items-end">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className={cn(
                        "min-h-7 flex-1 resize-none py-1 text-sm",
                        editInvalid && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                      )}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleEditSave}
                      disabled={!editValue.trim() || editInvalid}
                      className="cursor-pointer rounded p-1 text-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  {editLen > 0 && (
                    <div className="flex items-center justify-between px-0.5">
                      {editInvalid ? (
                        <p className="text-[11px] text-destructive">
                          {editTooShort
                            ? `Min ${minLength} characters`
                            : `Max ${maxLength} characters`}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className={cn(
                        "text-[11px] text-muted-foreground",
                        editTooLong && "text-destructive",
                      )}>
                        {editLen}/{maxLength}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-foreground mt-0.5">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm break-words">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleEditStart(index)}
                    className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
