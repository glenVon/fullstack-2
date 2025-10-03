/*
Script: apply_rename_from_csv.js
Lee: scripts/covers_rename_template.csv (columnas: current_filename,new_filename)
- Para cada fila con new_filename no vacío, crea un backup de src/images/covers en scripts/backup_covers_<timestamp>/
- Renombra el archivo indicado (si existe) a new_filename de forma segura, evitando sobreescribir (añade sufijo -1, -2 si colisión)
Opciones:
  --dry    : no hace renombrados, solo muestra lo que haría
  --csv <path> : usar un CSV alternativo (por defecto scripts/covers_rename_template.csv)

Uso recomendado:
  node scripts/apply_rename_from_csv.js --dry
  node scripts/apply_rename_from_csv.js    # para aplicar (asegúrate de tener backup/commit)
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const csvIndex = args.findIndex(a => a === '--csv');
const csvPath = csvIndex >= 0 && args[csvIndex+1] ? args[csvIndex+1] : path.join(__dirname, 'covers_rename_template.csv');

const coversDir = path.join(__dirname, '..', 'src', 'images', 'covers');

function readCsv(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',').map(h => h.trim());
  const idxCurrent = header.indexOf('current_filename');
  const idxNew = header.indexOf('new_filename');
  if (idxCurrent === -1 || idxNew === -1) throw new Error('CSV debe tener columnas current_filename,new_filename');
  return lines.map(l => {
    // split only first comma (filenames may contain commas rarely). We'll be liberal: split at first comma.
    const comma = l.indexOf(',');
    const curr = l.slice(0, comma !== -1 ? comma : l.length).trim();
    const nw = comma !== -1 ? l.slice(comma+1).trim() : '';
    return { current: curr, newName: nw };
  });
}

if (!fs.existsSync(csvPath)) {
  console.error('CSV no encontrado:', csvPath);
  process.exit(1);
}

if (!fs.existsSync(coversDir)) {
  console.error('Covers dir no encontrado:', coversDir);
  process.exit(1);
}

const rows = readCsv(csvPath);
const toProcess = rows.filter(r => r.newName && r.newName.length);

if (toProcess.length === 0) {
  console.log('No hay filas con new_filename. Revisar', csvPath);
  process.exit(0);
}

// backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, `backup_covers_${timestamp}`);

console.log(`Covers dir: ${coversDir}`);
console.log(`CSV: ${csvPath}`);
console.log(`Encontradas ${toProcess.length} filas a procesar.`);
console.log(dry ? 'MODO DRY-RUN: no se aplicarán cambios.' : `Se hará backup en: ${backupDir}`);

if (!dry) {
  fs.mkdirSync(backupDir, { recursive: true });
}

for (const r of toProcess) {
  const src = path.join(coversDir, r.current);
  if (!fs.existsSync(src)) {
    console.warn('[SKIP] Archivo no encontrado:', r.current);
    continue;
  }
  const sanitizedNew = r.newName.replace(/\\/g, '/');
  const newName = path.basename(sanitizedNew);
  let dest = path.join(coversDir, newName);
  // evitar sobrescribir
  if (fs.existsSync(dest)) {
    let i = 1;
    const base = path.basename(newName, path.extname(newName));
    const ext = path.extname(newName);
    while (fs.existsSync(path.join(coversDir, `${base}-${i}${ext}`))) i++;
    dest = path.join(coversDir, `${base}-${i}${ext}`);
  }

  console.log(`${dry ? '[DRY]' : '[RENAME]'} ${r.current} -> ${path.basename(dest)}`);

  if (!dry) {
    // copiar a backup
    const backupSrcDir = path.join(backupDir, path.dirname(r.current));
    fs.mkdirSync(backupSrcDir, { recursive: true });
    fs.copyFileSync(src, path.join(backupSrcDir, path.basename(r.current)));
    // renombrar
    fs.renameSync(src, dest);
  }
}

console.log('\nProceso finalizado.');
if (!dry) console.log('Backup creado en', backupDir);

process.exit(0);
