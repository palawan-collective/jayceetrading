import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, Phone, Facebook, Instagram, Youtube, Linkedin, MessageCircle, Music2, Send, Globe } from "lucide-react";
import { useBusinessSettings, useFooterSettings, useSocialLinks } from "@/hooks/use-settings";

const serviceAreas = ["Puerto Princesa", "Port Barton", "San Vicente", "Roxas", "Sabang", "Taytay", "El Nido"];
const socialIconMap = { facebook: Facebook, instagram: Instagram, youtube: Youtube, linkedin: Linkedin, whatsapp: MessageCircle, tiktok: Music2, telegram: Send, globe: Globe };

export default function Footer() {
  const location = useLocation();
  const { data: business } = useBusinessSettings();
  const { data: footer } = useFooterSettings();
  const { data: social = [] } = useSocialLinks();
  if (location.pathname.startsWith("/admin")) return null;

  const address = business?.business_address || "Unit 5, Ground Floor Daniel Business Alley, Corner Libis San Pedro, Puerto Princesa, Palawan";
  const phone = business?.business_phone || "009771167555";
  const email = business?.business_email || "info@jayceetrading.com";
  const year = new Date().getFullYear();
  const storedFooterBackground = footer?.footer_background_color?.toLowerCase();
  const storedFooterText = footer?.footer_text_color?.toLowerCase();
  const footerBackground = storedFooterBackground === "#1e293b" || storedFooterBackground === "#222222" || storedFooterBackground === "#171916" ? "#ffffff" : footer?.footer_background_color || "#ffffff";
  const footerTextColor = storedFooterText === "#94a3b8" || storedFooterText === "#f4f1e8" || storedFooterText === "#ffffff" ? "#222222" : footer?.footer_text_color || "#222222";
  const logoSrc = business?.logo_url?.includes("transparent=1") ? business.logo_url : "/images/brand/jaycee-logo-transparent.png";

  return (
    <footer className="site-footer" style={{ backgroundColor: footerBackground, color: footerTextColor }}>
      <div className="container site-footer__main">
        <div className="footer-brand-block">
          <Link to="/" className="site-brand site-brand--footer" aria-label="JayCee home">
            <img src={logoSrc} alt="" className="site-brand__logo" />
            <span className="site-brand__text"><strong>JayCee</strong><small>TRADING &amp; SERVICES</small></span>
          </Link>
          <p>{business?.site_tagline || "More than a supplier. A partner in your success."}</p>
          <span className="footer-location">Puerto Princesa · Palawan</span>
        </div>
        <div className="footer-column"><h2>Explore</h2><a href="/#story">Our story</a><a href="/#products">Products</a><a href="/#partners">Our partners</a><a href="/#delivery">Delivery areas</a><a href="/#contact">Contact us</a></div>
        <div className="footer-column"><h2>Where we deliver</h2>{serviceAreas.map((area) => <a href="/#delivery" key={area}>{area}</a>)}</div>
        {footer?.show_contact_info !== false && (
          <div className="footer-column footer-contact">
            <h2>Let’s talk</h2>
            <a href={`tel:${phone}`}><Phone size={15} />{phone}</a>
            <a href={`mailto:${email}`}><Mail size={15} />{email}</a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer"><MapPin size={15} />Puerto Princesa, Palawan <ArrowUpRight size={13} /></a>
            {footer?.show_social_icons !== false && (
              <div className="footer-social-links">
                {social.filter((item) => item.is_enabled).map((item) => {
                  const Icon = socialIconMap[item.icon_name as keyof typeof socialIconMap] ?? Globe;
                  return <a key={item.id} href={item.url} target="_blank" rel="noreferrer" aria-label={item.platform_name} title={item.platform_name}><Icon size={16} /></a>;
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="site-footer__bottom">
        <div className="container">
          <p>{footer?.copyright_text || business?.copyright_text || `© ${year} JayCee Trading & Services. All rights reserved.`}</p>
          <div><Link to="/privacy-policy">Privacy</Link><Link to="/track">Track an order</Link><Link to="/admin" className="footer-staff-link">Staff portal</Link></div>
        </div>
      </div>
    </footer>
  );
}
