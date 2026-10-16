# Halloween 5-1 — criptas, extremidades y combate

Implementación de toda la lista solicitada el 14 de octubre de 2026. El nivel interno sigue siendo 6, capítulo 5-1.

| Petición | Resultado |
| --- | --- |
| 1. Salida de las criptas | Puerta cerrada, aviso de 4.2 s, apertura brusca de 0.36 s y descarga de niebla antes del primer enemigo. Los actores parten pequeños y oscuros dentro de la puerta, cruzan el umbral en 1.8 s y recuperan su tamaño. Se dibujan del fondo hacia el frente para que el siguiente ocupante no vuelva a tapar al anterior con la fachada. |
| 2. Derrota de la mano | Cuatro poses de golpe, encogimiento y desplome; deja manga y guante inertes. Se eliminó la gran nube de desaparición que ocultaba esta animación. |
| 4. Esqueletos | Tres lanzamientos consecutivos con preparación completa y una pausa posterior. Al desmoronarse salen cráneo, dos brazos y dos piernas móviles, cada uno con 2 HP: un disparo básico. Tras 12–13.6 s dejan de perseguir; costillas, pelvis y partes derrotadas quedan en el suelo. No se generan enemigos nuevos durante la purga del jefe. |
| 5. Barras de salud | Eliminadas las barras de enemigos, gigante reservado, Campanero, lápidas y criptas. Regla permanente añadida a `.github/copilot-instructions.md` y a la nota de memoria solicitada. El HUD de Hexy se conserva. |
| 6. Salud, cantidad y cajas | Zombis/crawlers: 13.8 HP, x3 del payaso normal de 4.6 HP. Diez zombis de patrulla frente a los tres anteriores. Cada cripta mantiene hasta ocho ocupantes: seis zombis y dos esqueletos, separados 0.72 s. Dos cajas adicionales en x=8640 y x=14680 garantizan Magic Drinks nivel 2; ahora hay cinco cajas. Abrirlas no permite volver a cobrar el mismo premio al reintentar. |
| 7. Ropa de las extremidades | Brazos con manga naranja/morada y guante; piernas con pantalón y bota morada. La mano que persigue mantiene el mismo traje. |
| 8. Zombis bajo ramas | Estado de mirar/alcanzar arriba, dirección estable y margen de salida. Reanudan la persecución cuando Hexy se aleja. Sus pies siguen la ruta del suelo, sin tomar una rama como terreno. |
| 9. Pérdida de extremidades | Ocho poses de reacción por pérdida de brazo/pierna; desprendimiento retrasado 0.24 s, giro de la pieza y recuperación hacia los ciclos heridos. Ocho poses de caminar con un brazo y ocho de arrastre, conservando sombrero, proporciones y traje. |
| 10. Restos | Permanecen 28 s y se desvanecen durante los últimos 2 s. No se transforman en huesos los restos de los payasos. |
| 11. Proyectiles del jefe | Ocho poses del pequeño espíritu blanco de ojos ovalados, rodeado de fuego azul/violeta, tomado del espíritu de su propia animación. Tanto las descargas de la campana como las ráfagas de la segunda fase usan este espíritu. Las ondas de suelo conservan su lectura propia. |

## Sprites y reproducción

Generados con la herramienta integrada **image_gen**, usando los sprites existentes como referencias. No se usó un rig de piezas para los personajes completos. Las fuentes, referencias y prompts se guardan aquí; el empaquetado técnico usa Sharp para alfa, recorte, escala y registro de las celdas.

Prompts: [lote inicial](prompts.json), [ciclos heridos](injured-prompt.json), [niebla](fog-prompt.json), [rostro del espíritu](spirit-correction-prompt.json).

| Archivo final | Celdas |
| --- | ---: |
| `public/arcade/maps/halloween/crypt-opening-v7.webp` | 8 |
| `public/arcade/maps/halloween/crypt-fog-v7.webp` | 4 |
| `public/arcade/sprites/enemies/nightmare-clothed-limbs-v7.webp` | 16 |
| `public/arcade/sprites/enemies/nightmare-zombie-reactions-v7.webp` | 24 |
| `public/arcade/sprites/enemies/nightmare-injured-v7.webp` | 16 |
| `public/arcade/sprites/enemies/nightmare-skeleton-parts-v7.webp` | 12 |
| `public/arcade/sprites/enemies/nightmare-spirit-v7.webp` | 8 |

Empaquetado: `node scripts/arcade/pack-nightmare-revision-7.mjs`. Los límites de fila son específicos de cada fuente; el último fotograma de pérdida de pierna enlaza con el primer fotograma real de arrastre. Registro: [registration.json](registration.json).

## Verificación

- Pruebas de comportamiento: apertura/capacidad/cancelación de criptas, daño básico de manos y partes, ráfagas de huesos, salud x3, cajas nivel 2, permanencia de restos, reacción a pérdidas y estabilidad de dirección bajo ramas.
- Regresión: captura y rescate, fantasmas de dos impactos, prohibición de salto al perder extremidades, ramas, recorrido completo con las dos criptas, fases del Campanero, derrota, purga y reintento.
- Selector real de `/arcade`: entrar a 5-1, simular reposo, caminar y atacar sin errores del navegador. Registro de la última tanda: [final-tests.log](final-tests.log).
- Ocho escenas grabadas con el motor y renderizador de producción, decodificadas y revisadas: `crypt`, `hand`, `skeleton`, `injuries`, `reach`, `spirits`, `crate-a`, `crate-b`. Vídeos, hojas de fotogramas, capturas grandes y estadísticas en `tests/artifacts/arcade/cemetery-revision-7/`.
- La revisión visual corrigió restos de filas vecinas en los atlas, el orden de oclusión de la puerta, el volumen de la niebla y la expresión del espíritu para coincidir con el original del jefe.
- Compilación: [build.log](build.log). Dimensiones, transparencia y comparación SHA-256 entre `public` y `dist`: [verification.json](verification.json).

La cantidad final de enemigos y su ritmo quedan disponibles para evaluación jugando el nivel; las pruebas verifican los límites y las secuencias, no sustituyen esa valoración de dificultad.
