# Arcade

La interfaz usa React y CSS Modules. La simulación y el dibujo de la aventura siguen separados; Canvas dibuja los actores y escenarios sin provocar un render de React por cada fotograma.

| Carpeta | Responsabilidad |
| --- | --- |
| `adventure/HexyAdventure.jsx` | Ciclo de vida, pantallas, audio y conexión entre motor e interfaz. |
| `adventure/engine/` | Simulación, combate, economía, poderes, tienda y recompensas. |
| `adventure/actors/hexy/` | Selección de poses y coordenadas de la varita. |
| `adventure/actors/bosses/` | Patrones y animación de los minijefes. |
| `adventure/actors/enemies/` | Enemigos, geometría y campamentos. |
| `adventure/world/` | Niveles, terreno, parallax y objetos del recorrido. |
| `adventure/render/` | Cámara y dibujo de mundo, actores y efectos. |
| `adventure/input/` | Gamepad API y navegación con mando. |
| `adventure/ui/` | HUD, título, tienda y ajustes, cada uno con su CSS Module. |
| `shared/` | Guardado y audio compartidos. |
| `hunt/` | Bunnies coleccionables en las páginas de la web. |

Los recursos que se descargan están en `public/arcade`, en WebP. Las pruebas y sus capturas están en `tests` y `tests/artifacts`; las capturas no se versionan. Los scripts de preparación de arte están en `scripts/arcade`.

`HexyAdventure` usa `useIllustratedFinish('arcade')`: los ajustes de imagen se guardan y sincronizan únicamente entre instancias del juego. La llamada sin ámbito conserva el acabado compartido de inicio, Hexy y bebidas. No reutilizar la preferencia visual de la web para los controles del arcade.

Cambiar nombres de carpetas requiere actualizar también las importaciones de las pruebas y sus interceptores de módulos. Las poses aéreas se seleccionan antes que el apuntado de pie. La punta de la varita se mide sobre el sprite definitivo, después de normalizar su cuerpo.

El runner antiguo y las pantallas retiradas ya no pertenecen al árbol de módulos activo. Consulta `context/arcade/README.md` para recursos y respaldos.
