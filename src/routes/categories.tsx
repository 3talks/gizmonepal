import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Container, EmptyState, SectionHeading } from "@/components/site/Section";
import { CategoryCard } from "@/components/site/Cards";
import { StaggerGrid, StaggerItem } from "@/components/site/motion";
import { categoriesQuery, productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — PulseGear Accessory Range" },
      {
        name: "description",
        content:
          "Explore PulseGear categories: chargers, power banks, cables, audio, action camera gear, bike mounts, storage and more.",
      },
      { property: "og:title", content: "Categories — PulseGear" },
      {
        property: "og:description",
        content: "Every accessory category stocked at the PulseGear showroom.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = useQuery(categoriesQuery());
  const products = useQuery(productsQuery());

  return (
    <Container className="py-14">
      <SectionHeading
        eyebrow="Browse"
        title="Categories"
        description="Pick a category to jump straight into the matching products."
      />
      <StaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(categories.data ?? []).map((category) => (
          <StaggerItem key={category.id}>
            <CategoryCard
              category={category}
              count={(products.data ?? []).filter((p) => p.category_id === category.id).length}
            />
          </StaggerItem>
        ))}
      </StaggerGrid>
      {!categories.isLoading && (categories.data ?? []).length === 0 && (
        <div className="mt-8">
          <EmptyState title="No categories yet" />
        </div>
      )}
    </Container>
  );
}
