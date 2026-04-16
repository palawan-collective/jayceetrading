import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPayments() {
  const qc = useQueryClient();
  const { data: methods } = useQuery({
    queryKey: ["all-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const toggle = async (id: number, val: boolean) => {
    await supabase.from("payment_methods").update({ is_enabled: val }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["all-payment-methods"] });
    qc.invalidateQueries({ queryKey: ["payment-methods"] });
  };

  const updateQR = async (id: number, url: string) => {
    await supabase.from("payment_methods").update({ qr_code_url: url || null }).eq("id", id);
    toast.success("QR code updated");
    qc.invalidateQueries({ queryKey: ["all-payment-methods"] });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Payment Methods</h2>
      {methods?.map(m => (
        <Card key={m.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{m.method_name}</span>
              <Switch checked={m.is_enabled} onCheckedChange={v => toggle(m.id, v)} />
            </div>
            <div>
              <Label className="text-xs">QR Code URL</Label>
              <div className="flex gap-2">
                <Input defaultValue={m.qr_code_url || ""} placeholder="https://..." onBlur={e => updateQR(m.id, e.target.value)} className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
