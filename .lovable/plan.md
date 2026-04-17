
## Plan: Branded XLSX Exports with ExcelJS

Replace the 5 CSV downloads in the Reports tab with fully styled `.xlsx` workbooks built via ExcelJS. CSV logic stays as a fallback utility (no callers removed unless replaced). Pure presentation layer — no query/data changes.

### 1. Dependencies & assets
- Install `exceljs`
- Add `public/jaycee-logo.png` — **I need you to upload this file**. If it's not present at build time the export will skip the logo gracefully (no crash) and log a console warning.

### 2. New module: `src/lib/xlsx-export.ts`
Single styling engine reused by all 5 reports. Exports:

- `buildBrandedWorkbook(opts)` — returns an ExcelJS `Workbook`
- `downloadWorkbook(workbook, filename)` — triggers browser download
- `brandedXlsxFilename(type, date)` — `jaycee_[type]_[MMMYYYY]_[HHmm].xlsx`

`buildBrandedWorkbook` options:
```ts
{
  sheetName: string;          // "Orders" | "Line Items" | "Revenue" | "Payments" | "Loyalty"
  tabColor: string;           // hex without #
  reportName: string;         // "Order Line Items Report"
  range: DateRangeLike;
  headers: string[];          // raw column keys (snake_case)
  rows: Record<string, any>[];
  totalsRow?: Record<string, any>;       // rendered as TOTALS row with orange-tint fill + thick top border
  extraSections?: Section[];             // for Revenue's "PAYMENT METHOD BREAKDOWN" + Payments' subtotal/grand total inserts
  columnTypes?: Record<string, ColType>; // 'money' | 'margin' | 'date' | 'count' | 'id' | 'text'
}
```

`Section` supports either `{ type: 'spacer' }`, `{ type: 'banner', text }`, `{ type: 'subheader', headers }`, `{ type: 'row', cells, style: 'data'|'subtotal'|'grand_total'|'totals' }`.

### 3. Styling rules implemented inside the engine
- **Rows 1–6 header block**: orange title, navy report name, italic period + generated, contact line, white spacer — all merged across data columns
- **Logo**: load `/jaycee-logo.png` via `fetch` → `arrayBuffer`, embed top-right spanning H1:I5 (skipped silently if fetch fails)
- **Row 7 column headers**: bold white on navy, centered, white borders, height 28
- **Freeze panes**: `views = [{ state: 'frozen', ySplit: 7 }]` so headers stay visible
- **Data rows (row 8+)**: alternating white / `#F9FAFB` fill, thin `#E5E7EB` borders, 10pt `#1F2937`
- **Number formats per column type**:
  - `money` → `"₱"#,##0.00`, right-align
  - `margin` → `0.0"%"`, right-align, conditional fill (≥30 green, 20–29.9 none, <20 red)
  - `date` → `yyyy-mm-dd`, left-align
  - `count` → `0`, right-align
  - `id` → Courier New 9pt, left-align, width forced to 22
  - `text` → default, left-align
- **Auto column widths**: scan header + all values, clamp to `[10, 35]` chars (ID columns overridden to 22)
- **TOTALS row**: bold navy text, `#FED7AA` fill, 2pt orange top border, height 28, first cell = "TOTALS", number formats preserved per column

### 4. Per-report column-type maps + section logic

**Orders** (tab #F97316, "Orders")
- `id` → order_id, invoice_number
- `date` → order_date
- `text` → customer_name, customer_phone, payment_method, delivery_type, delivery_address, items_summary, status
- `money` → subtotal, discount, loyalty_redeemed, total
- TOTALS row: count + sum of money cols

**Line Items** (tab #3B82F6, "Line Items")
- `id` → order_id, invoice_number
- `date` → order_date
- `text` → customer_name, product_name, category
- `count` → quantity
- `money` → unit_cost, unit_price, line_cost, line_revenue, line_gross_profit
- `margin` → margin_percent
- TOTALS: sum qty/cost/revenue/profit, weighted avg margin

**Revenue Summary** (tab #10B981, "Revenue")
- `date` → date
- `count` → order_count
- `money` → gross_revenue, total_discounts, net_revenue, total_cogs, gross_profit, avg_order_value
- `margin` → margin_percent
- TOTALS row, then `extraSections`: spacer → banner "PAYMENT METHOD BREAKDOWN" (bold 12pt white on navy) → subheader [Payment Method, Total Amount] → one row per normalized method → GRAND TOTAL row (TOTALS style)

**Payments** (tab #A855F7, "Payments")
- `date` → date
- `id` → order_id, invoice_number
- `text` → customer_name, payment_method
- `money` → amount
- Sort by method then date; after each method group insert a `subtotal` row (`#FEF3C7`, bold 10pt, label "[Method] Subtotal", preserve money format)
- Final GRAND TOTAL row in TOTALS style

**Loyalty** (tab #EAB308, "Loyalty")
- `text` → customer_name, customer_phone, status
- `count` → stamps_earned_period, rewards_claimed_period, lifetime_stamps, next_reward_at
- `money` → total_spent
- Sort by `lifetime_stamps` desc; TOTALS row (count, sum stamps, sum lifetime_stamps, sum total_spent; `next_reward_at` blank)

### 5. Wire into `AdminReports.tsx`
Each existing export handler:
1. Keeps its current data fetch + transformation (no query changes)
2. Builds the rows/totals/sections in the shape the engine expects
3. Calls `buildBrandedWorkbook(...)` → `downloadWorkbook(wb, brandedXlsxFilename(type))`

Replace `.csv` filenames + `downloadCSV` calls; remove the now-unused branded-CSV helpers from button handlers (utility file stays for any other consumers).

### 6. Out of scope
- No DB / RLS / query changes
- No Reports tab UI changes (date picker, cards, layout untouched)
- Logo upload (you provide the PNG; I'll wire the path)

### Files
- **Add:** `src/lib/xlsx-export.ts`
- **Add:** `public/jaycee-logo.png` (you upload)
- **Edit:** `src/components/admin/AdminReports.tsx` (swap 5 export handlers to xlsx)
- **Install:** `exceljs`
