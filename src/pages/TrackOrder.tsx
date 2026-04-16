import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, ChevronDown, ChevronUp, Star, Gift, CreditCard } from "lucide-react";
import { useBusinessSettings } from "@/hooks/use-settings";
import { TIER_COLORS, REWARD_THRESHOLDS, getNextRewardThreshold } from "@/lib/loyalty-utils";

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
  return <Badge className={`${colors} border text-xs capitalize`}>{status}</Badge>;
}

export default function TrackOrder() {
  const { data: business } = useBusinessSettings();
  const currency = business?.currency_symbol || "₱";

  const [invoiceInput, setInvoiceInput] = useState("");
  const [searchInvoice, setSearchInvoice] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loyaltyPhone, setLoyaltyPhone] = useState("");
  const [searchLoyaltyPhone, setSearchLoyaltyPhone] = useState<string | null>(null);

  const savedProfile = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();
  const savedPhone = savedProfile?.phone || null;

  // Invoice lookup
  const { data: lookedUpOrder, isLoading: lookupLoading } = useQuery({
    queryKey: ["track-order", searchInvoice],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("invoice_number", searchInvoice!).single();
      return data || null;
    },
    enabled: !!searchInvoice,
  });

  // Order history
  const { data: orderHistory } = useQuery({
    queryKey: ["order-history", savedPhone],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("customer_phone", savedPhone!).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!savedPhone,
  });

  // Loyalty card lookup
  const phoneToLookup = searchLoyaltyPhone || savedPhone;
  const { data: loyaltyCustomer } = useQuery({
    queryKey: ["loyalty-card", phoneToLookup],
    queryFn: async () => {
      const { data } = await supabase.from("loyalty_customers").select("*").eq("phone", phoneToLookup!).maybeSingle();
      return data;
    },
    enabled: !!phoneToLookup,
  });

  const { data: loyaltyRewards } = useQuery({
    queryKey: ["loyalty-rewards", loyaltyCustomer?.id],
    queryFn: async () => {
      const { data } = await supabase.from("loyalty_rewards").select("*").eq("customer_id", loyaltyCustomer!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!loyaltyCustomer?.id,
  });

  const { data: stampLogs } = useQuery({
    queryKey: ["loyalty-logs", loyaltyCustomer?.id],
    queryFn: async () => {
      const { data } = await supabase.from("loyalty_stamp_log").select("*").eq("customer_id", loyaltyCustomer!.id).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!loyaltyCustomer?.id,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceInput.trim()) setSearchInvoice(invoiceInput.trim().toUpperCase());
  };

  const handleLoyaltySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (loyaltyPhone.trim()) setSearchLoyaltyPhone(loyaltyPhone.trim());
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

  // Loyalty card rendering
  const nextReward = loyaltyCustomer ? getNextRewardThreshold(loyaltyCustomer.stamp_count || 0) : null;
  const stampCount = loyaltyCustomer?.stamp_count || 0;
  const nextThreshold = nextReward?.stamps || REWARD_THRESHOLDS[REWARD_THRESHOLDS.length - 1].stamps;
  const remaining = Math.max(0, nextThreshold - stampCount);
  const progressPercent = nextThreshold > 0 ? Math.min(100, (stampCount / nextThreshold) * 100) : 100;
  const unclaimedRewards = loyaltyRewards?.filter(r => r.status === "unclaimed" && !r.is_claimed && (!r.expires_at || new Date(r.expires_at) > new Date())) || [];

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
            <Input value={invoiceInput} onChange={e => setInvoiceInput(e.target.value)} placeholder="INV-2026-XXXX" className="flex-1 font-mono" />
            <Button type="submit" disabled={lookupLoading} className="shrink-0 gap-2"><Search className="h-4 w-4" /> Check</Button>
          </form>
        </CardContent>
      </Card>

      {searchInvoice && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            {lookupLoading ? (
              <p className="text-center text-muted-foreground text-sm">Looking up order...</p>
            ) : lookedUpOrder ? renderOrderDetail(lookedUpOrder) : (
              <p className="text-center text-muted-foreground text-sm">No order found with that invoice number.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loyalty Card Section */}
      <div className="mt-8 mb-6">
        <div className="text-center mb-4">
          <CreditCard className="h-8 w-8 mx-auto text-amber-500 mb-1" />
          <h2 className="text-lg font-semibold">Your Loyalty Card</h2>
        </div>

        {!phoneToLookup && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleLoyaltySearch} className="flex gap-2">
                <Input value={loyaltyPhone} onChange={e => setLoyaltyPhone(e.target.value)} placeholder="Your phone number" className="flex-1" />
                <Button type="submit" className="shrink-0 gap-2"><Search className="h-4 w-4" /> View</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {phoneToLookup && !loyaltyCustomer && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground text-sm">No loyalty card found for this phone number.</p>
              {!savedPhone && (
                <form onSubmit={handleLoyaltySearch} className="flex gap-2 mt-3">
                  <Input value={loyaltyPhone} onChange={e => setLoyaltyPhone(e.target.value)} placeholder="Try another number" className="flex-1" />
                  <Button type="submit" className="shrink-0">Search</Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {loyaltyCustomer && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{loyaltyCustomer.name || "Customer"}</p>
                  <p className="text-xs text-muted-foreground">{loyaltyCustomer.phone}</p>
                </div>
                <Badge className={`${TIER_COLORS[loyaltyCustomer.tier || "regular"]} border text-xs capitalize`}>
                  {loyaltyCustomer.tier || "regular"}
                </Badge>
              </div>

              {/* Stamp dots */}
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Array.from({ length: nextThreshold }, (_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                      i < stampCount ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                    }`}>
                      {i < stampCount ? "★" : ""}
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-secondary rounded-full h-2 mb-1">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {remaining > 0 ? `${remaining} more stamp${remaining !== 1 ? "s" : ""} to next reward` : "Maximum rewards reached!"}
                  {nextReward && <span className="ml-1">({nextReward.label})</span>}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-accent/30 rounded-lg p-2">
                  <p className="text-lg font-bold">{loyaltyCustomer.lifetime_stamps || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Lifetime Stamps</p>
                </div>
                <div className="bg-accent/30 rounded-lg p-2">
                  <p className="text-lg font-bold">{currency}{Number(loyaltyCustomer.total_spent || 0).toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">Total Spent</p>
                </div>
              </div>

              {/* Unclaimed rewards */}
              {unclaimedRewards.length > 0 && (
                <div className="space-y-2">
                  {unclaimedRewards.map(r => (
                    <div key={r.id} className="border border-amber-300 bg-amber-500/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold">🎁 Reward ready!</span>
                      </div>
                      <p className="font-mono text-lg font-bold tracking-wider">{r.reward_code}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.reward_type?.replace("_", " ")}</p>
                      {r.expires_at && <p className="text-xs text-muted-foreground">Expires {new Date(r.expires_at).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Recent stamp history */}
              {stampLogs && stampLogs.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-1">Recent Stamps</p>
                  {stampLogs.map(l => (
                    <div key={l.id} className="flex justify-between text-xs py-1.5 border-b border-border last:border-0">
                      <span>{l.invoice_number} · {new Date(l.created_at!).toLocaleDateString()}</span>
                      <span className="font-medium text-primary">+{l.stamps_earned}</span>
                    </div>
                  ))}
                </div>
              )}

              {!savedPhone && (
                <form onSubmit={handleLoyaltySearch} className="flex gap-2 mt-2">
                  <Input value={loyaltyPhone} onChange={e => setLoyaltyPhone(e.target.value)} placeholder="Try another number" className="flex-1" />
                  <Button type="submit" size="sm">Search</Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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
