# Guía de campaña: seis actos y treinta niveles

Decisión acordada con el usuario: **16 de octubre de 2026**. Ésta es la distribución vigente para continuar el juego. Sustituye los planes de tres recorridos por acto, la antigua ubicación de Halloween como acto 5 y las tablas anteriores que todavía dejaban el número de actos por definir.

Guías relacionadas: [Magic Drinks y amuletos](MAGIC_DRINKS_Y_AMULETOS.md), [diseño general](DISENO_DEL_JUEGO.md) y [dirección del acto Halloween](halloween-5-1/ACTO_5.md).

## Estructura acordada

Sin checkpoints: al perder se reinicia desde el inicio del nivel. Cada recorrido tiene una sola caja con un corazón cerca de la mitad, que recupera un corazón al romperla y recogerlo. Los niveles exclusivamente de jefe no añaden esta caja. [Implementación y validación](balloon-air-restart/README.md).

- **6 actos, 5 niveles por acto: 30 niveles.**
- Los niveles 1 a 4 de cada acto terminan con un minijefe propio: **24 minijefes** en total.
- El nivel 5 se dedica al jefe principal: **6 enfrentamientos principales**.
- Actos 1 a 4: arlequines de uno, dos, tres y cuatro conos, respectivamente.
- Acto 5: **Mr. Eclipse**, quien dirige el circo. Tras derrotarlo se revela la **Bruja**, verdadera antagonista.
- Acto 6: aproximación y enfrentamiento final contra la Bruja.
- Arlequines con tres fases; Mr. Eclipse y la Bruja con cuatro, conforme a la dirección de combate existente. Vida, duración y equilibrio se ajustan al probar cada encuentro.
- Halloween pasa al **acto 2**. El cementerio es **2-1** y Villa Lumbre es **2-2**.

Los escenarios y encuentros siguientes son la guía aceptada. Los nombres de personajes nuevos son nombres de trabajo y pueden pulirse al producirlos. «Planificado» no significa que el nivel o su arte ya estén implementados. La planificación del videojuego no modifica el manuscrito ni el canon de la marca.

## Acto 1 — La llegada del circo

Naturaleza, agua, máquinas circenses y una escalada hacia el incendio. Se conserva el primer acto construido.

| Nivel | Escenario y dinámica | Minijefe o jefe | Estado |
| --- | --- | --- | --- |
| 1-1 | **El campo de los globos.** Colinas, caravanas y ataques desde el aire. | La Comparsa Voladora | Implementado; sujeto a pulido |
| 1-2 | **El río del organillo.** Puentes, corrientes y plataformas entre árboles. | Fortaleza Organillo | Implementado; sujeto a pulido |
| 1-3 | **La ribera de los redobles.** Muelles, buzos y combate entre embarcaciones. | La Barcaza del Redoble | Implementado; sujeto a pulido |
| 1-4 | **El bosque de las brasas.** Incendios, fortificaciones y acceso al campamento. | El Fuerte Escupefuegos | Implementado; sujeto a pulido |
| 1-5 | **La carpa del Gran Telón.** Encuentro principal. | Arlequín de un cono: fuego | Implementado; sujeto a pulido |

Referencias: [bosque y fortaleza](ember-fort/README.md), [ribera y barcaza](harbor-barge/README.md), [Gran Telón](grand-harlequin/README.md).

## Acto 2 — La noche de las pesadillas

Continúa desde el bosque quemado. Las criaturas de Halloween nacen de la mente de la arlequín de dos conos y pueden dañar físicamente a Hexy. Anime cartoon, ambiente spooky y actuación expresiva, sin gore. El ejército de marionetas queda para el acto 4.

| Nivel | Escenario y dinámica | Minijefe o jefe | Estado |
| --- | --- | --- | --- |
| 2-1 | **El sendero de las risas.** Bosque de cenizas, cementerio, criptas y caminos sobre las tumbas. | El Campanero Hueco | Implementado; antes 5-1 |
| 2-2 | **Villa Lumbre / El pueblo de los dulces.** Evacuación, barricadas, rescates y habitantes convertidos en dulces. | La Cosechera de Dulces | Implementado; antes 5-2 |
| 2-3 | **El maizal del ?ltimo atardecer.** 15.600 unidades, graneros, rescates, emboscadas y revelaci?n del falso atardecer. El castillo circo se acerca en el horizonte. | El Rey de Paja: dos formas y reconstrucci?n interrumpible | Implementado; ampliado el 17/10/2026 |
| 2-4 | **El castillo del gran telón.** 15.200 unidades de jardines, entrada con fundido, galerías, salones y estructuras de lona; tres rescates y rutas a distintas alturas. | El Conde y la Condesa del Telón: dos fases coordinadas | Implementado; revisión del 18/10/2026 |
| 2-5 | **La carpa de los malos sueños.** Bodega de dulces de los vecinos, subida hasta la cúpula y tres fases con actuación y ataques propios. Rueda de máscaras desde arriba, choque diagonal y Encore doble. | Arlequín de dos conos: anfitriona infantil de Halloween; frustración y locura en espiral al perder | Implementado; revisión del 18/10/2026 |

Repartir las criaturas por escenario: zombis y esqueletos en el cementerio; brujas y calabazas en el pueblo; espantapájaros en el maizal; vampiros en la mansión. Evitar concentrar todos los tipos en cada recorrido.

Implementación de 2-3 a 2-5, arte, mecánicas y comprobaciones: [ampliación del acto 2](act-2-expansion/README.md).

La [revisión de las tres fases y la colección de Halloween](nightmare-madness-v2/README.md) conserva su apariencia joven y conecta los dulces con Villa Lumbre. Los diálogos con retratos quedan previstos para una etapa posterior.

Referencias conservadas: [cementerio](halloween-5-1/README.md), [pueblo y revisión actual](village-5-2/README.md). Sus carpetas mantienen los nombres históricos para conservar enlaces y recursos.

## Acto 3 — Las caravanas del desierto

Amplitud, viento, roca y un tramo de velocidad después de Halloween.

| Nivel | Escenario y dinámica | Minijefe o jefe | Estado |
| --- | --- | --- | --- |
| 3-1 | **Las dunas de los cascabeles.** Caravanas semienterradas, arena que cede y salidas anunciadas bajo el suelo. | El Tragaarenas: bestia circense excavadora | Planificado |
| 3-2 | **El barranco de los equilibristas.** Puentes de cuerda, ascensores mineros y rutas a distintas alturas. | Los Gemelos del Barranco: atacan desde lados opuestos | Planificado |
| 3-3 | **El oasis de las ruinas.** Acueductos, patios inundados y mecanismos para cambiar el nivel del agua. | La Encantadora del Oasis, acompañada de una enorme cobra | Planificado |
| 3-4 | **El Expreso de Medianoche.** Tren en marcha; interiores, techos de vagones y cargas destructibles. | El Maquinista del Expreso | Planificado |
| 3-5 | **La carpa de los vientos.** Cuerdas tensas, plataformas suspendidas y corrientes anunciadas por las lonas. | Arlequín de tres conos: viento y acrobacias | Planificado |

## Acto 4 — La ciudad de los hilos

El ejército de marionetas ocupa una ciudad cuyos edificios funcionan como mecanismos de escenario.

| Nivel | Escenario y dinámica | Minijefe o jefe | Estado |
| --- | --- | --- | --- |
| 4-1 | **Los tejados del reloj.** Calles ocupadas, campanarios y recorridos por azoteas. | El Sereno de Cuerda: vigilante mecánico | Planificado |
| 4-2 | **El jardín de las espinas.** Invernaderos rotos, setos móviles y plantas que abren o cierran caminos. | La Jardinera de Espinas | Planificado |
| 4-3 | **La fábrica de comparsas.** Cintas, prensas y marionetas que se ensamblan delante del jugador. | El Sastre Mecánico | Planificado |
| 4-4 | **El teatro abandonado.** Escenarios giratorios, contrapesos y combate entre bambalinas. | La Bailarina de Porcelana | Planificado |
| 4-5 | **La carpa de los cuatro mástiles.** El jefe mueve partes del escenario y sus marionetas durante el combate. | Arlequín de cuatro conos: hilos y control del escenario | Planificado |

## Acto 5 — La última función de Mr. Eclipse

Frío en la aproximación y espectáculo monumental al entrar en el centro de operaciones del circo.

| Nivel | Escenario y dinámica | Minijefe o jefe | Estado |
| --- | --- | --- | --- |
| 5-1 | **El paso de las carpas heladas.** Caravanas congeladas, pendientes y pequeñas avalanchas anunciadas. | El Forzudo de la Escarcha | Planificado |
| 5-2 | **El lago de cristal.** Hielo quebradizo, embarcaderos y plataformas que flotan al romperse. | El Cisne de Hielo: combate sobre y bajo la superficie | Planificado |
| 5-3 | **Los bastidores del gran circo.** Jaulas, almacenes y entrenamiento de las tropas más peligrosas. | El Domador de las Sombras | Planificado |
| 5-4 | **La cúpula de los reflectores.** Ascenso entre pasarelas, focos móviles y grandes mecanismos. | El Equilibrista Astral | Planificado |
| 5-5 | **La función de Mr. Eclipse.** Distintas puestas en escena de su gran pista. | Mr. Eclipse | Planificado |

Tras la victoria sobre Mr. Eclipse se revela la Bruja. La escena debe dar peso a la aparente victoria y a la aparición de quien realmente controla el conflicto.

## Acto 6 — Más allá del telón

Un paisaje reconocible se transforma conforme Hexy se acerca a la Bruja: campo estrellado, agua suspendida, viento y tormenta.

| Nivel | Escenario y dinámica | Minijefe o jefe | Estado |
| --- | --- | --- | --- |
| 6-1 | **El campo de las estrellas caídas.** Colinas, grandes charcos y fragmentos celestes que modifican el terreno. | El Ciervo de las Estrellas | Planificado |
| 6-2 | **El río del cielo.** Cascadas suspendidas, islas y recorridos entre agua y aire. | La Manta de Medianoche | Planificado |
| 6-3 | **La torre de la tormenta.** Ascenso vertical, estructuras que se desprenden y rayos anunciados. | El Heraldo de la Tormenta | Planificado |
| 6-4 | **El corazón del hechizo.** Calderos, energía cautiva y mecanismos mágicos destructibles que abren el camino. | El Guardián del Caldero | Planificado |
| 6-5 | **El último aquelarre.** La magia de la Bruja transforma progresivamente la arena e incorpora la tormenta. | La Bruja: antagonista final | Planificado |

La Bruja final necesita silueta, actuación y magia exclusivas para sostener su revelación después de las brujas menores y de la Cosechera.

## Reglas de variedad y continuidad

- Cada acto combina combate, plataformas, destrucción, rescates y movimiento de forma distinta. El tren, la evacuación, la fábrica y el ascenso por la tormenta deben ofrecer situaciones propias.
- Presentar cada amenaza con animación y sonido, mantener legibles cuerpos y proyectiles y probar las transiciones entre fases.
- Un obstáculo importante puede ofrecer salto, ruta alternativa o destrucción; conservar terreno y objetivos claros.
- Las máquinas, criaturas, dúos y personajes individuales requieren comportamientos distintos.
- Conservar la regla permanente: **sin barras de vida enemigas**, incluidos minijefes, arlequines y generadores. Mostrar daño y fase mediante actuación, deterioro y efectos. Se conserva el HUD de Hexy.
- La intercepción por magia fuerte se mantiene en todos los actos.

## Numeración visible e identificadores de guardado

Se conservan los IDs anteriores, música, estrellas, cofres y partidas. Los nuevos niveles amplían el orden y sus desbloqueos se migran sin borrar el avance anterior.

| ID interno | Etiqueta visible actual | Contenido |
| --- | --- | --- |
| 0 | 1-1 | Campo |
| 1 | 1-2 | Río |
| 2 | 1-3 | Ribera |
| 5 | 1-4 | Bosque de las brasas |
| 3 | 1-5 | Primer arlequín |
| 6 | 2-1 | Cementerio; antes 5-1 |
| 7 | 2-2 | Pueblo; antes 5-2 |
| 8 | 2-3 | Maizal del último atardecer |
| 9 | 2-4 | El castillo del gran telón |
| 10 | 2-5 | Arlequín de dos conos |
| 4 | 6-1 | Prototipo heredado; todavía no representa el 6-1 planificado arriba |

Orden técnico vigente: `0, 1, 2, 5, 3, 6, 7, 8, 9, 10, 4`. La campaña 5 migra las versiones 2, 3 y 4 conservando capítulos activos, estrellas, compras y recibos. Quien ya tenía el prototipo heredado desbloqueado lo conserva, incluidos los tres nuevos niveles intermedios. Las reglas de compra siguen usando el rango técnico existente.

La [revisi?n a?rea del 2-5](nightmare-aerial-v3/README.md) ampl?a la arena, aprovecha el suelo del fondo pintado y sustituye la rueda por una tormenta de pesadillas sostenida desde gran altura.
