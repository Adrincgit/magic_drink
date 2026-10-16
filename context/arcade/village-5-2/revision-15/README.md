# Revisión 15 — la Cosechera y la evacuación

16/10/2026. El jefe termina su absorción y vuelve al combate. Al cruzar media vida llama una escoba, espera su llegada, se monta y despega para continuar atacando desde el aire.

## Jefe

- Tamaño terrestre reducido exactamente un 15 %: 290 → 246,5 unidades, con cuerpo de colisión y anclajes ajustados.
- Ritual con ventana de captación y final definidos. Si no hay sitio para más calabazas, el jefe sigue combatiendo; si se agotan los sitios durante un ritual, los dulces pendientes quedan en el suelo y siguen siendo rescatables. Los golpes no interrumpen la absorción.
- Recuperación de cautivos antiguos sin reloj de absorción para impedir coordenadas inválidas o una espera indefinida.
- Llegada de la escoba en 1,2 s, montaje de 1,15 s y despegue de 1,1 s. La transición se conserva si cruzó media vida durante la absorción y luego se curó.
- Segunda fase con recorrido horizontal de la arena, cambios de altura, abanicos de cinco rayos, ráfagas de tres salvas y lluvia de cinco gotas mágicas. Los disparos salen de la punta medida de la varita en el fotograma de lanzamiento. Los proyectiles siguen impactando en el suelo.
- Cámara más abierta antes del despegue. La derrota aérea cae con la identidad de la Cosechera; el reintento reconstruye la fase terrestre. Sin barras de vida enemigas.

## Evacuación

- Carroza inicial al 82 % del tamaño anterior, situada 24 unidades más atrás. Se dibuja antes de Miso y del resto de actores; los cascos, ruedas y polvo comparten esa profundidad.
- Defensores: sólo inician la acción al tener un objetivo. El fotograma de mano abierta libera una piedra visible, con arco, estela breve, colisión, daño y sonido. La retirada ocurre entre lanzamientos, con los pies plantados durante el gesto. Seis lanzamientos y seis impactos en la grabación de dos defensores.
- Un adulto por grupo de la aproximación hace la advertencia, frena y mantiene el alto hacia Hexy durante 2,8 segundos. Los niños siguen huyendo. El adulto se dibuja después de los otros pueblerinos para que éstos no oculten su gesto. La advertencia termina si Hexy lo rebasa y no se activa dentro del pueblo.
- Retirada la secuencia de tropiezo, caída y ayuda. Los estados antiguos de esa secuencia vuelven a la huida al actualizarse.

## Arte

Generación con la herramienta ImageGen integrada: veinte celdas nuevas, con cuatro de montaje, cuatro de vuelo, cuatro de ataque, cuatro de absorción y cuatro de escoba sin jinete. No llevan proyectiles ni resplandores pegados a la varita.

- Atlas final: [`public/arcade/sprites/bosses/harvester-flight-v15.webp`](../../../../public/arcade/sprites/bosses/harvester-flight-v15.webp).
- Fuente RGBA: [sources/harvester-flight.png](sources/harvester-flight.png).
- Prompt final: [prompt.txt](prompt.txt).
- Recortes y puntos de registro: [registration.json](registration.json).
- Empaquetado técnico reproducible: `node scripts/arcade/pack-harvester-v15.mjs`.

Las advertencias usan las poses de alto existentes con mayor duración, espacio y protagonismo. Las dos generaciones de poses adicionales para civiles fueron rechazadas por la herramienta; no se incorporó ningún resultado de esos intentos.

## Verificación

Pruebas específicas del jefe, absorción, vuelo, posición real de lanzamiento, capacidad, cambio de fase tras curación, caída, reintento, piedras, advertencias y eliminación de tropiezos, además de regresiones de combate y carga real del capítulo: [tests.log](tests.log).

Grabaciones con el motor y renderizador de producción, posteriormente decodificadas e inspeccionadas:

- [Combate y cambio de fase](boss-playback.png).
- [Carroza detrás de Miso](carriage-playback.png).
- [Piedras de los defensores](defenders-playback.png).
- [Advertencia mirando a Hexy](warning-playback.png).

Vídeos: `tests/artifacts/arcade/harvester-v15/{boss,carriage,defenders,warning}.webm`. Regeneración: `node scripts/arcade/review-harvester-v15.mjs`. Eventos, fases y conteos en [validation.json](validation.json); compilación en [build.log](build.log).

La primera ejecución de navegador encontró el servidor detenido. Se inició el servidor y se repitieron las comprobaciones. Después se reinició para revisar las modificaciones que el observador de archivos no había recargado. El log final corresponde al código recargado.
