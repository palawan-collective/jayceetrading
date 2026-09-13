import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Box, MapPin, PackageCheck, Snowflake, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroImage from "@/assets/jaycee-hero.jpg";
import coldStorageImage from "@/assets/jaycee-cold-storage.jpg";
import businessTableImage from "@/assets/jaycee-business-table.jpg";

const processSteps = [
  { number: "01", title: "Stored with care", copy: "Temperature-conscious storage protects every product before it leaves us." },
  { number: "02", title: "Packed personally", copy: "Each order is checked and prepared by a small team that knows the stock." },
  { number: "03", title: "Moving locally", copy: "Reliable pickup and delivery options keep Palawan kitchens supplied." },
];

const fallbackFaqs = [
  { id: "delivery", question: "Where do you deliver?", answer: "Delivery coverage and available options are confirmed during checkout based on your order details." },
  { id: "business", question: "Can businesses place regular supply orders?", answer: "Yes. Restaurants, cafés, hotels, and other food businesses can contact JayCee for supply enquiries." },
  { id: "pickup", question: "Can I collect my order?", answer: "Yes. Choose pickup at checkout and the team will confirm when your order is ready." },
];

export default function HomePage() {
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
      const { data, error } = await supabase.from("faqs").select("id,question,answer").eq("is_active", true).order("display_order").limit(5);
      if (error) throw error;
      return data;
    },
  });

  const categories = Array.from(new Set(products?.map((product) => product.category) ?? [])).slice(0, 6);
  const categoryStories = categories.map((category) => ({
    category,
    image: products?.find((product) => product.category === category && product.image_url)?.image_url,
  }));
  const faqItems = faqs?.length ? faqs : fallbackFaqs;
  const whatsappNumber = business?.whatsapp_business_number?.replace(/\D/g, "");
  const wholesaleHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello JayCee, I would like to ask about wholesale supply.")}`
    : `mailto:${business?.business_email || "tradingjaycee@gmail.com"}?subject=${encodeURIComponent("Wholesale supply enquiry")}`;

  return (
    <div className="marketing-page overflow-hidden">
      <section className="border-b border-border" aria-labelledby="home-title">
        <div className="container grid grid-cols-1 items-center gap-10 px-4 py-10 md:py-14 lg:min-h-[46rem] lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:py-16">
          <div className="order-2 max-w-xl space-y-8 lg:order-1">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase text-primary">Food supplier in Puerto Princesa · Since 2017</p>
              <h1 id="home-title" className="font-heading text-5xl font-bold leading-[0.98] md:text-7xl">Good food starts with a dependable source.</h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">JayCee keeps homes and professional kitchens across Palawan supplied with carefully handled meats, dairy, seafood, frozen goods, and pantry essentials.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/order">Order online <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="lg"><a href={wholesaleHref}>Wholesale enquiry</a></Button>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-border pt-7">
              <div><p className="font-heading text-3xl font-bold">2017</p><p className="mt-1 text-sm text-muted-foreground">Serving local kitchens</p></div>
              <div><p className="font-heading text-3xl font-bold">Palawan</p><p className="mt-1 text-sm text-muted-foreground">Built for island supply</p></div>
            </div>
          </div>
          <div className="order-1 relative lg:order-2">
            <div className="aspect-[4/3] overflow-hidden rounded-sm lg:aspect-[5/6]">
              <img src={heroImage} alt="JayCee staff carefully handing over a cold-storage food order" width={1600} height={1067} className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-4 left-4 max-w-[15rem] border border-border bg-background p-4 shadow-sm md:bottom-6 md:left-6">
              <p className="text-xs font-bold uppercase text-primary">Handled here. Supplied here.</p>
              <p className="mt-2 text-sm leading-snug">A local team, personally accountable for every order.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-foreground text-background" aria-label="Service commitments">
        <div className="container grid grid-cols-2 px-4 md:grid-cols-4">
          {[{ icon: Snowflake, label: "Proper cold storage" }, { icon: PackageCheck, label: "Careful packing" }, { icon: Truck, label: "Reliable local delivery" }, { icon: Box, label: "Quality product range" }].map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-h-24 items-center gap-3 border-border/30 px-3 py-5 even:border-l md:border-l md:first:border-l-0">
              <Icon className="h-5 w-5 shrink-0 text-primary" /><span className="text-xs font-semibold uppercase">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="py-20 md:py-28" aria-labelledby="range-title">
        <div className="container px-4">
          <div className="mb-10 grid gap-6 md:grid-cols-[1fr_0.65fr] md:items-end">
            <div><p className="mb-3 text-xs font-bold uppercase text-primary">The range</p><h2 id="range-title" className="font-heading text-4xl font-bold md:text-6xl">A working pantry for Palawan.</h2></div>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:justify-self-end">Everyday family essentials and dependable professional supply, kept together in one practical catalogue.</p>
          </div>
          {categoryStories.length > 0 ? (
            <div className="grid auto-rows-[14rem] grid-cols-2 gap-3 md:auto-rows-[17rem] md:grid-cols-4">
              {categoryStories.map((item, index) => (
                <Link key={item.category} to={`/order?category=${encodeURIComponent(item.category)}`} className={`group relative overflow-hidden rounded-sm bg-secondary ${index === 0 || index === 3 ? "col-span-2" : ""}`}>
                  {item.image && <img src={item.image} alt={`${item.category} products`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-background"><h3 className="font-heading text-lg font-bold">{item.category}</h3><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                </Link>
              ))}
            </div>
          ) : <div className="h-80 animate-pulse rounded-sm bg-secondary" />}
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-center">
            <p className="font-heading text-xl font-semibold">Looking for something specific?</p>
            <Button asChild variant="outline"><Link to="/order">Open the complete catalogue <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      <section id="wholesale" className="border-y border-border bg-secondary/40 py-20 md:py-28" aria-labelledby="customers-title">
        <div className="container px-4">
          <p className="mb-3 text-xs font-bold uppercase text-primary">Who we supply</p>
          <h2 id="customers-title" className="max-w-3xl font-heading text-4xl font-bold md:text-6xl">One supplier. Two very different kitchens.</h2>
          <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:items-stretch">
            <article className="flex flex-col justify-between border border-border bg-background p-7 lg:col-span-5 lg:p-10">
              <div><p className="text-xs font-bold uppercase text-primary">For home</p><h3 className="mt-4 font-heading text-3xl font-bold">Keep family favorites within reach.</h3><p className="mt-5 leading-relaxed text-muted-foreground">Choose from practical pack sizes, order on your phone, and arrange pickup or delivery without the wholesale runaround.</p></div>
              <Button asChild className="mt-10 w-fit"><Link to="/order">Shop for home</Link></Button>
            </article>
            <div className="min-h-[24rem] overflow-hidden lg:col-span-7"><img src={businessTableImage} alt="Quality ingredients prepared for a professional kitchen" width={1200} height={900} loading="lazy" className="h-full w-full object-cover" /></div>
            <article className="border border-border bg-foreground p-7 text-background lg:col-span-12 lg:grid lg:grid-cols-2 lg:items-end lg:gap-16 lg:p-10">
              <div><p className="text-xs font-bold uppercase text-primary">For business</p><h3 className="mt-4 font-heading text-3xl font-bold md:text-4xl">Supply that respects your service.</h3></div>
              <div><p className="mt-5 leading-relaxed text-background/70 lg:mt-0">Restaurants, cafés, hotels, and food businesses need consistency, clear communication, and products that arrive ready for work.</p><Button asChild variant="secondary" className="mt-7"><a href={wholesaleHref}>Start a supply conversation</a></Button></div>
            </article>
          </div>
        </div>
      </section>

      <section id="delivery" className="py-20 md:py-28" aria-labelledby="care-title">
        <div className="container grid gap-12 px-4 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative"><img src={coldStorageImage} alt="Food products being carefully organized in cold storage" width={1200} height={900} loading="lazy" className="aspect-[4/5] w-full object-cover" /><p className="absolute bottom-4 right-4 bg-background px-4 py-3 text-xs font-semibold">Cold-chain care, close to home.</p></div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase text-primary">The journey</p>
            <h2 id="care-title" className="font-heading text-4xl font-bold md:text-6xl">From our cold room to your kitchen.</h2>
            <div className="mt-10 divide-y divide-border border-y border-border">
              {processSteps.map((step) => <div key={step.number} className="grid grid-cols-[3rem_1fr] gap-5 py-7"><span className="font-heading text-sm font-bold text-primary">{step.number}</span><div><h3 className="font-heading text-xl font-bold">{step.title}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{step.copy}</p></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-border py-20 md:py-28" aria-labelledby="about-title">
        <div className="container grid gap-10 px-4 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <div><p className="text-xs font-bold uppercase text-primary">JayCee, since 2017</p><div className="mt-6 h-1 w-16 bg-primary" /></div>
          <div><h2 id="about-title" className="font-heading text-4xl font-bold leading-tight md:text-6xl">A small local team that cares about every order.</h2><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">JayCee Trading &amp; Services grew around a straightforward promise: source dependable food products, handle them properly, and be the kind of supplier people can speak to. That personal responsibility still shapes every order today.</p></div>
        </div>
      </section>

      <section id="contact" className="bg-secondary/40 py-20 md:py-28" aria-labelledby="visit-title">
        <div className="container grid gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div><p className="mb-3 text-xs font-bold uppercase text-primary">Visit or get in touch</p><h2 id="visit-title" className="font-heading text-4xl font-bold md:text-6xl">Local supply starts with a real conversation.</h2></div>
          <address className="not-italic">
            <div className="space-y-6 border-t border-border pt-6">
              {business?.business_address && <div className="flex gap-4"><MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><p className="font-semibold">JayCee Trading &amp; Services</p><p className="mt-1 text-muted-foreground">{business.business_address}</p></div></div>}
              {business?.business_phone && <a className="block font-heading text-2xl font-bold hover:text-primary" href={`tel:${business.business_phone}`}>{business.business_phone}</a>}
              {business?.business_email && <a className="block break-all text-muted-foreground hover:text-primary" href={`mailto:${business.business_email}`}>{business.business_email}</a>}
              <div className="flex flex-wrap gap-3 pt-2">
                {business?.google_maps_url && <Button asChild><a href={business.google_maps_url} target="_blank" rel="noreferrer">Get directions <ArrowRight className="h-4 w-4" /></a></Button>}
                <Button asChild variant="outline"><a href={wholesaleHref}>Contact JayCee</a></Button>
              </div>
            </div>
          </address>
        </div>
      </section>

      <section id="faqs" className="py-20 md:py-28" aria-labelledby="faq-title">
        <div className="container grid gap-10 px-4 lg:grid-cols-[0.55fr_1fr] lg:gap-20">
          <div><p className="mb-3 text-xs font-bold uppercase text-primary">Before you order</p><h2 id="faq-title" className="font-heading text-4xl font-bold">Questions, answered simply.</h2></div>
          <Accordion type="single" collapsible className="border-t border-border">
            {faqItems.map((faq) => <AccordionItem key={faq.id} value={String(faq.id)}><AccordionTrigger className="text-left font-heading font-semibold">{faq.question}</AccordionTrigger><AccordionContent className="max-w-2xl leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}
          </Accordion>
        </div>
      </section>

      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container flex flex-col items-start justify-between gap-7 px-4 md:flex-row md:items-center">
          <div><p className="text-xs font-bold uppercase text-primary-foreground/70">Ready when you are</p><h2 className="mt-2 font-heading text-3xl font-bold md:text-4xl">Put quality food on the way.</h2></div>
          <Button asChild size="lg" variant="secondary"><Link to="/order">Order online <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
    </div>
  );
}