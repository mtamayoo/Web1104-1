# public/materiales/ — Reference Materials (PDFs)

This folder will hold the PDF documents for the "Materiales de Referencia"
section (section 10 of the spec / RF-09).

## Pending documents (section 12)

The following PDFs are pending delivery from the property owner:

| File (suggested name)     | Description                        |
|---------------------------|------------------------------------|
| `guia.pdf`                | Guía del Apartamento               |
| `manual.pdf`              | Manual del Huésped                 |
| `reglamento.pdf`          | Reglamento del Conjunto            |
| `llegada.pdf`             | Instrucciones de Llegada           |
| `mapa-turistico.pdf`      | Mapa Turístico de Santa Fe         |
| `restaurantes.pdf`        | Restaurantes Recomendados          |
| `actividades.pdf`         | Actividades para Familias          |
| `faq.pdf`                 | Preguntas Frecuentes               |

## Implementation notes (RF-09)

PDFs should open in a new browser tab WITHOUT forcing a download.
Use `<a href="..." target="_blank" rel="noopener noreferrer">` links in
`src/components/Materials.astro`. Update the `materials` array there once
real files are placed in this folder.

## File naming (PI-03)

Use short, non-descriptive names where possible. The table above shows
suggested names; owner/team may choose alternatives.
