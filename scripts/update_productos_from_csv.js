/* eslint-env node */
// Script: update_productos_from_csv.js
// - Lee un CSV con columnas: current_filename,new_filename
// - Busca en el archivo target (por defecto src/components/layout/Body.jsx) las propiedades imagen: "..." o '...'
//   y reemplaza el nombre del archivo (basename) cuando coincide con current_filename
// - Hace backup del archivo target en scripts/backup_productos_<timestamp>/
// Opciones:
//   --dry        : no escribe, solo muestra lo que cambiaría
//   --csv <path> : usar CSV distinto (por defecto scripts/covers_rename_template.csv)
//   --file <path>: archivo a actualizar (por defecto src/components/layout/Body.jsx)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const csvIndex = args.findIndex(a => a === '--csv');
const csvPath = csvIndex >= 0 && args[csvIndex+1] ? args[csvIndex+1] : path.join(__dirname, 'covers_rename_template.csv');
const fileIndex = args.findIndex(a => a === '--file');
const targetFile = fileIndex >= 0 && args[fileIndex+1] ? args[fileIndex+1] : path.join(__dirname, '..', 'src', 'components', 'layout', 'Body.jsx');

if (!fs.existsSync(csvPath)) {
  console.error('CSV no encontrado:', csvPath);
  process.exit(1);
}
if (!fs.existsSync(targetFile)) {
  console.error('Archivo target no encontrado:', targetFile);
  process.exit(1);
}

function readCsv(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',').map(h => h.trim());
  const idxCurrent = header.indexOf('current_filename');
  const idxNew = header.indexOf('new_filename');
  if (idxCurrent === -1 || idxNew === -1) throw new Error('CSV debe tener columnas current_filename,new_filename');
  return lines.map(l => {
    const comma = l.indexOf(',');
    const curr = l.slice(0, comma !== -1 ? comma : l.length).trim();
    const nw = comma !== -1 ? l.slice(comma+1).trim() : '';
    return { current: curr, newName: nw };
  }).filter(r => r.current && r.newName);
}

const mappings = readCsv(csvPath);
if (mappings.length === 0) {
  console.log('No hay filas con new_filename en el CSV. Nada que hacer.');
  process.exit(0);
}

const map = new Map();
for (const m of mappings) {
  map.set(m.current.toLowerCase(), m.newName);
}

const content = fs.readFileSync(targetFile, 'utf8');

// Regex para encontrar imagen: "..." o imagen: '...'
const regex = /(imagen\s*:\s*)(["'])(.*?)\2/g;

let match;
let newContent = content;
const changes = [];

while ((match = regex.exec(content)) !== null) {
  const full = match[0];
  const prefix = match[1];
  const quote = match[2];
  const imgPath = match[3];
  const basename = path.basename(imgPath).toLowerCase();
  if (map.has(basename)) {
    const newBasename = map.get(basename);
    // preserve path prefix, replace basename only
    const dir = path.dirname(imgPath).replace(/\\/g, '/');
    const newPath = (dir === '.' || dir === '') ? newBasename : path.posix.join(dir, newBasename);
    const oldSnippet = `${prefix}${quote}${imgPath}${quote}`;
    const newSnippet = `${prefix}${quote}${newPath}${quote}`;
    changes.push({ old: oldSnippet, new: newSnippet, image: imgPath, newImage: newPath });
    // replace all occurrences of oldSnippet in newContent (safer than incremental replacement)
    newContent = newContent.split(oldSnippet).join(newSnippet);
  }
}

if (changes.length === 0) {
  console.log('No se encontraron referencias a los archivos listados en el CSV dentro de', targetFile);
  process.exit(0);
}

console.log(`Se encontraron ${changes.length} referencias a actualizar en ${targetFile}:`);
for (const c of changes) console.log(`- ${c.image} -> ${c.newImage}`);

if (dry) {
  console.log('\nMODO DRY-RUN: no se escribirán cambios.');
  process.exit(0);
}

// backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, `backup_productos_${timestamp}`);
fs.mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, path.basename(targetFile));
fs.copyFileSync(targetFile, backupPath);

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log(`\nCambios aplicados. Backup de archivo original en: ${backupPath}`);
process.exit(0);
