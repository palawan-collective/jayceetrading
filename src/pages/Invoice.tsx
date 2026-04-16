import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Printer } from "lucide-react";

export default function Invoice() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
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

  if (isLoading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">Loading invoice...</div>;
  if (!order) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">Order not found.</div>;

  const isPaid = order.payment_status === "paid";
  const items = order.items as any[];
  const currency = settings?.currency_symbol || "₱";
  const showAll = (paymentSettings as any)?.invoice_layout !== "show_selected";
  const pm = order.payment_method?.toLowerCase() || "";

  const shouldShowGcash = paymentSettings?.show_gcash_on_invoice && paymentSettings?.gcash_qr_url && (showAll || pm.includes("gcash"));
  const shouldShowPhqr = paymentSettings?.show_phqr_on_invoice && paymentSettings?.phqr_qr_url && (showAll || pm.includes("phqr"));
  const shouldShowBank = paymentSettings?.show_bank_on_invoice && paymentSettings?.bank_name && (showAll || pm.includes("bank"));
  const shouldShowCod = (paymentSettings as any)?.show_cod_on_invoice && (showAll || pm.includes("cod") || pm.includes("cash on delivery"));
  const shouldShowCop = (paymentSettings as any)?.show_cop_on_invoice && (showAll || pm.includes("pickup") || pm.includes("cash on pickup"));

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 print:bg-white print:py-0">
      {/* Print button */}
      <div className="max-w-2xl mx-auto mb-4 print:hidden">
        <Button variant="outline" onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Print Invoice
        </Button>
      </div>

      {/* Invoice Paper */}
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* Header */}
        <div className="border-b-2 border-orange-500 p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {settings?.logo_url && (
                <img src={settings.logo_url} alt="Logo" className="h-14 w-14 rounded-lg object-cover" />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{settings?.business_name || "Business"}</h1>
                <p className="text-xs text-gray-500">{settings?.business_address}</p>
                <p className="text-xs text-gray-500">{settings?.business_phone} · {settings?.business_email}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900">INVOICE</p>
              <p className="text-xs text-gray-500 font-mono">{(order as any).invoice_number || order.id}</p>
            </div>
          </div>
        </div>

        {/* Invoice Details & Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 border-b border-gray-200">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
            <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
            <p className="text-xs text-gray-600">{order.customer_phone}</p>
            {order.customer_email && <p className="text-xs text-gray-600">{order.customer_email}</p>}
            {order.delivery_address && <p className="text-xs text-gray-600 mt-1">{order.delivery_address}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Invoice Details</p>
            <p className="text-xs text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-600">Time: {new Date(order.created_at).toLocaleTimeString()}</p>
            <p className="text-xs text-gray-600">Order: {order.id}</p>
            <p className="text-xs text-gray-600 capitalize">Delivery: {order.delivery_type}</p>
            <p className="text-xs text-gray-600 capitalize">Payment: {order.payment_method}</p>
            <div className="mt-2">
              {isPaid ? (
                <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs">PAID</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 text-xs">PENDING</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 border-b border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Qty</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Item</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Unit Price</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">{item.quantity}</td>
                  <td className="py-2 text-gray-900 font-medium">{item.name}</td>
                  <td className="py-2 text-right text-gray-700">{currency}{Number(item.price).toFixed(2)}</td>
                  <td className="py-2 text-right text-gray-900 font-medium">{currency}{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-end space-y-1">
            <div className="flex justify-between w-full max-w-xs text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">{currency}{Number(order.subtotal || order.total_price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-sm border-t-2 border-gray-900 pt-2 mt-2">
              <span className="font-bold text-gray-900 text-base">Grand Total</span>
              <span className="font-bold text-gray-900 text-base">{currency}{Number(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {isPaid ? (
          <div className="p-6">
            <div className="border-2 border-red-400 rounded-lg p-5 bg-green-50">
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="h-7 w-7 text-green-600" />
                <span className="text-xl font-bold text-green-700">PAYMENT CONFIRMED</span>
              </div>
              <div className="text-center space-y-1 text-sm text-gray-700">
                {order.paid_via && <p>Paid via: <span className="font-semibold capitalize">{order.paid_via}</span></p>}
                <p>Amount: <span className="font-bold text-green-700">{currency}{Number(order.total_price).toFixed(2)}</span></p>
                {order.paid_at && <p className="text-xs text-gray-500">Transaction completed: {new Date(order.paid_at).toLocaleString()}</p>}
                <p className="text-green-600 font-medium pt-2">Thank you for your payment!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-700">PENDING PAYMENT</span>
            </div>

            {(shouldShowGcash || shouldShowPhqr || shouldShowBank || shouldShowCod || shouldShowCop) && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                <p className="text-sm text-center text-gray-500 font-medium">Payment Instructions</p>

                {shouldShowGcash && (
                  <div className="text-center space-y-2 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold text-blue-600">GCash</p>
                    <img src={paymentSettings!.gcash_qr_url!} alt="GCash QR" className="max-w-[180px] mx-auto rounded border border-gray-300" />
                    <p className="text-xs text-gray-500">Scan to pay via GCash</p>
                  </div>
                )}

                {shouldShowPhqr && (
                  <div className="text-center space-y-2 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold text-blue-600">PHQR</p>
                    <img src={paymentSettings!.phqr_qr_url!} alt="PHQR QR" className="max-w-[180px] mx-auto rounded border border-gray-300" />
                    <p className="text-xs text-gray-500">Scan to pay via PHQR</p>
                  </div>
                )}

                {shouldShowBank && (
                  <div className="text-center space-y-1 text-sm border-b border-gray-200 pb-4">
                    <p className="font-bold text-gray-700">Bank Transfer</p>
                    <p className="text-gray-600">Bank: <span className="font-medium">{paymentSettings!.bank_name}</span></p>
                    <p className="text-gray-600">Account Name: <span className="font-medium">{paymentSettings!.bank_account_name}</span></p>
                    <p className="text-gray-600">Account Number: <span className="font-mono font-medium">{paymentSettings!.bank_account_number}</span></p>
                    {paymentSettings!.bank_branch && <p className="text-gray-600">Branch: {paymentSettings!.bank_branch}</p>}
                  </div>
                )}

                {shouldShowCod && (
                  <div className="text-center space-y-1 text-sm border-b border-gray-200 pb-4 last:border-b-0">
                    <p className="font-bold text-gray-700">Cash on Delivery</p>
                    <p className="text-gray-600">{(paymentSettings as any)?.cod_instructions || "Please prepare the exact amount for Cash on Delivery."}</p>
                  </div>
                )}

                {shouldShowCop && (
                  <div className="text-center space-y-1 text-sm">
                    <p className="font-bold text-gray-700">Cash on Pickup</p>
                    <p className="text-gray-600">{(paymentSettings as any)?.cop_instructions || "Please pay at the counter upon pickup."}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Status Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 text-center text-xs text-gray-400 space-y-0.5">
          <p>Order Status: <span className="capitalize font-medium text-gray-600">{order.order_status}</span></p>
          {order.confirmed_at && <p>Confirmed: {new Date(order.confirmed_at).toLocaleString()}</p>}
          {order.ready_at && <p>Ready: {new Date(order.ready_at).toLocaleString()}</p>}
          {order.completed_at && <p>Completed: {new Date(order.completed_at).toLocaleString()}</p>}
        </div>
      </div>
    </div>
  );
}
