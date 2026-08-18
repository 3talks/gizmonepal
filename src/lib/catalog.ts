import { supabase } from "@/integrations/supabase/client";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  specifications: Record<string, string> | null;
  price: number | null;
  featured: boolean;
  active: boolean;
  created_at: string;
  brands?: Pick<Brand, "id" | "name" | "slug"> | null;
  categories?: Pick<Category, "id" | "name" | "slug"> | null;
  product_images?: ProductImage[];
};

const PRODUCT_SELECT =
  "*, brands(id,name,slug), categories(id,name,slug), product_images(id,product_id,image_url,sort_order)";

export const sortImages = (product: Product) =>
  [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);

export const primaryImage = (product: Product) => sortImages(product)[0]?.image_url ?? null;

export const brandsQuery = () => ({
  queryKey: ["brands"],
  queryFn: async (): Promise<Brand[]> => {
    const { data, error } = await supabase.from("brands").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Brand[];
  },
});

export const categoriesQuery = () => ({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const productsQuery = (opts: { includeInactive?: boolean } = {}) => ({
  queryKey: ["products", opts.includeInactive ? "all" : "active"],
  queryFn: async (): Promise<Product[]> => {
    let query = supabase.from("products").select(PRODUCT_SELECT);
    if (!opts.includeInactive) query = query.eq("active", true);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
});

export const productQuery = (slug: string) => ({
  queryKey: ["product", slug],
  queryFn: async (): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as Product) ?? null;
  },
});

export const inquiriesQuery = () => ({
  queryKey: ["inquiries"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Is the currently signed-in user an admin? (own roles are readable by RLS) */
export const myAdminRoleQuery = () => ({
  queryKey: ["my-admin-role"],
  queryFn: async (): Promise<boolean> => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  },
});

export type ProductFormValues = {
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  price: number | null;
  featured: boolean;
  active: boolean;
  specifications: Record<string, string>;
  image_url: string | null;
};

export const emptyProductForm = (): ProductFormValues => ({
  name: "",
  slug: "",
  brand_id: null,
  category_id: null,
  short_description: null,
  description: null,
  price: null,
  featured: false,
  active: true,
  specifications: {},
  image_url: null,
});

const productPayload = (values: ProductFormValues) => ({
  name: values.name.trim(),
  slug: (values.slug.trim() || slugify(values.name)) as string,
  brand_id: values.brand_id,
  category_id: values.category_id,
  short_description: values.short_description?.trim() || null,
  description: values.description?.trim() || null,
  price: values.price,
  featured: values.featured,
  active: values.active,
  specifications: values.specifications,
});

async function syncPrimaryImage(productId: string, imageUrl: string | null) {
  const url = imageUrl?.trim();
  const { data: existing, error } = await supabase
    .from("product_images")
    .select("id,sort_order")
    .eq("product_id", productId)
    .order("sort_order");
  if (error) throw error;

  const primary = existing?.[0];

  if (!url) return;

  if (primary) {
    const { error: updateError } = await supabase
      .from("product_images")
      .update({ image_url: url })
      .eq("id", primary.id);
    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await supabase
    .from("product_images")
    .insert({ product_id: productId, image_url: url, sort_order: 0 });
  if (insertError) throw insertError;
}

export async function createProduct(values: ProductFormValues) {
  const { data, error } = await supabase
    .from("products")
    .insert(productPayload(values))
    .select("id")
    .single();
  if (error) throw error;
  await syncPrimaryImage(data.id, values.image_url);
  return data.id;
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const { error } = await supabase.from("products").update(productPayload(values)).eq("id", id);
  if (error) throw error;
  await syncPrimaryImage(id, values.image_url);
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function createBrand(name: string) {
  const { error } = await supabase.from("brands").insert({ name: name.trim(), slug: slugify(name) });
  if (error) throw error;
}

export async function createCategory(name: string) {
  const { error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), slug: slugify(name) });
  if (error) throw error;
}
