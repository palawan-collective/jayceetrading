import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CalendarIcon, Download, FileText, ChevronDown, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRESETS, getPresetRange, type DateRange, type PresetKey } from "@/lib/date-presets";
import {
  buildBrandedCSV, downloadCSV, brandedFilename, normalizePaymentMethod,
} from "@/lib/csv-export";
import {
  fetchAllOrders, fetchAllProducts, fetchAllLoyaltyCustomers,
  fetchLoyaltyStampLog, fetchLoyaltyRewards,
} from "@/lib/reports-queries";

const STATUS_ORDER = ["pending", "confirmed", "ready", "completed", "cancelled"] as const;
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  ready: "bg-green-500/15 text-green-600 dark:text-green-400",
  completed: "bg-secondary text-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

function rangeKey(r: DateRange) {
  return `${r.from?.toISOString() ?? "null"}_${r.to?.toISOString() ?? "null"}`;
}

function fmtDate(d: Date | null) {
  return d ? format(d, "MMM d, yyyy") : "—";
}

function itemsSummary(items: any[]): string {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map(it => {
      const name = it.name ?? it.product_name ?? "Item";
      const qty = Number(it.quantity ?? it.qty ?? 1);
      return `${name} x${qty}`;
    })
    .join(", ");
}

export default function AdminReports() {
  const [preset, setPreset] = useState<PresetKey>("this_month");
  const [range, setRange] = useState<DateRange>(getPresetRange("this_month"));

  const setPresetRange = (k: PresetKey) => {
    setPreset(k);
    setRange(getPresetRange(k));
  };

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["reports-orders", rangeKey(range)],
    queryFn: () => fetchAllOrders(range),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["reports-products"],
    queryFn: fetchAllProducts,
  });

  const { data: stampLog = [] } = useQuery({
    queryKey: ["reports-stamp-log", rangeKey(range)],
    queryFn: () => fetchLoyaltyStampLog(range),
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ["reports-rewards", rangeKey(range)],
    queryFn: () => fetchLoyaltyRewards(range),
  });

  const { data: loyaltyCustomers = [] } = useQuery({
    queryKey: ["reports-loyalty-customers"],
    queryFn: fetchAllLoyaltyCustomers,
  });

  const productMap = useMemo(() => {
    const m = new Map<string, any>();
    products.forEach((p: any) => {
      m.set(p.id, p);
      m.set(p.name?.toLowerCase?.() ?? "", p);
    });
    return m;
  }, [products]);

  // === Report 1: Full Orders ===
  const exportFullOrders = () => {
    const headers = [
      "order_id", "invoice_number", "order_date", "order_time",
      "customer_name", "customer_phone", "customer_email",
      "order_status", "fulfillment_type", "payment_method", "payment_status",
      "delivery_address", "subtotal", "discount_amount", "loyalty_redeemed",
      "total", "notes", "items_summary",
    ];
    let sumSubtotal = 0, sumDiscount = 0, sumLoyalty = 0, sumTotal = 0;
    const rows = orders.map((o: any) => {
      const created = new Date(o.created_at);
      const subtotal = Number(o.subtotal ?? 0);
      const total = Number(o.total_price ?? 0);
      const discount = Math.max(0, subtotal - total);
      const loyalty = o.reward_code_used ? 1 : 0;
      sumSubtotal += subtotal;
      sumDiscount += discount;
      sumLoyalty += loyalty;
      sumTotal += total;
      return {
        order_id: o.id,
        invoice_number: o.invoice_number ?? "",
        order_date: format(created, "yyyy-MM-dd"),
        order_time: format(created, "HH:mm:ss"),
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        customer_email: o.customer_email ?? "",
        order_status: o.order_status,
        fulfillment_type: o.delivery_type,
        payment_method: normalizePaymentMethod(o.payment_method),
        payment_status: o.payment_status,
        delivery_address: o.delivery_type === "pickup" ? "" : (o.delivery_address ?? ""),
        subtotal: subtotal.toFixed(2),
        discount_amount: discount.toFixed(2),
        loyalty_redeemed: o.reward_code_used ?? "",
        total: total.toFixed(2),
        notes: "",
        items_summary: itemsSummary(Array.isArray(o.items) ? o.items : []),
      };
    });

    const footerRows: any[][] = [
      [],
      [
        "TOTALS", orders.length, "", "", "", "", "", "", "", "", "", "",
        sumSubtotal.toFixed(2), sumDiscount.toFixed(2), sumLoyalty,
        sumTotal.toFixed(2), "", "",
      ],
    ];

    const csv = buildBrandedCSV({
      reportName: "Full Orders Export",
      range, headers, rows, footerRows,
    });
    downloadCSV(brandedFilename("full_orders"), csv);
  };

  // === Report 2: Line Items ===
  const lineItemsCount = useMemo(() => {
    return orders.reduce((sum: number, o: any) => sum + (Array.isArray(o.items) ? o.items.length : 0), 0);
  }, [orders]);

  const exportLineItems = () => {
    const headers = [
      "order_id", "invoice_number", "customer_name", "order_date",
      "product_name", "category", "quantity",
      "unit_cost", "unit_price", "line_cost", "line_revenue",
      "line_gross_profit", "margin_percent",
    ];
    const rows: any[] = [];
    let sumQty = 0, sumCost = 0, sumRev = 0, sumProfit = 0;
    orders.forEach((o: any) => {
      const items = Array.isArray(o.items) ? o.items : [];
      const created = new Date(o.created_at);
      items.forEach((it: any) => {
        const name = it.name ?? it.product_name ?? "";
        const product = productMap.get(it.id) || productMap.get(name.toLowerCase?.() ?? "");
        const qty = Number(it.quantity ?? it.qty ?? 1);
        const unitPrice = Number(it.price ?? it.unit_price ?? product?.price ?? 0);
        const unitCost = Number(it.cost ?? it.unit_cost ?? product?.cost_of_goods ?? 0);
        const lineRev = +(qty * unitPrice).toFixed(2);
        const lineCost = +(qty * unitCost).toFixed(2);
        const lineProfit = +(lineRev - lineCost).toFixed(2);
        const margin = lineRev > 0 ? +(lineProfit / lineRev * 100).toFixed(2) : 0;
        sumQty += qty;
        sumCost += lineCost;
        sumRev += lineRev;
        sumProfit += lineProfit;
        rows.push({
          order_id: o.id,
          invoice_number: o.invoice_number ?? "",
          customer_name: o.customer_name,
          order_date: format(created, "yyyy-MM-dd"),
          product_name: name,
          category: it.category ?? product?.category ?? "",
          quantity: qty,
          unit_cost: unitCost.toFixed(2),
          unit_price: unitPrice.toFixed(2),
          line_cost: lineCost.toFixed(2),
          line_revenue: lineRev.toFixed(2),
          line_gross_profit: lineProfit.toFixed(2),
          margin_percent: margin.toFixed(2),
        });
      });
    });

    const avgMargin = sumRev > 0 ? (sumProfit / sumRev * 100).toFixed(2) : "0.00";
    const footerRows: any[][] = [
      [],
      [
        "TOTALS", "", "", "", "", "", sumQty,
        sumCost.toFixed(2), "", sumRev.toFixed(2),
        sumProfit.toFixed(2), avgMargin,
      ],
    ];

    const csv = buildBrandedCSV({
      reportName: "Order Line Items",
      range, headers, rows, footerRows,
    });
    downloadCSV(brandedFilename("line_items"), csv);
  };

  // === Report 3: Revenue Summary ===
  const revenueSummaryRows = useMemo(() => {
    const byDay = new Map<string, { date: string; order_count: number; gross_revenue: number; total_discounts: number; total_cogs: number; net_revenue: number; gross_profit: number; }>();
    orders.forEach((o: any) => {
      const date = format(new Date(o.created_at), "yyyy-MM-dd");
      const subtotal = Number(o.subtotal ?? 0);
      const total = Number(o.total_price ?? 0);
      const discount = Math.max(0, subtotal - total);
      const items = Array.isArray(o.items) ? o.items : [];
      let cogs = 0;
      items.forEach((it: any) => {
        const product = productMap.get(it.id) || productMap.get((it.name ?? "").toLowerCase());
        const qty = Number(it.quantity ?? it.qty ?? 1);
        const unitCost = Number(it.cost ?? it.unit_cost ?? product?.cost_of_goods ?? 0);
        cogs += qty * unitCost;
      });
      const row = byDay.get(date) ?? { date, order_count: 0, gross_revenue: 0, total_discounts: 0, total_cogs: 0, net_revenue: 0, gross_profit: 0 };
      row.order_count += 1;
      row.gross_revenue += subtotal;
      row.total_discounts += discount;
      row.total_cogs += cogs;
      row.net_revenue += total;
      row.gross_profit += total - cogs;
      byDay.set(date, row);
    });
    return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [orders, productMap]);

  const exportRevenueSummary = () => {
    const headers = [
      "date", "order_count", "gross_revenue", "total_discounts",
      "total_cogs", "net_revenue", "gross_profit", "margin_percent",
      "avg_order_value",
    ];
    const rows = revenueSummaryRows.map(r => {
      const margin = r.gross_revenue > 0 ? (r.gross_profit / r.gross_revenue * 100) : 0;
      return {
        date: r.date,
        order_count: r.order_count,
        gross_revenue: r.gross_revenue.toFixed(2),
        total_discounts: r.total_discounts.toFixed(2),
        total_cogs: r.total_cogs.toFixed(2),
        net_revenue: r.net_revenue.toFixed(2),
        gross_profit: r.gross_profit.toFixed(2),
        margin_percent: margin.toFixed(1),
        avg_order_value: r.order_count ? (r.net_revenue / r.order_count).toFixed(2) : "0.00",
      };
    });

    const footerRows: any[][] = [];
    if (revenueSummaryRows.length) {
      const totals = revenueSummaryRows.reduce((acc, r) => ({
        order_count: acc.order_count + r.order_count,
        gross_revenue: acc.gross_revenue + r.gross_revenue,
        total_discounts: acc.total_discounts + r.total_discounts,
        total_cogs: acc.total_cogs + r.total_cogs,
        net_revenue: acc.net_revenue + r.net_revenue,
        gross_profit: acc.gross_profit + r.gross_profit,
      }), { order_count: 0, gross_revenue: 0, total_discounts: 0, total_cogs: 0, net_revenue: 0, gross_profit: 0 });
      const totalMargin = totals.gross_revenue > 0 ? (totals.gross_profit / totals.gross_revenue * 100) : 0;
      footerRows.push([]);
      footerRows.push([
        "TOTAL", totals.order_count,
        totals.gross_revenue.toFixed(2),
        totals.total_discounts.toFixed(2),
        totals.total_cogs.toFixed(2),
        totals.net_revenue.toFixed(2),
        totals.gross_profit.toFixed(2),
        totalMargin.toFixed(1),
        totals.order_count ? (totals.net_revenue / totals.order_count).toFixed(2) : "0.00",
      ]);
    }

    // Payment method breakdown
    const byMethod = new Map<string, { count: number; total: number }>();
    orders.forEach((o: any) => {
      const m = normalizePaymentMethod(o.payment_method);
      const cur = byMethod.get(m) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += Number(o.total_price ?? 0);
      byMethod.set(m, cur);
    });
    if (byMethod.size > 0) {
      footerRows.push([]);
      footerRows.push(["PAYMENT METHOD BREAKDOWN"]);
      footerRows.push(["payment_method", "order_count", "total_amount"]);
      Array.from(byMethod.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([m, v]) => {
          footerRows.push([m, v.count, v.total.toFixed(2)]);
        });
    }

    const csv = buildBrandedCSV({
      reportName: "Revenue Summary",
      range, headers, rows, footerRows,
    });
    downloadCSV(brandedFilename("revenue_summary"), csv);
  };

  // === Report 4: Payments ===
  const exportPayments = () => {
    const headers = [
      "order_id", "order_date", "customer_name",
      "payment_method", "amount", "payment_status",
    ];

    const enriched = orders.map((o: any) => ({
      order_id: o.id,
      order_date: format(new Date(o.created_at), "yyyy-MM-dd"),
      customer_name: o.customer_name,
      payment_method: normalizePaymentMethod(o.payment_method),
      amount: Number(o.total_price ?? 0),
      payment_status: o.payment_status,
    }));

    enriched.sort((a, b) => {
      if (a.payment_method !== b.payment_method) return a.payment_method.localeCompare(b.payment_method);
      return a.order_date.localeCompare(b.order_date);
    });

    const rows: Record<string, any>[] = [];
    const footerRows: any[][] = [];
    let currentMethod: string | null = null;
    let methodSum = 0;
    let methodCount = 0;
    let grandTotal = 0;
    let grandCount = 0;

    const flushSubtotal = () => {
      if (currentMethod !== null) {
        footerRows.push([]); // spacer not ideal mid-rows; use inline rows instead
      }
    };

    // We want subtotals inline between groups, so build rows directly
    enriched.forEach((r, i) => {
      if (currentMethod !== null && r.payment_method !== currentMethod) {
        rows.push({
          order_id: "SUBTOTAL", order_date: "", customer_name: "",
          payment_method: currentMethod, amount: methodSum.toFixed(2),
          payment_status: `${methodCount} order${methodCount !== 1 ? "s" : ""}`,
        });
        rows.push({ order_id: "", order_date: "", customer_name: "", payment_method: "", amount: "", payment_status: "" });
        methodSum = 0;
        methodCount = 0;
      }
      currentMethod = r.payment_method;
      methodSum += r.amount;
      methodCount += 1;
      grandTotal += r.amount;
      grandCount += 1;
      rows.push({
        order_id: r.order_id,
        order_date: r.order_date,
        customer_name: r.customer_name,
        payment_method: r.payment_method,
        amount: r.amount.toFixed(2),
        payment_status: r.payment_status,
      });
      if (i === enriched.length - 1 && currentMethod !== null) {
        rows.push({
          order_id: "SUBTOTAL", order_date: "", customer_name: "",
          payment_method: currentMethod, amount: methodSum.toFixed(2),
          payment_status: `${methodCount} order${methodCount !== 1 ? "s" : ""}`,
        });
      }
    });

    if (grandCount > 0) {
      footerRows.push([]);
      footerRows.push([
        "GRAND TOTAL", "", "", "", grandTotal.toFixed(2),
        `${grandCount} order${grandCount !== 1 ? "s" : ""}`,
      ]);
    }

    const csv = buildBrandedCSV({
      reportName: "Payments Report",
      range, headers, rows, footerRows,
    });
    downloadCSV(brandedFilename("payments"), csv);
  };

  // === Report 5: Loyalty ===
  const exportLoyalty = () => {
    const headers = [
      "customer_name", "customer_phone", "tier", "status",
      "stamps_earned_period", "rewards_claimed_period",
      "lifetime_stamps", "next_reward_at",
      "total_orders", "total_spent",
    ];

    const stampsByCustomer = new Map<string, number>();
    stampLog.forEach((s: any) => {
      if (!s.customer_id) return;
      stampsByCustomer.set(s.customer_id, (stampsByCustomer.get(s.customer_id) ?? 0) + Number(s.stamps_earned ?? 0));
    });
    const rewardsByPhone = new Map<string, number>();
    rewards.forEach((r: any) => {
      if (!r.is_claimed) return;
      rewardsByPhone.set(r.customer_phone, (rewardsByPhone.get(r.customer_phone) ?? 0) + 1);
    });

    const rows = loyaltyCustomers
      .map((c: any) => {
        const stampsPeriod = stampsByCustomer.get(c.id) ?? 0;
        const lifetime = Number(c.lifetime_stamps ?? 0);
        const nextReward = lifetime > 0 && lifetime % 10 === 0 ? 0 : 10 - (lifetime % 10);
        return {
          customer_name: c.name ?? "",
          customer_phone: c.phone,
          tier: c.tier ?? "regular",
          status: stampsPeriod > 0 ? "Active" : "Inactive",
          stamps_earned_period: stampsPeriod,
          rewards_claimed_period: rewardsByPhone.get(c.phone) ?? 0,
          lifetime_stamps: lifetime,
          next_reward_at: nextReward,
          total_orders: c.total_orders ?? 0,
          total_spent: Number(c.total_spent ?? 0).toFixed(2),
          _lifetime_sort: lifetime,
          _spent_sort: Number(c.total_spent ?? 0),
        };
      })
      .sort((a, b) => b._lifetime_sort - a._lifetime_sort)
      .map(({ _lifetime_sort, _spent_sort, ...rest }) => rest);

    const totals = rows.reduce((acc, r) => ({
      stamps: acc.stamps + Number(r.stamps_earned_period ?? 0),
      lifetime: acc.lifetime + Number(r.lifetime_stamps ?? 0),
      spent: acc.spent + parseFloat(String(r.total_spent ?? "0")),
    }), { stamps: 0, lifetime: 0, spent: 0 });

    const footerRows: any[][] = [
      [],
      [
        "TOTALS", `${rows.length} customers`, "", "",
        totals.stamps, "", totals.lifetime, "", "",
        totals.spent.toFixed(2),
      ],
    ];

    const csv = buildBrandedCSV({
      reportName: "Loyalty Program Report",
      range, headers, rows, footerRows,
    });
    downloadCSV(brandedFilename("loyalty"), csv);
  };

  // Invoices grouped by status
  const ordersByStatus = useMemo(() => {
    const map: Record<string, any[]> = { pending: [], confirmed: [], ready: [], completed: [], cancelled: [] };
    orders.forEach((o: any) => {
      const k = o.order_status || "pending";
      if (!map[k]) map[k] = [];
      map[k].push(o);
    });
    return map;
  }, [orders]);

  const reportCards = [
    { title: "Full Orders Export", desc: "Every order with customer, payment, and totals.", count: orders.length, label: "orders", onClick: exportFullOrders },
    { title: "Order Line Items", desc: "Per-item breakdown for COGS and margin analysis.", count: lineItemsCount, label: "line items", onClick: exportLineItems },
    { title: "Revenue Summary", desc: "Daily totals — revenue, COGS, profit, AOV.", count: revenueSummaryRows.length, label: "days", onClick: exportRevenueSummary },
    { title: "Payments Report", desc: "Every payment grouped by method with subtotals.", count: orders.length, label: "payments", onClick: exportPayments },
    { title: "Loyalty Program Report", desc: "Customer stamps, tiers, rewards, lifetime activity.", count: loyaltyCustomers.length, label: "customers", onClick: exportLoyalty },
  ];

  return (
    <div className="space-y-4">
      {/* Date range picker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Date Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <Button
                key={p.key}
                size="sm"
                variant={preset === p.key ? "default" : "outline"}
                onClick={() => setPresetRange(p.key)}
                className="h-8 text-xs"
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 justify-start text-left font-normal text-xs", !range.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  From: {fmtDate(range.from)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={range.from ?? undefined} onSelect={(d) => { setPreset("custom"); setRange(r => ({ ...r, from: d ?? null })); }} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 justify-start text-left font-normal text-xs", !range.to && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  To: {fmtDate(range.to)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={range.to ?? undefined} onSelect={(d) => { setPreset("custom"); setRange(r => ({ ...r, to: d ?? null })); }} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {ordersLoading ? "Loading…" : `${orders.length} orders in selected range`}
          </p>
        </CardContent>
      </Card>

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-3">
        {reportCards.map((r, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{r.count.toLocaleString()} {r.label}</p>
                </div>
              </div>
              <Button onClick={r.onClick} size="sm" disabled={r.count === 0} className="w-full sm:w-auto sm:self-end">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoices subsection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {STATUS_ORDER.map(status => {
            const list = ordersByStatus[status] ?? [];
            return (
              <Collapsible key={status} className="border border-border rounded-md">
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 rounded-md min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium capitalize", STATUS_STYLES[status])}>{status}</span>
                    <span className="text-xs text-muted-foreground">{list.length} order{list.length !== 1 ? "s" : ""}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2 space-y-1.5">
                  {list.length === 0 && <p className="text-[11px] text-muted-foreground px-2 py-2">No orders.</p>}
                  {list.map((o: any) => (
                    <OrderInvoiceRow key={o.id} order={o} productMap={productMap} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderInvoiceRow({ order, productMap }: { order: any; productMap: Map<string, any> }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const created = new Date(order.created_at);
  return (
    <Collapsible className="border border-border/60 rounded-md bg-muted/20">
      <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 px-3 py-2 min-h-[44px]">
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs font-medium truncate">{order.invoice_number ?? order.id}</div>
          <div className="text-[11px] text-muted-foreground truncate">{order.customer_name} · {format(created, "MMM d, yyyy HH:mm")}</div>
        </div>
        <div className="text-xs font-semibold shrink-0">₱{Number(order.total_price ?? 0).toFixed(2)}</div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-2 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-border/60">
          <div><span className="text-muted-foreground">Phone:</span> {order.customer_phone}</div>
          <div><span className="text-muted-foreground">Email:</span> {order.customer_email ?? "—"}</div>
          <div><span className="text-muted-foreground">Type:</span> {order.delivery_type}</div>
          <div><span className="text-muted-foreground">Payment:</span> {normalizePaymentMethod(order.payment_method)} ({order.payment_status})</div>
          {order.delivery_address && <div className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {order.delivery_address}</div>}
        </div>
        <div className="space-y-1 pt-1">
          {items.map((it: any, i: number) => {
            const name = it.name ?? it.product_name ?? "";
            const qty = Number(it.quantity ?? it.qty ?? 1);
            const price = Number(it.price ?? it.unit_price ?? productMap.get(it.id)?.price ?? 0);
            return (
              <div key={i} className="flex justify-between gap-2">
                <span className="flex-1 min-w-0 truncate">{qty}× {name}</span>
                <span className="shrink-0 text-muted-foreground">₱{(qty * price).toFixed(2)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between pt-2 border-t border-border/60">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">₱{Number(order.total_price ?? 0).toFixed(2)}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => window.open(`/invoice/${order.id}`, "_blank")}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download Invoice PDF
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
