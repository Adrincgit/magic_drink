# Pulido del recorrido, Hexy y la barcaza — 16/10/2026

## Reglas vigentes

- Un disparo breve o fuerte no sustituye las piernas que están corriendo por una pose quieta. La recepción de un salto solo fija los pies cuando Hexy se ha detenido. El retroceso de Popcorn conserva la marcha cuando se dispara corriendo.
- Perder o comenzar la celebración restaura salud, magia, ultimate y su reserva, munición equipada y esperas de acciones. Se retiran los bunnies del intento; al reintentar reaparecen las jaulas y sus portadores. El resultado conserva el número de rescates de ese intento, separado de los seguidores activos. Las estrellas ya cobradas conservan sus recibos.
- Las cajas requieren una superficie estable y espacio respecto a pinchos, carpas, jaulas, tienda, lápidas, escombros y otras cajas. La revisión visual también separa las cajas de lápidas decorativas sin colisión. La caja de un corazón sigue siendo única, cerca del punto medio del recorrido.
- Los proyectiles móviles amigos y enemigos detectan el cruce de la superficie del río, terminan allí y dejan un splash. El punto de impacto se interpola incluso entre dos pasos de simulación. Chorros, olas y ataques continuos conservan su física propia.
- El polvo común utiliza el material de la superficie y la distancia recorrida. Incluye a Hexy y enemigos terrestres. Se corrigen los recortes del polvo para que sea visible sin convertir cada paso en una nube grande. El cementerio y el exterior del circo usan tierra. El salto sencillo produce contacto con la superficie; las estrellas se reservan para el segundo salto.
- Los textos de instrucciones de Jelly y Honey aparecen en tutorial y prueba de Miso. Durante campaña se conserva la previsualización necesaria para colocar el objeto.
- Popcorn repele en dirección contraria al disparo: apuntar arriba empuja hacia abajo; apuntar abajo eleva a Hexy. Sostener el salto no anula el breve impulso descendente de un disparo hacia arriba. Disparar horizontalmente no concede elevación gratuita.

## Ultimate direccional

Ocho direcciones con espejo horizontal: horizontal, diagonales y verticales. El vector queda fijado al activar el ultimate y gobierna dibujo, origen medido, rayo, daño y retroceso. Las versiones en el aire usan posturas aéreas. Se conserva el disparo horizontal existente y el duelo horizontal con el Arlequín; un disparo dirigido a otra dirección no activa ese choque.

Las poses sostenidas fueron sustituidas por [preparaciones y ciclos de descarga animados](../hexy-acting/README.md), con continuidad de la mano y dibujos propios de cabello. Los archivos siguientes quedan como referencia histórica; la hoja estática ya no se carga ni selecciona en el juego.

- Asset del juego: `public/arcade/sprites/hexy/super-directional-v1.webp`.
- Fuentes con alfa: `ultimate-one-hand-source.png` (solo las dos primeras filas) y `ultimate-down-source.png` (las cuatro poses inferiores).
- [Prompts finales y modo de generación](prompts.md). Herramienta integrada **imagegen**.
- Empaquetado reproducible: `node scripts/arcade/pack-directional-ultimate.mjs`.
- Registro: `ultimate-registration.json` y `hexyDirectionalSuperAtlas.js`.
- La previsualización `ultimate-size-review.png` compara las posturas con los dibujos anteriores a escala de celda. El juego aplica registro de escala 1,15 a la nueva hoja, conservando el pivote y la punta real de la varita.

## Barcaza 1-3

La maquinaria funciona sola. Se retiran el operador añadido y los cables dibujados sobre todo el barco; se conserva la cabina vacía de la pintura y el mazo pintado, unido a un mecanismo local. Los buzos aparecen al salir de la cabina o saltar al agua.

El casco permanece en el canal detrás del puente. Se elimina su bloqueo de contacto con Hexy, también durante la entrada. El puente se recorre completo y la barcaza se desplaza suavemente entre ataques. Las olas se registran nueve unidades más abajo, con la misma corrección en su colisión.

Los chorros tienen frente y cola: cuando termina la emisión, el agua restante sigue avanzando. El torrente curvo produce la ola al tocar la superficie. Romper el tanque corta la emisión y deja viajar el agua que ya salió.

La derrota rompe chimeneas, tambor, tanque, cabina, cañón y rueda por sus formas. El casco se inclina y se hunde durante la secuencia. Los recortes estructurales usan máscaras de sus componentes, sin una cuadrícula de rectángulos. En el acceso de 1-5 se retira la vegetación pegada a las fachadas y se dejan huecos entre los elementos del suelo y las carpas.

## Verificación

`tests/hexy-route-polish.spec.js` comprueba marcha durante disparos, restauración y jaulas, espacio de cajas, cruces rápidos de agua, ultimate y daño en sus direcciones, reacción de Popcorn y polvo por contacto. Las pruebas de barcaza verifican también colisiones y trayectorias, daño localizado, final de emisión y derrota.

`node scripts/arcade/review-route-polish.mjs` usa el motor y renderizador reales en Chrome, graba y decodifica escenas de marcha, polvo, agua, barcaza y diez variantes del ultimate. Las grabaciones, trazas y hojas de reproducción están en `review/`; también se inspeccionan cajas, carpas y textos de colocación en campaña y prueba. Los registros finales de pruebas y compilación están en esta carpeta. No se añaden barras de salud a enemigos.
