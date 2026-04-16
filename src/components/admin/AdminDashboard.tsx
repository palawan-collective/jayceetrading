import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";

export default function AdminDashboard() {
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

  const totalSales = orders?.reduce((s, o) => s + o.total_price, 0) || 0;
  const totalProfit = orders?.reduce((s, o) => s + o.profit, 0) || 0;
  const totalOrders = orders?.length || 0;
  const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
  const lowStock = products?.filter(p => p.inventory <= p.inventory_min_threshold) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Sales</p><p className="text-xl font-bold">₱{totalSales.toFixed(2)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div>
            <div><p className="text-sm text-muted-foreground">Total Profit</p><p className="text-xl font-bold">₱{totalProfit.toFixed(2)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10"><ShoppingCart className="h-5 w-5 text-blue-500" /></div>
            <div><p className="text-sm text-muted-foreground">Orders</p><p className="text-xl font-bold">{totalOrders}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/10"><Package className="h-5 w-5 text-orange-500" /></div>
            <div><p className="text-sm text-muted-foreground">Avg Order</p><p className="text-xl font-bold">₱{avgOrder.toFixed(2)}</p></div>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-destructive">⚠️ Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-destructive font-medium">{p.inventory} left</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders?.slice(0, 10).map(o => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 text-sm p-2 rounded bg-secondary/30">
                <span className="font-mono text-xs">{o.id}</span>
                <span>{o.customer_name}</span>
                <span className="font-medium">₱{o.total_price.toFixed(2)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${o.order_status === 'completed' ? 'bg-green-500/20 text-green-500' : o.order_status === 'cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                  {o.order_status}
                </span>
              </div>
            ))}
            {(!orders || orders.length === 0) && <p className="text-sm text-muted-foreground">No orders yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
