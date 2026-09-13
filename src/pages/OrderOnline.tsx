import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function OrderOnline() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get("category") || "All");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("category")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(() => {
    if (!products) return ["All"];
    return ["All", ...new Set(products.map((product) => product.category))];
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const specials = filtered.filter((product) => product.is_special);
  const regular = filtered.filter((product) => !product.is_special);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase text-primary">JayCee online store</p>
        <h1 className="font-heading text-3xl font-bold md:text-5xl">Quality supplies, ready to order.</h1>
        <p className="text-muted-foreground">Browse current availability, add what you need, and choose pickup or delivery at checkout.</p>
      </header>

      <div className="sticky top-16 z-30 space-y-3 border-y border-border bg-background/95 py-4 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search products" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button key={category} variant={activeCategory === category ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(category)}>
              {category}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-md bg-secondary" />)}
        </div>
      )}

      {specials.length > 0 && (
        <section aria-labelledby="specials-heading">
          <h2 id="specials-heading" className="mb-4 flex items-center gap-2 font-heading text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> Current specials
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{specials.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}

      {regular.length > 0 && (
        <section aria-labelledby="products-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 id="products-heading" className="font-heading text-xl font-bold">All products</h2>
            <p className="text-sm text-muted-foreground">{filtered.length} items</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{regular.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}

      {!isLoading && filtered.length === 0 && <div className="py-16 text-center text-muted-foreground">No products match your search.</div>}
    </div>
  );
}