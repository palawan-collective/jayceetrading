

## Plan: Add Invoice Payment Features

### What We're Building
- A public invoice page customers can view (`/invoice/:orderId`)
- Payment QR codes and bank details on pending invoices
- "Mark Paid / Unpaid" buttons in admin Orders
- Invoice payment settings in admin Settings
- A new `payment_settings` table for QR images and bank info

---

### Database Changes (Migration)

**1. Add columns to `orders` table:**
- `paid_at` (timestamptz, nullable)
- `paid_via` (text, nullable)

**2. Create `payment_settings` table:**
- `id` (integer, PK, default 1)
- `show_gcash_on_invoice` (boolean, default true)
- `show_phqr_on_invoice` (boolean, default true)
- `show_bank_on_invoice` (boolean, default true)
- `gcash_qr_url` (text, nullable)
- `phqr_qr_url` (text, nullable)
- `bank_name` (text, nullable)
- `bank_account_name` (text, nullable)
- `bank_account_number` (text, nullable)
- `bank_branch` (text, nullable)
- `invoice_layout` (text, default 'show_all') -- 'show_all' or 'show_selected'
- Public read RLS, anon/authenticated insert/update

**3. Seed one default row** in `payment_settings`.

---

### New Files

**`src/pages/Invoice.tsx`** — Public invoice page at `/invoice/:orderId`
- Fetches order + payment_settings + business_settings
- **Pending**: Shows yellow "PENDING PAYMENT" badge, QR codes (GCash/PHQR images), bank transfer details, payment instructions
- **Paid**: Shows green "PAID" badge with red border box, payment method used, timestamp, hides QR/bank details, shows checkmark
- Mobile-first stacked layout, printable

---

### Modified Files

**`src/components/admin/AdminSettings.tsx`**
- Add "Invoice Payment Settings" card section:
  - Toggle checkboxes for GCash/PHQR/Bank on invoice
  - File upload for GCash QR and PHQR QR images (to `logos` bucket)
  - Bank details inputs (name, account name, number, branch)
  - Layout radio: "Show all" vs "Show only order's payment method"

**`src/components/admin/AdminOrders.tsx`**
- Add "Mark Paid" button (sets `payment_status=paid`, `paid_at=now()`, `paid_via=payment_method`)
- Add "Mark Unpaid" button (reverts to pending, clears `paid_at`/`paid_via`)
- Show payment status badge (yellow pending / green paid)
- Add "View Invoice" link that opens `/invoice/:id` in new tab
- Add "Send Paid Invoice" WhatsApp/email button after marking paid

**`src/App.tsx`**
- Add route: `/invoice/:orderId` → `Invoice` page

---

### Technical Details
- QR images uploaded to existing `logos` bucket (reuse, no new bucket needed)
- Invoice page is public (no auth), fetches by order ID
- CSV/PDF export not included (no invoice PDF generation — just a viewable web page)
- All existing functionality untouched

