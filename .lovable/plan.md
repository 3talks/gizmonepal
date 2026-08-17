# Plan: Switch to your own Supabase project + grant admin access

## ⚠️ Read this first — irreversible data loss

Disconnecting Lovable Cloud **permanently deletes** everything in the current
managed backend: the database (all products, brands, categories, inquiries),
the `media` storage bucket and uploaded images, **and all auth accounts**
(any staff login you already created). This cannot be undone.

We will rebuild the schema and seed data on your new Supabase project, so the
catalog comes back — but any **customer inquiries** and any **admin account
you already made** will be gone and must be recreated.

If you only wanted to log into the admin panel, you do **not** need to switch
Supabase — just tell me your staff account email and I'll grant the admin role
on the current backend instead. Confirm you really want to switch before
approving.

---

## Steps

### 1. You: Disconnect Lovable Cloud
- Open the **Cloud** tab → **Advanced** → **Disconnect**.
- Requires workspace admin. If you aren't one, ask a workspace admin to do it.
- This wipes the current database, storage, and auth accounts.

### 2. You: Connect your own Supabase project
- Go to **Project Settings → Integrations → Supabase** and complete the
  Supabase OAuth flow to link your external Supabase project.
- Lovable securely retrieves that project's service role key for server-side
  runtime use. There is no agent tool for this step — it's done in the UI.
- Your new project must be **empty** (no conflicting tables).

### 3. Me: Re-apply the schema
- Run the full schema migration against your new empty Supabase project via the
  migration tool: `app_role` enum, `user_roles`, `brands`, `categories`,
  `products`, `product_images`, `inquiries` tables, all GRANTs, RLS policies,
  and storage policies for the `media` bucket.

### 4. Me: Re-seed the catalog
- Insert the 10 categories, 10 brands, 12 products, and product image rows
  so the showroom is populated again.

### 5. Me: Recreate the media storage bucket + re-upload images
- Create the private `media` bucket on the new project.
- Re-upload the product/brand images (sourced from `public/images/`).

### 6. You: Create your staff account
- Sign up at `/auth` on the now-connected project.
- (Email confirmation is on by default — confirm via the email link.)

### 7. Me: Grant the admin role
- You give me the staff account email.
- I look up that user in `auth.users` and insert an `admin` row into
  `user_roles` for them (service-level write — users can't self-grant).
- You can now sign in at `/auth` and reach `/admin`.

### 8. Me: Verify
- Confirm the public pages load seeded products/brands/categories.
- Confirm the admin panel opens for the granted account and toggles work.
- Rebind secrets if the server env looks stale.

## What is NOT included
- No role-management UI in the admin panel (you chose instructions only).
- No data migration of existing inquiries/accounts — they are lost on
  disconnect (see warning above).
