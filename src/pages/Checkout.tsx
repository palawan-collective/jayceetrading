import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/lib/cart-store";
import { useBusinessSettings, usePaymentMethods } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, QrCode } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+63", country: "PH" },
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
  { code: "+81", country: "JP" },
  { code: "+82", country: "KR" },
  { code: "+65", country: "SG" },
  { code: "+60", country: "MY" },
  { code: "+66", country: "TH" },
  { code: "+84", country: "VN" },
  { code: "+91", country: "IN" },
  { code: "+86", country: "CN" },
  { code: "+971", country: "AE" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { data: business } = useBusinessSettings();
  const { data: paymentMethods } = usePaymentMethods();
  const currency = business?.currency_symbol || "₱";

  const [form, setForm] = useState({
    name: "", countryCode: "+63", phone: "", email: "", deliveryType: "pickup", address: "", paymentMethod: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedPM = paymentMethods?.find(pm => pm.method_name === form.paymentMethod);
  const fullPhone = `${form.countryCode}${form.phone}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.phone.trim()) return toast.error("Phone is required");
    if (form.deliveryType === "delivery" && !form.address.trim()) return toast.error("Address required for delivery");
    if (items.length === 0) return toast.error("Cart is empty");

    setSubmitting(true);
    const subtotal = getTotal();
    const totalCost = items.reduce((s, i) => s + i.cost * i.quantity, 0);
    const orderId = `ORD-${Date.now()}`;

    // Reduce inventory
    for (const item of items) {
      const { data: prod } = await supabase.from("products").select("inventory").eq("id", item.id).single();
      if (prod) {
        await supabase.from("products").update({ inventory: Math.max(0, prod.inventory - item.quantity) }).eq("id", item.id);
      }
    }

    const { error } = await supabase.from("orders").insert({
      id: orderId,
      customer_name: form.name.trim(),
      customer_phone: fullPhone,
      customer_email: form.email.trim() || null,
      delivery_type: form.deliveryType,
      delivery_address: form.deliveryType === "delivery" ? form.address.trim() : null,
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, cost: i.cost, quantity: i.quantity, unit: i.unit })),
      subtotal,
      total_price: subtotal,
      profit: subtotal - totalCost,
      payment_method: form.paymentMethod,
      payment_status: "pending",
      order_status: "pending",
    });

    if (error) {
      toast.error("Order failed");
      setSubmitting(false);
      return;
    }

    clearCart();
    toast.success(`Order ${orderId} placed!`);
    navigate("/");
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => navigate("/")}>Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate("/")}>
        <ArrowLeft className="h-4 w-4" /> Back to Menu
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {items.map(i => (
              <div key={i.id} className="flex justify-between text-sm">
                <span>{i.name} × {i.quantity}</span>
                <span>{currency}{(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{currency}{getTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div>
              <Label>Phone *</Label>
              <div className="flex gap-2">
                <Select value={form.countryCode} onValueChange={v => setForm(f => ({ ...f, countryCode: v }))}>
                  <SelectTrigger className="w-24 shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} {c.country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9XX XXX XXXX" className="flex-1" />
              </div>
            </div>
            <div><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="For order updates" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={form.deliveryType} onValueChange={v => setForm(f => ({ ...f, deliveryType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
            {form.deliveryType === "delivery" && (
              <div><Label>Address *</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Delivery address" /></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods?.map(pm => (
                  <SelectItem key={pm.id} value={pm.method_name}>{pm.method_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPM?.qr_code_url && (
              <div className="border rounded-lg p-4 text-center space-y-2">
                <QrCode className="h-6 w-6 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Scan to pay with {selectedPM.method_name}</p>
                <img src={selectedPM.qr_code_url} alt="QR Code" className="mx-auto max-w-[200px] rounded" />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Placing Order..." : `Place Order — ${currency}${getTotal().toFixed(2)}`}
        </Button>
      </form>
    </div>
  );
}
