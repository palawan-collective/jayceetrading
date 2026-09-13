# A bespoke, story-led JayCee website

## Creative reset
This will not be a reskin of the existing product grid or a copy of the reference image. The new homepage will tell one clear story: a trusted local Palawan supplier that handles food carefully, serves homes and businesses reliably, and makes ordering straightforward. Products become evidence of that story rather than the entire website.

## Experience structure
- Keep `/` as the brand experience and move the existing shopping catalogue to `/order`.
- Preserve the connected cart, checkout, account, loyalty, inventory, pricing, and admin experience exactly as they work now.
- Make **Order Online** consistently available without turning every section into a sales banner.
- Use anchored homepage navigation for Products, Wholesale, About, Delivery, FAQs, and Contact; retain My Account and Cart as practical customer actions.

## Visual concept: “Palawan Provision House”
A modern editorial system inspired by a meticulously arranged supplier catalogue, cold-chain labels, and the warmth of a trusted neighborhood business.

- **Palette:** white `#FFFFFF`, ink `#111827`, JayCee red `#DC1818`, and restrained gold `#F3B61F`.
- **Typography:** Sora for confident headlines and Manrope for highly readable supporting copy.
- **Composition:** generous white space, deliberate asymmetry, large documentary food imagery, fine rules, small operational labels, and occasional full-width red moments.
- **Craft:** crisp alignments, varied editorial pacing, restrained corners, no floating blobs, no glass effects, no generic card wall, and no repetitive icon-feature blocks.
- **Motion:** subtle image masks and text reveals that support the story; no decorative animation.

## Homepage narrative
1. **Opening statement** — JayCee’s literal offer and Palawan roots, paired with one strong documentary image and clear paths for ordering or wholesale enquiries.
2. **Proof in motion** — a narrow operational strip showing years serving Palawan, delivery, cold storage, and quality handling as factual signals rather than marketing cards.
3. **The range** — an editorial mosaic of real product photography organized by category, with fewer, larger images and a direct entrance to the complete catalogue.
4. **Two customer stories** — Home and Business presented as distinct use cases, not identical side-by-side cards.
5. **From cold storage to kitchen** — a visual process sequence showing storage, careful packing, local dispatch, and arrival.
6. **Local relationships** — customer names or approved reviews displayed with restrained credibility, using available content only.
7. **The people behind the supply** — a human, local-company chapter centered on JayCee’s history and personal handling.
8. **Find JayCee** — location, hours, contact details, directions, and delivery context composed as a practical destination section.
9. **Questions and next step** — a clean FAQ preview followed by one decisive red ordering band.
10. **Editorial footer** — compact navigation, product range, and contact information without newsletter clutter dominating the close.

## Online store
- Rehouse the current search, category filters, specials, product cards, stock states, and cart interactions at `/order`.
- Give the store a compact, commerce-focused header and cleaner product hierarchy while preserving all existing behavior.
- Ensure every homepage product/category path leads naturally into the relevant store experience.

## Content and imagery
- Reuse real product photography from the catalogue wherever it is strong.
- Create only the missing documentary imagery needed for the opening, handling/process, business use, and local-team chapters; imagery must feel specific to a Palawan food supplier, not stock photography.
- Use current business settings and published content when available. Any missing hours, client names, history details, or wholesale contact copy will be clearly marked as temporary rather than invented as fact.

## Technical boundaries
- Frontend presentation and routing only.
- No database, authentication, admin data, order submission, loyalty, report, pricing, or inventory logic changes.
- Keep semantic design tokens and existing design-system controls.
- Update the site title, descriptions, social metadata, and font loading for the new public-facing experience.

## Verification
- Check `/` and `/order` at desktop and mobile widths.
- Verify header navigation, category-to-store links, cart drawer, checkout handoff, My Account, theme contrast, and FAQ interactions.
- Confirm no horizontal scrolling, overlapping text, generic placeholders, or inaccessible color combinations.
