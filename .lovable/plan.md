

# Food Ordering Web Application — Implementation Plan

## Overview
A full-featured food ordering web app with a customer-facing storefront, dynamic pages, and a powerful admin panel. Built with React + Supabase backend, dark mode by default, mobile-first design.

## Phase 1: Database & Foundation
- Create all 14 Supabase tables with proper schemas, defaults, and RLS policies
- Seed business_settings, header_settings, footer_settings, payment_methods, and social_media_links with sensible defaults
- Set up dark mode as default with theme toggle (dark bg: #0f172a, light: #f8fafc)
- Configure modern fonts (Inter/Plus Jakarta Sans) and base layout

## Phase 2: Customer Storefront — Order Page
- Product grid (1/2/3 columns responsive) with category filters
- Special badges, countdown timers, special vs regular pricing
- Shopping cart (sidebar/drawer) with quantity controls
- Checkout flow: name, phone (country code), email, delivery/pickup, address, payment method selection
- QR code display for GCash/PHQR payments
- Order placement: save to DB, reduce inventory, calculate profit

## Phase 3: Dynamic Pages
- Route system for: About, Services, Specials, Blog, FAQ, Catering, Contact, Testimonials, Privacy Policy
- Each page renders content from `website_pages` and `content_sections` tables
- Contact form saves to `contact_form_submissions`
- Newsletter signup saves to `newsletter_subscribers`
- Testimonials page shows approved reviews with star ratings
- Specials page with active/upcoming specials

## Phase 4: Header & Footer
- Configurable header: logo, nav links (show/hide per admin), theme toggle, cart icon, admin icon
- Configurable footer: social icons, contact info, newsletter signup, copyright, quick links, Google Maps link
- Colors driven by header_settings/footer_settings tables

## Phase 5: Admin Panel (passkey: 5309)
- **Analytics Dashboard** — date range filters, KPIs (sales, profit margin, AOV, order count), charts, top products, low-margin alerts, inventory alerts, payment/delivery breakdowns, hourly heatmap
- **Products** — CRUD, special toggle, inventory adjust, profit margin display, CSV export/import
- **Specials Management** — create/edit specials (daily/weekly/holiday/flash), date ranges, product selection, discount %
- **Orders** — list with filters, status updates, WhatsApp send button
- **Inventory** — stock levels, low stock report, bulk restock
- **Payment Methods** — enable/disable, QR code URLs
- **Profit & Loss** — P&L statement, revenue by category, CSV export
- **Page Builder** — enable/disable pages, reorder, edit content sections (hero, features, gallery, testimonials, contact form, map, newsletter, text, CTA)
- **Testimonials** — approve/reject/edit/delete reviews
- **Newsletter** — view/export subscribers
- **Contact Submissions** — view messages, mark read
- **Header & Footer Settings** — toggle elements, set colors, manage social links
- **General Settings** — business info, WhatsApp number, logo, favicon, currency, copyright

## Technical Approach
- All data in Supabase (no localStorage for business data)
- React Query for data fetching/caching
- Lucide React icons throughout
- Mobile-first with Tailwind responsive classes
- Dark/light mode with consistent typography
- WhatsApp integration via `wa.me` links using customer phone from order

