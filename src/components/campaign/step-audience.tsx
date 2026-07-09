"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useState } from "react";

const AGE_GROUPS = [
  { value: "13-17", label: "13–17" },
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45-54", label: "45–54" },
  { value: "55+", label: "55+" },
];

interface LocationEntry {
  city: string;
  state: string;
}

interface StepAudienceProps {
  targetAgeGroups: string[];
  targetLocations: LocationEntry[];
  onTargetAgeGroupsChange: (groups: string[]) => void;
  onTargetLocationsChange: (locations: LocationEntry[]) => void;
}

export function StepAudience({
  targetAgeGroups,
  targetLocations,
  onTargetAgeGroupsChange,
  onTargetLocationsChange,
}: StepAudienceProps) {
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");

  const toggleAgeGroup = (value: string) => {
    if (targetAgeGroups.includes(value)) {
      onTargetAgeGroupsChange(targetAgeGroups.filter((g) => g !== value));
    } else {
      onTargetAgeGroupsChange([...targetAgeGroups, value]);
    }
  };

  const addLocation = () => {
    if (!newCity.trim() && !newState.trim()) return;
    onTargetLocationsChange([
      ...targetLocations,
      { city: newCity.trim(), state: newState.trim() },
    ]);
    setNewCity("");
    setNewState("");
  };

  const removeLocation = (index: number) => {
    onTargetLocationsChange(targetLocations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Target Audience</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define who you want your campaign to reach.
        </p>
      </div>

      {/* Age Groups */}
      <div className="space-y-3">
        <Label>Target Age Groups (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((group) => (
            <button
              key={group.value}
              type="button"
              onClick={() => toggleAgeGroup(group.value)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors",
                targetAgeGroups.includes(group.value)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/30",
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <Label>Target Locations (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Add cities or states where you want to target creators. Leave empty
          for nationwide.
        </p>

        {targetLocations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {targetLocations.map((loc, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {[loc.city, loc.state].filter(Boolean).join(", ")}
                <button
                  type="button"
                  onClick={() => removeLocation(i)}
                  className="cursor-pointer hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="loc-city" className="text-xs">
              City
            </Label>
            <Input
              id="loc-city"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="e.g. Austin"
              maxLength={100}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="loc-state" className="text-xs">
              State
            </Label>
            <Input
              id="loc-state"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              placeholder="e.g. Texas"
              maxLength={100}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLocation}
            disabled={!newCity.trim() && !newState.trim()}
            className="cursor-pointer"
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
