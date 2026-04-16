import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<any>({});
  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const handleSave = async () => {
    const { id, ...rest } = form;
    const { error } = await supabase.from("business_settings").update(rest).eq("id", 1);
    if (error) return toast.error("Failed to save");
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["business-settings"] });
  };

  return (
    <Card>
      <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Business Name</Label><Input value={form.business_name || ""} onChange={e => setForm((f: any) => ({ ...f, business_name: e.target.value }))} /></div>
        <div><Label>Phone</Label><Input value={form.business_phone || ""} onChange={e => setForm((f: any) => ({ ...f, business_phone: e.target.value }))} /></div>
        <div><Label>Email</Label><Input value={form.business_email || ""} onChange={e => setForm((f: any) => ({ ...f, business_email: e.target.value }))} /></div>
        <div><Label>Address</Label><Input value={form.business_address || ""} onChange={e => setForm((f: any) => ({ ...f, business_address: e.target.value }))} /></div>
        <div><Label>Google Maps URL</Label><Input value={form.google_maps_url || ""} onChange={e => setForm((f: any) => ({ ...f, google_maps_url: e.target.value }))} /></div>
        <div><Label>WhatsApp Number</Label><Input value={form.whatsapp_business_number || ""} onChange={e => setForm((f: any) => ({ ...f, whatsapp_business_number: e.target.value }))} /></div>
        <div><Label>Currency Symbol</Label><Input value={form.currency_symbol || "₱"} onChange={e => setForm((f: any) => ({ ...f, currency_symbol: e.target.value }))} /></div>
        <div><Label>Copyright Text</Label><Input value={form.copyright_text || ""} onChange={e => setForm((f: any) => ({ ...f, copyright_text: e.target.value }))} /></div>
        <div><Label>Logo URL</Label><Input value={form.logo_url || ""} onChange={e => setForm((f: any) => ({ ...f, logo_url: e.target.value }))} /></div>
        <Button onClick={handleSave}>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
