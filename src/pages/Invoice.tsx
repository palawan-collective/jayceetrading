import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

export default function Invoice() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading: loadingOrder } = useQuery({
    queryKey: ["invoice-order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const { data: settings } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  if (loadingOrder) return <div className="p-8 text-center text-muted-foreground">Loading invoice...</div>;
  if (!order) return <div className="p-8 text-center text-muted-foreground">Order not found.</div>;

  const isPaid = order.payment_status === "paid";
  const items = order.items as any[];
  const currency = settings?.currency_symbol || "₱";
  const showAll = paymentSettings?.invoice_layout !== "show_selected";

  const shouldShowGcash = paymentSettings?.show_gcash_on_invoice && paymentSettings?.gcash_qr_url && (showAll || order.payment_method?.toLowerCase().includes("gcash"));
  const shouldShowPhqr = paymentSettings?.show_phqr_on_invoice && paymentSettings?.phqr_qr_url && (showAll || order.payment_method?.toLowerCase().includes("phqr"));
  const shouldShowBank = paymentSettings?.show_bank_on_invoice && paymentSettings?.bank_name && (showAll || order.payment_method?.toLowerCase().includes("bank"));

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 print:p-0">
      {/* Header */}
      <div className="text-center space-y-1">
        {settings?.logo_url && <img src={settings.logo_url} alt="Logo" className="h-12 mx-auto rounded" />}
        <h1 className="text-xl font-bold">{settings?.business_name || "Invoice"}</h1>
        <p className="text-xs text-muted-foreground">{settings?.business_address}</p>
        <p className="text-xs text-muted-foreground">{settings?.business_phone} · {settings?.business_email}</p>
      </div>

      {/* Order Info */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono text-xs">{order.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Customer</span>
          <span>{order.customer_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Phone</span>
          <span>{order.customer_phone}</span>
        </div>
        {order.customer_email && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{order.customer_email}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span className="capitalize">{order.delivery_type}</span>
        </div>
        {order.delivery_address && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Address</span>
            <span className="text-right max-w-[60%]">{order.delivery_address}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="capitalize">{order.payment_method}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Date</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        <p className="font-semibold text-sm">Items</p>
        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>{currency}{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
          <span>Total</span>
          <span>{currency}{Number(order.total_price).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Status */}
      {isPaid ? (
        <div className="border-2 border-red-500 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <Badge className="bg-green-500/20 text-green-500 text-lg px-4 py-1">PAID</Badge>
          </div>
          <div className="text-center space-y-1 text-sm">
            {order.paid_via && <p>Paid via: <span className="capitalize font-medium">{order.paid_via}</span></p>}
            <p>Amount: <span className="font-bold">{currency}{Number(order.total_price).toFixed(2)}</span></p>
            {order.paid_at && <p>Transaction completed: {new Date(order.paid_at).toLocaleString()}</p>}
            <p className="text-green-500 font-medium pt-1">Thank you for your payment!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <Badge className="bg-yellow-500/20 text-yellow-500 text-base px-3 py-1">PENDING PAYMENT</Badge>
          </div>

          {(shouldShowGcash || shouldShowPhqr || shouldShowBank) && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <p className="text-sm text-center text-muted-foreground">Scan QR code or use bank transfer to complete payment</p>

              {shouldShowGcash && (
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold">GCash</p>
                  <img src={paymentSettings!.gcash_qr_url!} alt="GCash QR" className="max-w-[200px] mx-auto rounded border" />
                </div>
              )}

              {shouldShowPhqr && (
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold">PHQR</p>
                  <img src={paymentSettings!.phqr_qr_url!} alt="PHQR QR" className="max-w-[200px] mx-auto rounded border" />
                </div>
              )}

              {shouldShowBank && (
                <div className="text-center space-y-1 text-sm">
                  <p className="font-semibold">Bank Transfer</p>
                  <p>Bank: {paymentSettings!.bank_name}</p>
                  <p>Account Name: {paymentSettings!.bank_account_name}</p>
                  <p>Account Number: <span className="font-mono">{paymentSettings!.bank_account_number}</span></p>
                  {paymentSettings!.bank_branch && <p>Branch: {paymentSettings!.bank_branch}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Status */}
      <div className="text-center text-xs text-muted-foreground space-y-0.5">
        <p>Order Status: <span className="capitalize font-medium">{order.order_status}</span></p>
        {order.confirmed_at && <p>Confirmed: {new Date(order.confirmed_at).toLocaleString()}</p>}
        {order.ready_at && <p>Ready: {new Date(order.ready_at).toLocaleString()}</p>}
        {order.completed_at && <p>Completed: {new Date(order.completed_at).toLocaleString()}</p>}
      </div>
    </div>
  );
}
