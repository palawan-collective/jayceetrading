import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, CheckCircle, XCircle, Clock, Mail, Search, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useBusinessSettings } from "@/hooks/use-settings";

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: settings } = useBusinessSettings();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const matchStatus = statusFilter === "all" || o.order_status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || o.customer_name.toLowerCase().includes(q) || o.customer_phone.includes(q) || o.id.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    const update: any = { order_status: status };
    if (status === "confirmed") update.confirmed_at = new Date().toISOString();
    if (status === "ready") update.ready_at = new Date().toISOString();
    if (status === "completed") update.completed_at = new Date().toISOString();
    if (status === "cancelled") {
      const order = orders?.find(o => o.id === id);
      if (order) {
        const items = order.items as any[];
        for (const item of items) {
          const { data: prod } = await supabase.from("products").select("inventory").eq("id", item.id).single();
          if (prod) await supabase.from("products").update({ inventory: prod.inventory + item.quantity }).eq("id", item.id);
        }
      }
    }
    await supabase.from("orders").update(update).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success(`Order ${status}`);
  };

  const fillTemplate = (template: string, order: any) => {
    return template
      .replace("{name}", order.customer_name)
      .replace("{id}", order.id)
      .replace("{total}", `₱${order.total_price}`)
      .replace("{delivery_type}", order.delivery_type)
      .replace("{address}", order.delivery_address || settings?.business_address || "our store");
  };

  const sendWhatsApp = (order: any, type: "confirm" | "ready") => {
    const template = type === "confirm"
      ? (settings?.confirmation_whatsapp_template || "Hello {name}, your order #{id} has been CONFIRMED. Total: {total}.")
      : (settings?.ready_whatsapp_template || "Hello {name}, your order #{id} is READY for {delivery_type}.");
    const msg = encodeURIComponent(fillTemplate(template, order));
    window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
    const col = type === "confirm" ? "whatsapp_confirmation_sent" : "whatsapp_ready_sent";
    supabase.from("orders").update({ [col]: true }).eq("id", order.id).then(() => qc.invalidateQueries({ queryKey: ["admin-orders"] }));
  };

  const sendEmail = (order: any, type: "confirm" | "ready") => {
    const template = type === "confirm"
      ? (settings?.confirmation_email_template || "Dear {name}, your order #{id} has been confirmed. Total: {total}.")
      : (settings?.ready_email_template || "Dear {name}, your order #{id} is now READY for {delivery_type}.");
    const subject = type === "confirm" ? `Order ${order.id} Confirmed` : `Order ${order.id} Ready`;
    const body = encodeURIComponent(fillTemplate(template, order));
    window.open(`mailto:${order.customer_email}?subject=${encodeURIComponent(subject)}&body=${body}`, "_blank");
    const col = type === "confirm" ? "email_confirmation_sent" : "email_ready_sent";
    supabase.from("orders").update({ [col]: true }).eq("id", order.id).then(() => qc.invalidateQueries({ queryKey: ["admin-orders"] }));
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-green-500/20 text-green-500";
      case "cancelled": return "bg-destructive/20 text-destructive";
      case "ready": return "bg-blue-500/20 text-blue-500";
      case "confirmed": return "bg-yellow-500/20 text-yellow-500";
      default: return "bg-primary/20 text-primary";
    }
  };

  const statusCounts = useMemo(() => {
    if (!orders) return {};
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.order_status] = (counts[o.order_status] || 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Orders ({filtered.length})</h2>
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "ready", "completed", "cancelled"].map(s => (
          <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="text-xs capitalize">
            {s} {s !== "all" && statusCounts[s] ? `(${statusCounts[s]})` : s === "all" ? `(${orders?.length || 0})` : ""}
          </Button>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, or order ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.map(o => (
        <Card key={o.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs truncate">{o.id}</p>
                <p className="font-medium">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {o.customer_phone}
                  {o.customer_email && <> · <Mail className="h-3 w-3" /> {o.customer_email}</>}
                </p>
                <p className="text-xs text-muted-foreground">{o.delivery_type} · {o.payment_method} · {new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="font-bold">₱{Number(o.total_price).toFixed(2)}</p>
                  <p className="text-xs text-green-500">+₱{Number(o.profit).toFixed(2)}</p>
                  <Badge className={statusColor(o.order_status)}>{o.order_status}</Badge>
                </div>
                {expandedOrder === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>

            {expandedOrder === o.id && (
              <div className="space-y-3 border-t border-border pt-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Items:</p>
                  {(o.items as any[]).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1">
                    <span>Total</span><span>₱{Number(o.total_price).toFixed(2)}</span>
                  </div>
                </div>
                {o.delivery_address && <p className="text-sm"><span className="font-semibold">Address:</span> {o.delivery_address}</p>}

                {/* Communication Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => sendWhatsApp(o, "confirm")} disabled={o.whatsapp_confirmation_sent}>
                    <MessageCircle className="h-3 w-3" /> WA Confirm {o.whatsapp_confirmation_sent && "✓"}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => sendWhatsApp(o, "ready")} disabled={o.whatsapp_ready_sent}>
                    <MessageCircle className="h-3 w-3" /> WA Ready {o.whatsapp_ready_sent && "✓"}
                  </Button>
                  {o.customer_email && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => sendEmail(o, "confirm")} disabled={o.email_confirmation_sent}>
                        <Mail className="h-3 w-3" /> Email Confirm {o.email_confirmation_sent && "✓"}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => sendEmail(o, "ready")} disabled={o.email_ready_sent}>
                        <Mail className="h-3 w-3" /> Email Ready {o.email_ready_sent && "✓"}
                      </Button>
                    </>
                  )}
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {o.order_status === "pending" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => updateStatus(o.id, "confirmed")}><CheckCircle className="h-3 w-3" /> Confirm</Button>
                  )}
                  {(o.order_status === "confirmed" || o.order_status === "pending") && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => updateStatus(o.id, "ready")}><Clock className="h-3 w-3" /> Ready</Button>
                  )}
                  {o.order_status !== "completed" && o.order_status !== "cancelled" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => updateStatus(o.id, "completed")}><CheckCircle className="h-3 w-3" /> Complete</Button>
                  )}
                  {o.order_status !== "cancelled" && o.order_status !== "completed" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive" onClick={() => updateStatus(o.id, "cancelled")}><XCircle className="h-3 w-3" /> Cancel</Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  {o.confirmed_at && <p>Confirmed: {new Date(o.confirmed_at).toLocaleString()}</p>}
                  {o.ready_at && <p>Ready: {new Date(o.ready_at).toLocaleString()}</p>}
                  {o.completed_at && <p>Completed: {new Date(o.completed_at).toLocaleString()}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No orders found</p>}
    </div>
  );
}
