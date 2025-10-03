/* eslint-env node */
// Script: generate_ocr_csv.js
// - Recorre src/images/covers y para cada imagen ejecuta OCR (tesseract.js) para generar una propuesta de nombre
// - Escribe un CSV (scripts/covers_rename_suggestions.csv) con columnas: current_filename,ocr_suggestion
// Opciones:
//   --lang <langs> : idiomas Tesseract (por defecto 'spa+eng')
//   --out <path>   : archivo CSV de salida (por defecto scripts/covers_rename_suggestions.csv)
//   --limit <n>    : procesar solo n primeros archivos (útil para pruebas)
// Nota: requiere instalar tesseract.js localmente.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWorker } from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const langIndex = args.findIndex(a => a === '--lang');
const lang = langIndex >= 0 && args[langIndex+1] ? args[langIndex+1] : 'spa+eng';
const outIndex = args.findIndex(a => a === '--out');
const outPath = outIndex >= 0 && args[outIndex+1] ? args[outIndex+1] : path.join(__dirname, 'covers_rename_suggestions.csv');
const limitIndex = args.findIndex(a => a === '--limit');
const limit = limitIndex >= 0 && args[limitIndex+1] ? parseInt(args[limitIndex+1], 10) : null;

const coversDir = path.join(__dirname, '..', 'src', 'images', 'covers');

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

(async () => {
  if (!fs.existsSync(coversDir)) {
    console.error('Covers dir not found:', coversDir);
    process.exit(1);
  }

  const files = fs.readdirSync(coversDir).filter(f => /\.(jpe?g|png)$/i.test(f));
  const toProcess = limit ? files.slice(0, limit) : files;

  console.log(`Procesando ${toProcess.length} archivos. Esto puede tardar.`);

  const worker = await createWorker();
  await worker.load();
  try {
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
  } catch (error) {
    console.warn('No se pudo cargar idiomas:', lang, 'intentando eng');
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }

  const outLines = ['current_filename,ocr_suggestion'];

  for (const f of toProcess) {
    try {
      const p = path.join(coversDir, f);
      const { data: { text } } = await worker.recognize(p);
      const sample = (text || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0,3).join(' ');
      const suggestion = sample ? `${slugify(sample)}${path.extname(f).toLowerCase()}` : '';
      outLines.push(`${f},${suggestion}`);
      console.log(f, '->', suggestion);
    } catch (error) {
      console.warn('Error OCR', f, error && error.message ? error.message : error);
      outLines.push(`${f},`);
    }
  }

  await worker.terminate();

  fs.writeFileSync(outPath, outLines.join('\n'), 'utf8');
  console.log('CSV guardado en', outPath);
  process.exit(0);
})();
