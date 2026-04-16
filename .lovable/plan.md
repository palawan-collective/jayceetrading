

## Plan: Fix Build Errors and Complete Admin Features

### Problem
The `AdminCategories` component references a `categories` table that doesn't exist in the database, causing TypeScript errors. The `AdminLayout` and routes are already partially set up but missing Categories and Units routes.

### Steps

**1. Create database tables via migration**
- `categories` table: `id` (serial PK), `name` (text, unique, not null), `created_at` (timestamptz, default now())
- `units` table: `id` (serial PK), `value` (text, unique, not null), `label` (text, not null), `example` (text), `created_at` (timestamptz, default now())
- Add a foreign key from `products.category` to `categories.name` (or keep as text and just use dropdown — safer given existing data)
- RLS: public read/insert/update/delete for both tables (matching existing pattern)
- Add foreign key relationship: `products.category` references `categories.name` and `products.unit` references `units.value` so Supabase joins work

**2. Create storage bucket `product-images`**
- Public bucket for product image uploads

**3. Seed data via insert tool**
- Categories: Sausages, Meats, Seafood, Fries, Butter, Syrup, Baking, Pampanga's Best, Dairy
- Units: kg/Kilogram/Meats Seafood, g/Gram/Spices, pack/Package/Sausages, bot/Bottle/Syrup, ltr/Liter/Milk, case/Case/Bulk orders

**4. Create `AdminUnits` component** (`src/components/admin/AdminUnits.tsx`)
- CRUD for units table with value, label, example fields
- Same card-based list pattern as AdminCategories

**5. Fix `AdminCategories` component**
- Already exists but needs to work with the new table. The current code should work once the `categories` table exists and types regenerate. Add `products(count)` relationship query.

**6. Update `AdminProducts` component**
- Replace category text input with a dropdown populated from `categories` table
- Replace unit text input with a dropdown populated from `units` table
- Replace image URL input with file upload to `product-images` storage bucket
- Keep availability toggle (already exists)

**7. Update `AdminLayout`**
- Add Categories and Units nav items to the `allNavItems` array

**8. Update `App.tsx`**
- Add routes for `/admin/categories` and `/admin/units` wrapped in AdminLayout

**9. Copy uploaded logo**
- Copy `jaycee_trading_logo.jpg` to `public/images/` for potential use

### Technical Notes
- The `products` table currently has `category` as plain text. We'll keep it as text but populate the dropdown from the `categories` table (no FK constraint to avoid migration complexity with existing data).
- Storage bucket creation will be done via migration.
- The PDF price list will be parsed to check if product data should be seeded from it.

