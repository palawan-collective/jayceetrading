import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, ShoppingCart, TrendingUp, Package, BarChart3, PieChart as PieChartIcon, Users, AlertTriangle, Download, Clock } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["hsl(var(--primary))", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(r => keys.map(k => `"${r[k] ?? ""}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("all");

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const getDateFilter = useCallback(() => {
    const now = new Date();
    switch (dateRange) {
      case "today": return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "week": { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
      case "month": { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
      case "year": { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
      default: return null;
    }
  }, [dateRange]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const df = getDateFilter();
    return orders.filter(o => !df || new Date(o.created_at) >= df);
  }, [orders, getDateFilter]);

  const completed = filteredOrders.filter(o => o.order_status !== "cancelled");
  const totalSales = completed.reduce((s, o) => s + Number(o.total_price), 0);
  const totalCost = completed.reduce((s, o) => s + (o.items as any[]).reduce((c: number, i: any) => c + (i.cost || 0) * i.quantity, 0), 0);
  const totalProfit = totalSales - totalCost;
  const grossMargin = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;
  const avgOrder = completed.length > 0 ? totalSales / completed.length : 0;

  // Status counts
  const statusCounts = useMemo(() => {
    const c = { pending: 0, confirmed: 0, ready: 0, completed: 0, cancelled: 0 };
    filteredOrders.forEach(o => { if (o.order_status in c) c[o.order_status as keyof typeof c]++; });
    return c;
  }, [filteredOrders]);
  const cancellationRate = filteredOrders.length > 0 ? (statusCounts.cancelled / filteredOrders.length * 100) : 0;

  // Product performance
  const productPerf = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};
    completed.forEach(o => {
      (o.items as any[]).forEach((i: any) => {
        if (!map[i.name]) map[i.name] = { name: i.name, qty: 0, revenue: 0, cost: 0 };
        map[i.name].qty += i.quantity;
        map[i.name].revenue += i.price * i.quantity;
        map[i.name].cost += (i.cost || 0) * i.quantity;
      });
    });
    return Object.values(map).map(p => ({ ...p, profit: p.revenue - p.cost, margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue * 100) : 0 }));
  }, [completed]);

  const bestSellers = [...productPerf].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const worstSellers = [...productPerf].sort((a, b) => a.revenue - b.revenue).slice(0, 5);
  const mostProfitable = [...productPerf].sort((a, b) => b.margin - a.margin).slice(0, 5);
  const leastProfitable = [...productPerf].sort((a, b) => a.margin - b.margin).slice(0, 5);

  // Revenue by category
  const revByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach(o => {
      (o.items as any[]).forEach((i: any) => {
        const cat = i.category || "Other";
        map[cat] = (map[cat] || 0) + i.price * i.quantity;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: +value.toFixed(0) })).sort((a, b) => b.value - a.value);
  }, [completed]);

  // Revenue by payment
  const revByPayment = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach(o => { map[o.payment_method] = (map[o.payment_method] || 0) + Number(o.total_price); });
    return Object.entries(map).map(([name, value]) => ({ name, value: +value.toFixed(0) }));
  }, [completed]);

  // Customer analytics
  const customerStats = useMemo(() => {
    const map: Record<string, { name: string; phone: string; total: number; orders: number }> = {};
    completed.forEach(o => {
      const k = o.customer_phone;
      if (!map[k]) map[k] = { name: o.customer_name, phone: k, total: 0, orders: 0 };
      map[k].total += Number(o.total_price);
      map[k].orders++;
    });
    const all = Object.values(map);
    const returning = all.filter(c => c.orders > 1).length;
    return { unique: all.length, returning, repeatRate: all.length > 0 ? (returning / all.length * 100) : 0, top10: [...all].sort((a, b) => b.total - a.total).slice(0, 10) };
  }, [completed]);

  // Inventory analytics
  const inventoryStats = useMemo(() => {
    if (!products) return { stockValue: 0, lowStock: [], outOfStock: [], restockSuggestions: [] };
    const stockValue = products.reduce((s, p) => s + Number(p.cost_of_goods) * p.inventory, 0);
    const lowStock = products.filter(p => p.inventory > 0 && p.inventory <= p.inventory_min_threshold);
    const outOfStock = products.filter(p => p.inventory <= 0);
    const restockSuggestions = [...lowStock, ...outOfStock].map(p => ({ name: p.name, current: p.inventory, threshold: p.inventory_min_threshold, suggested: p.inventory_min_threshold * 3 }));
    return { stockValue, lowStock, outOfStock, restockSuggestions };
  }, [products]);

  // Time analytics
  const ordersByHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    completed.forEach(o => { hours[new Date(o.created_at).getHours()].count++; });
    return hours;
  }, [completed]);

  const ordersByDay = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => ({ day: d, count: 0 }));
    completed.forEach(o => { days[new Date(o.created_at).getDay()].count++; });
    return days;
  }, [completed]);

  const ordersByMonth = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => ({ month: m, count: 0 }));
    completed.forEach(o => { months[new Date(o.created_at).getMonth()].count++; });
    return months;
  }, [completed]);

  // Delivery split
  const deliverySplit = useMemo(() => {
    let pickup = 0, delivery = 0;
    filteredOrders.forEach(o => o.delivery_type === "delivery" ? delivery++ : pickup++);
    return [{ name: "Pickup", value: pickup }, { name: "Delivery", value: delivery }];
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Sales", value: `₱${totalSales.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
          { label: "Net Profit", value: `₱${totalProfit.toFixed(0)}`, icon: TrendingUp, color: "text-green-500" },
          { label: "Margin", value: `${grossMargin.toFixed(1)}%`, icon: BarChart3, color: "text-blue-500" },
          { label: "Orders", value: `${filteredOrders.length}`, icon: ShoppingCart, color: "text-orange-500" },
          { label: "Avg Order", value: `₱${avgOrder.toFixed(0)}`, icon: Package, color: "text-purple-500" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-3 flex items-center gap-2">
              <m.icon className={`h-4 w-4 ${m.color} shrink-0`} />
              <div><p className="text-[10px] text-muted-foreground">{m.label}</p><p className="text-sm font-bold">{m.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status & Funnel */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Order Status (Cancel: {cancellationRate.toFixed(0)}%)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center p-2 rounded-lg bg-secondary/50">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Revenue by Category</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(revByCategory, "revenue-by-category")}><Download className="h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revByCategory}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Revenue by Payment</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(revByPayment, "revenue-by-payment")}><Download className="h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={revByPayment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {revByPayment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Top 10 Products</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(bestSellers, "best-sellers")}><Download className="h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {bestSellers.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-xs p-1.5 rounded bg-secondary/30">
                  <span className="truncate flex-1">#{i + 1} {p.name}</span>
                  <span className="shrink-0 ml-2">{p.qty} · ₱{p.revenue.toFixed(0)} · <span className={p.margin > 40 ? "text-green-500" : p.margin >= 20 ? "text-yellow-500" : "text-destructive"}>{p.margin.toFixed(0)}%</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Bottom 5 Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {worstSellers.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs p-1.5 rounded bg-secondary/30">
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="shrink-0 ml-2">{p.qty} sold · ₱{p.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Profitability Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Product Profitability</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(productPerf.map(p => ({ Name: p.name, Units: p.qty, Revenue: p.revenue.toFixed(2), Cost: p.cost.toFixed(2), Profit: p.profit.toFixed(2), Margin: p.margin.toFixed(1) + "%" })), "product-profitability")}><Download className="h-3 w-3" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {productPerf.sort((a, b) => b.profit - a.profit).map(p => (
              <div key={p.name} className="flex flex-wrap items-center justify-between text-xs p-1.5 rounded bg-secondary/30 gap-1">
                <span className="truncate min-w-[100px] flex-1">{p.name}</span>
                <span>{p.qty}u</span>
                <span>₱{p.revenue.toFixed(0)}</span>
                <span className="text-muted-foreground">-₱{p.cost.toFixed(0)}</span>
                <span className="text-green-500">₱{p.profit.toFixed(0)}</span>
                <span className={`font-medium ${p.margin > 40 ? "text-green-500" : p.margin >= 20 ? "text-yellow-500" : "text-destructive"}`}>{p.margin.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Analytics */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Customer Analytics</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(customerStats.top10.map(c => ({ Name: c.name, Phone: c.phone, Orders: c.orders, Total: c.total.toFixed(2) })), "top-customers")}><Download className="h-3 w-3" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-secondary/50 rounded"><p className="text-lg font-bold">{customerStats.unique}</p><p className="text-[10px] text-muted-foreground">Unique</p></div>
            <div className="text-center p-2 bg-secondary/50 rounded"><p className="text-lg font-bold">{customerStats.returning}</p><p className="text-[10px] text-muted-foreground">Returning</p></div>
            <div className="text-center p-2 bg-secondary/50 rounded"><p className="text-lg font-bold">{customerStats.repeatRate.toFixed(0)}%</p><p className="text-[10px] text-muted-foreground">Repeat Rate</p></div>
          </div>
          <p className="text-xs font-semibold mb-1">Top 10 Customers</p>
          <div className="space-y-1">
            {customerStats.top10.map((c, i) => (
              <div key={c.phone} className="flex items-center justify-between text-xs p-1.5 rounded bg-secondary/30">
                <span>#{i + 1} {c.name}</span>
                <span>{c.orders} orders · ₱{c.total.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Analytics */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Inventory Analytics</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(inventoryStats.restockSuggestions, "restock-suggestions")}><Download className="h-3 w-3" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-secondary/50 rounded"><p className="text-lg font-bold">₱{inventoryStats.stockValue.toFixed(0)}</p><p className="text-[10px] text-muted-foreground">Stock Value</p></div>
            <div className="text-center p-2 bg-secondary/50 rounded"><p className="text-lg font-bold text-yellow-500">{inventoryStats.lowStock.length}</p><p className="text-[10px] text-muted-foreground">Low Stock</p></div>
            <div className="text-center p-2 bg-secondary/50 rounded"><p className="text-lg font-bold text-destructive">{inventoryStats.outOfStock.length}</p><p className="text-[10px] text-muted-foreground">Out of Stock</p></div>
          </div>
          {inventoryStats.restockSuggestions.length > 0 && (
            <>
              <p className="text-xs font-semibold mb-1">Restock Suggestions</p>
              <div className="space-y-1">
                {inventoryStats.restockSuggestions.map(r => (
                  <div key={r.name} className="flex items-center justify-between text-xs p-1.5 rounded bg-secondary/30">
                    <span className="truncate flex-1">{r.name}</span>
                    <span className="text-destructive">{r.current} left</span>
                    <span className="text-muted-foreground ml-2">→ order {r.suggested}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Time Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Orders by Hour</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(ordersByHour, "orders-by-hour")}><Download className="h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ordersByHour}><XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={2} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Orders by Day</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(ordersByDay, "orders-by-day")}><Download className="h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ordersByDay}><XAxis dataKey="day" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="count" fill="#22c55e" radius={[2, 2, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Orders by Month</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(ordersByMonth, "orders-by-month")}><Download className="h-3 w-3" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={ordersByMonth}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot /></LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Delivery split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Delivery vs Pickup</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={deliverySplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {deliverySplit.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[180px] overflow-y-auto">
              {filteredOrders.slice(0, 8).map(o => (
                <div key={o.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-secondary/30">
                  <span className="truncate">{o.customer_name}</span>
                  <span>₱{Number(o.total_price).toFixed(0)}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${o.order_status === 'completed' ? 'bg-green-500/20 text-green-500' : o.order_status === 'cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>{o.order_status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
