# Prompt maestro — Sitio Apartasol 1104 Citadela Di Sole

> **Nota:** Este prompt es un **punto de partida** para arrancar de cero, no una
> reproducción exacta del sitio actual. La fuente de verdad exacta es el propio
> código de este repositorio. Para clonar el sitio con cambios menores (otro
> apartamento, otros textos/fotos), es más rápido reutilizar el repo y editar los
> archivos `src/i18n/{es,en,fr}.json`, las fotos y los enlaces.

---

## Prompt

```
Crea un sitio web de marketing de una sola página (landing) para un apartamento
turístico, con estas especificaciones:

CONTEXTO DEL NEGOCIO
- Nombre: "Apartasol 1104 Citadela Di Sole", Santa Fe de Antioquia, Colombia.
- Apartamento en piso 11, 76 m², 2 habitaciones con A/C, 3 baños, cocina equipada,
  balcón amplio con vistas al valle del río Tonusco y al pueblo. Aloja 6 adultos + 2 niños.
- Unidad cerrada con vigilancia 24h, parqueadero incluido (1 vehículo).
- Piscina de la URBANIZACIÓN (NO privada del apartamento), tobogán, cancha de
  microfútbol, golfito, juegos infantiles.
- A 4 cuadras del parque principal; calles coloniales, iglesias, restaurantes.
- Registro Nacional de Turismo (RNT) Nº 179772 — mostrar en el footer.

STACK TÉCNICO
- Astro v7 + Tailwind CSS. Sitio estático.
- Trilingüe con i18n por archivos JSON: Español (default, ruta /), Inglés (/en/),
  Francés (/fr/). Mantener PARIDAD de claves entre los 3 idiomas.
- Desplegado en GitHub Pages vía GitHub Actions (.github/workflows/deploy.yml),
  Node 22, base path = nombre del repo.

SECCIONES (en orden)
1. Hero: slideshow de fotos, slogan ("You're going to love it" / equivalente en 1 línea),
   logo oficial como marca de agua, y 3 botones de reserva a la misma altura (grid de 3
   columnas en escritorio). Cada botón muestra SOLO el logo de la plataforma (sin repetir
   "Reserva en"). En móvil: botones apilados, compactos y estrechos (max-w-[16rem], centrados)
   para no tapar la foto.
2. Apartamento: descripción rica (basada en el texto de Booking) + "Ambientes destacados"
   (chips de características; NO incluir metraje/piso, accesibilidad ni lavadora).
3. Amenidades: agrupadas (cocina, baño, exteriores/piscina, actividades, vistas, seguridad,
   servicios). Escribir "Solarium" (sin tilde).
4. Sitios para visitar / alrededores: puente de Occidente, parque acuático Kanaloa (3,4 km),
   restaurantes cercanos, paseos a caballo, senderismo, ciclismo, minigolf.
5. Galería de fotos.
6. Reglas de la casa: incluir RNT 179772, "quiet hours" (silencio 00:00–09:00),
   menores de 18 solo con padres/tutores, prohibido fiestas/despedidas, no fumar,
   pago por transferencia antes de la llegada.
7. (Oculta por ahora, reactivable) Sección "Materiales de referencia" para PDFs.
8. Footer con RNT y navegación.

BOTONES DE RESERVA (3 plataformas)
- Airbnb, Booking.com y Vrbo.
- Vrbo enlaza a: https://tinyurl.com/DiSole1104V
- Los tres a la misma altura, solo con logo de la plataforma.

MARCA
- El logo oficial debe decir "Apartamento 1104" + "Di Sole" (no recortar el "1104").
- Usar el logo lockup oficial tanto arriba a la izquierda como de marca de agua en el hero.
```

---

## Detalles técnicos aprendidos (para no repetir errores)

- **Node 22 obligatorio:** Astro v7 requiere Node >= 22.12. En `deploy.yml` usar
  `node-version: "22"` (con Node 20 el build falla).
- **Base path:** `astro.config.mjs` usa `base: "/<nombre-del-repo>"`. El repositorio
  debe llamarse igual que el base path (aquí: `Web1104-1`).
- **GitHub Pages:** en Settings → Pages, "Source" debe ser **GitHub Actions**.
  Cada push a `main` republica automáticamente.
- **Imágenes en Astro:** los atributos `src`/`srcset` deben usar expresiones `{}`
  (p. ej. `src={`${base}/...`}`), no cadenas literales.
- **Reutilizar como plantilla** es más rápido que regenerar: clonar el repo y editar
  textos (`src/i18n/*.json`), fotos y enlaces de reserva.
