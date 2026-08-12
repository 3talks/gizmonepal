import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

const isDirect = (src: string) => src.startsWith("http") || src.startsWith("/");

/** Storage paths are private, so they are resolved to a short-lived signed URL. */
export function useMediaUrl(src?: string | null) {
  const { data } = useQuery({
    queryKey: ["media", src],
    enabled: Boolean(src) && !isDirect(src ?? ""),
    staleTime: 45 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .createSignedUrl(src as string, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  if (!src) return null;
  return isDirect(src) ? src : (data ?? null);
}

export function Media({
  src,
  alt,
  className,
  eager,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const url = useMediaUrl(src);

  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-2 text-muted-foreground",
          className,
        )}
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
