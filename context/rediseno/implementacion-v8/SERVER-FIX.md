# Corrección del servidor local

El navegador del usuario recibía `504 Outdated Optimize Dep` para
`@nanostores/react` y `react-router-dom`, impidiendo hidratar el recorrido y
el navbar. La respuesta HTML 200 no bastaba para verificar el portal.

Había dos procesos Astro del mismo proyecto en el puerto 4321: uno escuchaba
en IPv4 (`127.0.0.1`) y el otro en IPv6 (`::1`, resuelto por `localhost`).
Compartían la caché de Vite y devolvían versiones distintas de los módulos.
La petición de la captura se reprodujo directamente: respuesta 504.

Se detuvo la instancia auxiliar duplicada y se conservó el proceso iniciado
con `npm run dev`. La configuración lo reinició automáticamente.

- Host local explícito `127.0.0.1`, puerto 4321 y `strictPort` para evitar un
  segundo servidor inadvertido en otra dirección o un salto a otro puerto.
- Caché de Vite separada por comando Astro: desarrollo, compilación y sync.
- Preoptimización explícita de las dependencias del recorrido y la navegación.
- Las pruebas ahora usan `localhost`, el enlace entregado al usuario.
- Nueva regresión que abre ambas direcciones, recarga, comprueba errores de
  consola/descarga de scripts, cambia de idioma y recorre el portal.

Se verificó la navegación con Chrome antes y después de compilar. La
compilación produjo 9 páginas y no modificó el hash de la caché de desarrollo.
La suite completa aprobó 13 pruebas (38,1 s) con
`npx playwright test --workers=1 --reporter=line`.

URL de trabajo: http://localhost:4321/.
Si queda abierta una pestaña con los módulos de la instancia anterior,
recargarla una vez con Ctrl+Shift+R.
