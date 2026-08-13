# Gadget Showcase

Use this as a single comprehensive prompt for ChatGPT, Claude, Lovable, Bolt, Cursor, or any AI full-stack code generator.

Build a complete modern full-stack product showcase website for my physical gadget and accessories store. ## Project Goal This is not an e-commerce website. Customers should be able to browse products, categories, and brands, but there should be no cart, checkout, payment, or order functionality. The website should function as a professional digital showroom / catalog for my store. ## Store Products The store sells: - Mobile accessories - Chargers and cables - Power banks - Earbuds and headphones - GoPro accessories - Action camera accessories - Bike accessories - Helmet mounts - Bike mobile holders - Carry bags and travel cases - Tripods and mounts - Memory cards - Adapters and converters - Other similar gadget accessories ## Design References Use Oliz Store as a design inspiration for layout and product presentation, but do not copy the design directly. Reference: https://www.olizstore.com/ ## Tech Stack (Mandatory) ### Frontend - React + Vite - Tailwind CSS - Framer Motion for animations - React Router DOM ### Backend / Database - Supabase (mandatory) - Supabase Authentication - Supabase PostgreSQL database - Supabase Storage for product images ### Deployment Ready - Frontend deployable to Vercel - Supabase used as hosted backend ## Website Requirements ### Public Website #### Home Page - Full-width modern hero section - Animated floating gadget elements - Gradient and glassmorphism effects - Featured brands - Featured products - Categories section - Why choose us section - Contact and store information - Smooth scroll and motion effects #### Products Page - Responsive product grid - Product cards with hover effects - Image zoom on hover - Category filter - Brand filter - Search by product name - Sort by latest / name #### Product Detail Page - Large image gallery - Product name - Brand - Category - Description - Specifications - Related products #### Brands Page - Brand logos - Brand-wise product count - Click to view products of that brand #### Categories Page - Visual category cards with icons and animations #### About Page - Store story - Services - Genuine products - Warranty/support information #### Contact Page - Contact details - WhatsApp button - Google Maps embed - Inquiry form (store in Supabase) ## Admin Dashboard (Important) Create a secure admin panel. ### Authentication - Admin login with Supabase Auth - Protected routes ### Dashboard Features #### Product Management - Add product - Edit product - Delete product - Upload multiple images - Toggle featured product - Toggle active/inactive #### Brand Management - Add brand - Edit brand - Delete brand - Upload brand logo #### Category Management - Add category - Edit category - Delete category #### Inquiry Management - View contact inquiries - Mark as read ## Database Schema Design proper Supabase tables. ### brands - id - name - slug - logo_url - created_at ### categories - id - name - slug - icon - created_at ### products - id - name - slug - brand_id - category_id - short_description - description - specifications (JSON) - price_optional - featured - active - created_at ### product_images - id - product_id - image_url - sort_order ### inquiries - id - name - phone - email - message - is_read - created_at ## UI / UX Requirements The design must feel: - Modern - Premium - Tech-focused - Smooth - Fast - Mobile-first ### Visual Style - Dark theme with optional light theme - Electric blue / cyan accent colors - Glassmorphism cards - Soft shadows - Rounded corners (16px–24px) - Subtle animated gradients ### Animations - Framer Motion page transitions - Fade-up on scroll - Staggered product animations - Hover lift effects - Floating background particles - Animated category icons Do not overuse animations; keep them professional. ## Components to Build - Navbar - Mobile menu - Hero section - Product card - Brand card - Category card - Filter sidebar - Search bar - Image gallery - Footer - Admin sidebar - Admin tables - Product form - Brand form - Category form ## Responsive Requirements Optimize for: - Mobile (320px+) - Tablet - Laptop - Large desktop ## Performance - Lazy load images - Use optimized image sizes - Code splitting with React Router - Avoid unnecessary re-renders ## SEO - Dynamic page titles - Meta descriptions - Open Graph tags - Clean URLs using slugs ## Deliverables Provide the complete production-ready codebase with:

Project folder structure

All React pages and components

Tailwind configuration

Supabase client setup

SQL schema for all tables

Row Level Security policies

Storage bucket setup instructions

Environment variables example

Admin authentication setup

Image upload implementation

Search and filter logic

Deployment instructions for Vercel

## Extra Premium Features Add these if possible: - Skeleton loaders - Toast notifications - Breadcrumbs - Recently added products - Featured brands carousel - Scroll progress indicator - Back to top button - WhatsApp floating action button - Empty states - 404 page - Loading transitions ## Important Constraints - No shopping cart - No payment gateway - No checkout - No user accounts for customers - Only admin authentication - Clean and maintainable code - Use TypeScript if possible ## Final Goal The final website should look like a high-end gadget showroom website, suitable for a real physical store in 2026, with smooth animations, premium visuals, easy product management through Supabase, and excellent mobile responsiveness.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gizmonepal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5249f6f5-38fe-442c-8a62-e2009edd0857).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
