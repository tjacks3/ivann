"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  Eye,
  Trophy,
  AlertCircle,
} from "lucide-react";

interface NextStepCardProps {
  state: string;
  isBrand: boolean;
  onAction?: () => void;
  secondaryAction?: { label: string; onClick: () => void };
  paymentStatus?: string | null;
}

interface StepConfig {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

function getStepConfig(
  state: string,
  isBrand: boolean,
): StepConfig {
  switch (state) {
    case "awaiting_brand_brief":
      return isBrand
        ? {
            icon: FileText,
            title: "Add your campaign brief",
            description:
              "Provide the creator with your campaign requirements, goals, and guidelines.",
            actionLabel: "Add Brief",
            borderColor: "border-l-amber-500",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
          }
        : {
            icon: Clock,
            title: "Waiting for brand to submit brief",
            description:
              "The brand is preparing the campaign brief. You will be notified when it is ready.",
            borderColor: "border-l-amber-500",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
          };

    case "awaiting_creator_confirmation":
      return isBrand
        ? {
            icon: Clock,
            title: "Waiting for creator to confirm",
            description:
              "The creator is reviewing your brief. You will be notified when they confirm.",
            borderColor: "border-l-amber-500",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
          }
        : {
            icon: CheckCircle2,
            title: "Review brief and confirm",
            description:
              "The brand has submitted the campaign brief. Review the details and confirm to start working.",
            actionLabel: "Review Brief",
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
          };

    case "revision_requested":
      return isBrand
        ? {
            icon: AlertCircle,
            title: "Creator requested brief changes",
            description:
              "The creator has requested changes to the brief. Please update and resubmit.",
            actionLabel: "Update Brief",
            borderColor: "border-l-red-500",
            iconBg: "bg-red-500/10",
            iconColor: "text-red-600",
          }
        : {
            icon: Clock,
            title: "Waiting for updated brief",
            description:
              "Your change request has been sent to the brand. You will be notified when they update the brief.",
            borderColor: "border-l-amber-500",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
          };

    case "in_progress":
      return isBrand
        ? {
            icon: Clock,
            title: "Creator is working on deliverable",
            description:
              "The creator is working on the content. You will be notified when they submit.",
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
          }
        : {
            icon: Upload,
            title: "Submit your deliverable when ready",
            description:
              "Work on the content based on the brief. Submit your deliverable when it is ready for review.",
            actionLabel: "Submit Deliverable",
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
          };

    case "submitted":
      return isBrand
        ? {
            icon: Eye,
            title: "Review submitted deliverable",
            description:
              "The creator has submitted their deliverable. Review and approve or request changes.",
            actionLabel: "Review Deliverable",
            borderColor: "border-l-purple-500",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-600",
          }
        : {
            icon: Clock,
            title: "Waiting for brand review",
            description:
              "Your deliverable has been submitted. The brand will review and provide feedback.",
            borderColor: "border-l-purple-500",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-600",
          };

    case "completed":
      return {
        icon: Trophy,
        title: "Collaboration complete!",
        description:
          "The deliverable has been approved. Great work!",
        borderColor: "border-l-primary",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      };

    default:
      return {
        icon: Clock,
        title: "Processing...",
        description: "Please wait.",
        borderColor: "border-l-muted",
        iconBg: "bg-muted",
        iconColor: "text-muted-foreground",
      };
  }
}

export function NextStepCard({
  state,
  isBrand,
  onAction,
  secondaryAction,
  paymentStatus,
}: NextStepCardProps) {
  const config = getStepConfig(state, isBrand);
  const Icon = config.icon;

  const showPaymentWarning =
    isBrand &&
    paymentStatus === "unpaid" &&
    (state === "in_progress" || state === "awaiting_creator_confirmation");

  return (
    <Card className={cn("border-l-4", config.borderColor)}>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            config.iconBg,
          )}
        >
          <Icon className={cn("size-6", config.iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{config.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {config.description}
          </p>
          {showPaymentWarning && (
            <p className="mt-1 text-xs text-amber-600">
              Payment has not been funded yet. Fund the deal to secure payment for the creator.
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="cursor-pointer"
            >
              {secondaryAction.label}
            </Button>
          )}
          {config.actionLabel && onAction && (
            <Button onClick={onAction} className="cursor-pointer">
              {config.actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
