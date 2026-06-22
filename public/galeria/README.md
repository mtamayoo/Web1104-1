# public/galeria/ — Gallery Images

This folder will hold the optimised (WebP / AVIF) gallery photographs once the
owner delivers the final photo selection (section 12 of the spec).

## Pending assets (section 12)

- Apartment interior photos (living room, bedrooms, bathrooms, kitchen, balcony)
- Pool and water-slide photos
- Views (mountain, pool from balcony)
- Complex amenities (gym, sports courts, playground)
- Santa Fe de Antioquia surroundings

## File naming convention (PI-03: avoid descriptive filenames)

Use short, non-descriptive names to minimise direct-link scraping, e.g.:
  `g01.webp`, `g02.webp`, ... or hash-based names.
Do NOT use names like `piscina-principal.jpg` that reveal content.

## Format requirements (section 6.5)

- Primary format: WebP
- Additional: AVIF when meaningful size savings are achieved
- No originals in this folder — use optimised, web-sized copies only (PI-01)
- Include width × height attributes in `<img>` tags for CLS prevention

## Placeholder files in this folder

The two SVG placeholders (`placeholder-01.svg`, `placeholder-02.svg`) are
temporary scaffolding only. Delete them when real assets are added.
