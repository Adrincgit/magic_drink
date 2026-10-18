# El maizal del último atardecer — revisión del 17/10/2026

**Arte de personajes vigente:** [corrección anime cartoon con los payasos como referencia](../cornfield-cartoon-v3/README.md). Los recursos y capturas de personajes de esta carpeta documentan la primera entrega; el recorrido y el combate descritos a continuación siguen vigentes.

El 2-3 pasa de 9.800 a **15.600 unidades**. El recorrido alterna los caminos de entrada, maíz denso, secaderos, una hondonada con pendientes y el claro del Rey de Paja. Hay rutas altas opcionales, tres rescates, seis emboscadas y cinco claros con separación entre encuentros. Fallar un salto devuelve a la ruta inferior; no hay saltos obligatorios sobre abismos. Reiniciar conserva el comportamiento vigente: volver al principio del capítulo.

El panorama, las granjas lejanas, el banco intermedio, las hileras del camino y las plantas delanteras se desplazan a velocidades diferentes. El maíz oscila y se agita antes de una emboscada; los enemigos emergen durante 0,8 s antes de actuar. La vegetación delantera pierde opacidad cerca de Hexy y sus oponentes para conservar la lectura del combate. El suelo y la cámara siguen las pendientes reales.

Los espantapájaros alternan lanzadores y corredores. Su marcha tiene doce dibujos gobernados por distancia. Los cuervos tienen ocho dibujos de vuelo, avisan durante 0,7 s y se lanzan hacia una posición comprometida: no corrigen la picada cuando Hexy esquiva. También aparecen payasos calabaza y brujas voladoras, espaciados entre encuentros. Las pacas se pueden romper o usar para alcanzar las rutas superiores; un enemigo apoyado en una paca destruida cae al suelo.

## Rey de Paja

- **Primera forma:** abrigo verde y horca; dos abanicos de dardos, embestida y lluvia sobre tres posiciones anunciadas.
- **Transición:** se desarma y reconstruye durante una ventana de 3,2 s. Destruir sus tres montones evita que recupere 24 puntos de vida. Un golpe grande no puede saltarse la segunda forma.
- **Segunda forma:** cuerpo de raíces y paja con ataques de raíces anunciadas, salto dirigido con ondas al aterrizar, ráfagas alternadas, refuerzos limitados y embestida. Las raíces dejan huecos de paso y admiten salto. Los ataques tienen preparación, descarga y recuperación vulnerable.

Las dos formas tienen dibujos de marcha propios de doce poses, ataques, reacción, transformación y derrota. La cámara abre el plano según la distancia. La entrada al combate retira a los enemigos rezagados para que solo los refuerzos del jefe entren en su encuentro. La victoria espera a la derrota animada. **No se dibujan barras de vida enemigas.** Se conserva el HUD de Hexy y la intercepción con magia fuerte.

## Arte y reproducción

Creado con **ImageGen integrado**, usando las referencias del propio nivel. Los originales se guardan en [sources](sources/). Conjunto de prompts: [personajes y entorno](prompts.json), [cuervos y efectos](flock-prompt.json), [locomoción del Rey](walk-prompt.json).

Recursos finales: [`public/arcade/act-two/cornfield-v2`](../../../../public/arcade/act-two/cornfield-v2/). Son seis atlas, con 88 celdas empaquetadas, y seis recortes de escenario. Las cuadrículas generadas se miden por sus dibujos reales; no se asume que coincidan con el prompt. Se conservan componentes completos, apoyo de pies y márgenes para la horca, alas y paja. Dos poses de raíces que se tocaban en la fuente se excluyen de la selección. [Registro de recortes](registration.json) y [comprobación de márgenes](atlas-check.json).

Empaquetado reproducible: `node scripts/arcade/pack-cornfield-v2.mjs`.

## Comprobaciones

[49 pruebas aprobadas](tests.log): navegación con saltos normales por todas las plataformas superiores, paso completo del nivel con movimiento y disparos reales, rescates alcanzables, emboscadas, marcha por distancia, picadas, destrucción de apoyo, raíces con aviso y salto, reconstrucción y ambas fases. Incluyen derrota con la varita básica, regresiones del acto 2, cadencia y música. El selector real abre 2-3, 2-4 y 2-5 sin recursos ausentes.

[Compilación](build.log): `npm run build` terminó en `Complete!`, con cero errores de Astro. Se mantienen los avisos informativos de Browserslist y tamaño de paquetes.

Revisión visual mediante el motor y renderizador de producción: `node scripts/arcade/review-cornfield-v2.mjs`. Los vídeos se decodifican para inspeccionar sus fotogramas:

- [Entrada al maíz](entering-corn-playback.png) · [vídeo](entering-corn.webm).
- [Hondonada y secaderos](hollow-run-playback.png) · [vídeo](hollow-run.webm).
- [Combate y transformación](king-both-phases-playback.png) · [vídeo](king-both-phases.webm).

Estas grabaciones usan invulnerabilidad para observar las acciones completas, suprimen únicamente el parpadeo visual de esa invulnerabilidad y fuerzan el umbral de fase y la derrota a tiempos conocidos. No sustituyen una partida humana de ajuste de dificultad. Las pruebas de combate verifican además la derrota mediante disparos reales. [Errores y recursos del navegador](browser-errors.json).

La revisión final no registró errores del navegador ni recursos ausentes. En estas capturas el tiempo de simulación y dibujo medido en el equipo local tuvo medianas de 0,6–0,8 ms por cuadro; es una medición de esta ejecución, no una garantía para otros dispositivos.
