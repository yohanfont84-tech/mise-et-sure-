// Fabrique les pages publiques « prêtes à l'emploi » du site, APRÈS _source/build.js :
//
//   1. index.html (racine) : la page d'accueil est pré-affichée dans le fichier lui-même. Le
//      visiteur la voit dès les premiers octets reçus, sans attendre le JavaScript ni le serveur,
//      et Google lit le contenu directement.
//   2. tarifs/, mentions-legales/, confidentialite/, cgu/ : une copie du site par page publique,
//      avec son propre titre, sa description et son contenu pré-affiché. Ce sont de vraies
//      adresses (misesure.fr/tarifs/) que Google indexe et qu'on peut partager.
//   3. haccp/, fiche-technique/, allergenes/, commandes-fournisseurs/, inventaire/ : des pages
//      légères, une par fonctionnalité, pour attirer les restaurateurs depuis Google. Textes à
//      modifier dans _source/pages-content.js.
//   4. sitemap.xml : la liste de toutes ces pages, pour Google.
//   5. og-image.jpg : l'image d'aperçu quand on partage un lien du site (WhatsApp, Facebook…).
//
// Utilisation (depuis la racine du dépôt), une fois _source/build.js lancé :
//   npm install --no-save playwright@1    (une seule fois ; puis : npx playwright install chromium)
//   node _source/build-pages.js
//
// Le fichier _source/index.html reste la seule source à modifier : tout le reste est regénéré.
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://misesure.fr';
const PAGES = require('./pages-content.js');

// Pages publiques de l'application (même code que la page d'accueil, contenu pré-affiché).
const APP_PAGES = [
  { site: 'marketing', dir: '', title: null, description: null },
  { site: 'pricing', dir: 'tarifs', title: 'Tarifs — Mise & Sûre, logiciel de gestion de restaurant',
    description: "Forfaits Solo, Essentiel et Pro à partir de 19 € par mois, sans engagement. 14 jours d'essai gratuit sans carte bancaire. Commandes, coût de revient, HACCP, inventaire." },
  { site: 'mentions-legales', dir: 'mentions-legales', title: 'Mentions légales — Mise & Sûre', description: 'Mentions légales du site Mise & Sûre.' },
  { site: 'confidentialite', dir: 'confidentialite', title: 'Politique de confidentialité — Mise & Sûre', description: 'Comment Mise & Sûre protège et traite vos données personnelles.' },
  { site: 'cgu', dir: 'cgu', title: "Conditions générales d'utilisation et de vente — Mise & Sûre", description: "Conditions générales d'utilisation et de vente de Mise & Sûre." },
];

const PRERENDER_START = '<!--prerender-->';
const PRERENDER_END = '<!--/prerender-->';

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function loadPlaywright() {
  try { return require('playwright'); } catch (e) {}
  if (process.env.PW) return require(process.env.PW);
  console.error("Playwright est nécessaire : npm install --no-save playwright@1 && npx playwright install chromium");
  process.exit(1);
}

// Petit serveur de fichiers local, le temps de faire tourner la page dans un navigateur.
function startServer() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function stripPrerender(html) {
  const a = html.indexOf(PRERENDER_START);
  const b = html.indexOf(PRERENDER_END);
  if (a === -1 || b === -1) return html;
  return html.slice(0, a) + html.slice(b + PRERENDER_END.length);
}

function setMeta(html, page) {
  if (!page.title) return html;
  const url = `${SITE}/${page.dir}/`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(page.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(page.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(page.description)}">`)
    // Les fichiers (images, scripts…) sont à la racine : sans cette ligne, une page placée dans
    // /tarifs/ les chercherait dans /tarifs/.
    .replace(/<head>/, '<head><base href="/">');
}

function injectApp(html, inner) {
  const marker = '<div id="app"></div>';
  if (!html.includes(marker)) throw new Error('Repère <div id="app"></div> introuvable dans index.html — lancez d\'abord _source/build.js');
  return html.replace(marker, `<div id="app">${PRERENDER_START}${inner}${PRERENDER_END}</div>`);
}

// ---------------------------------------------------------------------------------------------
// Pages « fonctionnalité »
// ---------------------------------------------------------------------------------------------
const ALLERGEN_DEMO = (() => {
  const cols = ['🌾 Gluten', '🦐 Crustacés', '🥚 Œufs', '🐟 Poissons', '🥜 Arachides', '🫘 Soja', '🥛 Lait', '🌰 Fruits à coque', '🥬 Céleri', '🟡 Moutarde', '⚪ Sésame', '🍷 Sulfites', '🌼 Lupin', '🦪 Mollusques'];
  const rows = [
    ['Croissant', [0, 2, 6]], ['Burger maison', [0, 2, 6, 9, 10]], ['Salade César', [0, 2, 3, 6, 9]],
    ['Moules marinières', [8, 11, 13]], ['Tarte aux noix', [0, 2, 6, 7]],
  ];
  return `<div class="alg-demo" role="img" aria-label="Exemple de fiche allergènes : un tableau des plats et de leurs allergènes">
    <table><thead><tr><th>Plat</th>${cols.map(c => { const [i, ...l] = c.split(' '); return `<th><span>${i}</span>${esc(l.join(' '))}</th>`; }).join('')}</tr></thead>
    <tbody>${rows.map(([n, has]) => `<tr><td>${esc(n)}</td>${cols.map((_, i) => `<td class="${has.includes(i) ? 'y' : ''}">${has.includes(i) ? '●' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
})();

function featurePageHTML(p, all) {
  const url = `${SITE}/${p.slug}/`;
  const related = (p.related || []).map(slug => all.find(x => x.slug === slug)).filter(Boolean);
  const faqLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'FAQPage', mainEntity: p.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Mise & Sûre', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: p.kicker, item: url },
      ] },
    ],
  };
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${esc(p.title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="Mise & Sûre">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:image" content="${SITE}/${p.image ? p.image : 'og-image.jpg'}">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png">
<link rel="apple-touch-icon" href="/icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<style>
  :root{ --ink:#141414; --paper:#FAFAF7; --surface:#FFFFFF; --muted:#5E5E58; --border:#E3E3DD; --soft:#F2F2EE; --alert:#A93A2E; }
  *{ box-sizing:border-box; }
  html{ -webkit-text-size-adjust:100%; }
  body{ margin:0; background:var(--paper); color:var(--ink); font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif; font-size:16px; line-height:1.6; }
  a{ color:inherit; }
  .wrap{ max-width:1080px; margin:0 auto; padding:0 20px; }
  header{ border-bottom:1px solid var(--border); background:var(--surface); position:sticky; top:0; z-index:5; }
  header .wrap{ display:flex; align-items:center; justify-content:space-between; gap:12px; height:62px; }
  .brand{ display:flex; align-items:center; gap:10px; font-weight:700; text-decoration:none; font-size:16px; white-space:nowrap; }
  .brand img{ width:30px; height:30px; border-radius:8px; background:var(--ink); }
  nav.top{ display:flex; gap:6px; align-items:center; }
  .btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 18px; border-radius:10px; font-weight:600; font-size:15px; text-decoration:none; border:1px solid var(--ink); background:var(--ink); color:#fff; white-space:nowrap; }
  .btn.ghost{ background:transparent; color:var(--ink); border-color:var(--border); }
  .btn.sm{ padding:8px 12px; font-size:14px; }
  .hide-sm{ }
  .hero{ padding-top:64px; padding-bottom:36px; text-align:center; }
  .kicker{ display:inline-block; font-size:12.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); background:var(--soft); border:1px solid var(--border); border-radius:30px; padding:5px 12px; margin-bottom:18px; }
  h1{ font-family:Fraunces,Georgia,serif; font-size:clamp(30px,5vw,46px); line-height:1.12; margin:0 auto 18px; max-width:820px; }
  .intro{ font-size:18px; color:var(--muted); max-width:720px; margin:0 auto 28px; }
  .cta{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
  .trial{ font-size:13.5px; color:var(--muted); margin-top:12px; }
  .shot{ margin:40px auto 0; max-width:960px; border-radius:14px; border:1px solid var(--border); background:var(--surface); box-shadow:0 18px 50px rgba(0,0,0,.08); overflow:hidden; }
  .shot img{ display:block; width:100%; height:auto; }
  section{ padding:44px 0; }
  h2{ font-family:Fraunces,Georgia,serif; font-size:clamp(24px,3.4vw,32px); line-height:1.2; margin:0 0 22px; text-align:center; }
  .grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:16px; }
  .card{ background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:22px; }
  .card .ic{ font-size:26px; line-height:1; margin-bottom:12px; }
  .card h3{ margin:0 0 8px; font-size:17px; }
  .card p{ margin:0; color:var(--muted); font-size:15px; }
  ol.steps{ list-style:none; counter-reset:s; padding:0; margin:0 auto; max-width:760px; display:grid; gap:12px; }
  ol.steps li{ counter-increment:s; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px 18px 16px 62px; position:relative; }
  ol.steps li::before{ content:counter(s); position:absolute; left:18px; top:50%; transform:translateY(-50%); width:30px; height:30px; border-radius:50%; background:var(--ink); color:#fff; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:14px; }
  .faq{ max-width:780px; margin:0 auto; }
  details{ background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
  summary{ font-weight:600; cursor:pointer; }
  details p{ margin:10px 0 0; color:var(--muted); }
  .final{ text-align:center; background:var(--ink); color:#fff; border-radius:18px; padding:42px 24px; margin:10px 0 50px; }
  .final h2{ color:#fff; }
  .final p{ color:#CFCFC8; margin:0 0 22px; }
  .final .btn{ background:#fff; color:var(--ink); border-color:#fff; }
  .final .btn.ghost{ background:transparent; color:#fff; border-color:#5a5a55; }
  .related{ display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
  .related a{ text-decoration:none; border:1px solid var(--border); background:var(--surface); border-radius:30px; padding:9px 16px; font-weight:600; font-size:14.5px; }
  footer{ border-top:1px solid var(--border); padding:26px 0 40px; font-size:13px; color:var(--muted); text-align:center; }
  footer nav{ display:flex; gap:16px; flex-wrap:wrap; justify-content:center; margin-top:10px; }
  .alg-demo{ overflow-x:auto; margin:36px auto 0; max-width:1000px; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:14px; box-shadow:0 18px 50px rgba(0,0,0,.08); }
  .alg-demo table{ border-collapse:collapse; width:100%; font-size:12.5px; min-width:760px; }
  .alg-demo th, .alg-demo td{ border:1px solid var(--border); padding:6px 4px; text-align:center; }
  .alg-demo th{ background:var(--soft); font-weight:600; font-size:11px; vertical-align:bottom; }
  .alg-demo th span{ display:block; font-size:16px; }
  .alg-demo td:first-child, .alg-demo th:first-child{ text-align:left; font-weight:600; padding-left:8px; }
  .alg-demo td.y{ background:#FBE3DE; color:var(--alert); font-weight:700; }
  @media (max-width:640px){ .hide-sm{ display:none; } .hero{ padding-top:40px; } header .wrap{ height:56px; } .btn.sm{ padding:8px 10px; font-size:13.5px; } .brand{ font-size:15px; } }
</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="/"><img src="/mark-white-transparent.png" alt="" width="30" height="30">Mise &amp; Sûre</a>
  <nav class="top" aria-label="Navigation principale">
    <a class="btn ghost sm hide-sm" href="/tarifs/">Tarifs</a>
    <a class="btn ghost sm" href="/?connexion=1">Se connecter</a>
    <a class="btn sm" href="/tarifs/">Essai gratuit</a>
  </nav>
</div></header>
<main>
  <div class="wrap hero">
    <div class="kicker">${esc(p.kicker)}</div>
    <h1>${esc(p.h1)}</h1>
    <p class="intro">${esc(p.intro)}</p>
    <div class="cta">
      <a class="btn" href="/tarifs/">Essayer gratuitement 14 jours</a>
      <a class="btn ghost" href="/?demo=1">Voir la démo</a>
    </div>
    <div class="trial">Sans carte bancaire · sans engagement · inclus dans tous les forfaits</div>
    ${p.image ? `<div class="shot"><img src="/${p.image}" alt="${esc(p.imageAlt || p.h1)}" width="1200" height="750" decoding="async" fetchpriority="high"></div>` : (p.slug === 'allergenes' ? ALLERGEN_DEMO : '')}
  </div>
  <section><div class="wrap">
    <h2>Ce que ça change au quotidien</h2>
    <div class="grid">${p.benefits.map(b => `<div class="card"><div class="ic" aria-hidden="true">${b.icon}</div><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>`).join('')}</div>
  </div></section>
  <section><div class="wrap">
    <h2>Comment ça marche</h2>
    <ol class="steps">${p.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
  </div></section>
  <section><div class="wrap faq">
    <h2>Questions fréquentes</h2>
    ${p.faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
  </div></section>
  <div class="wrap">
    <div class="final">
      <h2>Essayez Mise &amp; Sûre avec votre vrai catalogue</h2>
      <p>14 jours gratuits, sans carte bancaire. Commandes, coût de revient, HACCP, allergènes et inventaire au même endroit.</p>
      <div class="cta"><a class="btn" href="/tarifs/">Commencer l'essai gratuit</a><a class="btn ghost" href="/">Découvrir Mise &amp; Sûre</a></div>
    </div>
    ${related.length ? `<h2 style="font-size:22px;">Aussi dans Mise &amp; Sûre</h2><div class="related" style="margin-bottom:46px;">${related.map(r => `<a href="/${r.slug}/">${esc(r.kicker)}</a>`).join('')}</div>` : ''}
  </div>
</main>
<footer><div class="wrap">
  Mise &amp; Sûre — logiciel de gestion pour restaurants
  <nav aria-label="Pages">
    ${all.map(x => `<a href="/${x.slug}/">${esc(x.kicker)}</a>`).join('')}
    <a href="/tarifs/">Tarifs</a><a href="/mentions-legales/">Mentions légales</a><a href="/confidentialite/">Confidentialité</a><a href="/cgu/">CGU/CGV</a>
  </nav>
</div></footer>
</body>
</html>
`;
}

function sitemapXML() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: '1.0', freq: 'weekly' },
    { loc: `${SITE}/tarifs/`, priority: '0.9', freq: 'monthly' },
    ...PAGES.map(p => ({ loc: `${SITE}/${p.slug}/`, priority: '0.8', freq: 'monthly' })),
    { loc: `${SITE}/mentions-legales/`, priority: '0.2', freq: 'yearly' },
    { loc: `${SITE}/confidentialite/`, priority: '0.2', freq: 'yearly' },
    { loc: `${SITE}/cgu/`, priority: '0.2', freq: 'yearly' },
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

const OG_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@500;600&display=swap" rel="stylesheet">
<style>
  body{ margin:0; width:1200px; height:630px; background:#141414; color:#fff; font-family:Inter,sans-serif; display:flex; overflow:hidden; }
  .l{ width:560px; padding:64px 0 64px 64px; display:flex; flex-direction:column; justify-content:center; }
  .b{ display:flex; align-items:center; gap:14px; font-weight:600; font-size:24px; margin-bottom:36px; }
  .b img{ width:52px; height:52px; border-radius:12px; }
  h1{ font-family:Fraunces,serif; font-size:56px; line-height:1.08; margin:0 0 22px; }
  p{ font-size:22px; color:#CFCFC8; margin:0 0 30px; line-height:1.45; }
  .t{ display:inline-block; background:#fff; color:#141414; border-radius:40px; padding:11px 22px; font-weight:600; font-size:19px; }
  .r{ flex:1; position:relative; }
  .r img{ position:absolute; left:36px; top:78px; width:720px; border-radius:14px; box-shadow:0 30px 80px rgba(0,0,0,.6); border:1px solid #333; }
</style></head><body>
  <div class="l">
    <div class="b"><img src="/icon-256.webp" alt="">Mise &amp; Sûre</div>
    <h1>La gestion de votre restaurant, sans friction.</h1>
    <p>Commandes fournisseurs, coût de revient, HACCP, allergènes, inventaire.</p>
    <div><span class="t">14 jours d'essai gratuit</span></div>
  </div>
  <div class="r"><img src="/mkt-commandes.webp" alt=""></div>
</body></html>`;

(async () => {
  const indexPath = path.join(ROOT, 'index.html');
  const baseHtml = stripPrerender(fs.readFileSync(indexPath, 'utf8'));
  if (!baseHtml.includes('<div id="app"></div>')) throw new Error('index.html inattendu : relancez _source/build.js');
  fs.writeFileSync(indexPath, baseHtml); // version sans pré-affichage pour le passage dans le navigateur

  const server = await startServer();
  const port = server.address().port;
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    // Aucun appel au vrai serveur ni aux statistiques pendant la fabrication.
    await ctx.route(/railway\.app|umami|analytics/, r => r.abort());
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.getElementById('app') && document.getElementById('app').innerHTML.length > 500, null, { timeout: 15000 });

    for (const p of APP_PAGES) {
      const inner = await page.evaluate(site => {
        goToSite(site);
        return document.getElementById('app').innerHTML;
      }, p.site);
      if (!inner || inner.length < 300) throw new Error(`Pré-affichage vide pour ${p.site}`);
      let html = injectApp(setMeta(baseHtml, p), inner);
      const out = p.dir ? path.join(ROOT, p.dir, 'index.html') : indexPath;
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, html);
      console.log(`${p.dir ? p.dir + '/' : '(accueil)'} : ${Math.round(Buffer.byteLength(html) / 1024)} Ko`);
    }

    for (const p of PAGES) {
      const out = path.join(ROOT, p.slug, 'index.html');
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, featurePageHTML(p, PAGES));
      console.log(`${p.slug}/ : page fonctionnalité`);
    }

    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXML());
    console.log('sitemap.xml : ' + (PAGES.length + 5) + ' adresses');

    if (!fs.existsSync(path.join(ROOT, 'og-image.jpg')) || process.argv.includes('--og')) {
      const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      await og.route('**/og.html', r => r.fulfill({ contentType: 'text/html', body: OG_HTML }));
      await og.goto(`http://127.0.0.1:${port}/og.html`, { waitUntil: 'networkidle' }).catch(() => {});
      await og.waitForTimeout(800);
      await og.screenshot({ path: path.join(ROOT, 'og-image.jpg'), type: 'jpeg', quality: 86 });
      console.log('og-image.jpg : image de partage créée');
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
