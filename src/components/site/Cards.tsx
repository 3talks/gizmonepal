import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { categoryIcon } from "@/components/site/icons";
import { Media } from "@/components/site/media";
import type { Brand, Category } from "@/lib/catalog";

export function CategoryCard({ category, count }: { category: Category; count?: number }) {
  const Icon = categoryIcon(category.icon);

  return (
    <Link
      to="/products"
      search={{ category: category.slug }}
      className="group lift relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5"
    >
      <div
        className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-60"
        aria-hidden="true"
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="mt-6">
        <h3 className="text-sm font-semibold">{category.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {category.description}
        </p>
        {count != null && (
          <p className="mt-3 text-xs text-primary">
            {count} {count === 1 ? "product" : "products"}
          </p>
        )}
      </div>
    </Link>
  );
}

export function BrandCard({ brand, count }: { brand: Brand; count: number }) {
  return (
    <Link
      to="/products"
      search={{ brand: brand.slug }}
      className="group lift flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
        {brand.logo_url ? (
          <Media
            src={brand.logo_url}
            alt={`${brand.name} logo`}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <span className="font-display text-lg font-semibold text-primary">
            {brand.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{brand.name}</h3>
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>
      <ArrowUpRight
        className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}
