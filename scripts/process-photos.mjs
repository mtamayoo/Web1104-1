import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_ROOT = 'C:\\Users\\mtamayoo\\Downloads\\Fotos DiSole 1104';
const OUT_DIR = path.join(process.cwd(), 'public', 'galeria');
const QUALITY = 80;

const photos = [
  // Hero and visual room highlights
  { name: 'salon-dia', file: 'Salon-Dia-DiSole1104.jpg', widths: [400, 600, 800, 1000, 1024, 1600, 1920] },
  { name: 'salon-noche', file: 'Salon-noche-DiSole1104.jpg', widths: [600, 1000, 1024, 1600, 1920] },
  { name: 'balcon', file: 'Balcón-DiSole1104.jpg', widths: [400, 600, 800, 1000, 1024, 1600, 1920] },
  { name: 'vista-pueblo', file: 'VistaPueblo-DiSole1104.jpg', widths: [400, 800, 1024, 1600, 1920], cropBottom: 0.13 },
  { name: 'piscina-tobogan', file: 'Piscina1-Tobogan-Solarium-DiSole1104.jpg', widths: [400, 600, 800, 1000, 1024, 1600, 1920] },

  // Apartment gallery
  { name: 'salon', file: 'Salon-DiSole1104.jpg', widths: [400, 800, 1600] },
  { name: 'salon-cocina', file: 'Salon-Cocina-DiSole1104.jpg', widths: [400, 600, 800, 1000, 1600], cropBottom: 0.13 },
  { name: 'cocina-salon', file: 'Cocina-Salón-Disole1104.jpg', widths: [400, 600, 800, 1000, 1600] },
  { name: 'cocina-otra-vista', file: 'Cocina-otravista-DiSole1104.jpg', widths: [400, 800, 1600], cropBottom: 0.13 },
  { name: 'habitacion', file: 'Hab2-DiSole1104.jpg', widths: [400, 800, 1600], cropBottom: 0.13 },
  { name: 'habitacion-otra-vista', file: 'Hab2-otravista-DiSole1104.jpg', widths: [400, 600, 800, 1000, 1600], cropBottom: 0.13 },
  { name: 'bano-principal', file: 'Baño-2-DiSole1104.jpg', widths: [400, 600, 800, 1000, 1600], cropBottom: 0.13 },

  // Pools, amenities, views, surroundings
  { name: 'piscina-principal', file: 'Piscina1-DiSole1104.jpg', widths: [400, 800, 1600], cropBottom: 0.13 },
  { name: 'piscina-tobogan-solarium', file: 'Piscina1-Tobogan-Solarium-(sinsombrillas)-DiSole1104.jpg', widths: [400, 800, 1600], cropBottom: 0.13 },
  { name: 'tobogan-etapa', file: 'Etapa1-Tobogán-DiSole1104.jpg', widths: [400, 800, 1600], cropBottom: 0.13 },
  { name: 'espejo-agua', file: 'Espejo-Agua-DiSole1104.jpg', widths: [400, 800, 1600] },
  { name: 'balcon-dos', file: 'Balcón(2)-DiSole1104.jpg', widths: [400, 800, 1600], cropBottom: 0.13 },
  { name: 'golfito-canchas', file: 'Golfito-Canchas-DiSole1104.jpg', widths: [400, 800, 1600] },
  { name: 'cancha-micro', file: 'Cancha-Micro-DiSole1104.jpg', widths: [400, 800, 1600] },
  { name: 'juegos-ninos', file: 'Juegos-niños-DiSole1104.jpg', widths: [400, 800, 1600] },
  { name: 'porteria', file: 'Porteria-DiSole1104.jpg', widths: [400, 600, 800, 1000, 1600] },

  // Assets 2026 phone photos: auto-orient with .rotate(), then strip metadata to WebP.
  { name: 'piscina-sombrillas', file: path.join('Assets 2026', '20260411_132638.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'piscina-aerea', file: path.join('Assets 2026', '20260411_135139.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'piscina-ninos', file: path.join('Assets 2026', '20260411_133057.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'piscina-vista', file: path.join('Assets 2026', '20260411_132412.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'minigolf', file: path.join('Assets 2026', '20260411_132151.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'cancha-futbol', file: path.join('Assets 2026', '20260411_132227.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'cancha-arena', file: path.join('Assets 2026', '20260411_132407.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'parque-infantil', file: path.join('Assets 2026', '20260411_131126.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'complejo-torres', file: path.join('Assets 2026', '20260411_130907.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'vista-pueblo-aerea', file: path.join('Assets 2026', '20260411_135535.jpg'), widths: [400, 600, 800, 1000, 1600] },
  { name: 'vista-aerea', file: path.join('Assets 2026', '20260421_103845.jpg'), widths: [400, 600, 800, 1000, 1600] },
  // Accessible parking bays (blue floor paint, wheelchair symbols) — lower-left of aerial photo.
  // Custom extract (not cropBottom): left=50, top=1352, width=1200, height=900 (4:3, fills to bottom of rotated 4000x2252 frame).
  { name: 'parqueadero-accesible', file: path.join('Assets 2026', '20260421_103851.jpg'), widths: [400, 600, 800, 1000, 1600], _extract: { left: 50, top: 1352, width: 1200, height: 900 } },

  // Trust/brand assets for the footer
  { name: 'booking-award-2024', file: 'Award-Booking-2024-DiSole1104.jpg', widths: [160, 320] },
  { name: 'rnt-2026', file: 'RNT2026.png', widths: [160, 320] },
  { name: 'logo-disole-1104', file: 'Logo DiSole 1104.png', widths: [160, 320] },
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function processOne({ name, file, widths, cropBottom, _extract }) {
  const input = path.join(SOURCE_ROOT, file);
  if (!(await fileExists(input))) {
    throw new Error(`Missing source: ${input}`);
  }

  const metadata = await sharp(input).metadata();
  const sourceWidth = metadata.width ?? 0;

  const rotatedMetadata = await sharp(input).rotate().metadata();
  const orientedWidth = rotatedMetadata.width ?? metadata.width ?? 0;
  const orientedHeight = rotatedMetadata.height ?? metadata.height ?? 0;
  const cropPixels = cropBottom ? Math.ceil(orientedHeight * cropBottom) : 0;
  const extractRegion = _extract
    ? _extract
    : cropPixels
      ? { left: 0, top: 0, width: orientedWidth, height: orientedHeight - cropPixels }
      : null;

  for (const width of widths) {
    const output = path.join(OUT_DIR, `${name}-${width}.webp`);
    let pipeline = sharp(input).rotate();
    if (extractRegion) {
      pipeline = pipeline.extract(extractRegion);
    }
    pipeline = pipeline
      .resize({ width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY });

    // Intentionally do not call withMetadata(): Sharp strips EXIF/GPS by default.
    await pipeline.toFile(output);
    const outMeta = await sharp(output).metadata();
    const note = sourceWidth < width ? ` (not upscaled; actual ${outMeta.width}w)` : '';
    console.log(`wrote public\\galeria\\${name}-${width}.webp${note}`);
  }
}

await fs.mkdir(OUT_DIR, { recursive: true });

for (const photo of photos) {
  await processOne(photo);
}

// ── Logo lockup: public/brand/ ─────────────────────────────────────────────
// Crop: left=36, top=30, width=952, height=888 from the 1024×1024 marketing tile.
// This includes the outer gold field + mandala + "CITADELA / DI SOLE / SANTA FE DE
// ANTIOQUIA" text + the white "Apartamento 1104" rounded box, while trimming the
// outer white border and most of the gray photo strip at the very bottom.
// Decision: 2026-06-23 — extended height from 760→888 to restore the Apartamento 1104 box.
{
  const LOGO_SRC = path.join(SOURCE_ROOT, 'Logo DiSole 1104.png');
  const LOGO_OUT_DIR = path.join(process.cwd(), 'public', 'brand');
  const LOGO_CROP = { left: 36, top: 30, width: 952, height: 888 };
  const LOGO_WIDTHS = [160, 320, 640];

  await fs.mkdir(LOGO_OUT_DIR, { recursive: true });
  for (const width of LOGO_WIDTHS) {
    const output = path.join(LOGO_OUT_DIR, `logo-disole-lockup-${width}.webp`);
    await sharp(LOGO_SRC)
      .extract(LOGO_CROP)
      .resize({ width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(output);
    const m = await sharp(output).metadata();
    console.log(`wrote public\\brand\\logo-disole-lockup-${width}.webp -> ${m.width}x${m.height}`);
  }
}
