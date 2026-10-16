# Popcorn Panic

Actualización de derrotas y sonido: [revisión 2](revision-2/README.md).

Magic Drink de maíz caramelizado y dulces, inspirada en la sensación de la escopeta de Metal Slug. Lata y efectos originales dibujados para el estilo de Magic Drink. Implementada el 15 de octubre de 2026.

## Comportamiento

| Propiedad | Disparo normal | Disparo fuerte |
| --- | --- | --- |
| Perdigones por descarga | 7 | 7 |
| Daño por perdigón | 3.2 | 3.2 |
| Alcance desde la varita | 240 unidades | 480 unidades |
| Abanico | ±0.24 radianes | ±0.24 radianes |
| Coste de magia | 0 | 45 de 100 |
| Munición por descarga | 1 | 1 |

El fuerte amplía el alcance, manteniendo el daño y la dispersión. Los perdigones chocan con enemigos y obstáculos; no atraviesan cuerpos ni reciben las ventajas de penetración de otros ataques fuertes. El daño máximo a quemarropa es 22.4 si impactan los siete. A mayor distancia es más difícil concentrarlos todos.

La pausa base entre descargas es de 0.78 segundos. Ambos botones comparten la recuperación para impedir que alternarlos permita disparar sin pausa. La magia insuficiente impide el fuerte sin consumir munición. Cada lata contiene 24 descargas; el amuleto de inicio proporciona 48. Las mejoras generales de reserva y tamaño siguen funcionando.

Controles: ataque normal habitual; **C en teclado / Y en mando** para el fuerte. Se puede apuntar hacia arriba y a ambos lados, disparar en movimiento, agachada o durante el salto.

## Dónde encontrarla

- Tienda: Popcorn Panic, 125 estrellas, disponible desde el rango de progreso 1. Comprar y equipar su amuleto permite empezar con 48 descargas.
- Pueblo 5-2: cajas de suministros en x=1850 y x=10800; la segunda entrega nivel II.
- Incluida en el conjunto de bebidas que pueden aparecer en el botín a partir de su desbloqueo.
- ID 13; los sabores y guardados anteriores conservan sus identificadores.

## Arte e integración

- Lata: `public/arcade/sprites/pickups/popcorn-panic.webp`.
- Atlas: `public/arcade/sprites/effects/popcorn-panic.webp`, 16 celdas de 256 × 256. Ocho fotogramas de descarga, cuatro de proyectiles y cuatro de impacto.
- Generación con ImageGen integrado, referencias del propio juego y fondo transparente. Prompts completos y rutas en [art.json](art.json); originales conservados en `sources/`.
- Registro y empaquetado reproducibles: `node scripts/arcade/pack-popcorn-panic.mjs`. Sharp recorta, registra y empaqueta las imágenes generadas; no dibuja sustitutos.
- Lógica de alcance y daño: `engine/adventurePopcorn.js`; render: `render/popcornCanvas.js`, dentro de `src/components/arcade/adventure/`.
- Sonido propio de descarga grave, crujidos y explosión de palomitas; utiliza los controles de volumen y silencio existentes.

## Verificación

- 8 pruebas específicas del modelo: daño, alcance, magia, munición, pausa compartida, botín, guardados, bolsillos y prismas.
- 34 pruebas de regresión de otras bebidas y del pueblo. Registro: [regression.log](regression.log), **42 pasaron** en total.
- 2 pruebas de navegador: cuatro escenas grabadas con el motor/render reales y compra/equipamiento en la tienda. Sin errores de página ni recursos del arcade faltantes.
- Grabaciones de cinco segundos: normal, fuerte, salto/apuntado y movimiento/agachado. Decodificadas con `node scripts/arcade/review-popcorn.mjs` y revisadas en secuencias de doce imágenes. Se observaron los ocho fotogramas de la descarga, impactos y disipación; los registros del fuerte muestran 100 → 55 de magia.
- Evidencia visual en `tests/artifacts/arcade/popcorn-panic/`: archivos `.webm`, `*-motion.png`, fotogramas individuales, métricas `.json` y `shop.png`. Las escenas de combate usan un montaje controlado del nivel; la compra se comprueba en la interfaz real.
- `npm run build`: código de salida 0, Astro check con 0 errores, `[build] Complete!` a las 00:37:37 del 15 de octubre de 2026. Registro: [build.log](build.log).
- La validación visual se hizo en Chrome de escritorio. No se realizó una sesión manual con mando físico ni una revisión auditiva del nuevo sonido.

Comandos de pruebas:

```powershell
npx playwright test tests/hexy-popcorn.spec.js tests/hexy-drink-roster.spec.js tests/hexy-extra-drinks.spec.js tests/hexy-drink-revision.spec.js tests/hexy-village.spec.js --grep-invert 'real chapter' --workers=1
npx playwright test tests/hexy-popcorn-browser.spec.js --workers=1
node scripts/arcade/review-popcorn.mjs
npm run build
```
