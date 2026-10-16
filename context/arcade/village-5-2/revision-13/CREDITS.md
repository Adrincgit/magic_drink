# Grabaciones de partida

Los clips del juego son ediciones y mezclas locales de estas grabaciones CC0. No son interpretaciones vocales generadas por IA. Las páginas de origen consultadas se conservan en `sources/`.

| Fuente | Autor | Uso |
| --- | --- | --- |
| [Witch's Laugh](https://freesound.org/people/NikoMyth/sounds/348142/) | NikoMyth | Dos cortes de risa al absorber dulces. Fuente: preview HQ público MP3. |
| [Fire Burst Flash](https://freesound.org/people/Za-Games/sounds/539972/) | Za-Games | Ataque de llama, apagado y acento de invocación. Fuente: preview HQ público MP3. |
| [Fireball 1](https://opengameart.org/content/fireball-1) | Julien Matthey | Cuerpo y cola del fuego. |
| [Break pumpkin](https://opengameart.org/content/break-pumpkin) | TinyWorlds | Rotura y aterrizaje de calabazas. |
| [Magic spell SFX](https://opengameart.org/content/magic-spell-sfx) | JaggedStone | Invocación de una nueva calabaza. |
| [Zombie / Skeleton / Monster Voice Effects](https://opengameart.org/content/zombie-skeleton-monster-voice-effects) | ArcadeParty | Tres muertes de zombi; voz de muerte de calabaza en canal separado. |
| [Zombies sound pack](https://opengameart.org/content/zombies-sound-pack) | artisticdude | Tres gruñidos breves. |

Descargas originales de los paquetes de voz: [ArcadeParty](https://opengameart.org/sites/default/files/Voice%20Effects%20Zombie-Skeleton-Monster%20Human%20Male.zip), [artisticdude](https://opengameart.org/sites/default/files/zombies.zip). Se conservan los WAV usados, sin archivos de recursos de macOS ni tomas descartadas.

Edición reproducible: `node scripts/arcade/pack-creature-audio.mjs`. Recortes, capas, filtros y niveles en `edits.json`; salida mono PCM de 16 bits a 32 kHz. Reproducción local con panorámica estéreo y compresión; sin servicio de audio externo durante la partida.

El MP3 `momia-mslug.mp3` aportado por el usuario se conserva como referencia, no se ha añadido a los eventos del juego.
