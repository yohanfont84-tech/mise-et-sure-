// Vérifications du code, sans navigateur :
//  1. Analyse ESLint du JavaScript du site : variable inconnue, fonction déclarée deux fois…
//     (ces fautes font planter une page entière au premier clic).
//  2. Le fichier publié index.html correspond bien à la source _source/index.html : personne n'a
//     modifié l'un sans regénérer l'autre (sinon une correction serait perdue au prochain build).
//  3. Les copies /tarifs/, /cgu/… contiennent le même code que l'accueil.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
let ok = 0, ko = 0;
const check = (l, c, x = '') => { c ? ok++ : ko++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + l + (x !== '' ? '  [' + x + ']' : '')); };

// ---- 1. ESLint sur le JavaScript de _source/index.html (lignes conservées pour les messages)
const src = fs.readFileSync(path.join(ROOT, '_source', 'index.html'), 'utf8');
let js = '', pos = 0;
for (const m of src.matchAll(/(<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>)([\s\S]*?)<\/script>/g)) {
  const start = m.index + m[1].length;
  js += '\n'.repeat((src.slice(pos, start).match(/\n/g) || []).length) + m[2];
  pos = start + m[2].length;
}
const tmp = path.join(os.tmpdir(), 'mise-et-sure-lint.js');
fs.writeFileSync(tmp, js);
const { ESLint } = require('eslint');
(async () => {
  const eslint = new ESLint({ useEslintrc: false, overrideConfigFile: path.join(__dirname, '.eslintrc.json') });
  const [res] = await eslint.lintFiles([tmp]);
  const errors = res.messages.filter(m => m.severity === 2);
  check('JavaScript du site : aucune erreur ESLint (variable inconnue, doublon…)', errors.length === 0,
    errors.slice(0, 5).map(e => `ligne ${e.line} : ${e.message}`).join(' | '));

  // CSS : accolades équilibrées (une accolade oubliée casse tout le style qui suit)
  const css = (src.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []).join('').replace(/\/\*[\s\S]*?\*\//g, '');
  check('CSS : accolades équilibrées', (css.match(/{/g) || []).length === (css.match(/}/g) || []).length);

  // ---- 2. index.html publié = build de la source (pré-affichage mis à part)
  const out = path.join(os.tmpdir(), 'mise-et-sure-build.html');
  execFileSync(process.execPath, [path.join(ROOT, '_source', 'build.js'), out], { stdio: 'ignore', env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') } });
  const strip = h => { const a = h.indexOf('<!--prerender-->'), b = h.indexOf('<!--/prerender-->'); return a === -1 ? h : h.slice(0, a) + h.slice(b + '<!--/prerender-->'.length); };
  const built = fs.readFileSync(out, 'utf8');
  const published = strip(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
  check('index.html publié = version fabriquée depuis _source/index.html', built === published,
    built === published ? '' : 'relancer : node _source/build.js puis node _source/build-pages.js');

  // ---- 3. Copies des pages publiques à jour (même code que l'accueil)
  // Le plus gros bloc <script> = le code de l'application (le contenu pré-affiché, lui, diffère par page).
  const scriptOf = h => [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).sort((a, b) => b.length - a.length)[0] || '';
  for (const dir of ['tarifs', 'cgu', 'mentions-legales', 'confidentialite']) {
    const f = path.join(ROOT, dir, 'index.html');
    const same = fs.existsSync(f) && scriptOf(fs.readFileSync(f, 'utf8')) === scriptOf(published);
    check(`/${dir}/ : même code que l'accueil`, same, same ? '' : 'relancer : node _source/build-pages.js');
  }
  console.log(`\n${ok} OK / ${ko} FAIL`);
})().catch(e => { console.error(e); process.exit(1); });
