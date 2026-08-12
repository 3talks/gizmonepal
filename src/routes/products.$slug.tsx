import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, MessageCircle, Phone } from "lucide-react";

import { Container, EmptyState, SectionHeading } from "@/components/site/Section";
import { Media } from "@/components/site/media";
import { ProductCard } from "@/components/site/ProductCard";
import { InquiryForm } from "@/components/site/InquiryForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productQuery, productsQuery, sortImages } from "@/lib/catalog";
import { STORE, whatsappLink } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${readable} — PulseGear` },
        {
          name: "description",
          content: `Specs, photos and in-store availability for ${readable} at the PulseGear showroom.`,
        },
        { property: "og:title", content: `${readable} — PulseGear` },
        {
          property: "og:description",
          content: `See full specifications and availability for ${readable} at PulseGear.`,
        },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <Container className="py-20">
      <EmptyState
        title="Product not found"
        description="This item may have been removed from the catalog."
        action={
          <Button asChild variant="outline">
            <Link to="/products">Back to products</Link>
          </Button>
        }
      />
    </Container>
  ),
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const [active, setActive] = useState(0);

  const product = useQuery(productQuery(slug));
  const all = useQuery(productsQuery());

  if (product.isLoading) {
    return (
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-surface-2" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product.data) throw notFound();

  const item = product.data;
  const images = sortImages(item);
  const current = images[active]?.image_url ?? null;
  const specs = Object.entries(item.specifications ?? {});
  const related = (all.data ?? [])
    .filter((p) => p.id !== item.id && p.category_id === item.category_id)
    .slice(0, 4);

  return (
    <>
      <Container className="pt-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to catalog
        </Link>
      </Container>

      <Container className="grid gap-12 py-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-surface-2">
            <Media
              src={current}
              alt={item.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-surface-2 transition-colors",
                    index === active ? "border-primary" : "border-border hover:border-primary/50",
                  )}
                >
                  <Media
                    src={image.image_url}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {item.brands && (
              <Badge variant="secondary" className="rounded-full">
                {item.brands.name}
              </Badge>
            )}
            {item.categories && (
              <Link
                to="/products"
                search={{ category: item.categories.slug }}
                className="text-xs text-primary hover:underline"
              >
                {item.categories.name}
              </Link>
            )}
            {item.featured && (
              <Badge className="rounded-full border-0 bg-primary/90 text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {item.name}
          </h1>
          {item.short_description && (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {item.short_description}
            </p>
          )}

          {item.price != null && (
            <p className="mt-6 font-display text-3xl font-semibold">
              Rs {Number(item.price).toLocaleString()}
              <span className="ml-2 align-middle text-xs font-normal text-muted-foreground">
                indicative in-store price
              </span>
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <a
                href={whatsappLink(`Hi! Is "${item.name}" available in store?`)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Check availability
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={`tel:${STORE.phone.replace(/\s/g, "")}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {STORE.phone}
              </a>
            </Button>
          </div>

          {item.description && (
            <div className="mt-10">
              <h2 className="text-sm font-semibold">Overview</h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {item.description}
              </p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="mt-10">
              <h2 className="text-sm font-semibold">Specifications</h2>
              <dl className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {specs.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            {["Genuine product", "In-store warranty support", "Hands-on demo available"].map(
              (perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  {perk}
                </li>
              ),
            )}
          </ul>
        </div>
      </Container>

      <Container className="py-12">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-6 lg:grid-cols-2 sm:p-10">
          <div>
            <h2 className="text-xl font-semibold">Ask about this product</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Send us a quick note and our counter team will confirm stock, colour options and
              the best price for you.
            </p>
          </div>
          <InquiryForm defaultMessage={`I'm interested in "${item.name}". Is it in stock?`} />
        </div>
      </Container>

      {related.length > 0 && (
        <Container className="pb-20">
          <SectionHeading eyebrow="You may also like" title="Similar in this category" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
