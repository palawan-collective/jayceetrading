import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, ShoppingCart, TrendingUp, Package, BarChart3, PieChart } from "lucide-react";
import { useState, useMemo } from "react";

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

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case "today": return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "week": { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
      case "month": { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
      case "year": { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
      default: return null;
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const dateFilter = getDateFilter();
    return orders.filter(o => {
      if (dateFilter && new Date(o.created_at) < dateFilter) return false;
      return true;
    });
  }, [orders, dateRange]);

  const completedOrders = filteredOrders.filter(o => o.order_status !== "cancelled");
  const totalSales = completedOrders.reduce((s, o) => s + Number(o.total_price), 0);
  const totalProfit = completedOrders.reduce((s, o) => s + Number(o.profit), 0);
  const totalOrders = filteredOrders.length;
  const avgOrder = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;
  const lowStock = products?.filter(p => p.inventory <= p.inventory_min_threshold) || [];

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, ready: 0, completed: 0, cancelled: 0 };
    filteredOrders.forEach(o => { if (o.order_status in counts) counts[o.order_status as keyof typeof counts]++; });
    return counts;
  }, [filteredOrders]);

  // Best selling products
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};
    completedOrders.forEach(o => {
      (o.items as any[]).forEach((item: any) => {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0, profit: 0 };
        map[item.name].qty += item.quantity;
        map[item.name].revenue += item.price * item.quantity;
        map[item.name].profit += (item.price - (item.cost || 0)) * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [completedOrders]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => { map[o.payment_method] = (map[o.payment_method] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredOrders]);

  // Delivery vs Pickup
  const deliverySplit = useMemo(() => {
    let pickup = 0, delivery = 0;
    filteredOrders.forEach(o => { o.delivery_type === "delivery" ? delivery++ : pickup++; });
    return { pickup, delivery };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Sales</p><p className="text-lg font-bold">₱{totalSales.toFixed(2)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div>
            <div><p className="text-xs text-muted-foreground">Net Profit</p><p className="text-lg font-bold">₱{totalProfit.toFixed(2)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10"><ShoppingCart className="h-5 w-5 text-blue-500" /></div>
            <div><p className="text-xs text-muted-foreground">Orders</p><p className="text-lg font-bold">{totalOrders}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/10"><Package className="h-5 w-5 text-orange-500" /></div>
            <div><p className="text-xs text-muted-foreground">Avg Order</p><p className="text-lg font-bold">₱{avgOrder.toFixed(2)}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Order Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Selling Products */}
      {bestSellers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Best Selling Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bestSellers.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <span>{p.qty} sold</span>
                    <span className="font-medium">₱{p.revenue.toFixed(0)}</span>
                    <span className="text-green-500">+₱{p.profit.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment & Delivery Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4" /> Payment Methods</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paymentBreakdown.map(([method, count]) => (
                <div key={method} className="flex justify-between text-sm">
                  <span>{method}</span>
                  <span className="font-medium">{count} orders ({totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(0) : 0}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Delivery vs Pickup</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pickup</span>
                <span className="font-medium">{deliverySplit.pickup} ({totalOrders > 0 ? ((deliverySplit.pickup / totalOrders) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span className="font-medium">{deliverySplit.delivery} ({totalOrders > 0 ? ((deliverySplit.delivery / totalOrders) * 100).toFixed(0) : 0}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-destructive">⚠️ Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-destructive font-medium">{p.inventory} left (min: {p.inventory_min_threshold})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredOrders.slice(0, 10).map(o => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 text-sm p-2 rounded bg-secondary/30">
                <span className="font-mono text-xs">{o.id}</span>
                <span>{o.customer_name}</span>
                <span className="font-medium">₱{Number(o.total_price).toFixed(2)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${o.order_status === 'completed' ? 'bg-green-500/20 text-green-500' : o.order_status === 'cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                  {o.order_status}
                </span>
              </div>
            ))}
            {filteredOrders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
