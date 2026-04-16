

## Plan: Admin Dashboard UI Redesign

**Single file change**: `src/components/admin/AdminDashboard.tsx` — JSX return and presentational helpers only. All hooks, data logic, queries, useMemo, useCallback, and `exportCSV` remain untouched.

---

### 1. Custom HTML Legend Helper

Add a small `ChartLegend` component inside the file that renders a flex-wrap div of colored squares + label + value. Used by all pie/donut charts instead of Recharts built-in labels.

### 2. KPI Metric Cards

- Remove icons from cards
- Style: `bg-secondary/50 rounded-md`, no border
- Muted label (text-[11px]) on top, large value (text-xl font-medium) below
- Net Profit in `text-green-500`, Margin in `text-blue-500`
- Grid: `grid-cols-2 md:grid-cols-5`

### 3. Order Status Pills

Replace plain grid with colored semantic pills:
- Pending: `bg-yellow-500/15 text-yellow-500`
- Confirmed: `bg-blue-500/15 text-blue-500`
- Ready: `bg-green-500/15 text-green-500`
- Completed: `bg-secondary text-foreground`
- Cancelled: `bg-destructive/15 text-destructive`
- Large number (text-xl), small label (text-[10px]), centered, rounded-md

### 4. Charts — All Fixes

- **Revenue by Category**: Convert BarChart → PieChart (donut with `innerRadius={45} outerRadius={70}`), remove built-in labels, use custom `ChartLegend` above
- **Revenue by Payment**: Same donut treatment with custom legend
- **Delivery vs Pickup**: Same donut + custom legend; move into same row as Bottom 5 Products
- **Bar charts** (Orders by Hour, Day): keep as bars, add `radius={[4,4,0,0]}`
- **Line chart** (Orders by Month): add `type="monotone"` with `strokeWidth={2}`
- All charts: formatted tooltips with ₱ where applicable, empty state message when no data

### 5. Product Tables

- **Top 10**: Rank number (muted), name (flex-1 truncate), revenue right-aligned, margin as colored pill badge (green/yellow/red)
- **Bottom 5**: Same structure, revenue in `text-destructive`
- Rows: `border-b border-border last:border-0` instead of bg blocks

### 6. Product Profitability

- Fix cost lookup: cross-reference with `products` query to build `productCostMap` by name, use as fallback when order item `cost` is 0 or missing
- Mobile: each product as a stacked card (name on top, label-value pairs below)
- Desktop: compact row layout with striped backgrounds

### 7. Customer Analytics

- Summary metrics: same clean card style as KPI row
- Top 10 list: add initials avatar circle (28px, rounded-full) with cycling bg colors
- Right side: muted "N orders · ₱value"

### 8. Inventory Section

- Conditional coloring: Stock Value `text-primary`, Low Stock `text-yellow-500` when > 0, Out of Stock `text-destructive` when > 0

### 9. Recent Orders

- Status badges use same color mapping as Order Status pills

### 10. Layout & Mobile

- All grids: `grid-cols-1 md:grid-cols-2` (KPI: `grid-cols-2 md:grid-cols-5`)
- Status pills: `grid-cols-3 md:grid-cols-5` (wraps on mobile)
- No horizontal scrolling anywhere
- Name columns: `flex-1 min-w-0 truncate`
- Import and use `useIsMobile()` for card-based mobile layouts on profitability table

### Files Modified
- `src/components/admin/AdminDashboard.tsx` — JSX rewrite + presentational helpers only

### Constraint
All `useQuery`, `useState`, `useMemo`, `useCallback`, `exportCSV`, and computed variables remain exactly as-is. Only the `return (...)` block and any new purely presentational helper components change.

