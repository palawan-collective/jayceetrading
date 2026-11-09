-- Site-wide brand controls used by the customer-facing storefront.
-- Existing RLS policies on business_settings are retained; this migration does not add policies.
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS brand_red TEXT NOT NULL DEFAULT '#E11D2E',
  ADD COLUMN IF NOT EXISTS brand_yellow TEXT NOT NULL DEFAULT '#FFC107',
  ADD COLUMN IF NOT EXISTS brand_green TEXT NOT NULL DEFAULT '#0B7D32',
  ADD COLUMN IF NOT EXISTS brand_charcoal TEXT NOT NULL DEFAULT '#222222',
  ADD COLUMN IF NOT EXISTS brand_sand TEXT NOT NULL DEFAULT '#F4F1E8',
  ADD COLUMN IF NOT EXISTS heading_font TEXT NOT NULL DEFAULT 'Montserrat',
  ADD COLUMN IF NOT EXISTS body_font TEXT NOT NULL DEFAULT 'Inter';

ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS hero_title_line1 TEXT NOT NULL DEFAULT 'Savor the taste.',
  ADD COLUMN IF NOT EXISTS hero_title_line2 TEXT NOT NULL DEFAULT 'Indulge in quality.',
  ADD COLUMN IF NOT EXISTS hero_intro TEXT NOT NULL DEFAULT 'A trusted food distribution partner for homes, hotels, restaurants, and businesses across Palawan since 2017.',
  ADD COLUMN IF NOT EXISTS site_tagline TEXT NOT NULL DEFAULT 'More than a supplier. A partner in your success.',
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Keep the header and footer white so the full-colour logo's light backing disappears into the page.
UPDATE public.footer_settings
SET footer_background_color = CASE WHEN lower(footer_background_color) IN ('#1e293b', '#222222', '#171916') THEN '#ffffff' ELSE footer_background_color END,
    footer_text_color = CASE WHEN lower(footer_text_color) IN ('#94a3b8', '#f4f1e8', '#ffffff') THEN '#222222' ELSE footer_text_color END
WHERE id = 1;

UPDATE public.header_settings
SET header_background_color = CASE WHEN lower(header_background_color) = '#0f172a' THEN '#ffffff' ELSE header_background_color END,
    header_text_color = CASE WHEN lower(header_text_color) = '#ffffff' THEN '#222222' ELSE header_text_color END
WHERE id = 1;
