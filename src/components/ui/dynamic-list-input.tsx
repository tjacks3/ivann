"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check, X, Info } from "lucide-react";

interface DynamicListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  hint?: string;
}

export function DynamicListInput({
  items,
  onChange,
  placeholder = "Add an item...",
  addLabel = "Add",
  hint,
}: DynamicListInputProps) {
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    const text = newItem.trim();
    if (!text) return;
    onChange([...items, text]);
    setNewItem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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
    if (!text) return;
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
    if (e.key === "Enter") {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

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
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="cursor-pointer shrink-0"
        >
          <Plus className="size-3.5" />
          {addLabel}
        </Button>
      </div>

      {/* Item list */}
      {items.length > 0 && (
        <ul className="mb-2 space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 py-1"
            >
              {editingIndex === index ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="h-7 flex-1 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleEditSave}
                    className="cursor-pointer rounded p-1 text-primary hover:bg-primary/10"
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
                </>
              ) : (
                <>
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-foreground">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm">{item}</span>
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
