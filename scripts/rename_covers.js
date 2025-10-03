/* eslint-env node */
// Script: rename_covers.js
// - Recorre recursivamente la carpeta src/images/covers
// - Para cada archivo de imagen (.jpg, .jpeg, .png) ejecuta OCR con tesseract.js
// - Crea un slug a partir del texto OCR (minúsculas, sin acentos, espacios -> '-')
// - Renombra el archivo preservando la extensión
// - Añade sufijo incremental si ya existe un archivo con ese nombre

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { createWorker } from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const coversDir = path.join(__dirname, '..', 'src', 'images', 'covers');

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')                 // split accented letters
    .replace(/\p{Diacritic}/gu, '')  // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // remove invalid chars
    .trim()
    .replace(/\s+/g, '-')           // collapse whitespace
    .replace(/-+/g, '-');            // collapse dashes
}

async function renameImages() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry');
  const interactive = args.includes('--interactive');
  const langArgIndex = args.findIndex(a => a === '--lang');
  const lang = langArgIndex >= 0 && args[langArgIndex + 1] ? args[langArgIndex + 1] : 'spa+eng';

  const worker = await createWorker({
    logger: m => {
      if (m.status && m.progress !== undefined) console.log(m.status, Math.round(m.progress * 100) + '%');
    }
  });

  await worker.load();
  try {
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
  } catch (error) {
    console.warn('No se pudo cargar el/los idiomas solicitados para Tesseract:', lang, '\nIntentando con inglés...');
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }

  const files = [];

  function walk(dir) {
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (/\.(jpe?g|png)$/i.test(f)) files.push(full);
    }
  }

  if (!fs.existsSync(coversDir)) {
    console.error('Directorio no encontrado:', coversDir);
    await worker.terminate();
    return;
  }

  walk(coversDir);

  console.log(`Encontradas ${files.length} imágenes. Empezando OCR...`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question) => new Promise(resolve => rl.question(question, ans => resolve(ans.trim())));

  for (const file of files) {
    console.log('\nProcesando:', file);
    try {
      const { data: { text } } = await worker.recognize(file);
      const sample = (text || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0,3).join(' ');
      const base = sample || path.basename(file, path.extname(file));
      let name = slugify(base).slice(0,120) || slugify(path.basename(file, path.extname(file)));
      if (!name) name = 'cover';

      const ext = path.extname(file).toLowerCase();
      const dir = path.dirname(file);
      let newName = `${name}${ext}`;
      let counter = 1;
      while (fs.existsSync(path.join(dir, newName))) {
        newName = `${name}-${counter}${ext}`;
        counter++;
      }

      const newPath = path.join(dir, newName);
      if (dryRun) {
        console.log(`[DRY] ${path.basename(file)} -> ${newName}`);
      } else if (interactive) {
        console.log(`Propuesta: ${path.basename(file)} -> ${newName}`);
        const ans = await ask('¿Renombrar? (y/n) ');
        if (ans.toLowerCase() === 'y' || ans.toLowerCase() === 's') {
          fs.renameSync(file, newPath);
          console.log('Renombrado a:', newPath);
        } else {
          console.log('Omitido');
        }
      } else {
        fs.renameSync(file, newPath);
        console.log('Renombrado a:', newPath);
      }
    } catch (error) {
      console.error('Error procesando', file, error && error.message ? error.message : error);
    }
  }

  if (interactive) rl.close();

  await worker.terminate();
  console.log('\nProceso completado. Revisa los nombres generados en:', coversDir);
}

renameImages().catch(error => {
  console.error('Fallo del script:', error);
});
