# Tienda y revisión de bebidas · 2026-10-11

La tienda muestra catálogo, ficha y patio de prueba juntos en pantallas de escritorio. Buscar y filtrar no compra artículos. Comprar, equipar, mejorar y ampliar el estuche son acciones explícitas; probar no llama a ninguna operación de guardado.

## Prueba gratuita

- **Ver demo** repite una demostración con las mecánicas reales.
- **Probar yo** da el control del patio. Flechas/AD, Espacio, Z, C, X, V, R, Q y B conservan su función. También acepta mando estándar.
- **Esc** vuelve a navegar la tienda; Menú del mando sale de la prueba. B del mando sigue siendo rodar dentro del patio.
- **Reiniciar** restaura el ensayo y la munición. Se puede probar cualquier nivel de mejora sin poseerlo.
- **Combinar con** cambia la bebida de ensayo sin borrar los prismas ni otros efectos desplegados.
- Los payasos del patio tienen más vida para observar daño sostenido. Los de la prueba de Honey caminan para hacer visible la ralentización. Ningún resultado del patio se transfiere a la aventura.

## Mecánicas

| Objeto | Cambio |
|---|---|
| Botitas de resorte | 100 estrellas, un nivel. Pisotón sobre enemigo pequeño: impulso vertical de 690 y recuperación de saltos aéreos. Sin inmunidad a pinchos ni maquinaria. |
| Echo Melon | Eco móvil durante 3,5 s, con movimiento y pose retrasados. Copia los disparos nuevos al 50% de daño. Conserva el básico expansivo. |
| Prism Peach | Básico de 1,6 de daño. Cada división produce tres tiros al 55%. Mejora II o lata potenciada: dos prismas, hasta 7 s. Cada trayectoria puede visitar dos prismas como máximo. Cintas y ataques continuos no se dividen. |
| Jelly Cherry | Mantener C muestra el trampolín; flechas horizontales ajustan distancia; soltar confirma. V cancela. Desde mejora II o lata potenciada, las cerezas descendentes rebotan más alto sobre su trampolín. |
| Volt Lychee | Z mantiene un rayo de 315 unidades y hasta tres enemigos. Cada encendido cobra una unidad; comienza a dañar tras 0,34 s y sube gradualmente. C: descarga instantánea de 850 unidades, hasta cinco enemigos, 7 de munición y 42 de magia. Las cadenas pierden 25% de daño en cada salto. |
| Honey Mango | Mantener C y usar flechas controla posición y altura; soltar confirma. Vista previa del panal y área del suelo. La miel deja marcas ámbar y ralentiza sin encerrar al enemigo. |
| Bubble Tape | Básico captura proyectiles. Solo el fuerte atrapa enemigos elegibles; maquinaria excluida. |
| Orbit Orange | Nueva ilustración de lata, 257 × 480, sin estirar el personaje de la etiqueta. |

La colocación cobra al confirmar sobre suelo válido, nunca al mover la vista previa ni al cancelar. Un toque breve conserva 0,2 s de anticipación visual.

## Arte

Generado con **imagegen integrado**. Referencias: Orbit Orange anterior, Prism Peach y el amuleto Posavasos encantado. Fuentes y prompts completos en [art.json](./art.json); recorte de transparencia y conversión reproducibles mediante `scripts/arcade/pack-shop-lab.mjs`.

- `public/arcade/sprites/pickups/orbit-orange.webp`
- `public/arcade/sprites/ui/spring-boots.webp`

## Comprobaciones

Pruebas dedicadas: `hexy-drink-revision`, `hexy-shop-workshop`, `hexy-shop-lab-motion`. Regresiones de Aqua, Ribbon, Posavasos, paraguas, inventario y tienda en sus archivos existentes. Las capturas de escritorio y el vídeo están en `tests/artifacts/arcade/shop-lab/`.

Validado en Chrome a 1920 × 1080 y 2560 × 1440, incluida la prueba gratuita con cero estrellas, compra, mejora y equipamiento. Revisadas capturas secuenciales de las demostraciones. Pasan las pruebas dedicadas, las regresiones de bebidas y tienda y nueve comprobaciones adicionales de Bubble Tape. `npm run build` termina correctamente: 0 errores, 0 advertencias y 24 hints del analizador.

Los números de daño son una primera calibración comprobada funcionalmente; el equilibrio final depende de probarlos durante los niveles.
