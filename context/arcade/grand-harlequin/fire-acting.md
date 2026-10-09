# Actuación y fuego — 8 de octubre de 2026

Cambios solicitados: llevar el estilo de los retratos al combate jugable, mayor expresividad y viento, conservar visibilidad al lanzar desde un salto, choque de hasta 15 segundos con oleadas, polvo expulsado detrás de los pies y más ataques de fuego.

- Hexy: 12 dibujos nuevos, compartidos por el retrato y la descarga habitual en suelo/aire. Una sola mano en la varita; dientes apretados hasta ir ganando, preocupación sólo cerca de perder, grito heroico al superar al rival. Cabello y falda animados a 18 pasos/s. Sin sonrisas.
- Arlequín: 72 dibujos limpios de combate y desgaste (24 acciones por tres vestuarios), 20 cuadros de carga, nuevas brasas/llamaradas y caída con variantes de ropa para fase II y III. Su descarga real comparte las doce poses del retrato.
- Choque: límite de 15 s desde el contacto, oleadas distintas en normal/suave, luz del oponente sobre quien cede terreno, rumble y vibración reforzados en cada empuje. Se mantienen 4 corazones de penalización, 192 de daño al ganar y caída letal sin reincorporarse.
- Composición: retratos de torso con bandas y borde desvanecido. Se sitúan en la esquina libre de su lado según la altura de los combatientes y del rayo. Se conserva el dibujo de cuerpo completo al preparar el ataque.
- Polvo: plumas expulsadas hacia atrás desde los zapatos, ancladas a la pista; sin polvo flotante debajo de Hexy cuando dispara en el aire.
- Fuego: brasas balísticas y llamaradas anunciadas con huecos seguros, más densas en fase III. Cada lanzamiento tiene preparación, gesto de soltar y recuperación.

Arte generado con **image_gen integrado**, sin CLI. Prompts y fuentes: [fire-acting-art.json](fire-acting-art.json). Salidas utilizadas por el juego:

- `public/arcade/sprites/hexy/super-cast.webp`
- `public/arcade/sprites/ui/hexy-clash-full.webp`
- `public/arcade/sprites/bosses/harlequin/motion.webp`, `motion-mid.webp`, `motion-final.webp`, `fire-actions.webp`, `fire-actions-mid.webp`, `super-cast.webp`.

Empaquetador: `scripts/arcade/pack-fire-acting.mjs`. Conserva alfa, aísla siluetas conectadas y registra pies y salidas de energía. Los archivos nativos permanecen en su ubicación original; todos los recursos consumidos por el juego están dentro del repositorio.

Pruebas de regresión y revisión visual: `tests/hexy-fire-acting.spec.js`, pruebas existentes del choque, jefe, cámara y ultimate en movimiento. Capturas de ambos lados, suelo/aire, expresiones, ataques y fases en `tests/artifacts/arcade/fire-acting/` (excluidas de Git). La valoración final del ritmo y de la dificultad queda abierta a las partidas del usuario.
