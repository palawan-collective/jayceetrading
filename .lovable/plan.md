# JayCee editorial commerce rebuild

## Direction
Rebuild the public site using the supplied Maison Cleo screenshot as the layout reference, translated into a Palawan food-supply business rather than fashion. Keep the same editorial pacing: a slim centered header, large campaign opening, horizontal product rows, three image-led category panels, supplier/brand strip, alternating story rows, bestsellers, business story, reviews, call-to-action band, social/gallery strip, and dark footer.

## JayCee translation
- **Hero:** reliable food supply and online ordering, with an admin-uploaded image or a clean empty image placeholder.
- **New arrivals:** latest available products from the real catalogue.
- **Three category panels:** Meats, Dairy & Cheese, and Frozen & Pantry, linking into the catalogue.
- **Supplier strip:** real product categories rather than invented fashion brands.
- **Editorial rows:** Home essentials, Business supply, and Cold storage/delivery.
- **Bestsellers:** real available products; no invented items or photos.
- **About:** JayCee’s local service story, address, and contact information.
- **Reviews:** approved customer reviews from existing data.
- **Closing band/gallery:** ordering CTA plus empty admin-uploadable gallery slots until real images are provided.
- **Footer:** business details, catalogue links, account, and modern Lucide social icons.

## Store and admin
- Keep `/order` as the dedicated full catalogue. Categories filter products in place, counts remain visible, search/reset stay beside results, and no action jumps customers toward the footer.
- Add a dedicated admin website editor using existing content/settings records. Admins can change global hero, section, and supporting fonts; every homepage text field; section images from their device; header/footer wording; contact data; and social links/icons.
- Replace high-impact generic admin card lists with a consistent responsive data layout: aligned desktop columns and labelled stacked mobile rows, without horizontal scrolling.

## Boundaries
Keep existing product, cart, checkout, order, inventory, special pricing, loyalty, alerting, and reporting logic intact. Do not use the fashion screenshot as a site image. Do not invent product photography; show polished placeholders until the admin uploads real images.

## Verification
Check homepage, catalogue browsing, image uploads, saved fonts/text, header/footer/social updates, cart handoff, and key admin lists on desktop and mobile.
