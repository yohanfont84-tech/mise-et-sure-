// ============================================================
// TESTS AUTOMATIQUES DU SITE — sans serveur
// Sert le site comme GitHub Pages (localhost:8765), puis lance chaque suite. S'arrête avec une
// erreur si un seul test échoue : c'est ce qui fait passer la vérification GitHub au rouge.
// Les tests de bout en bout avec le vrai serveur sont dans le dépôt mise-et-sure-backend.
//
// Utilisation : cd _tests && npm install && npx playwright install chromium && node lancer-les-tests.js
// ============================================================
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..');
const PORT = 8765;
const SUITES = [
  ['code', []],
  ['site-public', []],
  ['balayage', []],
  ['clics-au-hasard', []],
  ['clics-au-hasard', ['mobile']],
];

function startSite() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(SITE_DIR, p);
    // Comme GitHub Pages : les dossiers commençant par « _ » ne sont pas publiés.
    if (!file.startsWith(SITE_DIR) || /[\\/]_/.test(path.relative(SITE_DIR, file)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => { server.on('error', reject); server.listen(PORT, '127.0.0.1', () => resolve(server)); });
}

function runSuite(name, args) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(__dirname, `${name}.test.js`), ...args], { cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', d => { out += d; });
    child.stderr.on('data', d => { out += d; });
    const timer = setTimeout(() => child.kill('SIGKILL'), 12 * 60 * 1000);
    child.on('close', code => {
      clearTimeout(timer);
      const m = out.match(/(\d+) OK \/ (\d+) FAIL/);
      resolve({ ok: m ? +m[1] : 0, ko: m ? +m[2] : 0, passed: code === 0 && !!m && +m[2] === 0, out, code });
    });
  });
}

(async () => {
  const site = await startSite();
  let failed = 0, total = 0;
  for (const [name, args] of SUITES) {
    const label = (name + (args.length ? ' (' + args.join(' ') + ')' : '')).padEnd(28);
    process.stdout.write(`  ${label} `);
    const r = await runSuite(name, args);
    total += r.ok;
    console.log(r.passed ? `✅ ${r.ok} réussis` : `❌ ${r.ok} réussis, ${r.ko} échoués${r.code ? ` (code ${r.code})` : ''}`);
    if (!r.passed) {
      failed++;
      const lines = r.out.split('\n').filter(l => /^FAIL|Error|✖|•/.test(l)).slice(0, 25);
      console.log(lines.map(l => '      ' + l).join('\n') || r.out.slice(-1500));
    }
  }
  site.close();
  console.log(`\n${failed ? '❌' : '✅'} ${total} vérifications réussies — ${failed} suite(s) en échec sur ${SUITES.length}`);
  process.exit(failed ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
