// Pages publiques, sans serveur : ce que voient les visiteurs et Google.
// Le serveur Railway est volontairement injoignable pendant ce test : la page d'accueil doit
// s'afficher quand même, tout de suite.
const { chromium } = require('playwright');
const O = process.env.SITE_URL || 'http://localhost:8765';
let ok = 0, ko = 0;
const check = (l, c, x = '') => { c ? ok++ : ko++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + l + (x !== '' ? '  [' + x + ']' : '')); };
const FEATURE_PAGES = ['haccp', 'fiche-technique', 'allergenes', 'commandes-fournisseurs', 'inventaire'];
const APP_PAGES = { '': 'La gestion de votre restaurant', 'tarifs/': 'Des tarifs simples', 'cgu/': null, 'mentions-legales/': null, 'confidentialite/': null };

(async () => {
  // ---- HTML brut (ce que lit Google, sans exécuter le JavaScript)
  for (const [p, text] of Object.entries(APP_PAGES)) {
    const r = await fetch(`${O}/${p}`); const t = await r.text();
    check(`/${p} : page servie avec contenu pré-affiché`, r.status === 200 && t.includes('<!--prerender-->') && (!text || t.includes(text)));
    check(`/${p} : adresse canonique propre`, t.includes(`<link rel="canonical" href="https://misesure.fr/${p}">`));
  }
  const home = await (await fetch(`${O}/`)).text();
  check('Accueil : données structurées pour Google', home.includes('"@type":"SoftwareApplication"'));
  check('Accueil : image de partage 1200×630', home.includes('og-image.jpg') && home.includes('summary_large_image'));
  check('Accueil : zoom autorisé sur téléphone', !home.includes('user-scalable=no'));
  const tarifs = await (await fetch(`${O}/tarifs/`)).text();
  check('/tarifs/ : titre propre et base « / » (images à la racine)', tarifs.includes('<title>Tarifs — Mise') && tarifs.includes('<base href="/">'));
  for (const slug of FEATURE_PAGES) {
    const r = await fetch(`${O}/${slug}/`); const t = await r.text();
    check(`/${slug}/ : page fonctionnalité avec titre, description et FAQ pour Google`, r.status === 200 && /<h1>/.test(t) && t.includes('"FAQPage"') && t.includes('<meta name="description"'));
  }
  const sm = await (await fetch(`${O}/sitemap.xml`)).text();
  check('sitemap.xml : 10 adresses', (sm.match(/<loc>/g) || []).length === 10, (sm.match(/<loc>/g) || []).length);
  for (const f of ['robots.txt', 'og-image.jpg', 'icon-256.png', 'manifest.json', 'service-worker.js', 'CNAME']) {
    const r = await fetch(`${O}/${f}`); check(`Fichier présent : ${f}`, r.status === 200);
  }

  // ---- Dans le navigateur
  const b = await chromium.launch(); const errs = [];
  const page = async (vp) => {
    const ctx = await b.newContext({ viewport: vp || { width: 1280, height: 900 } });
    await ctx.route(/railway\.app|umami/, r => r.abort());
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message));
    return p;
  };
  let p = await page();
  const t0 = Date.now(); await p.goto(`${O}/`, { waitUntil: 'domcontentloaded' });
  const h1 = await p.locator('.site-hero h1').innerText({ timeout: 3000 }).catch(() => '');
  check('Accueil visible tout de suite, même sans serveur', /La gestion de votre restaurant/.test(h1), (Date.now() - t0) + ' ms');
  await p.waitForTimeout(1200);
  const coin = await p.evaluate(() => [...document.querySelectorAll('.coin3d-face img')].map(i => i.complete && i.naturalWidth));
  check('Pièce 3D : logo chargé (recto et verso)', coin.length === 2 && coin.every(Boolean), JSON.stringify(coin));
  check('Pied de page : liens vers les 5 pages fonctionnalités', await p.locator(FEATURE_PAGES.map(s => `footer a[href="/${s}/"]`).join(', ')).count() === 5);
  await p.evaluate(() => goToSite('pricing'));
  check('Clic sur Tarifs → adresse /tarifs/', new URL(p.url()).pathname === '/tarifs/');
  await p.goBack(); await p.waitForTimeout(300);
  check('Bouton « précédent » → accueil', new URL(p.url()).pathname === '/' && await p.evaluate(() => state.site) === 'marketing');

  p = await page(); await p.goto(`${O}/cgu/`); await p.waitForTimeout(1200);
  check('/cgu/ ouvre directement les CGU', await p.evaluate(() => state.site) === 'cgu');
  await p.reload(); await p.waitForTimeout(1200);
  check('Actualiser sur /cgu/ reste sur les CGU', await p.evaluate(() => state.site) === 'cgu');
  const broken = await p.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src));
  check('Sous-dossier : toutes les images se chargent', broken.length === 0, broken.join(', '));

  p = await page(); await p.goto(`${O}/haccp/`);
  await p.click('a:has-text("Voir la démo")'); await p.waitForTimeout(2000);
  check('Page fonctionnalité : « Voir la démo » ouvre la démo', await p.evaluate(() => state.isDemoMode === true));
  p = await page(); await p.goto(`${O}/haccp/`);
  await p.click('header a:has-text("Se connecter")'); await p.waitForTimeout(1500);
  check('Page fonctionnalité : « Se connecter » ouvre la connexion', await p.evaluate(() => state.site) === 'account-auth');

  p = await page({ width: 390, height: 844 }); await p.goto(`${O}/allergenes/`); await p.waitForTimeout(500);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('Page fonctionnalité sur téléphone : pas de débordement horizontal', sw <= 1, sw);
  p = await page({ width: 390, height: 844 }); await p.goto(`${O}/`); await p.waitForTimeout(1200);
  const sw2 = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('Accueil sur téléphone : pas de débordement horizontal', sw2 <= 1, sw2);

  await b.close();
  check('Aucune erreur JavaScript', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(`\n${ok} OK / ${ko} FAIL`);
})().catch(e => { console.error(e); process.exit(1); });
