import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSpecials() {
  const qc = useQueryClient();
  const { data: specials } = useQuery({
    queryKey: ["admin-specials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("specials").select("*").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const defaultForm = { title: "", description: "", special_type: "daily", discount_percent: 0, is_active: true, image_url: "" };
  const [form, setForm] = useState(defaultForm);

  const openNew = () => { setEdit(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (s: any) => { setEdit(s); setForm({ ...s, image_url: s.image_url || "", discount_percent: s.discount_percent || 0 }); setDialogOpen(true); };

  const handleSave = async () => {
    const payload = { ...form, image_url: form.image_url || null, discount_percent: form.discount_percent || null };
    if (edit) {
      await supabase.from("specials").update(payload).eq("id", edit.id);
      toast.success("Updated");
    } else {
      await supabase.from("specials").insert(payload);
      toast.success("Created");
    }
    qc.invalidateQueries({ queryKey: ["admin-specials"] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("specials").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-specials"] });
    toast.success("Deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Specials</h2>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Special</Button>
      </div>
      {specials?.map(s => (
        <Card key={s.id}>
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.special_type} · {s.discount_percent}% off · {s.is_active ? "Active" : "Inactive"}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit Special" : "New Special"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Type</Label>
              <Select value={form.special_type} onValueChange={v => setForm(f => ({ ...f, special_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="flash">Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Discount %</Label><Input type="number" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: +e.target.value }))} /></div>
            <Button onClick={handleSave} className="w-full">{edit ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
