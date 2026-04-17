

## Plan: Reports Tab + Accounting Overhaul

### 1. New "Reports" tab in admin nav
Insert between Orders and Specials in `src/pages/Admin.tsx`. Create `src/components/admin/AdminReports.tsx` as the container.

### 2. Date range picker (top of Reports tab)
- Preset pill buttons: Today, Yesterday, This Week, Last Week, This Month, Last Month, This Year, All Time
- Custom from/to via shadcn Calendar in Popover (with `pointer-events-auto`)
- Single `dateRange` state drives all 5 reports + invoices section
- Helper `src/lib/date-presets.ts` returns `{from, to}` per preset using `date-fns`

### 3. CSV utility
New `src/lib/csv-export.ts`:
- `toCSV(rows, headers)` — escapes quotes/commas/newlines
- `downloadCSV(filename, csv)` — prepends UTF-8 BOM (`\uFEFF`), triggers download
- Snake_case headers enforced

### 4. Five report cards
Each card: title, description, live record count (queried on mount + range change), download button. All queries fetch ALL matching rows (paginate with `.range()` in batches of 1000 to bypass Supabase row limit).

| Report | Source | Notes |
|---|---|---|
| 1. Full Orders | `orders` filtered by `created_at` | Items jsonb → `notes` left blank if absent |
| 2. Line Items | `orders` → flatten `items` jsonb, join product cost/category from `products` | Compute `line_gross_profit`, `margin_percent` client-side |
| 3. Revenue Summary | `orders` grouped by date in JS | Includes totals row |
| 4. Payments | `orders` (payment fields) | Append per-method subtotal rows |
| 5. Loyalty | `loyalty_customers` + `loyalty_stamp_log` + `loyalty_rewards` filtered by `created_at` in range | Aggregate stamps_earned_period, rewards_claimed_period |

### 5. Invoices subsection
Below report cards. Fetches orders in range, groups by `order_status` (Pending/Confirmed/Ready/Completed/Cancelled). Collapsible cards per status, expandable order rows showing items, totals, customer info. "Download Invoice PDF" button per order opens `/invoice/:id` in print-ready mode (reuse existing `src/pages/Invoice.tsx` + `window.print()`).

### 6. Dashboard CSV fix
Audit `AdminDashboard.tsx` exports. Replace any in-memory slicing with paginated full fetches respecting the dashboard's date filter. Extract shared `fetchAllOrders(from, to)` into `src/lib/reports-queries.ts` so Dashboard + Reports use identical logic.

### 7. Mobile-first UI
- Vertical stack of report cards (`grid-cols-1`)
- Date presets wrap with `flex-wrap gap-2`
- Calendar in Popover (touch-friendly)
- No tables that overflow — invoice details use stacked label/value rows on mobile, optional 2-col on `md:`
- Honors `no-horizontal-scroll` constraint

### Files
**Create:** `AdminReports.tsx`, `csv-export.ts`, `date-presets.ts`, `reports-queries.ts`
**Edit:** `Admin.tsx` (add tab), `AdminDashboard.tsx` (fix exports)

### Out of scope
No schema changes. No new RLS. No edge functions. PDF download reuses existing Invoice page print flow.

