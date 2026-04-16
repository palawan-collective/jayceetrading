import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function AdminProducts() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("category").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: units } = useQuery({
    queryKey: ["admin-units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*").order("label");
      if (error) throw error;
      return data;
    },
  });

  const [editProduct, setEditProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const defaultForm = { name: "", category: "General", price: 0, cost_of_goods: 0, unit: "piece", inventory: 0, inventory_min_threshold: 5, image_url: "", is_available: true, is_special: false, special_price: 0 };
  const [form, setForm] = useState(defaultForm);

  const openNew = () => { setEditProduct(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditProduct(p); setForm({ ...p, special_price: p.special_price || 0, image_url: p.image_url || "" }); setDialogOpen(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

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

  const getMarginColor = (cost: number, price: number) => {
    if (price <= 0) return "text-muted-foreground";
    const margin = ((price - cost) / price) * 100;
    if (margin > 40) return "text-green-500";
    if (margin >= 20) return "text-yellow-500";
    return "text-destructive";
  };

  const getMarginPercent = (cost: number, price: number) => {
    if (price <= 0) return "0";
    return ((1 - cost / price) * 100).toFixed(0);
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
            <CardContent className="p-3 flex flex-wrap items-center gap-3">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-[150px]">
                <p className="font-medium text-sm">{p.name} {p.is_special && <span className="text-primary text-xs">★</span>}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category} · ₱{Number(p.cost_of_goods).toFixed(0)} → ₱{Number(p.price).toFixed(0)} ·{" "}
                  <span className={getMarginColor(Number(p.cost_of_goods), Number(p.price))}>
                    {getMarginPercent(Number(p.cost_of_goods), Number(p.price))}% margin
                  </span>
                </p>
              </div>
              <div className="text-xs">
                Stock: <span className={p.inventory <= p.inventory_min_threshold ? "text-destructive font-bold" : ""}>{p.inventory}</span>
              </div>
              <Switch checked={p.is_available} onCheckedChange={v => toggleAvailable(p.id, v)} />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>

            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cost</Label><Input type="number" value={form.cost_of_goods} onChange={e => setForm(f => ({ ...f, cost_of_goods: +e.target.value }))} /></div>
              <div><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {units?.map(u => (
                      <SelectItem key={u.id} value={u.value}>{u.label} ({u.value})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Inventory</Label><Input type="number" value={form.inventory} onChange={e => setForm(f => ({ ...f, inventory: +e.target.value }))} /></div>
            </div>

            <div><Label>Min Stock Threshold</Label><Input type="number" value={form.inventory_min_threshold} onChange={e => setForm(f => ({ ...f, inventory_min_threshold: +e.target.value }))} /></div>

            <div>
              <Label>Product Image</Label>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex items-center gap-2 mt-1">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                  <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Image"}
                </Button>
                {form.image_url && <img src={form.image_url} alt="Preview" className="w-10 h-10 rounded object-cover" />}
              </div>
            </div>

            <div className="flex items-center gap-2"><Switch checked={form.is_available} onCheckedChange={v => setForm(f => ({ ...f, is_available: v }))} /><Label>Available</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_special} onCheckedChange={v => setForm(f => ({ ...f, is_special: v }))} /><Label>Special</Label></div>
            {form.is_special && <div><Label>Special Price</Label><Input type="number" value={form.special_price} onChange={e => setForm(f => ({ ...f, special_price: +e.target.value }))} /></div>}
            <Button onClick={handleSave} className="w-full">{editProduct ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
