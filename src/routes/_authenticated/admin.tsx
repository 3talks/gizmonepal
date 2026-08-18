import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LogOut, Pencil, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Container, EmptyState, SectionHeading } from "@/components/site/Section";
import { ProductFormDialog } from "@/components/site/ProductFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  brandsQuery,
  categoriesQuery,
  createBrand,
  createCategory,
  createProduct,
  deleteProduct,
  inquiriesQuery,
  myAdminRoleQuery,
  productsQuery,
  updateProduct,
  type Product,
  type ProductFormValues,
} from "@/lib/catalog";
import { claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Gizmo Nepal" },
      { name: "description", content: "Manage Gizmo Nepal products, brands, categories and inquiries." },
      { property: "og:title", content: "Admin Dashboard — Gizmo Nepal" },
      { property: "og:description", content: "Internal catalog management for Gizmo Nepal staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const claimAdmin = useServerFn(claimFirstAdmin);

  const products = useQuery(productsQuery({ includeInactive: true }));
  const brands = useQuery(brandsQuery());
  const categories = useQuery(categoriesQuery());
  const inquiries = useQuery(inquiriesQuery());
  const isAdmin = useQuery(myAdminRoleQuery());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const fail = (error: Error) => {
    const message = /row-level security|permission denied/i.test(error.message)
      ? "Your account does not have the admin role yet, so changes are blocked."
      : error.message;
    toast.error(message);
  };

  const save = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (editing) await updateProduct(editing.id, values);
      else await createProduct(values);
    },
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      setEditing(null);
      toast.success(editing ? "Product updated" : "Product created");
    },
    onError: fail,
  });

  const patch = useMutation({
    mutationFn: async (input: { id: string; values: { active?: boolean; featured?: boolean } }) => {
      const { error } = await supabase.from("products").update(input.values).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Product updated");
    },
    onError: fail,
  });

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted");
    },
    onError: fail,
  });

  const addBrand = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      setNewBrand("");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand added");
    },
    onError: fail,
  });

  const addCategory = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setNewCategory("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category added");
    },
    onError: fail,
  });

  const claim = useMutation({
    mutationFn: async () => claimAdmin({ data: undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-admin-role"] });
      invalidate();
      toast.success("Admin access granted to your account");
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

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  return (
    <Container className="py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Catalog dashboard"
        description="Add, edit and remove products, manage brands and categories, and review customer inquiries."
        action={
          <div className="flex gap-2">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add product
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        }
      />

      {isAdmin.isSuccess && !isAdmin.data && (
        <div className="glass mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Your account does not have the admin role
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Adding, editing and deleting products is blocked until the admin role is granted. If
              you are the first staff member, claim it now.
            </p>
          </div>
          <Button onClick={() => claim.mutate()} disabled={claim.isPending}>
            {claim.isPending ? "Claiming…" : "Claim admin access"}
          </Button>
        </div>
      )}

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
          <TabsTrigger value="taxonomy">Brands & categories</TabsTrigger>
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
                onClick={() => openEdit(product)}
                aria-label={`Edit ${product.name}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
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
            <EmptyState title="No products" description="Use “Add product” to create your first listing." />
          )}
        </TabsContent>

        <TabsContent value="taxonomy" className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Brands</p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (newBrand.trim()) addBrand.mutate(newBrand);
              }}
            >
              <Input
                value={newBrand}
                onChange={(event) => setNewBrand(event.target.value)}
                placeholder="New brand name"
                aria-label="New brand name"
              />
              <Button type="submit" disabled={addBrand.isPending}>
                Add
              </Button>
            </form>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {(brands.data ?? []).map((brand) => (
                <li key={brand.id}>{brand.name}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Categories</p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (newCategory.trim()) addCategory.mutate(newCategory);
              }}
            >
              <Input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="New category name"
                aria-label="New category name"
              />
              <Button type="submit" disabled={addCategory.isPending}>
                Add
              </Button>
            </form>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {(categories.data ?? []).map((category) => (
                <li key={category.id}>{category.name}</li>
              ))}
            </ul>
          </div>
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

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        product={editing}
        brands={brands.data ?? []}
        categories={categories.data ?? []}
        saving={save.isPending}
        onSubmit={(values) => save.mutate(values)}
      />
    </Container>
  );
}
