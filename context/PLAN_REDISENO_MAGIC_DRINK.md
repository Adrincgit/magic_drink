**Plan de acción por fases — Magic Drink Original**

Fecha: 18 de septiembre de 2026.

Estado actualizado el 19 de septiembre de 2026: fases 1 y 2 ejecutadas como preparación y propuesta visual revisable. Fases 3 a 8 pendientes. El código del portal conserva su estado previo.

Entrega: [revisión visual de escritorio y móvil](rediseno/fases-1-2/revision.html), [índice de documentos y evidencias](rediseno/fases-1-2/README.md) y [storyboard de doce viñetas](rediseno/fases-1-2/arte/storyboard.svg).

**Objetivo y decisiones de partida**

Transformar el portal en una experiencia de marca con dirección artística consistente, profundidad por capas y un recorrido visual continuo. Magic Drink Original es el único producto de esta etapa. Bubble Tape, Dragon Grape, Banana Drama, Sparkle Soda y Witchy Kiwi quedan fuera de la experiencia publicada; una posible continuación podrá recuperar esas ideas.

El portal representa a la empresa y sus productos en el mundo real de la historia. Hexy es la idol comercial; Wonderpop es un espacio físico de la marca. El misterio se expresa mediante la comunicación pública y las conexiones entre música, producto y pertenencia. Las revelaciones de la novela sirven de contexto de autor y no se trasladan automáticamente al contenido público.

Se mantienen español e inglés. La propuesta visual combina el envase original, arquitectura creíble, iluminación cinematográfica y la identidad kawaii de la marca. La implementación parte del Astro, React y GSAP existentes.

Referencias de trabajo: los dos MP4 en la raíz, el documento `DJ_Sweet_Hex_Historia_Completa.docx`, el lore de `.github`, la lata original y las imágenes actuales de Wonderpop y Hexy. La documentación antigua debe contrastarse con el código y con las decisiones actuales del usuario. La revisión inicial de la novela cubrió su estructura y pasajes clave; no se considera una lectura íntegra de todos sus capítulos.

**Fase 1 — Preservar el trabajo y definir el alcance**

Propósito: contar con una base recuperable y un inventario real de lo que debe cambiar.

- [x] Revisar Git y preservar los cambios disponibles en disco y el estado persistido del editor. Los posibles buffers solo en memoria no son observables; no se reorganizó ni sobrescribió código. Limitación documentada en la base recuperable.
- [x] Preparar una copia aislada con 353 archivos verificados por SHA-256 e historial Git completo. Cambiar de rama por sí solo no respalda archivos sin seguimiento ni buffers del editor.
- [x] Registrar una referencia visual del portal actual en escritorio y móvil, especialmente Inicio, Bebidas, Hexy y Wonderpop: 24 capturas.
- [x] Inventariar referencias a sabores, textos, imágenes, audio, enlaces y efectos asociados: 159 recursos y 181 coincidencias de texto, con decisiones de migración.
- [x] Definir la ficha canónica de Magic Drink Original: envase, nombre, atributos sustentados por el lore y tono de comunicación.
- [x] Registrar la distinción entre la perspectiva pública del portal y las revelaciones de la novela.

Entregable: base recuperable, capturas de referencia e inventario de migración.

Criterio de cierre: el trabajo existente está preservado y cada área afectada tiene una decisión de conservar, adaptar o retirar de la experiencia pública. No se borran materiales de otros sabores durante esta fase.

**Fase 2 — Dirección artística y storyboard del recorrido**

Propósito: resolver la composición y las transiciones antes de producir muchas imágenes.

- [x] Definir paleta, iluminación, tipografía, escala del producto, tratamiento de Hexy y aspecto de la arquitectura.
- [x] Diseñar un storyboard de cuatro momentos: La Original; la ciudad vive Magic Drink; entrada e interior de Wonderpop; el sonido de Hexy y cierre con el producto.
- [x] Identificar las escenas que comparten un mismo espacio y las que necesitan una transición editorial. Evitar prometer continuidad física entre vistas incompatibles.
- [x] Dibujar el inicio, punto intermedio y final de cada transición, incluyendo qué elemento cubre o descubre la siguiente escena: doce viñetas.
- [x] Reservar zonas legibles para títulos, textos y controles. Los textos de interfaz y logos controlables se componen por separado del arte generado.
- [x] Preparar una composición vertical para móvil desde esta fase; creada como imagen independiente.
- [x] Definir el mapa del sitio y el contenido breve en ES/EN. Navegación propuesta: Magic Drink, Hexy, WonderPop Plaza y Nosotros; Contacto sigue accesible.

Entregable: storyboard, una composición maestra de portada y un mapa de contenido y navegación.

Criterio de cierre: las composiciones funcionan como imágenes estáticas, mantienen el protagonismo de la bebida y muestran una continuidad espacial comprensible.

Resultado: maestras de escritorio y móvil, composición HTML comprobada en ES/EN y storyboard de continuidad. Propuesta lista para revisión del autor; la aprobación estética no se presume. No se han producido las capas WebP ni probado el parallax en movimiento.

**Fase 3 — Crear el arte del primer tramo**

Propósito: obtener un conjunto pequeño de recursos definitivos con el que probar el efecto real.

- [ ] Crear la escena maestra de portada y la vista necesaria para su transición hacia Wonderpop.
- [ ] Usar el envase y los diseños de marca como referencias fijas; comprobar que etiqueta, estrella, colores y proporciones se conservan entre imágenes.
- [ ] Preparar las capas según el storyboard: cielo, ciudad lejana, arquitectura, entorno cercano, producto, elementos de primer plano y acentos ambientales.
- [ ] Generar o reconstruir los fondos ocultos detrás de los objetos que se moverán.
- [ ] Incorporar margen de imagen alrededor del encuadre para permitir desplazamientos sin descubrir bordes vacíos.
- [ ] Exportar `.webp` con transparencia donde corresponda y tamaños adecuados a los encuadres de escritorio y móvil.
- [ ] Comprobar bordes, sombras, transparencias, coincidencia de perspectiva y presencia exclusiva de Magic Drink Original.
- [ ] Registrar por recurso: archivo, dimensiones, transparencia, punto de anclaje, plano de profundidad, recorrido previsto y referencia visual utilizada.

Entregable: portada y primera transición divididas en capas utilizables, con sus composiciones estáticas de referencia.

Criterio de cierre: al superponer las capas se reconstruye la escena diseñada sin huecos, halos visibles ni cambios de identidad del producto.

La cantidad de capas se decide por lo que deba moverse de forma independiente. Un giro que revele geometría nueva exige vistas adicionales o un modelo 3D; una imagen plana no ofrece esa información.

**Fase 4 — Prototipo funcional de portada y primera transición**

Propósito: comprobar que la dirección artística produce el salto visual buscado en una página real.

- [ ] Montar el tramo en una vista local o de preview aislada de la portada actual.
- [ ] Coordinar profundidad, desplazamientos, escalas y pausas mediante una secuencia de scroll con GSAP.
- [ ] Añadir solo el movimiento ambiental necesario para dar vida a esa escena.
- [ ] Mantener textos y controles como elementos accesibles del documento.
- [ ] Preparar comportamiento móvil y una alternativa con movimiento reducido, conservando contenido y navegación.
- [ ] Evitar que la secuencia bloquee la lectura, el teclado o el acceso a otras páginas.
- [ ] Probar entrada, salida, scroll inverso, redimensionado y carga directa.
- [ ] Medir descarga inicial, tiempo de aparición del contenido, fluidez y memoria con las capas reales. Fijar a partir de esa prueba un presupuesto de imágenes y efectos para el resto del portal.
- [ ] Comparar visualmente el resultado con la portada actual y con las dos referencias de movimiento.

Entregable: una portada terminada con su primera transición hacia Wonderpop, revisable en escritorio y móvil.

Criterio de cierre: profundidad perceptible, transiciones sin saltos ni huecos, producto reconocible, texto legible y rendimiento aceptable en los dispositivos comprobados. Ajustar este tramo antes de producir todas las escenas.

**Fase 5 — Producir y montar el resto del recorrido**

Propósito: extender el lenguaje visual que ya funcionó en el prototipo.

- [ ] Crear las composiciones maestras restantes: entorno urbano, atrio de Wonderpop, escenario de Hexy y cierre de producto, según el storyboard definitivo.
- [ ] Mantener continuidad de fachada, entrada e interior: geometría visible, hora del día, iluminación y materiales.
- [ ] Preparar y revisar las capas y variantes de cada escena siguiendo el proceso de la fase 3.
- [ ] Integrar las escenas progresivamente, comprobando la unión con el tramo anterior al añadir el siguiente.
- [ ] Introducir pausas de lectura y contemplación entre los momentos de mayor movimiento.
- [ ] Cargar recursos de escenas posteriores cuando se aproximen y detener animaciones que no estén visibles.
- [ ] Integrar el reproductor de Hexy. El sonido comienza por acción del visitante y dispone de pausa y volumen claros.
- [ ] Coordinar la iluminación con la reproducción. Si se presenta como reacción al ritmo, utilizar una señal musical real o una secuencia sincronizada conocida.
- [ ] Resolver la convivencia entre el audio de Original y el reproductor de Hexy para impedir reproducciones simultáneas involuntarias.

Entregable: nuevo Inicio completo y escenas de Wonderpop y Hexy listas para su integración definitiva.

Criterio de cierre: el recorrido conserva la dirección visual, cumple el presupuesto fijado en el prototipo y funciona también en silencio.

**Fase 6 — Migrar todo el portal a Magic Drink Original**

Propósito: aplicar el cambio editorial y funcional en todas las rutas públicas.

- [ ] Sustituir el catálogo de múltiples sabores por la presentación de un único producto.
- [ ] Reescribir llamadas como «Ver sabores», «Nuestros sabores» y «6 sabores oficiales» en ES/EN.
- [ ] Adaptar o sustituir los componentes de catálogo, selectores, indicadores, estados y efectos específicos de otros sabores.
- [ ] Simplificar el mapa de audio y retirar del flujo público comportamientos como Kiwi Afterglow.
- [ ] Revisar navegación, footer, Nosotros, Magic Drink Day y Contacto para que el contenido pertenezca al nuevo portal.
- [ ] Revisar imágenes y videos, incluyendo productos pequeños en tiendas, carteles, pantallas y fondos. Corregir los recursos incompatibles.
- [ ] Mantener inicialmente `/bebidas` como ruta válida de la presentación de Original. Si se decide cambiarla, preparar la redirección adecuada al alojamiento real.
- [ ] Verificar que las canciones de Hexy y los recursos compatibles siguen disponibles.
- [ ] Retirar de la salida publicada los recursos exclusivos de sabores descartados. Conservar una copia recuperable fuera de los directorios públicos antes de eliminarlos de ellos.
- [ ] Actualizar las instrucciones del proyecto para reflejar el producto único, la arquitectura final y el tratamiento del lore.

Entregable: portal coherente con un único producto en todas sus páginas, recursos y contenidos publicados.

Criterio de cierre: no quedan referencias públicas ni descargas de recursos de los cinco sabores retirados; las rutas y funcionalidades conservadas siguen operativas.

**Fase 7 — Revisión visual, funcional y de rendimiento**

Propósito: comprobar el resultado completo en condiciones representativas.

- [ ] Revisar escritorio ancho, portátil, móvil vertical y cambios de orientación.
- [ ] Recorrer todas las transiciones en ambos sentidos; comprobar saltos, superposiciones, espacios vacíos y posiciones retenidas incorrectamente.
- [ ] Comprobar textos ES/EN, enlaces, navegación directa, foco de teclado, movimiento reducido y contraste.
- [ ] Comprobar reproducción, pausa, volumen, cambio de canción y navegación entre páginas con audio activo.
- [ ] Verificar carga inicial y progresiva, errores de consola, recursos ausentes, memoria y fluidez frente al presupuesto del prototipo.
- [ ] Verificar títulos, descripciones y contenido HTML indexable; decidir qué secciones deben renderizar contenido inicial desde Astro o React en servidor en lugar de depender completamente de `client:only`.
- [ ] Ejecutar `npm run build` y las pruebas de navegador pertinentes. Adaptar las pruebas actuales de scroll a los nuevos recorridos cuando sus selectores y supuestos dejen de ser válidos.
- [ ] Revisar el contenido real de la salida de publicación y confirmar que no incluye referencias internas, el manuscrito ni materiales reservados para futuras entregas.
- [ ] Documentar los dispositivos y navegadores realmente comprobados y las limitaciones pendientes.

Entregable: versión candidata con evidencias de revisión visual y resultados de las comprobaciones necesarias.

Criterio de cierre: build correcto, navegación y audio operativos, incidencias bloqueantes resueltas y revisión visual satisfactoria. El build por sí solo no acredita calidad visual.

**Fase 8 — Preview, cierre y publicación**

Propósito: disponer de una versión final revisable y publicarla de forma recuperable.

- [ ] Verificar el alojamiento y el mecanismo de despliegue reales antes de elegir el procedimiento de publicación.
- [ ] Preparar una preview con el cambio completo y registrar sus diferencias frente a la versión anterior.
- [ ] Resolver los ajustes surgidos de la revisión de la preview.
- [ ] Registrar la versión final de código y recursos y el punto de restauración de la versión anterior.
- [ ] Publicar en producción cuando el usuario lo solicite o autorice explícitamente.
- [ ] Después de publicar, comprobar la URL real, las rutas, la carga de imágenes, el audio y el recorrido en escritorio y móvil.

Entregable: preview final; posteriormente, versión publicada y comprobada cuando exista autorización de producción.

Criterio de cierre: la versión accesible en la URL de destino corresponde al cambio validado y conserva una vía de restauración.

**Dependencias y orden de trabajo**

Fases 1 y 2 definen la base. Fases 3 y 4 producen la primera prueba completa. La fase 5 depende de que esa prueba satisfaga los criterios visuales y técnicos. La migración de contenido de la fase 6 puede adelantarse en el entorno aislado tras la fase 2, pero la sustitución integral se completa cuando el nuevo recorrido está disponible. Las fases 7 y 8 se realizan con la versión integrada.

Primer hito visual: final de la fase 2, con storyboard y composición de portada. Primer hito interactivo: final de la fase 4, con la portada y su transición ejecutándose con recursos reales. Estos hitos permiten corregir el rumbo antes de extender el trabajo.

**Inventario inicial confirmado**

- `src/data/magicDrinkFlavors.js`: seis productos definidos.
- `src/components/index/Secciones/IndexSeccion1.jsx` y `IndexSeccion2.jsx`: llamadas a explorar sabores.
- `src/components/index/Secciones/IndexSeccion3.jsx` y su CSS: catálogo duplicado, efectos por sabor y Kiwi Afterglow.
- `src/components/bebidas/`: presentación y componentes que consumen el catálogo; verificar cuáles están montados antes de sustituirlos.
- `src/components/global/useFlavorAudio.js`: mapa y comportamiento de audio por sabor.
- `src/data/magicDrinkGlobalContent.js`: navegación y footer con la categoría Bebidas/Drinks.
- `public/audio/loops/`: recursos y documentación ligados a los sabores.
- Imágenes actuales de Wonderpop: revisar la presencia de envases y variantes en los puestos y escaparates.
- `.github/copilot-instructions.md`: contiene descripciones de una etapa anterior y convenciones que requieren actualización.
- Trabajo local pendiente detectado al crear este plan: secciones 3 y 4 de Wonderpop, sus estilos y el CSS de la sección 6; dos MP4 de referencia y la carpeta `context` sin seguimiento.

El inventario es el punto de partida de la fase 1, no una auditoría exhaustiva de todos los recursos.
