import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone, UtensilsCrossed } from "lucide-react";
import { useBusinessSettings, useFooterSettings, useSocialLinks } from "@/hooks/use-settings";

const rangeLinks = ["Meats", "Dairy & Cheese", "Sausages & Cold Cuts", "Seafood", "Frozen & Fries", "Baking & Pantry"];

export default function Footer() {
  const location = useLocation();
  const { data: business } = useBusinessSettings();
  const { data: footer } = useFooterSettings();
  const { data: social } = useSocialLinks();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-border bg-background">
      <div className="container grid gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-heading font-bold">
            {business?.logo_url ? <img src={business.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <UtensilsCrossed className="h-6 w-6 text-primary" />}
            <span>{business?.business_name || "JayCee Trading & Services"}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">Quality food. Personal service. Proudly Palawan.</p>
          {footer?.show_social_icons !== false && <div className="mt-5 flex gap-2">{social?.filter((item) => item.is_enabled).map((item) => { const Icon = item.icon_name === "facebook" ? Facebook : item.icon_name === "instagram" ? Instagram : Mail; return <a key={item.id} href={item.url} target="_blank" rel="noreferrer" aria-label={item.icon_name} className="grid h-9 w-9 place-items-center border border-border transition-colors hover:border-primary hover:text-primary"><Icon className="h-4 w-4" /></a>; })}</div>}
        </div>
        <div><h2 className="text-xs font-bold uppercase text-primary">Explore</h2><nav className="mt-4 grid gap-2 text-sm"><a href="/#products" className="hover:text-primary">Products</a><a href="/#wholesale" className="hover:text-primary">Wholesale</a><a href="/#about" className="hover:text-primary">About</a><a href="/#delivery" className="hover:text-primary">Delivery</a><a href="/#faqs" className="hover:text-primary">FAQs</a><a href="/#contact" className="hover:text-primary">Contact</a></nav></div>
        <div><h2 className="text-xs font-bold uppercase text-primary">Product range</h2><div className="mt-4 grid gap-2 text-sm">{rangeLinks.map((item) => <Link key={item} to={`/order?category=${encodeURIComponent(item)}`} className="hover:text-primary">{item}</Link>)}</div></div>
        <div><h2 className="text-xs font-bold uppercase text-primary">Contact</h2><div className="mt-4 space-y-3 text-sm text-muted-foreground">{business?.business_address && <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{business.business_address}</p>}{business?.business_phone && <a href={`tel:${business.business_phone}`} className="flex gap-2 hover:text-foreground"><Phone className="h-4 w-4 shrink-0 text-primary" />{business.business_phone}</a>}{business?.business_email && <a href={`mailto:${business.business_email}`} className="flex break-all gap-2 hover:text-foreground"><Mail className="h-4 w-4 shrink-0 text-primary" />{business.business_email}</a>}</div></div>
      </div>
      <div className="border-t border-border"><div className="container flex flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>{footer?.copyright_text || business?.copyright_text || "© 2026 JayCee Trading & Services. All rights reserved."}</p><div className="flex gap-5"><Link to="/privacy-policy" className="hover:text-foreground">Privacy</Link><Link to="/track" className="hover:text-foreground">My Account</Link></div></div></div>
    </footer>
  );
}