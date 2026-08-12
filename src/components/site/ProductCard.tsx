import { Link } from "@tanstack/react-router";
import { Media } from "@/components/site/media";
import { primaryImage, type Product } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group lift block overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        <Media
          src={primaryImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.featured && (
          <Badge className="absolute top-3 left-3 rounded-full border-0 bg-primary/90 text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs tracking-wide text-primary uppercase">
          {product.brands?.name ?? "In store"}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {product.short_description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {product.categories?.name}
          </span>
          {product.price != null && (
            <span className="text-sm font-semibold text-foreground">
              Rs {Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
