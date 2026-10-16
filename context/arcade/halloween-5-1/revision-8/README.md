# Corrección: hueso visible en el zombi, ropa en las piezas desprendidas

La revisión 7 interpretó mal la petición sobre las extremidades: vació también los muñones del personaje. La aclaración del usuario distingue dos cosas:

- El zombi debe mostrar hueso al perder un brazo o una pierna.
- La pieza que se desprende y cae al suelo conserva manga, guante, pantalón o bota y el volumen del miembro; no se convierte en un hueso suelto.

Se corrigieron los ciclos de caminar con un brazo, arrastrarse, reaccionar a la pérdida y alcanzar hacia arriba con un brazo. Se conservan el sombrero, el traje, las poses y los tiempos. Las poses intactas se copian del atlas anterior; el último fotograma de caída coincide con el primero del arrastre.

## Archivos

- `public/arcade/sprites/enemies/nightmare-injured-v8.webp`: 16 celdas, 1024 × 1024.
- `public/arcade/sprites/enemies/nightmare-zombie-reactions-v8.webp`: 24 celdas, 1024 × 1536.
- `public/arcade/sprites/enemies/nightmare-clothed-limbs-v7.webp`: conservado sin cambios, comprobado mediante SHA-256.

Edición con la herramienta integrada **image_gen**. Los [prompts completos](prompts.json) y las fuentes PNG quedan en esta carpeta. El empaquetado técnico se reproduce con `node scripts/arcade/pack-nightmare-stumps-v8.mjs`; mantiene el alfa y registra las celdas en la misma línea de suelo.

## Verificación

Registro de dimensiones y continuidad: [verification.json](verification.json). Las poses intactas mantienen el mismo alfa; el compuesto de Sharp introduce como máximo un nivel RGB de redondeo.

Las grabaciones de pérdida de brazo/pierna y alcance bajo una rama, con payaso intacto y herido, se guardan en `tests/artifacts/arcade/cemetery-revision-8/`. Se usan el motor y el renderizador de producción.

- 16 pruebas aprobadas: [tests.log](tests.log).
- Tres grabaciones decodificadas y revisadas: `injuries`, `reach` y `reach-injured`. Se ve el hueso en los muñones y la ropa en las piezas desprendidas, incluyendo el brazo móvil y los restos asentados.
- Compilación terminada, 0 errores: [build.log](build.log). Los dos atlas nuevos y las piezas vestidas coinciden entre `public` y `dist` por SHA-256.
