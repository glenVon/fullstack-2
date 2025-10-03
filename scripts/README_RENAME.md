Guía para renombrar imágenes en src/images/covers

Resumen del flujo seguro (recomendado):
1) Hacer commit o backup de la carpeta del proyecto.
2) Instalar dependencias necesarias para OCR (si usarás OCR):
   npm install tesseract.js@2.1.5

3) Generar propuestas OCR (dry-run) en un CSV:
   node scripts/generate_ocr_csv.js --dry
   # o con idioma: node scripts/generate_ocr_csv.js --lang spa+eng
   # Limitar para pruebas: node scripts/generate_ocr_csv.js --limit 50

   Esto creará `scripts/covers_rename_suggestions.csv` con las propuestas.

4) Revisar y ajustar manualmente las propuestas, copiarlas a `scripts/covers_rename_template.csv` en la columna new_filename.

5) Ejecutar el aplicador en modo dry-run para ver qué cambios haría:
   node scripts/apply_rename_from_csv.js --dry

6) Si todo está bien, ejecutar sin --dry para aplicar los cambios (se hará backup):
   node scripts/apply_rename_from_csv.js

Notas importantes:
- Los scripts están escritos en CommonJS y usan APIs de Node (fs, path). Asegúrate de ejecutar con Node.js (v14+ preferido).
- El script `generate_ocr_csv.js` y `rename_covers.js` realizan OCR y pueden tardar mucho en función del número de imágenes y de la CPU.
- Siempre revisa `scripts/backup_covers_<timestamp>` después de aplicar para recuperar archivos si fuese necesario.
- Estos scripts no actualizan referencias en tus arrays `productos`. Si quieres, puedo generar un script adicional para mapear y actualizar esas referencias.

Si quieres, puedo:
- Añadir un script que actualice automáticamente `src/components/layout/Body.jsx` o el archivo donde resides el array `productos` para que use los nuevos nombres (con precaución).
- Convertir los scripts a ESM (import/export) para que funcionen si `package.json` tiene `type: "module"`.
- Crear un script que compare `covers_rename_template.csv` con `covers_rename_suggestions.csv` y genere un diff.

Dime cómo quieres proceder (ejecutar OCR y generar CSV; o usar solo CSV manual; o crear el aplicador directo).