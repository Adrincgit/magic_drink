# Ribbon Raspberry, Posavasos encantado y Payaso paraguas

Implementación local de la terna propuesta, 2026-10-10. Se conserva el resto del trabajo previo del checkout.

## Ribbon Raspberry

- Bebida 12: lata rosa y crema, mascota hurón con cinta. Disponible en botín desde 1-3 y como sabor inicial de tienda por 110 estrellas.
- Normal: látigo de cinta unido a la punta de la varita, barrido de 0,4 s, alcance máximo aproximado de 168 unidades y 3,5 de daño. Cada objetivo recibe como máximo un impacto por barrido. Sigue la dirección de apuntado y se interrumpe al rodar o recibir daño.
- Fuerte: lazo de 1,5 s que reúne hasta tres payasos pequeños sobre suelo conectado, con un golpe de 3 de daño. No mueve máquinas, jefes ni enemigos a través de huecos. El paraguas abierto impide la captura inicial.
- 44 disparos base; fuerte consume 5 disparos y 34,5 de magia, igual que las otras bebidas. Los mods de tamaño y la bebida potenciada afectan el alcance.
- Echo puede repetir la cinta desde la varita de su silueta fija. Prism no divide un látigo unido a la varita.
- La lata sale al romper el contenedor; no se dibuja como un objeto recogible por fuera de la caja.

## Posavasos encantado

- Mod de un nivel, 135 estrellas, disponible desde 1-3.
- B en teclado, L3 en mando y botón propio en HUD táctil.
- Solo se coloca en el aire. Superficie de una dirección: permite subir a través y aterrizar encima. Dura 1,6 s, muestra grietas antes de romperse y admite saltar desde ella.
- Una colocación hasta tocar terreno real. Volver a aterrizar en el posavasos no recarga el mod. No forma parte de las plataformas permanentes del nivel.
- Estado temporal eliminado al reintentar, entrar en tienda/carpa, completar el nivel o iniciar el súper. El HUD atenúa el amuleto mientras está gastado.

## Payaso paraguas

- Enemigo 14. Sustituye un payaso de las carpas segunda y tercera del 1-5; no aumenta las cantidades de esas oleadas.
- Camina a 34 unidades/s con ciclo ligado a la distancia recorrida. Paraguas abierto bloquea magia frontal y captura por burbuja; espalda y ataques descendentes quedan expuestos.
- Cierra durante 0,65 s antes de atacar; mantiene la orientación anunciada. Después recupera durante 0,75 s con el paraguas cerrado.
- Atlas de 16 dibujos: caminar, cerrar, disparar con paraguas cerrado, recuperar, abrir, bloquear y cuatro etapas de derrota. Escala compartida y botas registradas en la misma línea para evitar saltos de tamaño/altura.

## Arte y verificación

Los cuatro originales se generaron con **imagegen integrado**, con transparencia real y referencias de la familia visual existente. Prompts exactos, originales y destinos: [art.json](art.json). El script `scripts/arcade/pack-ribbon-coaster-umbrella.mjs` recorta, registra y empaqueta los recursos sin repintarlos. La cinta se dibuja con la misma geometría que sus colisiones.

Recursos finales:

- `public/arcade/sprites/pickups/ribbon-raspberry.webp`
- `public/arcade/sprites/ui/enchanted-coaster.webp`
- `public/arcade/sprites/effects/enchanted-coaster.webp`
- `public/arcade/sprites/enemies/umbrella-clown.webp`

Pruebas: `hexy-ribbon-coaster-umbrella.spec.js` cubre daño único, aim, Echo/Prism, lazo y huecos, plataformas temporales, consumo/carry/cajas, bloqueo direccional y ventanas de ataque. `hexy-ribbon-coaster-umbrella-browser.spec.js` compra y equipa en tienda real, utiliza B/L3/botón móvil, reproduce los ataques/derrota y verifica aparición en la carpa del 1-5. Se revisaron capturas y fotogramas de la grabación de juego en `tests/artifacts/ribbon-coaster-umbrella/`.

Además se ejecutaron las suites previas de bebidas, mods tácticos y profundidad del campamento. Build de Astro sin errores ni advertencias; mantiene 24 hints existentes. Las pruebas no sustituyen una partida completa para ajustar la dificultad.
