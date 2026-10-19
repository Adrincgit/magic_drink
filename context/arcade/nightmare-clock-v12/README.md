# Choque con reloj y proyecto independiente

La cuenta atrás vuelve a decidir el desenlace. Empieza con 20 segundos; cada contraataque añade 10 al descargarse, con un máximo de 20 segundos restantes. Las cargas cinematográficas pausan la cuenta. La última oleada de frustración no concede tiempo adicional.

- Antes de su primer contraataque: llegar cerca de la arlequina activa su sorpresa. Si vence el reloj y Hexy iba ganando, el rayo avanza primero hasta cerca de ella, se detiene y ella carga su contraataque.
- Después de ese contraataque: al vencer el reloj gana quien domine la mitad del empuje. El empate exacto favorece a Hexy, como en el choque de fuego. El rayo ganador recorre el tramo restante y solo entonces se aplica el impacto y el daño.
- Encore doble recentra el contacto y suma tiempo; sigue siendo posible perder por presión o por reloj.
- Durante el avance final se conservan los sprites de esfuerzo, los retratos y la perspectiva de la arena.

La unión de los poderes usa el centro luminoso pintado de cada dibujo, no el borde de su celda. Se registraron 12 dibujos del rayo de Hexy, 16 del torbellino Halloween y 8 del contacto. El arte y sus contornos están intactos. La comprobación de las transformaciones reales de Canvas en 288 combinaciones dio una desviación máxima de 0.000052 unidades.

## Evidencia

Grabaciones reales reproducidas y decodificadas en `tests/artifacts/arcade/nightmare-clock-v12/`:

- `midpoint-right.webm` y `midpoint-left.webm`: unión durante Encore doble en las dos orientaciones.
- `expiry-surprise.webm`: reloj a cero, avance aparente, sorpresa, +10 segundos y Encore doble.
- `expiry-win.webm` y `expiry-loss.webm`: decisión por tiempo y recorrido visible antes de la explosión.
- Archivos `*-playback.jpg`: doce fotogramas decodificados de cada grabación. Los JSON registran presión, tiempo, estado y vida.

Validación: 33/33 pruebas iniciales de combate; revisión amplia con 94/95, cuya única discrepancia era una expectativa antigua de 30 segundos. Esa prueba se corrigió al tope de 20 restantes y pasó en la repetición dirigida (1/1). Ambos proyectos compilan con cero errores. El proyecto independiente además pasó 22/22 pruebas de aventura y combate, incluyendo escritorio, móvil, práctica, pausa y capítulos. Se revisó en navegador su inicio y partida, con audio cargado y sin errores, recursos faltantes ni peticiones a otro proyecto.

## Proyecto independiente

`G:\TRABAJO\ASTRO\ADRINC_WEBS\hexy-lost-chorus`

Tiene su propio paquete, lockfile, dependencias, páginas, servidor en el puerto 4322, pruebas, fuentes de arte y reglas en AGENTS.md. No usa enlaces a Magic Drink. Se comprobó la igualdad de 485 archivos del motor, código compartido y recursos del acto dos. La navegación del portal no forma parte del juego independiente.

El guardado conserva su formato; por ser otro origen del navegador, el puerto 4322 tiene su propio progreso. No hay sincronización automática entre las dos carpetas. La versión del portal permanece en Magic Drink y el trabajo futuro del videojuego se realiza en la carpeta nueva.

El checkpoint previo se publicó como `54f8dbe` en `origin/paralax`, antes de estas correcciones.
