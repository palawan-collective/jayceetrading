

## Plan: Add Missing Features to Food Ordering App

This is a large set of enhancements across 6 areas. I'll implement them incrementally, keeping all existing functionality intact.

---

### 1. Specials Image Upload + Form Fix

**AdminSpecials.tsx** — Complete overhaul of the form dialog:
- Add file input for image upload to a new `specials` storage bucket
- Add image preview in the form and in the card list
- Add missing fields: start date, end date, product selector (multi-select from products table), active toggle
- The `specials` table already has all needed columns (`start_date`, `end_date`, `products_included`, `is_active`, `image_url`)

**Database**: Create `specials` storage bucket (public) via migration.

### 2. Payment Methods QR Upload

**AdminPayments.tsx** — Replace the QR Code URL text input with a file upload button that uploads to `product-images` bucket. Show QR preview.

**Checkout.tsx** — Already has payment method selector and QR display. No changes needed (it already works with `qr_code_url` from payment_methods table).

### 3. Email Order Confirmation

Skip full Lovable Email infrastructure for this use case. Instead, use a simple approach:
- The existing WhatsApp template system already works. For email, add **mailto: link buttons** in AdminOrders (similar to WhatsApp buttons) that open the user's email client with pre-filled subject/body using the templates from `business_settings`.
- Add "Email Confirm" and "Email Ready" buttons to AdminOrders that use `mailto:` links with the customer's email, pre-filled with template content.
- Track `email_confirmation_sent` and `email_ready_sent` flags (columns already exist).

This avoids needing edge functions or email domain setup for a simple admin notification workflow.

### 4. Dynamic Pages Admin

**AdminPages.tsx** — Enhance to:
- Add/edit page content (title, slug, basic text content via textarea)
- Reorder pages with up/down buttons
- Add new pages
- Delete non-essential pages
- Content stored in existing `content` jsonb column and `content_sections` table

### 5. Full Analytics Dashboard

**AdminDashboard.tsx** — Major expansion using recharts (already installed):

**New sections with interactive charts:**
- Gross Profit Margin % card
- Revenue by Category (BarChart)
- Revenue by Payment Method (PieChart)
- Average Order Value trend
- Worst selling products (bottom 5)
- Product Profitability table (name, units sold, revenue, cost, profit, margin %)
- Customer analytics: unique customers, top 10 by spend, repeat rate
- Inventory analytics: stock value, low stock, out of stock, days remaining, restock suggestions
- Time analytics: orders by hour (bar chart), orders by day of week, orders by month
- Order funnel (pending→confirmed→ready→completed), cancellation rate
- Specials performance section
- CSV export buttons on each section
- All charts responsive with tooltips, all update with date range

### 6. No Database Schema Changes Needed

All required columns and tables already exist. Only need:
- Create `specials` storage bucket

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/...sql` | Create `specials` storage bucket |
| `src/components/admin/AdminSpecials.tsx` | Add image upload, dates, product selector, active toggle |
| `src/components/admin/AdminPayments.tsx` | Add QR image upload from device |
| `src/components/admin/AdminOrders.tsx` | Add email confirmation/ready buttons |
| `src/components/admin/AdminPages.tsx` | Add content editing, reorder, add/delete pages |
| `src/components/admin/AdminDashboard.tsx` | Full analytics suite with recharts charts |

### Technical Notes
- Recharts is already installed — will use BarChart, PieChart, LineChart, ResponsiveContainer
- CSV export via client-side Blob download
- All charts mobile-responsive via ResponsiveContainer
- No horizontal scrolling — all tables use card-based stacked layouts on mobile

