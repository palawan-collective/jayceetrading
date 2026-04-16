import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const update: any = { order_status: status };
    if (status === "completed") update.completed_at = new Date().toISOString();
    await supabase.from("orders").update(update).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success(`Order ${status}`);
  };

  const sendWhatsApp = (order: any) => {
    const items = (order.items as any[]).map((i: any) => `${i.name} x${i.quantity}`).join(", ");
    const msg = encodeURIComponent(`Hi ${order.customer_name}! Your order ${order.id} has been received.\n\nItems: ${items}\nTotal: ₱${order.total_price}\n\nThank you!`);
    window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
    supabase.from("orders").update({ whatsapp_sent: true }).eq("id", order.id).then(() => qc.invalidateQueries({ queryKey: ["admin-orders"] }));
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-green-500/20 text-green-500";
      case "cancelled": return "bg-destructive/20 text-destructive";
      case "ready": return "bg-blue-500/20 text-blue-500";
      default: return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Orders ({orders?.length || 0})</h2>
      {orders?.map(o => (
        <Card key={o.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-sm">{o.id}</p>
                <p className="font-medium">{o.customer_name} · {o.customer_phone}</p>
                <p className="text-xs text-muted-foreground">{o.delivery_type} · {o.payment_method} · {new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₱{o.total_price.toFixed(2)}</p>
                <Badge className={statusColor(o.order_status)}>{o.order_status}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => sendWhatsApp(o)}>
                <MessageCircle className="h-3 w-3" /> WhatsApp {o.whatsapp_sent && "✓"}
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(o.id, "ready")}>
                <Clock className="h-3 w-3" /> Ready
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(o.id, "completed")}>
                <CheckCircle className="h-3 w-3" /> Complete
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => updateStatus(o.id, "cancelled")}>
                <XCircle className="h-3 w-3" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!orders || orders.length === 0) && <p className="text-muted-foreground">No orders yet</p>}
    </div>
  );
}
