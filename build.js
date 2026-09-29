// Fabrique le fichier index.html publié (à la racine du site) à partir de _source/index.html.
//
// _source/index.html est la version de travail, avec toutes les explications internes : c'est
// ELLE qu'on modifie. Le fichier publié en retire les commentaires et les espaces inutiles, pour
// qu'un visiteur télécharge le moins possible, sans rien changer au fonctionnement.
// Le dossier _source n'est pas publié par GitHub Pages (les dossiers commençant par « _ » sont
// ignorés).
//
// Utilisation (depuis la racine du dépôt) :
//   npm install --no-save html-minifier-terser@7
//   node _source/build.js
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

(async () => {
  const srcPath = path.join(__dirname, 'index.html');
  const outPath = path.join(__dirname, '..', 'index.html');
  const src = fs.readFileSync(srcPath, 'utf8');
  const out = await minify(src, {
    removeComments: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    // Code JavaScript : on retire seulement commentaires et espaces. Aucun renommage, aucune
    // réécriture : le code publié reste exactement celui de la source.
    minifyJS: { compress: false, mangle: false, format: { comments: false } },
    keepClosingSlash: true,
  });
  const banner = '<!-- Fichier généré à partir de _source/index.html (voir _source/build.js) — ne pas modifier directement. -->\n';
  fs.writeFileSync(outPath, banner + out);
  const kb = n => Math.round(n / 1024) + ' Ko';
  console.log(`index.html : ${kb(Buffer.byteLength(src))} → ${kb(Buffer.byteLength(banner + out))}`);
})();
