// scripts/sync-ical.js
// Este script descarga el calendario iCal de Airbnb y genera dates.json
// Se ejecuta via GitHub Actions cada hora automaticamente
// También puedes ejecutarlo manualmente: node scripts/sync-ical.js

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CONFIGURACIÓN ──────────────────────────────────────────
// La URL iCal se lee de la variable de entorno ICAL_URL
// Configúrala en GitHub → Settings → Secrets → ICAL_URL
const ICAL_URL = process.env.ICAL_URL;
// ───────────────────────────────────────────────────────────

if (!ICAL_URL) {
  console.error('❌ Variable de entorno ICAL_URL no definida.');
  console.error('   Añádela en GitHub → Settings → Secrets → Actions → New secret');
  console.error('   Nombre: ICAL_URL   Valor: tu URL iCal de Airbnb');
  process.exit(1);
}

async function parseIcal(text) {
  const dates = {};
  const blocks = text.split('BEGIN:VEVENT');
  blocks.shift();

  for (const blk of blocks) {
    const ds = getProp(blk, 'DTSTART');
    const de = getProp(blk, 'DTEND');
    if (!ds || !de) continue;

    const start = icalDate(ds);
    const end   = icalDate(de);
    if (!start || !end) continue;

    const cur = new Date(start);
    while (cur < end) {
      const key = toKey(cur.getFullYear(), cur.getMonth(), cur.getDate());
      dates[key] = true;
      cur.setDate(cur.getDate() + 1);
    }
  }
  return dates;
}

function getProp(text, prop) {
  const m = text.match(new RegExp(prop + '(?:;[^:]*)?:([^\\r\\n]+)'));
  return m ? m[1].trim() : null;
}

function icalDate(s) {
  const d = s.replace(/T.*/, '');
  if (d.length !== 8) return null;
  return new Date(+d.slice(0,4), +d.slice(4,6)-1, +d.slice(6,8));
}

function toKey(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

async function main() {
  console.log('🔄 Sincronizando calendario iCal...');

  const res = await fetch(ICAL_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();

  if (!text.includes('BEGIN:VCALENDAR')) {
    throw new Error('La respuesta no es un iCal válido');
  }

  const dates = await parseIcal(text);
  const count = Object.keys(dates).length;

  const output = {
    updatedAt: new Date().toISOString(),
    dates
  };

  const outPath = path.join(__dirname, '..', 'dates.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`✅ Sincronizado: ${count} días ocupados → dates.json`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
