# Magic Drink - portal oficial

Este proyecto contiene el portal actual de Magic Drink: portada continua con parallax (`IndexJourney`), ciudad, Hexy, festival y Wonderpop, además de las páginas de bebidas y Hexy. La rama de producción y trabajo actual es `main`, publicada en https://magic-drink.vercel.app. La portada con parallax se trasladó desde `paralax` conservando el historial. No sustituir esta portada por las secciones antiguas.

## Desarrollo

```powershell
npm ci
npm run dev
npm run build
```

Portal: http://localhost:4321. `src/pages/index.astro` monta `IndexExperience`, que utiliza `src/components/index/Secciones/IndexJourney.jsx`. El movimiento vive en `src/components/index/animations`; las ilustraciones del recorrido, en `public/image/journey`.

## Proyectos separados

- Portal: `G:/TRABAJO/ASTRO/ADRINC_WEBS/magicdrink`.
- Juego web: `G:/TRABAJO/ASTRO/ADRINC_WEBS/hexy-lost-chorus` (puerto 4322).
- Juego Unity: `G:/TRABAJO/UNITY/ADRINC_GAMES/hexy-lost-chorus-unity`.

El portal no incluye el motor, niveles, sprites, música ni herramientas del videojuego. Los conejitos del paisaje viven en `src/components/scenery`: son decoración, sin monedas, cartera, premios ni guardado de progreso. El juego web y Unity conservan sus proyectos independientes. La antigua ruta `/arcade` fue retirada del portal.

## Espacio y pruebas

`dist`, cachés y `tests/artifacts` son resultados regenerables. Conservar informes pequeños y vídeos seleccionados, evitando acumular secuencias completas y compilaciones duplicadas. El historial de Git se conserva: quitar archivos del portal no elimina sus versiones antiguas del repositorio. No reescribir el historial para reducir tamaño sin una decisión expresa.

La documentación y fuentes del juego se mantienen en el proyecto web independiente. Las referencias únicas antes omitidas están en `context/arcade/legacy-reference-assets`; los documentos históricos que difieren, en `context/portal-extraction-2026-10-23`. El archivo externo `_magicdrink_archive` conserva material histórico original y no es una copia del portal vigente.
