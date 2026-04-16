import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminProducts() {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("category").order("name");
      if (error) throw error;
      return data;
    },
  });

  const [editProduct, setEditProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const defaultForm = { name: "", category: "General", price: 0, cost_of_goods: 0, unit: "piece", inventory: 0, inventory_min_threshold: 5, image_url: "", is_available: true, is_special: false, special_price: 0 };
  const [form, setForm] = useState(defaultForm);

  const openNew = () => { setEditProduct(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditProduct(p); setForm({ ...p, special_price: p.special_price || 0, image_url: p.image_url || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    const payload = { ...form, special_price: form.is_special ? form.special_price : null, image_url: form.image_url || null };
    if (editProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
      if (error) return toast.error("Failed to update");
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast.error("Failed to create");
      toast.success("Product created");
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error("Failed to delete");
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const toggleAvailable = async (id: string, val: boolean) => {
    await supabase.from("products").update({ is_available: val }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Products ({products?.length || 0})</h2>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      <div className="space-y-2">
        {products?.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium">{p.name} {p.is_special && <span className="text-primary text-xs">★ SPECIAL</span>}</p>
                <p className="text-xs text-muted-foreground">{p.category} · ₱{p.cost_of_goods} cost · ₱{p.price} sell · {((1 - p.cost_of_goods / p.price) * 100).toFixed(0)}% margin</p>
              </div>
              <div className="text-sm">Stock: <span className={p.inventory <= p.inventory_min_threshold ? "text-destructive font-bold" : ""}>{p.inventory}</span></div>
              <Switch checked={p.is_available} onCheckedChange={v => toggleAvailable(p.id, v)} />
              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cost</Label><Input type="number" value={form.cost_of_goods} onChange={e => setForm(f => ({ ...f, cost_of_goods: +e.target.value }))} /></div>
              <div><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
              <div><Label>Inventory</Label><Input type="number" value={form.inventory} onChange={e => setForm(f => ({ ...f, inventory: +e.target.value }))} /></div>
            </div>
            <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_special} onCheckedChange={v => setForm(f => ({ ...f, is_special: v }))} /><Label>Special</Label></div>
            {form.is_special && <div><Label>Special Price</Label><Input type="number" value={form.special_price} onChange={e => setForm(f => ({ ...f, special_price: +e.target.value }))} /></div>}
            <Button onClick={handleSave} className="w-full">{editProduct ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
