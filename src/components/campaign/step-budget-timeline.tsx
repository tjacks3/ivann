"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

interface StepBudgetTimelineProps {
  totalBudget: string;
  reachGoal: string;
  startDate: string;
  endDate: string;
  onTotalBudgetChange: (value: string) => void;
  onReachGoalChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function StepBudgetTimeline({
  totalBudget,
  reachGoal,
  startDate,
  endDate,
  onTotalBudgetChange,
  onReachGoalChange,
  onStartDateChange,
  onEndDateChange,
}: StepBudgetTimelineProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Budget &amp; Timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your total campaign budget and timeline. You&rsquo;ll allocate
          budget per creator later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="total-budget">Total Campaign Budget (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="total-budget"
              type="number"
              min={1}
              step={1}
              value={totalBudget}
              onChange={(e) => onTotalBudgetChange(e.target.value)}
              placeholder="500"
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This is your total budget across all creators in this campaign.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reach-goal">Reach Goal (optional)</Label>
          <Input
            id="reach-goal"
            type="number"
            min={1}
            step={1}
            value={reachGoal}
            onChange={(e) => onReachGoalChange(e.target.value)}
            placeholder="e.g. 50000"
          />
          <p className="text-xs text-muted-foreground">
            How many viewers do you want to reach? e.g. 50,000
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date (optional)</Label>
            <DatePicker
              value={startDate || undefined}
              onChange={(date) => onStartDateChange(date ?? "")}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date (optional)</Label>
            <DatePicker
              value={endDate || undefined}
              onChange={(date) => onEndDateChange(date ?? "")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
