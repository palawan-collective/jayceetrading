import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminPages() {
  const qc = useQueryClient();
  const { data: pages } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("website_pages").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const togglePublished = async (id: number, val: boolean) => {
    await supabase.from("website_pages").update({ is_published: val }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-pages"] });
    qc.invalidateQueries({ queryKey: ["website-pages"] });
    toast.success("Updated");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Website Pages</h2>
      {pages?.map(p => (
        <Card key={p.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">/{p.slug}</p>
            </div>
            <Switch checked={p.is_published} onCheckedChange={v => togglePublished(p.id, v)} disabled={p.slug === "home"} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
