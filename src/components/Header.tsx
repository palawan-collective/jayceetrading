import { Clock, Facebook, Instagram, Youtube, Linkedin, MessageCircle, Music2, Send, Globe, Menu, ShoppingBag, User, X } from "lucide-react";
import { useBusinessSettings, useHeaderSettings, useSocialLinks } from "@/hooks/use-settings";
import { useCartStore } from "@/lib/cart-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const socialIconMap = { facebook: Facebook, instagram: Instagram, youtube: Youtube, linkedin: Linkedin, whatsapp: MessageCircle, tiktok: Music2, telegram: Send, globe: Globe };
const storyLinks = [
  { label: "Our story", href: "/#story" },
  { label: "Products", href: "/#products" },
  { label: "Our partners", href: "/#partners" },
  { label: "Delivery", href: "/#delivery" },
  { label: "Contact", href: "/#contact" },
];

function ManilaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  }).format(now);
  const shortTime = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit", hour12: true }).format(now);
  const fullDate = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(now);
  const compactDate = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric",
  }).format(now);

  return (
    <div className="manila-clock" aria-label={`Manila time ${time}, ${fullDate}`}>
      <span className="manila-clock__zone"><Clock size={12} /> Manila time</span>
      <time className="manila-clock__time" dateTime={now.toISOString()}><span className="manila-clock__desktop-time">{time}</span><span className="manila-clock__mobile-time">{shortTime}</span></time>
      <span className="manila-clock__date manila-clock__date--full">{fullDate}</span>
      <span className="manila-clock__date manila-clock__date--compact">{compactDate}</span>
    </div>
  );
}

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
  // Ignore legacy uploaded logo URLs which were stored with a solid white matte; only use
  // explicitly marked transparent custom logos, otherwise use the corrected local brand asset.
  const logoSrc = business?.logo_url?.includes("transparent=1") ? business.logo_url : "/images/brand/jaycee-logo-transparent.png";
  const headerBackground = header?.header_background_color?.toLowerCase() === "#0f172a" ? "#ffffff" : header?.header_background_color || "#ffffff";
  const headerTextColor = header?.header_text_color?.toLowerCase() === "#ffffff" ? "#222222" : header?.header_text_color || "#222222";

  if (isAdmin) return null;

  const closeMenu = () => setMobileOpen(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.hash, location.search]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [mobileOpen]);

  return (
    <header className="site-header" style={{ backgroundColor: headerBackground, color: headerTextColor }}>
      <div className="site-header__utility"><div className="container site-header__utility-inner"><span className="utility-location"><span className="utility-location__dot" /> Puerto Princesa · Palawan</span><ManilaClock /></div></div>
      <div className="container site-header__inner">
        <Link to="/" className="site-brand" aria-label="JayCee Trading and Services home">
          {header?.show_logo !== false && <img src={logoSrc} alt="" className="site-brand__logo" />}
          <span className="site-brand__text"><strong>JayCee</strong><small>TRADING &amp; SERVICES</small></span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {storyLinks.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}
        </nav>

        <div className="site-header__actions">
          {enabledSocial.map((item) => {
            const Icon = socialIconMap[item.icon_name as keyof typeof socialIconMap];
            return Icon ? <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="header-social" aria-label={item.platform_name}><Icon size={16} /></a> : null;
          })}
          <Button variant="ghost" size="icon" onClick={() => navigate("/track")} aria-label="Track an order" className="header-icon header-track"><User size={17} /></Button>
          {header?.show_cart_icon !== false && <Button variant="ghost" size="icon" onClick={() => toggleCart()} aria-label={`Cart with ${cartCount} items`} className="header-icon header-cart"><ShoppingBag size={17} />{cartCount > 0 && <Badge className="cart-count">{cartCount}</Badge>}</Button>}
          <Button asChild className="header-order"><Link to="/order">Order online <ArrowIcon /></Link></Button>
          <Button variant="ghost" size="icon" className="header-menu-button" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-controls="jaycee-mobile-navigation" aria-expanded={mobileOpen}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</Button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="jaycee-mobile-navigation" className="site-mobile-nav" aria-label="Mobile navigation">
          {storyLinks.map((item) => <a key={item.label} href={item.href} onClick={closeMenu}>{item.label}</a>)}
          <Link to="/order" onClick={closeMenu} className="site-mobile-nav__order">Order online <ArrowIcon /></Link>
          <Link to="/track" onClick={closeMenu} className="site-mobile-nav__secondary">Track an order</Link>
        </nav>
      )}
    </header>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
