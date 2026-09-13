import { Facebook, Instagram, Lock, Menu, ShoppingBag, User, UtensilsCrossed, X } from "lucide-react";
import { useHeaderSettings, useBusinessSettings, useSocialLinks } from "@/hooks/use-settings";
import { useCartStore } from "@/lib/cart-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const socialIconMap = { facebook: Facebook, instagram: Instagram };
const storyLinks = [
  { label: "Products", href: "/#products" },
  { label: "Wholesale", href: "/#wholesale" },
  { label: "About", href: "/#about" },
  { label: "Delivery", href: "/#delivery" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  const { data: header } = useHeaderSettings();
  const { data: business } = useBusinessSettings();
  const { data: social } = useSocialLinks();
  const cartCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = location.pathname.startsWith("/admin");
  const enabledSocial = social?.filter((item) => item.is_enabled) || [];

  if (isAdmin) return null;

  const closeMenu = () => setMobileOpen(false);
  const navClass = "text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 items-center justify-between gap-3 px-4 lg:h-[4.5rem]">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="JayCee home">
          {header?.show_logo !== false && (business?.logo_url ? <img src={business.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" /> : <UtensilsCrossed className="h-6 w-6 shrink-0 text-primary" />)}
          <span className="font-heading text-base font-bold sm:hidden">JayCee</span>
          <span className="hidden max-w-[13rem] truncate font-heading text-sm font-bold sm:block md:text-base">{business?.business_name || "JayCee Trading & Services"}</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {storyLinks.map((item) => <a key={item.label} href={item.href} className={navClass}>{item.label}</a>)}
        </nav>

        <div className="flex items-center gap-1">
          {enabledSocial.map((item) => {
            const Icon = socialIconMap[item.icon_name as keyof typeof socialIconMap];
            return Icon ? <Button key={item.id} variant="ghost" size="icon" asChild className="hidden xl:inline-flex"><a href={item.url} target="_blank" rel="noreferrer" aria-label={item.icon_name}><Icon className="h-4 w-4" /></a></Button> : null;
          })}
          <Button variant="ghost" size="icon" onClick={() => navigate("/track")} aria-label="My account"><User className="h-4 w-4" /></Button>
          {header?.show_cart_icon !== false && <Button variant="ghost" size="icon" className="relative" onClick={() => toggleCart()} aria-label={`Cart with ${cartCount} items`}><ShoppingBag className="h-4 w-4" />{cartCount > 0 && <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center p-0 text-[10px]">{cartCount}</Badge>}</Button>}
          <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/order">Order online</Link></Button>
          {header?.show_admin_icon !== false && <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} aria-label="Admin"><Lock className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-5 lg:hidden" aria-label="Mobile navigation">
          <div className="container grid gap-1 px-0">
            {storyLinks.map((item) => <a key={item.label} href={item.href} onClick={closeMenu} className="border-b border-border py-3 font-heading text-base font-semibold">{item.label}</a>)}
            <Link to="/order" onClick={closeMenu} className="mt-4 flex min-h-11 items-center justify-center bg-primary px-5 text-sm font-bold text-primary-foreground">Order online</Link>
          </div>
        </nav>
      )}
    </header>
  );
}