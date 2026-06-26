"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Star rating, used both interactively (logging) and read-only (display).
export default function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}) {
  const dim = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={cn(!readOnly && "cursor-pointer", readOnly && "cursor-default")}
          aria-label={`${star} 星`}
        >
          <Star
            className={cn(
              dim,
              star <= value ? "fill-accent text-accent" : "text-border"
            )}
          />
        </button>
      ))}
    </div>
  );
}
