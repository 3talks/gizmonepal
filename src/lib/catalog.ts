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
