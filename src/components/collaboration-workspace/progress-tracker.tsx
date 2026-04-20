"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  FileText,
  ThumbsUp,
  Play,
  Upload,
  Trophy,
} from "lucide-react";

const STEPS = [
  { key: "awaiting_brand_brief", label: "Accepted", icon: CheckCircle2 },
  { key: "awaiting_creator_confirmation", label: "Brief Added", icon: FileText },
  { key: "confirmation_done", label: "Confirmed", icon: ThumbsUp },
  { key: "in_progress", label: "In Progress", icon: Play },
  { key: "submitted", label: "Submitted", icon: Upload },
  { key: "completed", label: "Completed", icon: Trophy },
] as const;

const STATE_TO_STEP_INDEX: Record<string, number> = {
  awaiting_brand_brief: 0,
  awaiting_creator_confirmation: 1,
  revision_requested: 1,
  in_progress: 3,
  submitted: 4,
  completed: 5,
};

interface ProgressTrackerProps {
  state: string;
}

export function ProgressTracker({ state }: ProgressTrackerProps) {
  const activeIndex = STATE_TO_STEP_INDEX[state] ?? 0;

  return (
    <div className="p-4 sm:p-6">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = i < activeIndex || state === "completed";
          const isActive = i === activeIndex && state !== "completed";

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary/10 text-primary ring-2 ring-primary",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCompleted || isActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    i < activeIndex || state === "completed"
                      ? "bg-primary"
                      : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="space-y-3 sm:hidden">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = i < activeIndex || state === "completed";
          const isActive = i === activeIndex && state !== "completed";

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary/10 text-primary ring-2 ring-primary",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-8 h-3 w-px",
                      i < activeIndex || state === "completed"
                        ? "bg-primary"
                        : "bg-border",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCompleted || isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
