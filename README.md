# Recomendador de equipo (sin dependencias)
Requisitos: Node 18+.  Ejecutar: `ML_ACCESS_TOKEN=tu_token node server.js` → http://localhost:3000
- **Mercado Libre**: la API de búsqueda exige un token OAuth (crea una app en developers.mercadolibre.com). El token vive solo en el servidor (variable de entorno); nunca en el navegador ni en el código. Sin token, la página muestra "Precio no confirmado" y enlaces de búsqueda.
- **Tipo de cambio**: Frankfurter (datos del BCE), sin clave, vía `/api/fx`.
- Datos editables en `data/catalog.js` (sin precios).
