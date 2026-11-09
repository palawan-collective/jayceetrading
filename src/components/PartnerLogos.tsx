const partners = [
  { src: "/images/brand/partners/seda.png", alt: "Seda Hotels" },
  { src: "/images/brand/partners/funnylion.png", alt: "The Funny Lion, El Nido" },
  { src: "/images/brand/partners/robinsons.png", alt: "Robinsons Place Palawan" },
  { src: "/images/brand/partners/hue.png", alt: "Hue Hotels & Resorts" },
  { src: "/images/brand/partners/elnido.png", alt: "El Nido Resorts" },
  { src: "/images/brand/partners/best-western.png", alt: "Best Western Plus" },
  { src: "/images/brand/partners/astoria.png", alt: "Astoria Palawan" },
  { src: "/images/brand/partners/nccc.png", alt: "NCCC Supermarket" },
];

function LogoRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`partner-marquee__track${reverse ? " partner-marquee__track--reverse" : ""}`}>
      <div className="partner-marquee__inner">
        {[0, 1].map((copy) => (
          <div className="partner-marquee__group" key={copy} aria-hidden={copy === 1}>
            {partners.map((partner) => (
              <div className="partner-marquee__item" key={partner.alt} title={partner.alt}>
                <img src={partner.src} alt={copy === 0 ? partner.alt : ""} loading="lazy" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnerLogos() {
  return (
    <section className="partner-marquee" id="partners" aria-labelledby="partners-title">
      <div className="partner-marquee__head">
        <span className="eyebrow">In good company</span>
        <h2 className="partner-marquee__title" id="partners-title">Trusted by Palawan’s leading kitchens.</h2>
      </div>
      <LogoRow />
      <div className="partner-marquee__spacer" aria-hidden="true" />
      <LogoRow reverse />
    </section>
  );
}
