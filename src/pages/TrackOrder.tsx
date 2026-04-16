import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useBusinessSettings } from "@/hooks/use-settings";

const STORAGE_KEY = "jaycee_customer_profile";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 border-yellow-300",
  confirmed: "bg-blue-500/15 text-blue-600 border-blue-300",
  ready: "bg-green-500/15 text-green-600 border-green-300",
  completed: "bg-secondary text-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <Badge className={`${colors} border text-xs capitalize`}>
      {status}
    </Badge>
  );
}

export default function TrackOrder() {
  const { data: business } = useBusinessSettings();
  const currency = business?.currency_symbol || "₱";

  const [invoiceInput, setInvoiceInput] = useState("");
  const [searchInvoice, setSearchInvoice] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Get saved phone from localStorage for order history
  const savedProfile = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();
  const savedPhone = savedProfile?.phone || null;

  // Invoice lookup query
  const { data: lookedUpOrder, isLoading: lookupLoading, error: lookupError } = useQuery({
    queryKey: ["track-order", searchInvoice],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("invoice_number", searchInvoice!)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!searchInvoice,
  });

  // Order history query (by phone)
  const { data: orderHistory } = useQuery({
    queryKey: ["order-history", savedPhone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_phone", savedPhone!)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) return [];
      return data;
    },
    enabled: !!savedPhone,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceInput.trim()) {
      setSearchInvoice(invoiceInput.trim().toUpperCase());
    }
  };

  const renderOrderDetail = (order: any) => {
    const items = order.items as any[];
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium">{order.invoice_number || order.id}</span>
          <StatusBadge status={order.order_status} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
          <span>Time: {new Date(order.created_at).toLocaleTimeString()}</span>
          <span className="capitalize">Delivery: {order.delivery_type}</span>
          <span className="capitalize">Payment: {order.payment_method}</span>
        </div>
        {/* Bill To */}
        <div className="border-t border-border pt-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bill To</p>
          <p className="text-sm font-semibold">{order.customer_name}</p>
          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
          {order.customer_email && <p className="text-xs text-muted-foreground">{order.customer_email}</p>}
        </div>
        <div className="border-t border-border pt-2 space-y-1">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="min-w-0 truncate flex-1">{item.quantity}× {item.name}</span>
              <span className="shrink-0 tabular-nums ml-2">{currency}{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-bold text-sm">
          <span>Grand Total</span>
          <span className="tabular-nums">{currency}{Number(order.total_price).toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Lookup Section */}
      <div className="text-center mb-6">
        <Package className="h-10 w-10 mx-auto text-primary mb-2" />
        <h1 className="text-2xl font-bold">Track Your Order</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your invoice number to check your order status</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={invoiceInput}
              onChange={e => setInvoiceInput(e.target.value)}
              placeholder="INV-2026-XXXX"
              className="flex-1 font-mono"
            />
            <Button type="submit" disabled={lookupLoading} className="shrink-0 gap-2">
              <Search className="h-4 w-4" /> Check
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lookup Result */}
      {searchInvoice && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            {lookupLoading ? (
              <p className="text-center text-muted-foreground text-sm">Looking up order...</p>
            ) : lookedUpOrder ? (
              renderOrderDetail(lookedUpOrder)
            ) : (
              <p className="text-center text-muted-foreground text-sm">No order found with that invoice number.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      {savedPhone && orderHistory && orderHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Your Recent Orders</h2>
          <div className="space-y-2">
            {orderHistory.map((order: any) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <Card key={order.id} className="overflow-hidden">
                  <button
                    className="w-full text-left p-3 sm:p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs">{order.invoice_number || order.id}</span>
                        <StatusBadge status={order.order_status} />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="font-medium tabular-nums">{currency}{Number(order.total_price).toFixed(2)}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border p-3 sm:p-4">
                      {renderOrderDetail(order)}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
