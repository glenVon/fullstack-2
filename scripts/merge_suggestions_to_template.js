/* eslint-env node */
// Script: merge_suggestions_to_template.js
// - Lee: suggestions CSV (current_filename,ocr_suggestion) y template CSV (current_filename,new_filename)
// - Rellena en la plantilla las new_filename vacías con la sugerencia OCR cuando los current_filename coincidan
// Opciones:
//   --dry                 : mostrar resultados pero no escribir
//   --suggestions <path>  : CSV de sugerencias (por defecto scripts/covers_rename_suggestions.csv)
//   --template <path>     : CSV plantilla (por defecto scripts/covers_rename_template.csv)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const sugIndex = args.findIndex(a => a === '--suggestions');
const suggestionsPath = sugIndex >= 0 && args[sugIndex+1] ? args[sugIndex+1] : path.join(__dirname, 'covers_rename_suggestions.csv');
const tplIndex = args.findIndex(a => a === '--template');
const templatePath = tplIndex >= 0 && args[tplIndex+1] ? args[tplIndex+1] : path.join(__dirname, 'covers_rename_template.csv');

if (!fs.existsSync(suggestionsPath)) {
  console.error('Suggestions CSV no encontrado:', suggestionsPath);
  process.exit(1);
}
if (!fs.existsSync(templatePath)) {
  console.error('Template CSV no encontrado:', templatePath);
  process.exit(1);
}

function readCsvRows(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(l => {
    // preserve commas in fields by splitting only at first comma
    const comma = l.indexOf(',');
    if (comma === -1) return [l.trim(), ''];
    return [l.slice(0, comma).trim(), l.slice(comma+1).trim()];
  });
  return { header, rows };
}

const suggestions = readCsvRows(suggestionsPath);
const template = readCsvRows(templatePath);

// build map from suggestions
const sugMap = new Map();
for (const r of suggestions.rows) {
  const key = r[0].toLowerCase();
  const val = r[1] || '';
  if (val) sugMap.set(key, val);
}

const outRows = [];
let filled = 0;
for (const r of template.rows) {
  const curr = r[0];
  const existing = r[1] || '';
  const key = curr.toLowerCase();
  if ((!existing || existing.trim() === '') && sugMap.has(key)) {
    const suggestion = sugMap.get(key);
    outRows.push([curr, suggestion]);
    filled++;
  } else {
    outRows.push([curr, existing]);
  }
}

console.log(`Se rellenarán ${filled} filas en la plantilla (solo las vacías).`);
if (filled > 0) console.log('Algunas muestras:');
for (let i = 0; i < Math.min(20, outRows.length); i++) {
  const [c, n] = outRows[i];
  if (n && n.length) console.log(`${c} -> ${n}`);
}

if (dry) {
  console.log('\nMODO DRY: no se modificará el archivo plantilla.');
  process.exit(0);
}

// Escribir plantilla actualizada: sobrescribimos la plantilla original (puedes mantener backup manualmente)
const linesOut = [template.header.join(',')];
for (const r of outRows) linesOut.push(`${r[0]},${r[1]}`);
fs.writeFileSync(templatePath, linesOut.join('\n'), 'utf8');
console.log('\nPlantilla actualizada y guardada en', templatePath);
process.exit(0);
