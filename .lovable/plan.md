
## Plan: Branded CSV Exports + Loyalty Reward Tweak

Implements the previously approved branded CSV overhaul, with one refinement to the loyalty `next_reward_at` logic.

### 1. Extend `src/lib/csv-export.ts`
Add helpers:
- `buildBrandedCSV({ reportName, range, headers, rows, footerRows? })` — emits 6-row branded preamble + blank row + headers + data + optional footer rows
- `formatPeriod(range)` — handles from/to/All Time/Through X
- `formatGeneratedAt()` — `MMM d, yyyy HH:mm`
- `brandedFilename(type, now)` — `jaycee_[type]_[MMMYYYY]_[HHmm].csv` (uppercase month)
- `normalizePaymentMethod(raw)` — gcash→GCash, cash_on_delivery→Cash on Delivery, cash_on_pickup→Cash on Pickup, bank_transfer→Bank Transfer, phqr→PayQR

Branded preamble:
```
JAYCEE TRADING & SERVICES
[Report Name]
Period: [Apr 1, 2026 - Apr 30, 2026]
Generated: [Apr 17, 2026 14:32]
Zone 2 Abanico Rd, Puerto Princesa City, Palawan | +63977 116 7555 | tradingjaycee@gmail.com
(blank)
column_headers,...
```

### 2. Rewrite 5 exports in `src/components/admin/AdminReports.tsx`

**Full Orders** — add `delivery_address`, `items_summary` ("Name xQty, ..."); normalize `payment_method`; append blank row + `TOTALS` row (count, sum subtotal/discount/loyalty/total).

**Order Line Items** — insert `invoice_number`, `customer_name` after `order_id`; append blank row + `TOTALS` row (sum qty/cost/revenue/profit, weighted avg margin %).

**Revenue Summary** — add `margin_percent` after `gross_profit` (1 decimal); blank row → `TOTAL` row → blank row → `PAYMENT METHOD BREAKDOWN` label → one row per normalized method.

**Payments** — normalize methods, sort by method then date, subtotal row after each group, final `GRAND TOTAL`.

**Loyalty** — add `status` (Active if stamps_earned_period > 0 else Inactive); add `next_reward_at`:
- If `lifetime_stamps > 0 && lifetime_stamps % 10 === 0` → `0` (reward ready)
- Else → `10 - (lifetime_stamps % 10)`

Sort by `lifetime_stamps` desc; append `TOTALS` row (total customers, sum stamps, sum lifetime_stamps, sum total_spent).

### 3. Filenames
Replace all `downloadCSV(...)` filename args with `brandedFilename("full_orders" | "line_items" | "revenue_summary" | "payments" | "loyalty", new Date())`.

### 4. Formatting (already in place — confirm)
Money as `Number(x).toFixed(2)` (no symbol, no commas). Dates `yyyy-MM-dd`. UTF-8 BOM via existing `downloadCSV`.

### Files
- **Edit:** `src/lib/csv-export.ts`
- **Edit:** `src/components/admin/AdminReports.tsx`

### Out of scope
No schema changes, no new queries, no UI changes to the Reports tab itself.
