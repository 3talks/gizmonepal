import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, EmptyState, SectionHeading } from "@/components/site/Section";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { BrandCard, CategoryCard } from "@/components/site/Cards";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/site/motion";
import { brandsQuery, categoriesQuery, productsQuery } from "@/lib/catalog";
import { STORE } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseGear — Gadget & Accessory Showroom" },
      {
        name: "description",
        content:
          "Browse PulseGear's in-store catalog of chargers, power banks, earbuds, action camera and bike accessories. See real stock, then visit the showroom.",
      },
      { property: "og:title", content: "PulseGear — Gadget & Accessory Showroom" },
      {
        property: "og:description",
        content:
          "Explore our curated gadget and accessory catalog, then visit the store to see it in person.",
      },
    ],
  }),
  component: Index,
});

const PERKS = [
  {
    icon: BadgeCheck,
    title: "100% genuine stock",
    body: "Every item on the shelf is sourced through authorised distributors.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty support",
    body: "Local replacement and warranty handling handled at our counter.",
  },
  {
    icon: Store,
    title: "Try before you buy",
    body: "Test the audio, check the fit, feel the build — in person.",
  },
  {
    icon: Headphones,
    title: "Honest advice",
    body: "Tell us your device and budget, we'll match the right accessory.",
  },
];

function Index() {
  const products = useQuery(productsQuery());
  const categories = useQuery(categoriesQuery());
  const brands = useQuery(brandsQuery());

  const featured = (products.data ?? []).filter((p) => p.featured).slice(0, 8);
  const latest = (products.data ?? []).slice(0, 4);
  const showcase = featured.length > 0 ? featured : latest;

  const countByCategory = (id: string) =>
    (products.data ?? []).filter((p) => p.category_id === id).length;
  const countByBrand = (id: string) =>
    (products.data ?? []).filter((p) => p.brand_id === id).length;

  return (
    <>
      <section className="hero-bg relative overflow-hidden">
        <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              {STORE.tagline}
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Gadgets that keep your <span className="gradient-text">gear alive</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              {STORE.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/products">
                  Browse the catalog
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link to="/contact">Visit the store</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { k: "Products", v: products.data?.length ?? "—" },
                { k: "Brands", v: brands.data?.length ?? "—" },
                { k: "Categories", v: categories.data?.length ?? "—" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-xs text-muted-foreground">{s.k}</dt>
                  <dd className="font-display text-2xl font-semibold">{s.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div
                className="animate-float-slow absolute -inset-6 rounded-[2rem] bg-primary/12 blur-3xl"
                aria-hidden="true"
              />
              <img
                src="/images/hero-gadgets.jpg"
                alt="A flat lay of premium chargers, power banks and earbuds on a dark surface"
                className="relative w-full rounded-[1.75rem] border border-border/80 object-cover shadow-2xl"
                loading="eager"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <Container className="py-16">
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk) => (
            <StaggerItem key={perk.title}>
              <div className="glass h-full rounded-2xl p-5">
                <perk.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-sm font-semibold">{perk.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {perk.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>

      <Container className="py-8">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find your accessory faster"
          description="Ten focused categories covering everything we stock, from cables to camera rigs."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/categories">All categories</Link>
            </Button>
          }
        />
        <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(categories.data ?? []).slice(0, 8).map((category) => (
            <StaggerItem key={category.id}>
              <CategoryCard category={category} count={countByCategory(category.id)} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>

      <Container className="py-16">
        <SectionHeading
          eyebrow="Featured"
          title="Picked by our counter team"
          description="The gear customers keep coming back for."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/products">See all products</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.isLoading &&
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          {!products.isLoading &&
            showcase.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {!products.isLoading && showcase.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="No products yet"
              description="Our catalog is being set up. Please check back shortly."
            />
          </div>
        )}
      </Container>

      <Container className="pb-16">
        <SectionHeading
          eyebrow="Brands we stock"
          title="Names you already trust"
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/brands">All brands</Link>
            </Button>
          }
        />
        <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(brands.data ?? []).slice(0, 6).map((brand) => (
            <StaggerItem key={brand.id}>
              <BrandCard brand={brand} count={countByBrand(brand.id)} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>

      <Container className="pb-24">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
          <div
            className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
            aria-hidden="true"
          />
          <h2 className="relative text-2xl font-semibold sm:text-3xl">
            Seen something you like?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            We don't sell online — message us to check availability and reserve it, then pick
            it up at {STORE.address.split(",")[0]}.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">Contact the store</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/products">Keep browsing</Link>
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
