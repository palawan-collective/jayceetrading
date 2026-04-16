import { ShoppingCart, Lock, Sun, Moon, Menu, X, UtensilsCrossed, Facebook, Instagram, User } from "lucide-react";
import { useHeaderSettings, useBusinessSettings, useWebsitePages, useSocialLinks } from "@/hooks/use-settings";
import { useTheme } from "@/lib/theme-provider";
import { useCartStore } from "@/lib/cart-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const socialIconMap: Record<string, any> = { facebook: Facebook, instagram: Instagram };

export default function Header() {
  const { data: header } = useHeaderSettings();
  const { data: business } = useBusinessSettings();
  const { data: pages } = useWebsitePages();
  const { data: social } = useSocialLinks();
  const { theme, toggleTheme } = useTheme();
  const cartCount = useCartStore(s => s.getItemCount());
  const toggleCart = useCartStore(s => s.toggleCart);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navPages = pages?.filter(p => p.slug !== "home" && p.slug !== "privacy-policy" && p.slug !== "faq") || [];
  const enabledSocial = social?.filter(s => s.is_enabled) || [];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4 gap-2">
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
          {header?.show_logo !== false && (
            business?.logo_url ? (
              <img src={business.logo_url} alt={business.business_name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <UtensilsCrossed className="h-6 w-6 text-primary" />
            )
          )}
          <span className="text-sm md:text-lg font-bold truncate max-w-[140px] md:max-w-none">{business?.business_name || "FoodOrder"}</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors">Order</Link>
          <Link to="/track" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors flex items-center gap-1"><User className="h-4 w-4" />My Account</Link>
          <Link to="/faq" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors">FAQ</Link>
          {navPages.map(p => (
            <Link key={p.slug} to={`/${p.slug}`} className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors">
              {p.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Social icons - desktop only */}
          {enabledSocial.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {enabledSocial.map(s => {
                const Icon = socialIconMap[s.icon_name] || UtensilsCrossed;
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon">
                      <Icon className="h-5 w-5" />
                    </Button>
                  </a>
                );
              })}
            </div>
          )}
          {header?.show_theme_toggle !== false && (
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
          {header?.show_cart_icon !== false && (
            <Button variant="ghost" size="icon" className="relative" onClick={() => toggleCart()}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>
          )}
          {header?.show_admin_icon !== false && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <Lock className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-1">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">Order</Link>
          <Link to="/track" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent flex items-center gap-1"><User className="h-4 w-4" />My Account</Link>
          <Link to="/faq" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">FAQ</Link>
          {navPages.map(p => (
            <Link key={p.slug} to={`/${p.slug}`} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
              {p.title}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
