# Ethos Speedtyping v7.3

Test de mecanografía modular con diseño *liquid glass*, teclado virtual interactivo y sistema de ranking. Sin frameworks (solo Chart.js por CDN), sin build step: HTML + CSS + JS puro.

## Qué incluye esta v7.3

- **Motor de escritura** con métricas en vivo (WPM, precisión, tiempo), modo por tiempo (15/30/60/120s) o por número de palabras (5/10/25/50).
- **5 categorías** de frases en `data/*.json`: español, inglés, programación, gaming, ciencia (con fallback embebido en JS si el fetch falla).
- **Teclado virtual interactivo** con teclas guía F/J permanentes y resaltado en vivo al escribir, visible en la vista de Escribir y en Práctica Interactiva. Se puede ocultar desde Ajustes.
- **Vista de Práctica Interactiva**: frases de código sueltas, se avanza con `Enter`.
- **Dashboard** con resumen agregado, gráfica de progreso (Chart.js) e historial de sesiones.
- **Perfil**: nombre editable, selector de avatar (Dicebear) y rango calculado por mejor WPM.
- **Ranking**: clasificación por mejor WPM contra mecanógrafos de referencia y tu progreso real.
- **4 temas visuales** en Ajustes (Midnight, Aurora, Ember, Mono) — el motor soporta 6 (también Orchid y Glacier vía `themes.css`).
- **Filtros de accesibilidad**: ignorar mayúsculas, ignorar puntuación, sonido de tecleo sintético.
- Todo el estado persiste en `localStorage` bajo el prefijo `ethos-speedtyping:`.

## Cómo probarlo en local

Los `fetch()` a los JSON de `data/` necesitan servirse por HTTP (no `file://`):

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Subir a GitHub y desplegar

```bash
cd ethos-speedtyping
git init
git add .
git commit -m "Ethos Speedtyping v7.3"
git branch -M main
git remote add origin TU_REPOSITORIO
git push -u origin main
```

- **GitHub Pages**: Settings → Pages → rama `main` → carpeta raíz.
- **Vercel**: importa el repo, framework preset "Other", sin build command.

## Estructura

```
ethos-speedtyping/
├── index.html
├── manifest.json
├── robots.txt
├── sitemap.xml
├── LICENSE (MIT)
├── .gitignore / .gitattributes
├── css/
│   ├── main.css        (variables, layout, componentes compartidos)
│   ├── themes.css       (paletas por tema)
│   ├── dashboard.css    (resultados + dashboard)
│   ├── profile.css      (cabecera de perfil clásica)
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── core/app.js          (bootstrap, navegación, wiring de vistas)
│   ├── services/
│   │   ├── typing.js         (motor principal)
│   │   ├── practice.js       (motor de práctica interactiva)
│   │   ├── keyboard.js        (teclado virtual)
│   │   ├── timer.js
│   │   ├── stats.js
│   │   ├── history.js
│   │   ├── profile.js
│   │   ├── ranking.js
│   │   ├── themes.js
│   │   └── settings.js
│   ├── storage/utils.js      (wrapper de localStorage)
│   ├── components/           (vacío, para futuros widgets)
│   └── charts/               (vacío; el gráfico actual usa Chart.js directo en app.js)
├── data/          (5 categorías de frases en JSON)
├── icons/         (favicon.svg, favicon-32.png, icon-192.png, icon-512.png)
├── assets/        (logo.svg)
├── sounds/        (vacío, reservado)
└── fonts/         (vacío, usa Google Fonts CDN)
```

## Notas de la fusión v7 → v7.3

Este proyecto unificó dos ramas de desarrollo que habían divergido:
- La base modular v7 (motor con `fetch` a `data/*.json`, `EthosStats`/`EthosTimer`/`EthosHistory`).
- Los parches v7.3 (teclado virtual, ranking), que se reescribieron como módulos propios (`keyboard.js`, `ranking.js`) en vez de vivir sueltos en `app.js`, y ahora usan el mismo sistema de persistencia (`EthosUtils`) que el resto de la app.
