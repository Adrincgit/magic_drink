# Escenario, llegadas y Encore

## Ultimate: retroceso e impacto, 7 de octubre de 2026

Hexy retrocede lentamente durante la descarga: hasta 28 unidades en tierra y 40 en el aire, con aceleración y frenado suaves. El retroceso empieza al salir el rayo y conserva su posición final. En tierra sigue la pendiente y se detiene antes de perder apoyo; también respeta los límites del mapa, la arena y el cuerpo sólido del jefe. La varita y el origen del haz se actualizan juntos en cada cuadro.

El disparo tiene un golpe inicial de cámara de hasta 4 píxeles lógicos, seguido por una vibración pequeña que desaparece al terminar. Un único destello cálido de 0,16 segundos marca la salida; los pulsos restantes refuerzan el brillo local de la varita. Movimiento reducido desactiva el temblor, el destello y la oscilación nueva del brillo. El mundo sigue detenido durante el ultimate, salvo el movimiento de Hexy y los efectos de su descarga. Se mantienen ocho impactos, duración de 3,15 segundos, coste de 90 y recarga base de 80 segundos.

El retrato lateral se aprobó e implementó en la revisión siguiente: [encore-cutin/README.md](../encore-cutin/README.md). Su entrada, pausa y salida caben en la preparación existente de 0,9 segundos.

Validación: 24 pruebas aprobadas y compilación de producción correcta (0 errores y 0 advertencias del comprobador Astro). Los casos incluyen 30/60/120 FPS, suelo y aire, ambas direcciones, pendientes, bordes y registro de la varita. Se revisaron capturas de la descarga normal y con movimiento reducido. La grabación `tests/artifacts/arcade/super-impact/ultimate-recoil.webm` muestra las cuatro combinaciones de postura y dirección. Los registros están en esa misma carpeta: `regression.log` (22 pruebas), `air-registration.log` (2) y `build.log`. El archivo `verification.json` de esta carpeta conserva la evidencia de la revisión del escenario anterior.

## Revisión anterior del escenario

Revisión del 6 de octubre de 2026: retirada del primer plano rechazado, árboles mayores sin raíces visibles y daño durante el dash.

## Escenario y cámara

Se retiraron de ambos niveles las matas y los troncos cercanos difuminados. Sus cuatro imágenes históricas permanecen en disco, pero ya no se cargan ni se dibujan. Se eliminaron los módulos de colocación que habían producido las franjas y los grupos rechazados.

El bosque conserva sus cuatro especies nativas en tres velocidades de fondo, además de las montañas y el valle. En la arena del segundo jefe quedan dos árboles grandes: abedul y sauce. La parte inferior de las imágenes queda detrás del suelo opaco para ocultar el ensanchamiento de las raíces. Se mantienen sus colores y proporciones, sin filtros de desenfoque.

La altura y el tamaño de los árboles lejanos no dependen del zoom de combate. El fondo sigue una elevación amortiguada del recorrido, independiente de la compensación vertical de ese zoom. Los elementos físicos del escenario conservan su colocación sobre el terreno.

Al entrar a cualquiera de las dos arenas, el alejamiento de cámara mantiene el suelo como punto de referencia y lo desplaza suavemente hacia su altura de combate. La posición horizontal se limita cada cuadro usando el ancho visible actual, para que la ampliación del encuadre no descubra el final del mapa.

## Daño durante el dash

El dash terrestre y el aéreo reciben daño si un proyectil intersecta el cuerpo de Hexy; un golpe que quita salud interrumpe el dash y activa su reacción. La voltereta conserva su cuerpo bajo, por lo que un proyectil que pasa por encima puede fallar físicamente. Los escudos reales y el breve margen después de recibir daño conservan su protección.

## Sprite aéreo nuevo

El dibujo se creó desde la pose canónica de pie como referencia de identidad. La hoja de ultimate rechazada no se utilizó como entrada.

La pose elegida sostiene la varita con una sola mano cerrada y el codo flexionado; la otra mano queda recogida junto al cuerpo. Las piernas están levantadas hacia delante. Cuatro dibujos animan el cabello, la falda y los pies, manteniendo el agarre y la punta registrados. La preparación y la descarga usan la nueva hoja.

El empaquetado extrae cada dibujo completo por su alfa conectado, porque algunos zapatos atraviesan el margen nominal de la cuadrícula generada. Aplica una escala uniforme, conserva zapatos y cabello y evita incorporar fragmentos de otro cuadro. No estira el cuerpo de forma diferente en horizontal y vertical. Las medidas están en [air-registration.json](air-registration.json).

## Comportamiento conservado

El agua bajo los puentes sigue fija en coordenadas del escenario; sólo se animan las ondas de superficie. La espuma utiliza los puntos de contacto reales de cada pilar. La comparación del agua normalizada no cambia al desplazar horizontalmente la cámara.

Se conservan las llegadas graduales de los dos jefes, los ocho impactos del ultimate, su recarga base de 80 segundos y la reserva independiente. Esta revisión no vuelve a borrar progreso ni cambia el marcador del reinicio anterior.

## Arte histórico y validación actual

Esta revisión no generó imágenes nuevas. De los recursos creados en la revisión anterior siguen activos:

- public/arcade/sprites/hexy/air-super-release.webp
- public/arcade/sprites/effects/pier-foam.webp

Los árboles nativos del bosque permanecen activos. [prompts.json](prompts.json) conserva los prompts anteriores; [assets.json](assets.json) indica qué imágenes se retiraron del render, además de sus tamaños y hashes.

Las pruebas actuales comprueban impactos durante ambos tipos de dash, escudos, límites del mapa y altura del suelo cuadro a cuadro a 30/60/120 FPS, árboles independientes del zoom, llegadas de jefes, contacto del agua con los pilares y combate. Pasaron 37 pruebas distintas y la compilación de producción. Una prueba antigua de daño al jefe se corrigió: apuntaba a las ruedas y esperaba daño, aunque la regla vigente exige acertar al cuerpo incluso mientras dispara.

Las capturas actuales y boss-camera.webm están en tests/artifacts/arcade/dash-camera, excluido de Git. Se inspeccionaron capturas de la llegada, el encuadre amplio de embestida y el extremo derecho; el vídeo registra ambas llegadas para revisión. [verification.json](verification.json) detalla las ejecuciones y su alcance. La revisión visual no equivale a aprobación del usuario.
