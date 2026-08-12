import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Star, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Container, EmptyState, SectionHeading } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  brandsQuery,
  categoriesQuery,
  inquiriesQuery,
  productsQuery,
  type Product,
} from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — PulseGear" },
      { name: "description", content: "Manage PulseGear products, brands, categories and inquiries." },
      { property: "og:title", content: "Admin Dashboard — PulseGear" },
      { property: "og:description", content: "Internal catalog management for PulseGear staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const products = useQuery(productsQuery({ includeInactive: true }));
  const brands = useQuery(brandsQuery());
  const categories = useQuery(categoriesQuery());
  const inquiries = useQuery(inquiriesQuery());

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const patch = useMutation({
    mutationFn: async (input: {
      id: string;
      values: { active?: boolean; featured?: boolean };
    }) => {
      const { error } = await supabase
        .from("products")
        .update(input.values)
        .eq("id", input.id);
      if (error) throw error;
    },

    onSuccess: () => {
      invalidate();
      toast.success("Product updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const stats = [
    { label: "Products", value: products.data?.length ?? 0 },
    { label: "Brands", value: brands.data?.length ?? 0 },
    { label: "Categories", value: categories.data?.length ?? 0 },
    { label: "Inquiries", value: inquiries.data?.length ?? 0 },
  ];

  return (
    <Container className="py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Catalog dashboard"
        description="Toggle visibility, feature products and review customer inquiries. Admin role required for changes."
        action={
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="font-display mt-1 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="products" className="mt-10">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6 space-y-3">
          {(products.data ?? []).map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  className="text-sm font-semibold hover:text-primary"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.brands?.name ?? "No brand"} · {product.categories?.name ?? "No category"}
                  {product.price != null && ` · Rs ${Number(product.price).toLocaleString()}`}
                </p>
              </div>

              <Badge variant={product.active ? "secondary" : "outline"} className="rounded-full">
                {product.active ? "Visible" : "Hidden"}
              </Badge>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={product.active}
                  onCheckedChange={(checked) =>
                    patch.mutate({ id: product.id, values: { active: checked } })
                  }
                  aria-label={`Toggle visibility for ${product.name}`}
                />
                Active
              </label>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  patch.mutate({ id: product.id, values: { featured: !product.featured } })
                }
                aria-label={`Toggle featured for ${product.name}`}
              >
                <Star
                  className={product.featured ? "h-4 w-4 text-primary" : "h-4 w-4"}
                  aria-hidden="true"
                />
                {product.featured ? "Featured" : "Feature"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Delete "${product.name}"?`)) remove.mutate(product.id);
                }}
                aria-label={`Delete ${product.name}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
              </Button>
            </div>
          ))}
          {!products.isLoading && (products.data ?? []).length === 0 && (
            <EmptyState title="No products" />
          )}
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6 space-y-3">
          {(inquiries.data ?? []).map((inquiry) => (
            <div key={inquiry.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{inquiry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(inquiry.created_at).toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {[inquiry.phone, inquiry.email].filter(Boolean).join(" · ") || "No contact given"}
              </p>
              <p className="mt-3 text-sm whitespace-pre-line">{inquiry.message}</p>
            </div>
          ))}
          {!inquiries.isLoading && (inquiries.data ?? []).length === 0 && (
            <EmptyState
              title="No inquiries yet"
              description="Customer messages from the contact and product pages appear here (admin role required)."
            />
          )}
        </TabsContent>
      </Tabs>
    </Container>
  );
}
