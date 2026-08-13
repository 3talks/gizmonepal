import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Container, EmptyState, SectionHeading } from "@/components/site/Section";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brandsQuery, categoriesQuery, productsQuery } from "@/lib/catalog";

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

type ProductSearch = {
  category?: string | undefined;
  brand?: string | undefined;
  q?: string | undefined;
  sort?: SortKey | undefined;
};

const SORTS: SortKey[] = ["newest", "price-asc", "price-desc", "name"];

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    const str = (key: string) =>
      typeof search[key] === "string" && search[key] ? (search[key] as string) : undefined;
    const sort = search["sort"];
    return {
      category: str("category"),
      brand: str("brand"),
      q: str("q"),
      sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : undefined,
    };
  },

  head: () => ({
    meta: [
      { title: "All Products — Gizmo Nepal Showroom Catalog" },
      {
        name: "description",
        content:
          "Search and filter every gadget and accessory stocked at Gizmo Nepal by category, brand and price.",
      },
      { property: "og:title", content: "All Products — Gizmo Nepal" },
      {
        property: "og:description",
        content: "Filter the full Gizmo Nepal in-store catalog by category, brand and price.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const products = useQuery(productsQuery());
  const categories = useQuery(categoriesQuery());
  const brands = useQuery(brandsQuery());

  const setSearch = (patch: Partial<ProductSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const query = (search.q ?? "").trim().toLowerCase();
  const sort = search.sort ?? "newest";

  let list = (products.data ?? []).filter((product) => {
    if (search.category && product.categories?.slug !== search.category) return false;
    if (search.brand && product.brands?.slug !== search.brand) return false;
    if (query) {
      const haystack = [
        product.name,
        product.short_description,
        product.description,
        product.brands?.name,
        product.categories?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  list = [...list].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "price-asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
    if (sort === "price-desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
    return b.created_at.localeCompare(a.created_at);
  });

  const hasFilters = Boolean(search.category || search.brand || search.q);

  return (
    <Container className="py-14">
      <SectionHeading
        eyebrow="Catalog"
        title="Everything on our shelves"
        description="Browse the full showroom inventory. Prices are indicative — confirm the final price and availability at the counter."
      />

      <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search.q ?? ""}
            onChange={(e) => setSearch({ q: e.target.value || undefined })}
            placeholder="Search products, brands…"
            aria-label="Search products"
            className="rounded-full pl-9"
          />
        </div>

        <Select
          value={search.category ?? "all"}
          onValueChange={(v) => setSearch({ category: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="rounded-full" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(categories.data ?? []).map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={search.brand ?? "all"}
          onValueChange={(v) => setSearch({ brand: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="rounded-full" aria-label="Filter by brand">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {(brands.data ?? []).map((b) => (
              <SelectItem key={b.id} value={b.slug}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => setSearch({ sort: v as ProductSearch["sort"] })}
        >
          <SelectTrigger className="rounded-full" aria-label="Sort products">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          {products.isLoading ? "Loading…" : `${list.length} products`}
        </p>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate({ search: { sort: search.sort }, replace: true })
            }
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.isLoading &&
          Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        {!products.isLoading &&
          list.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {!products.isLoading && list.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No products match those filters"
            description="Try a different category, brand or search term."
            action={
              <Button variant="outline" onClick={() => navigate({ search: {}, replace: true })}>
                Reset filters
              </Button>
            }
          />
        </div>
      )}
    </Container>
  );
}
