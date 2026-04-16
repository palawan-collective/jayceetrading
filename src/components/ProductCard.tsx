import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useBusinessSettings } from "@/hooks/use-settings";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  product: Tables<"products">;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const { data: business } = useBusinessSettings();
  const currency = business?.currency_symbol || "₱";

  const effectivePrice = product.is_special && product.special_price ? product.special_price : product.price;
  const outOfStock = product.inventory <= 0 || !product.is_available;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] bg-secondary/50 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {product.is_special && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground gap-1">
            <Sparkles className="h-3 w-3" /> Special
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.category} · {product.unit}</p>
          </div>
          <div className="text-right shrink-0">
            {product.is_special && product.special_price ? (
              <>
                <p className="text-lg font-bold text-primary">{currency}{product.special_price}</p>
                <p className="text-xs text-muted-foreground line-through">{currency}{product.price}</p>
              </>
            ) : (
              <p className="text-lg font-bold">{currency}{product.price}</p>
            )}
          </div>
        </div>
        <Button
          className="w-full mt-3 gap-2"
          size="sm"
          disabled={outOfStock}
          onClick={() => addItem({
            id: product.id,
            name: product.name,
            price: effectivePrice,
            cost: product.cost_of_goods,
            unit: product.unit,
            image_url: product.image_url,
          })}
        >
          <Plus className="h-4 w-4" /> Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
