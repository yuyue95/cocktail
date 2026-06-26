import { Martini } from "lucide-react";
import { cn } from "@/lib/utils";

// Renders a cocktail image, or a tinted placeholder when none is set.
// eslint-disable-next-line @next/next/no-img-element
export default function CocktailThumb({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      // Using a plain img keeps the component usable for arbitrary remote URLs
      // without configuring next/image domains during MVP.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-accent-soft text-accent",
        className
      )}
    >
      <Martini className="h-1/3 w-1/3" />
    </div>
  );
}
