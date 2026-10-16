# Volt Lychee, Honey Mango y Orbit Orange

Segunda tanda jugable, IDs 9–11. Conserva los sabores anteriores y la exclusión de Dragon Grape del botín aleatorio del 1-4.

| Bebida | Disparo normal (Z) | Magia fuerte (C) |
| --- | --- | --- |
| Volt Lychee | Rayo de corto alcance. Tras el primer impacto salta hasta dos veces a enemigos próximos, perdiendo potencia en cada salto. | Dos postes apoyados en terreno sólido forman una cerca durante 4,2 segundos. Tras un aviso inicial descarga cada 0,45 segundos. No atraviesa plataformas sólidas. |
| Honey Mango | Gota con gravedad que deja miel sobre el suelo. La miel frena a los payasos pequeños, sin detener maquinaria. | Panal que deja caer seis gotas repartidas en tres posiciones. Los charcos duran 2,3 segundos y hay un máximo de seis. |
| Orbit Orange | Luna que describe una curva alrededor de Hexy y sale disparada tras 0,46 segundos. | Tres satélites acompañan a Hexy durante 4,2 segundos. Cada uno se consume al golpear un enemigo u objeto o interceptar un proyectil móvil. No apagan incendios del suelo. |

Cada fuerte cuesta una sola vez 5 disparos y 34,5 de magia. Una instalación por sabor, con limpieza al entrar a la tienda, cambiar de sala, reintentar o finalizar el encuentro. Los proyectiles de Echo conservan su origen fijo cuando repiten Orbit, y las copias del prisma salen directamente sin reiniciar la órbita.

Tienda y botín progresivo: Honey desde el segundo capítulo, Volt desde el tercero y Orbit desde el cuarto. Las latas aparecen al romper los contenedores; no se añadieron latas sueltas sobre ellos. Reservas normales: 42, 48 y 40 disparos respectivamente. Precios del sabor inicial: 110, 95 y 120 estrellas.

Arte creado con ImageGen integrado, tomando Prism Peach como referencia de familia. Originales preservados, prompts completos y rutas en [wave2-art.json](wave2-art.json). El script `scripts/arcade/pack-drink-wave2.mjs` empaqueta WebP con transparencia; registra las filas del atlas para no cortar la estrella de los postes ni las gotas del panal.

Archivos finales:

- `public/arcade/sprites/pickups/volt-lychee.webp`
- `public/arcade/sprites/pickups/honey-mango.webp`
- `public/arcade/sprites/pickups/orbit-orange.webp`
- `public/arcade/sprites/effects/volt-lychee.webp`
- `public/arcade/sprites/effects/honey-mango.webp`
- `public/arcade/sprites/effects/orbit-orange.webp`

Validación: `tests/hexy-extra-drinks.spec.js`, `tests/hexy-extra-drink-motion.spec.js`, `tests/hexy-extra-drink-shop.spec.js` y regresión de `tests/hexy-drink-roster.spec.js`. Capturas y grabación de teclado en `tests/artifacts/drink-wave2/`. Revisión visual de fotogramas, alineación de postes, miel y órbitas. El ajuste fino de balance sigue requiriendo una partida completa.
