# JayCee minimalist website and separate online store

## Goal
Turn the current storefront into a polished supplier website while keeping online ordering easy to reach and fully connected.

## Structure
- Use `/` as the main JayCee website: brand story, product ranges, delivery, wholesale, location, FAQs, and contact paths.
- Move the existing searchable product catalogue to `/order` without changing cart, checkout, inventory, pricing, account, or admin behavior.
- Keep prominent **Order Online** actions in the header, opening section, category area, and final call-to-action.
- Update internal links so the brand returns home while shopping links consistently open `/order`.

## Visual direction
- Follow the selected **Editorial heritage minimalist** composition, adapted to the actual food-supply business rather than copied literally.
- Lock the chosen palette: white `#FFFFFF`, ink `#111827`, JayCee red `#DC1818`, and gold `#F3B61F`.
- Use **Sora** for headings and **Manrope** for body text.
- Build full-width, spacious sections with square-to-subtle-radius imagery, restrained borders, and minimal motion.
- Keep the main website light and editorial; preserve semantic theme tokens so existing ordering and admin screens remain readable.

## Homepage content
- Refined header with Products, Wholesale, About, Delivery, FAQs, Contact, My Account, Cart, and a clear Order Online action.
- Image-led opening focused on quality food supply and reliable delivery across Palawan.
- Trust strip, six product-category highlights using real catalogue imagery, and a direct path into the store.
- Separate “For Home” and “For Business” sections.
- Food handling and delivery assurances, customer/review proof where data exists, local-team story, business location/contact details, FAQ preview, and final action band.
- Responsive mobile navigation and layouts with no horizontal scrolling or overlapping text.

## Technical details
- Add a dedicated order catalogue page by reusing the current product query and cart behavior.
- Create focused homepage sections and source imagery from existing product records where suitable; use a cohesive generated supplier image only where a strong editorial image is needed.
- Keep all colors in global semantic tokens and use existing button and accordion controls.
- Update app-specific page metadata and load Sora/Manrope through the document head.
- Verify `/`, `/order`, cart-to-checkout, desktop layout, and mobile layout in the live preview.

## Out of scope
- No database changes.
- No changes to checkout submission, authentication, admin data, reports, loyalty rules, product pricing, or inventory logic.
