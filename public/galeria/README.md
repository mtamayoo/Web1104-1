# public/galeria/ — Optimized Gallery Images

This folder contains optimized, web-sized WebP copies generated from the owner’s finalized photos. Originals remain outside the repository and must not be committed here.

## Processing

Run from the project root:

```powershell
node scripts\process-photos.mjs
```

The script uses Sharp, strips metadata by not calling `withMetadata()`, writes quality-80 WebP, resizes with `fit: 'inside'`, and avoids upscaling with `withoutEnlargement: true`.

## Current size sets

- Hero slides: 1024, 1600, 1920
- Gallery thumbnails: 400, 800
- Gallery lightbox: 1600
- Apartment room highlights: 600, 1000
- Footer credentials/logo: 160, 320

## Placeholder files

The original SVG placeholders may remain as harmless scaffolding, but active components should reference the real WebP assets instead.
