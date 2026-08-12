import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Container, EmptyState, SectionHeading } from "@/components/site/Section";
import { BrandCard } from "@/components/site/Cards";
import { StaggerGrid, StaggerItem } from "@/components/site/motion";
import { brandsQuery, productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands — PulseGear Authorised Range" },
      {
        name: "description",
        content:
          "The gadget and accessory brands stocked at PulseGear, with the number of products available for each.",
      },
      { property: "og:title", content: "Brands — PulseGear" },
      {
        property: "og:description",
        content: "See which accessory brands we carry in the PulseGear showroom.",
      },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const brands = useQuery(brandsQuery());
  const products = useQuery(productsQuery());

  return (
    <Container className="py-14">
      <SectionHeading
        eyebrow="Our shelves"
        title="Brands we stock"
        description="We work with authorised distributors only — every unit is genuine, with local warranty support."
      />
      <StaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(brands.data ?? []).map((brand) => (
          <StaggerItem key={brand.id}>
            <BrandCard
              brand={brand}
              count={(products.data ?? []).filter((p) => p.brand_id === brand.id).length}
            />
          </StaggerItem>
        ))}
      </StaggerGrid>
      {!brands.isLoading && (brands.data ?? []).length === 0 && (
        <div className="mt-8">
          <EmptyState title="No brands yet" />
        </div>
      )}
    </Container>
  );
}
