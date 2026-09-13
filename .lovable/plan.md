# Clean storefront and website editor

## Goal
Turn the current site into a white, editorial commerce experience where customers can browse the full catalogue naturally and admins can control the public-facing content without code.

## Build
- Remove the three mock homepage photos, but retain polished empty image areas with clear dimensions until an admin uploads real images.
- Rework the homepage into a cleaner white editorial layout using real business data and editable section content.
- Build a dedicated **Website Editor** inside the admin area for:
  - global hero, section-heading, and supporting-text fonts
  - every homepage heading, paragraph, label, and button label
  - hero, business, and delivery image uploads from a device
  - header wording, footer wording, contact details, and social links
  - modern Lucide icons for every supported social platform
- Store editable homepage data in the existing `content_sections` records and existing settings/social tables; do not add tables or alter ordering data.
- Rebuild `/order` around a complete product catalogue:
  - all available products load together
  - category counts remain visible near the grid
  - selecting a category filters in place and updates the URL
  - a clear reset returns to all products
  - search and result counts stay close to the products
  - no category action sends customers toward the footer
- Refine the highest-impact admin lists into a consistent responsive data layout: aligned columns on desktop, vertically labelled rows on mobile, no horizontal scrolling.
- Keep cart, checkout, inventory, prices, specials, order alerts, loyalty, reporting, and all existing business logic unchanged.

## Technical details
- Use the selected editorial workspace direction: white surfaces, fine neutral borders, compact rectangular controls, JayCee red accents, no gradients or decorative mock imagery.
- Apply saved font choices through safe CSS variables and a fixed curated font list.
- Use the existing public storage buckets for uploaded section images.
- Add defensive defaults so the storefront remains complete before any editor content has been saved.
- Fix the current React ref warnings while touching the affected storefront components.

## Verification
- Check homepage, catalogue filtering/search/reset, cart handoff, and website editor saves on desktop and mobile.
- Confirm uploaded images replace placeholders, saved fonts/text appear publicly, social links render with Lucide icons, and no page scrolls horizontally.
