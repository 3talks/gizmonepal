import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyProductForm,
  primaryImage,
  slugify,
  type Brand,
  type Category,
  type Product,
  type ProductFormValues,
} from "@/lib/catalog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  brands: Brand[];
  categories: Category[];
  saving?: boolean;
  onSubmit: (values: ProductFormValues) => void;
};

const toForm = (product?: Product | null): ProductFormValues =>
  product
    ? {
        name: product.name,
        slug: product.slug,
        brand_id: product.brand_id,
        category_id: product.category_id,
        short_description: product.short_description,
        description: product.description,
        price: product.price,
        featured: product.featured,
        active: product.active,
        specifications: (product.specifications ?? {}) as Record<string, string>,
        image_url: primaryImage(product),
      }
    : emptyProductForm();

const specsToText = (specs: Record<string, string>) =>
  Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

const textToSpecs = (text: string) => {
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key) specs[key] = value;
  }
  return specs;
};

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  brands,
  categories,
  saving,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ProductFormValues>(toForm(product));
  const [specsText, setSpecsText] = useState(specsToText(toForm(product).specifications));

  useEffect(() => {
    if (!open) return;
    const next = toForm(product);
    setValues(next);
    setSpecsText(specsToText(next.specifications));
  }, [open, product]);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...values,
      slug: values.slug.trim() || slugify(values.name),
      specifications: textToSpecs(specsText),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            Products appear in the showroom as soon as they are active.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                required
                value={values.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setValues((prev) => ({
                    ...prev,
                    name,
                    slug: product ? prev.slug : slugify(name),
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-slug">URL slug</Label>
              <Input
                id="product-slug"
                required
                value={values.slug}
                onChange={(event) => set("slug", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-brand">Brand</Label>
              <select
                id="product-brand"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={values.brand_id ?? ""}
                onChange={(event) => set("brand_id", event.target.value || null)}
              >
                <option value="">No brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <select
                id="product-category"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={values.category_id ?? ""}
                onChange={(event) => set("category_id", event.target.value || null)}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (Rs)</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={values.price ?? ""}
                onChange={(event) =>
                  set("price", event.target.value === "" ? null : Number(event.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image">Primary image URL or storage path</Label>
              <Input
                id="product-image"
                value={values.image_url ?? ""}
                placeholder="/images/example.jpg"
                onChange={(event) => set("image_url", event.target.value || null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-short">Short description</Label>
            <Input
              id="product-short"
              value={values.short_description ?? ""}
              onChange={(event) => set("short_description", event.target.value || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              rows={4}
              value={values.description ?? ""}
              onChange={(event) => set("description", event.target.value || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-specs">Specifications (one per line, {"Key: Value"})</Label>
            <Textarea
              id="product-specs"
              rows={4}
              value={specsText}
              onChange={(event) => setSpecsText(event.target.value)}
              placeholder={"Capacity: 20000mAh\nWarranty: 12 months"}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={values.active}
                onCheckedChange={(checked) => set("active", checked)}
                aria-label="Active"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={values.featured}
                onCheckedChange={(checked) => set("featured", checked)}
                aria-label="Featured"
              />
              Featured
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : product ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
