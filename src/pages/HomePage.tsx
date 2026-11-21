import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Award, Boxes, Check, ChevronRight,
  Compass, HeartHandshake, Leaf, Mail, MapPin, PackageCheck,
  Phone, Snowflake, Truck, Users, Warehouse, type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessSettings } from "@/hooks/use-settings";
import businessTableImage from "@/assets/jaycee-business-table.jpg";
import coldStorageImage from "@/assets/jaycee-cold-storage.jpg";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PartnerLogos from "@/components/PartnerLogos";
import PartnershipInquiryDialog from "@/components/PartnershipInquiryDialog";
import TypewriterAnswer from "@/components/TypewriterAnswer";

const serviceAreas = ["Puerto Princesa", "Port Barton", "San Vicente", "Roxas", "Sabang", "Taytay", "El Nido"];
const featuredCategories = [
  { category: "Canned food", detail: "Everyday pantry favourites", keywords: ["canned", "tin", "pantry", "grocery"] },
  { category: "Frozen products", detail: "Ready for the kitchen", keywords: ["frozen", "fries", "burger", "sausage", "meat", "seafood", "chicken"] },
  { category: "Dairy", detail: "Cheese, yogurt & cream", keywords: ["dairy", "cheese", "yogurt", "cream", "milk", "butter"] },
  { category: "Imported goods", detail: "Flavours from further afield", keywords: ["imported", "international", "specialty"] },
];
const fallbackFaqs = [
  { id: "range", question: "What products does JayCee supply?", answer: "Our range includes canned food, frozen products, dairy, and imported goods. Browse the online catalogue to see current products and availability." },
  { id: "delivery", question: "Where do you deliver?", answer: `We serve ${serviceAreas.slice(0, -1).join(", ")}, and ${serviceAreas[serviceAreas.length - 1]}. Please contact us to confirm delivery timing and arrangements for your location.` },
  { id: "business", question: "Can hotels, restaurants, and other businesses partner with JayCee?", answer: "Yes. We work with food businesses and hospitality partners. Get in touch to discuss your product needs and regular supply requirements." },
];

const values = [
  { icon: Award, title: "Quality products", copy: "Thoughtfully sourced products and careful handling at every step." },
  { icon: HeartHandshake, title: "Excellent service", copy: "A responsive local team that takes the time to understand your needs." },
  { icon: Check, title: "Honesty & integrity", copy: "Clear communication and dependable relationships, built to last." },
  { icon: Compass, title: "Innovation", copy: "Fresh thinking that helps us respond to changing tastes and needs." },
  { icon: Users, title: "Community focus", copy: "Proud to support the businesses and families that make Palawan special." },
  { icon: Leaf, title: "Thoughtful growth", copy: "Reaching new customers while exploring more sustainable choices." },
];

const ambitions = [
  { icon: Compass, title: "Reach more communities", copy: "Grow our service network and make dependable supply available to more of Palawan." },
  { icon: Boxes, title: "Build a better online experience", copy: "Make it easier for customers to discover products and plan their orders." },
  { icon: Leaf, title: "Make thoughtful choices", copy: "Explore practical ways to reduce waste and support more sustainable options." },
];

function CategoryShowcaseCard({
  category, detail, images, index, href,
}: {
  category: string; detail: string; images: string[]; index: number; href: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const canRotate = images.length > 1;
  useEffect(() => {
    if (!canRotate || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % images.length), 5200 + index * 600);
    return () => window.clearInterval(timer);
  }, [canRotate, paused, images.length, index]);

  return (
    <Link
      to={href}
      className={`category-card category-card--${index + 1}`}
      data-reveal
      aria-label={`Explore ${category} products`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="category-card__media" aria-hidden="true">
        {images.length ? images.map((src, i) => (
          <img key={src} src={src} alt="" loading="lazy" className={`category-card__image ${i === active ? "is-current" : ""}`}/>
        )) : <span className="category-card__art">
          <span className="category-card__number">0{index + 1}</span>
          <span className="category-card__shape" />
        </span>}
      </span>
      <span className="category-card__shade" aria-hidden="true" />
      <span className="category-card__copy">
        <small>{detail}</small>
        <strong>{category}</strong>
        <span className="category-card__arrow"><ArrowUpRight size={18}/></span>
      </span>
      {canRotate && (
        <span className="category-card__dots" aria-hidden="true">
          {images.map((_, i) => <span key={i} className={i === active ? "is-current" : ""}/>)}
        </span>
      )}
    </Link>
  );
}

function ValueFlipCard({ icon: Icon, title, copy, index }: { icon: LucideIcon; title: string; copy: string; index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <article className={`value-card${flipped ? " is-flipped" : ""}`}>
      <button
        type="button"
        className="value-card__button"
        aria-label={`${title}: reveal value details`}
        aria-pressed={flipped}
        onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setFlipped(true); }}
        onMouseLeave={() => { if (window.matchMedia("(hover: hover)").matches) setFlipped(false); }}
        onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setFlipped(true); }}
        onBlur={() => setFlipped(false)}
        onClick={(event) => {
          if (window.matchMedia("(hover: none)").matches && event.detail > 0) setFlipped((current) => !current);
        }}
      >
        <span className="value-card__inner">
          <span className="value-card__face value-card__front" aria-hidden={flipped}>
            <span className="value-card__number">0{index + 1}</span>
            <Icon aria-hidden="true" size={27} strokeWidth={1.6} />
            <span className="value-card__title" role="heading" aria-level={3}>{title}</span>
            <span className="value-card__hint">Explore this value <ArrowUpRight size={13} /></span>
          </span>
          <span className="value-card__face value-card__back" aria-hidden={!flipped}>
            <span className="value-card__number">0{index + 1}</span>
            <Icon aria-hidden="true" size={25} strokeWidth={1.6} />
            <span className="value-card__title" role="heading" aria-level={3}>{title}</span>
            <span className="value-card__copy">{copy}</span>
          </span>
        </span>
      </button>
    </article>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    const observeNewElements = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible):not([data-observed])").forEach((element) => {
        element.dataset.observed = "true";
        observer.observe(element);
      });
    };
    observeNewElements();
    const mutations = new MutationObserver(observeNewElements);
    mutations.observe(document.querySelector(".marketing-page") ?? document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);
}

function useHeroParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const images = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        images.forEach((image) => {
          const rect = image.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const distance = Math.max(0, window.innerHeight - rect.top);
            image.style.setProperty("--parallax-y", `${Math.min(distance * 0.035, 24)}px`);
          }
        });
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

export default function HomePage() {
  useScrollReveal();
  useHeroParallax();
  const { data: business } = useBusinessSettings();
  const { data: products } = useQuery({
    queryKey: ["home-product-story"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id,name,category,image_url").eq("is_available", true).order("category").order("name");
      if (error) throw error;
      return data;
    },
  });
  const { data: faqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("id,question,answer").eq("is_active", true).order("display_order").limit(4);
      if (error) throw error;
      return data;
    },
  });

  const storedCategories = [...new Set(products?.map((product) => product.category) ?? [])];
  const imageProducts = (products ?? []).filter((product) => Boolean(product.image_url));
  const usedProductImages = new Set<string>();
  const categories = featuredCategories.map(({ category, detail, keywords }, index) => {
    const storedCategory = storedCategories.find((stored) => keywords.some((keyword) => stored.toLowerCase().includes(keyword)));
    const productImage =
      imageProducts.find((product) => product.category === storedCategory && product.image_url && !usedProductImages.has(product.image_url)) ??
      imageProducts.find((product) => keywords.some((keyword) => `${product.category} ${product.name}`.toLowerCase().includes(keyword)) && product.image_url && !usedProductImages.has(product.image_url)) ??
      imageProducts.find((product) => product.image_url && !usedProductImages.has(product.image_url)) ??
      imageProducts[0];
    if (productImage?.image_url) usedProductImages.add(productImage.image_url);
    // Rotate only real product photos matching this category, not unrelated fallback items.
    const matchingImages = imageProducts.filter(product => {
      const text = `${product.category} ${product.name}`.toLowerCase();
      return (storedCategory && product.category === storedCategory) ||
        keywords.some(keyword => text.includes(keyword));
    }).map(product => product.image_url).filter((url): url is string => Boolean(url));
    const images = Array.from(new Set(matchingImages)).slice(0, 4);
    if (!images.length && productImage?.image_url) images.push(productImage.image_url);
    return {
      category,
      detail,
      images,
      index,
      href: storedCategory ? `/order?category=${encodeURIComponent(storedCategory)}` : "/order",
    };
  });
  const faqItems = faqs?.length ? faqs : fallbackFaqs;
  const phone = business?.business_phone || "009771167555";
  const email = business?.business_email || "tradingjaycee@gmail.com";
  const address = business?.business_address || "Unit 5, Ground Floor Daniel Business Alley, Corner Libis San Pedro, Puerto Princesa, Palawan";
  const [partnershipOpen, setPartnershipOpen] = useState(false);
  const openPartnership = () => setPartnershipOpen(true);
  const mapsHref = business?.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="marketing-page">
      <section id="top" className="brand-hero" aria-labelledby="hero-title">
        <div className="container brand-hero__inner">
          <div className="brand-hero__copy" data-reveal>
            <div className="hero-kicker"><span className="hero-kicker__line" /> Quality food. Stronger communities.</div>
            <p className="eyebrow hero-location"><MapPin size={14} /> Puerto Princesa, Palawan</p>
            <h1 id="hero-title">{business?.hero_title_line1 || "Savor the taste."}<br /><em>{business?.hero_title_line2 || "Indulge in quality."}</em></h1>
            <p className="brand-hero__intro">{business?.hero_intro || "A trusted food distribution partner for homes, hotels, restaurants, and businesses across Palawan since 2017."}</p>
            <div className="brand-hero__actions">
              <Button asChild size="lg" className="brand-button"><Link to="/order">Explore our products <ArrowRight size={17} /></Link></Button>
              <Button type="button" size="lg" variant="outline" className="brand-outline-button" onClick={openPartnership}>Partner with us <ArrowUpRight size={16} /></Button>
            </div>
            <div className="hero-note"><span className="hero-note__icon"><Snowflake size={18} /></span><span>Quality products, handled with care.<br /><strong>Locally rooted. Proudly Palawan.</strong></span></div>
          </div>
          <div className="brand-hero__visual" data-reveal>
            <div className="hero-store-frame">
              <img src={business?.hero_image_url || "/images/brand/jaycee-store.webp"} alt="JayCee Trading & Services storefront in Puerto Princesa" className="hero-store-image" fetchPriority="high" />
              <span className="hero-store-caption"><span className="hero-store-caption__dot" /> <strong>OUR HOME BASE</strong><small>Puerto Princesa · Palawan</small></span>
            </div>
          </div>
        </div>
        <div className="hero-bottom container">
          <span>Trusted supply since 2017</span><span className="hero-bottom__divider" /><span>Serving seven Palawan communities</span><a href="#story">Discover our story <ChevronRight size={14} /></a>
        </div>
      </section>

      <section className="brand-proof-strip" aria-label="JayCee at a glance">
        <div className="container brand-proof-strip__inner">
          <div className="brand-proof-item"><strong>2017</strong><span><b>Established</b><small>Family-founded in Palawan</small></span></div>
          <div className="brand-proof-item"><strong>07</strong><span><b>Delivery areas</b><small>Across Palawan</small></span></div>
          <div className="brand-proof-item"><strong>Local</strong><span><b>Food distribution</b><small>For homes and professional kitchens</small></span></div>
        </div>
      </section>

      <PartnerLogos />

      <section id="products" className="section-space product-section" aria-labelledby="products-heading">
        <div className="container">
          <div className="section-heading" data-reveal>
            <div><p className="eyebrow">Good things, well sourced</p><h2 id="products-heading">Made for the way<br /><em>Palawan eats.</em></h2></div>
            <div className="section-heading__aside"><p>From everyday essentials to kitchen staples, explore a considered range for homes and professional kitchens.</p><Link to="/order" className="text-link">Browse the full catalogue <ArrowRight size={16} /></Link></div>
          </div>
          <div className="category-grid">
            {categories.map(({ category, detail, images, index, href }) => (
              <CategoryShowcaseCard key={category} category={category} detail={detail} images={images} index={index} href={href}/>
            ))}
          </div>
          <div className="catalogue-note"><PackageCheck size={19} /><p>Looking for a particular item? <Link to="/order">Explore all available products</Link> or <button type="button" className="inline-text-button" onClick={openPartnership}>talk to our team</button>.</p></div>
        </div>
      </section>

      <section className="service-section" id="delivery" aria-labelledby="service-title">
        <div className="service-section__map">
          <div className="service-map-heading">
            <span className="service-map-heading__eyebrow"><MapPin size={14} /> VISIT JAYCEE</span>
            <strong>Find us in Puerto Princesa</strong>
            <span className="service-map-heading__address">{address}</span>
            <div className="service-map-heading__actions">
              <a href={mapsHref} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={16} /></a>
              <a href={`tel:${phone}`}><Phone size={15} /> Call us</a>
            </div>
          </div>
          <div className="service-map-frame">
          <iframe
            title="Map showing JayCee Trading & Services in Puerto Princesa"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.022030793975!2d118.7521104!3d9.764201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b563000ff94ee5%3A0x361d56d8cceee597!2sJayCee%20Trading%20%26%20Services!5e0!3m2!1sen!2sph!4v1794188163026!5m2!1sen!2sph"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          </div>
        </div>
        <div className="service-section__content" data-reveal>
          <p className="eyebrow">From our doorstep to yours</p>
          <h2 id="service-title">Palawan is our home.<br /><em>It’s where we show up.</em></h2>
          <p className="service-section__intro">We’re proud to serve homes, hospitality teams, and businesses across the island with thoughtful, dependable food supply.</p>
          <div className="service-locations" aria-label="Delivery service locations">
            {serviceAreas.map((area) => <span key={area}><MapPin size={14} />{area}</span>)}
          </div>
          <p className="service-footnote">Contact us to confirm delivery schedules and arrangements for your area.</p>
          <button type="button" className="text-link" onClick={openPartnership}>Ask about delivery <ArrowRight size={16} /></button>
        </div>
      </section>

      <section id="story" className="story-section section-space" aria-labelledby="story-title">
        <div className="container story-layout">
          <div className="story-image-wrap" data-reveal>
            <img src={businessTableImage} alt="Fresh food ingredients prepared in a professional kitchen" loading="lazy" />
            <div className="story-image-label"><span>Since</span><strong>2017</strong><small>PALAWAN, PHILIPPINES</small></div>
            <span className="story-image-accent" aria-hidden="true" />
          </div>
          <div className="story-copy" data-reveal>
            <p className="eyebrow">A family story, a local commitment</p>
            <h2 id="story-title">Our story is built around <em>good food</em> and good people.</h2>
            <p>Founded in 2017 by siblings with a passion for food, JayCee Trading &amp; Services began with a simple idea: share exceptional taste experiences with family, friends, and the wider community.</p>
            <p>That idea has grown into a Palawan-based distribution business connecting homes and professional kitchens with local and imported food products. We believe quality should come with honest service, careful handling, and a team you can reach.</p>
            <button type="button" className="text-link" onClick={openPartnership}>Get to know JayCee <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="values-section section-space" aria-labelledby="values-title">
        <div className="container">
          <div className="values-heading" data-reveal><p className="eyebrow">Our purpose & values</p><h2 id="values-title">Driven by quality.<br /><em>Grounded in integrity.</em></h2><p>Our mission is to provide high-quality food at the best possible prices, making delicious choices accessible to more homes, kitchens, and communities.</p></div>
          <div className="values-grid">
            {values.map((value, index) => <ValueFlipCard key={value.title} {...value} index={index} />)}
          </div>
        </div>
      </section>

      <section className="operations-section" aria-labelledby="operations-title">
        <div className="operations-section__photo"><img data-parallax src={coldStorageImage} alt="Careful cold-storage handling for food products" loading="lazy" /></div>
        <div className="operations-section__copy" data-reveal>
          <p className="eyebrow">Care from the start</p>
          <h2 id="operations-title">Freshness is a promise we take <em>seriously.</em></h2>
          <p>Our central warehouse is equipped with refrigerated and frozen storage to help protect dairy, produce, frozen goods, and more from the moment they arrive to the moment they’re on their way.</p>
          <div className="operations-points"><span><Snowflake size={18} /> Cold-chain care</span><span><Warehouse size={18} /> Purpose-ready storage</span><span><Truck size={18} /> Planned local delivery</span></div>
          <Button type="button" variant="outline" className="brand-outline-button" onClick={openPartnership}>Talk to our team <ArrowRight size={16} /></Button>
        </div>
      </section>

      <section className="team-section section-space" aria-labelledby="team-title">
        <div className="container team-layout">
          <div className="team-proof" data-reveal aria-label="How our team helps">
            <div className="team-proof__intro"><span>THE JAYCEE WAY</span><strong>Real people.<br />Reliable support.</strong></div>
            <div className="team-proof__item"><HeartHandshake size={23} strokeWidth={1.7} /><span><strong>Personal relationships</strong><small>We listen and learn what your business needs.</small></span></div>
            <div className="team-proof__item"><Truck size={23} strokeWidth={1.7} /><span><strong>Dependable service</strong><small>A local team that understands Palawan.</small></span></div>
            <div className="team-proof__item"><PackageCheck size={23} strokeWidth={1.7} /><span><strong>Careful handling</strong><small>Quality matters from storage to delivery.</small></span></div>
          </div>
          <div className="team-copy" data-reveal><p className="eyebrow">The people behind every order</p><h2 id="team-title">Passionate professionals.<br /><em>Personal service.</em></h2><p>Our team brings experience across sales, marketing, and distribution, with a shared focus on making every customer interaction memorable. We keep learning, improving, and showing up for the people who count on us.</p></div>
        </div>
      </section>

      <section className="vision-section" aria-labelledby="vision-title">
        <div className="container">
          <div className="vision-intro" data-reveal><div><p className="eyebrow">Looking forward</p><h2 id="vision-title">Expanding horizons,<br /><em>with Palawan in mind.</em></h2></div><p>We’re working toward becoming the most trusted supplier in Palawan—growing thoughtfully, listening closely, and bringing new ideas to market.</p></div>
          <div className="ambitions-grid">{ambitions.map(({ icon: Icon, title, copy }, index) => <article className="ambition-card" key={title} data-reveal><div className="ambition-card__top"><span className="ambition-card__icon"><Icon size={24} strokeWidth={1.7} /></span><span className="ambition-card__number">0{index + 1}</span></div><div className="ambition-card__body"><h3>{title}</h3><p>{copy}</p></div><span className="ambition-card__rule" aria-hidden="true" /></article>)}</div>
        </div>
      </section>

      <section id="faqs" className="faq-section section-space" aria-labelledby="faq-title">
        <div className="container faq-layout">
          <div data-reveal><p className="eyebrow">The helpful details</p><h2 id="faq-title">A few things<br /><em>you may be wondering.</em></h2><p className="faq-contact">Still have a question? <a href={`mailto:${email}`}>Send us a note <ArrowUpRight size={14} /></a></p></div>
          <Accordion type="single" collapsible className="faq-list" data-reveal>
            {faqItems.map((faq) => <AccordionItem key={faq.id} value={String(faq.id)}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent><TypewriterAnswer text={faq.answer} /></AccordionContent></AccordionItem>)}
          </Accordion>
        </div>
      </section>

      <section id="contact" className="contact-section" aria-labelledby="contact-title">
        <div className="container contact-layout">
          <div className="contact-copy" data-reveal><p className="eyebrow">Let’s do business</p><h2 id="contact-title">More than a supplier.<br /><em>A partner in your success.</em></h2><p>Whether you’re stocking a family pantry or planning supply for a busy kitchen, we’d love to hear from you.</p><div className="contact-actions"><Button type="button" size="lg" className="brand-button" onClick={openPartnership}>Start a conversation <ArrowUpRight size={16} /></Button><Button asChild size="lg" variant="outline" className="contact-order-button"><Link to="/order">Shop online <ArrowRight size={16} /></Link></Button></div></div>
          <address className="contact-card" data-reveal>
            <p className="eyebrow">Come say hello</p>
            <a href={mapsHref} target="_blank" rel="noreferrer" className="contact-detail"><MapPin size={18} /><span>{address}<small>Puerto Princesa, Palawan</small></span><ArrowUpRight size={15} /></a>
            <a href={`tel:${phone}`} className="contact-detail"><Phone size={18} /><span>{phone}<small>Call our team</small></span><ArrowUpRight size={15} /></a>
            <a href={`mailto:${email}`} className="contact-detail"><Mail size={18} /><span>{email}<small>Email JayCee</small></span><ArrowUpRight size={15} /></a>
            <div className="contact-social"><span>Follow our journey</span><a href="https://www.instagram.com/jaycee.tradingservices/" target="_blank" rel="noreferrer">@jaycee.tradingservices <ArrowUpRight size={13} /></a></div>
          </address>
        </div>
      </section>

      <div className="closing-band"><div className="container"><span>JAYCEE TRADING &amp; SERVICES</span><strong>Palawan feeds brighter days.</strong><a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top <ArrowDown size={14} /></a></div></div>
      <PartnershipInquiryDialog open={partnershipOpen} onOpenChange={setPartnershipOpen} />
    </div>
  );
}
