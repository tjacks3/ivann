"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Heart, Zap, Star } from "lucide-react";

interface CompletionActionsProps {
  isBrand: boolean;
  creatorName: string | null;
}

export function CompletionActions({
  isBrand,
  creatorName,
}: CompletionActionsProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          <h3 className="font-semibold">Collaboration Complete!</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          {isBrand
            ? `Great working with ${creatorName ?? "this creator"}! Here are some next steps.`
            : "Congrats on completing this collaboration! Here are some next steps."}
        </p>

        <div className="flex flex-wrap gap-2">
          {isBrand && (
            <>
              <Link href="/brand/quick-collab">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Zap className="size-3.5" />
                  Start New Collaboration
                </Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Heart className="size-3.5" />
                  Discover More Creators
                </Button>
              </Link>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled
            className="cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            <Star className="size-3.5" />
            Rate Collaboration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
