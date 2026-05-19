# Guadalajara 12 — Calendario de disponibilidad

Webapp estática para mostrar disponibilidad del alojamiento, con sincronización automática del calendario iCal de Airbnb.

---

## Estructura del proyecto

```
guadalajara12/
├── index.html                        # La webapp completa
├── dates.json                        # Fechas ocupadas (generado automáticamente)
├── package.json
├── scripts/
│   └── sync-ical.js                  # Script de sincronización iCal
└── .github/
    └── workflows/
        └── sync-ical.yml             # GitHub Action: sincroniza cada hora
```

---

## Setup en GitHub Pages

### 1. Crear repositorio en GitHub
- Ve a github.com → New repository
- Nombre: `guadalajara12` (o el que quieras)
- Visibilidad: **Public** (necesario para GitHub Pages gratis)
- Sube todos los archivos de esta carpeta

### 2. Configurar el secreto ICAL_URL
- GitHub → tu repositorio → **Settings** → **Secrets and variables** → **Actions**
- Pulsa **New repository secret**
- Nombre: `ICAL_URL`
- Valor: tu URL iCal de Airbnb (la que empieza por `https://www.airbnb.com/calendar/ical/...`)

### 3. Activar GitHub Pages
- GitHub → tu repositorio → **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Guardar

### 4. Activar GitHub Actions
- GitHub → tu repositorio → **Actions**
- Si aparece un aviso para activar Actions, confírmalo
- El workflow `sync-ical.yml` se ejecutará automáticamente cada hora

### 5. Primera sincronización manual
- GitHub → **Actions** → **Sync iCal Calendar** → **Run workflow**
- Esto generará el primer `dates.json` con las fechas actuales

---

## Acceso al panel de administración

- **Ordenador:** `Ctrl + Shift + A`
- **Móvil:** 5 toques rápidos en la cabecera

Contraseña por defecto: `admin1234`
⚠️ Cámbiala en `index.html` → línea `const ADMIN_PASSWORD`

---

## Desarrollo local

```bash
npm install
npm run dev       # Abre http://localhost:3000
npm run sync      # Sincroniza iCal manualmente (requiere ICAL_URL en .env)
```

---

## Cómo funciona

1. GitHub Actions ejecuta `scripts/sync-ical.js` cada hora
2. El script descarga el iCal de Airbnb y genera `dates.json`
3. El commit se sube automáticamente al repositorio
4. GitHub Pages sirve el `dates.json` actualizado
5. Cualquier dispositivo que abra la página lee `dates.json` — sin proxies, sin CORS
