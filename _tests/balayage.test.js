const { chromium } = require('playwright');
// Balayage complet en mode démo (aucun serveur nécessaire) : toutes les pages de chaque rôle,
// sur ordinateur et téléphone, en thème clair et sombre, plus l'ouverture de chaque fenêtre.
(async()=>{
  const b = await chromium.launch(); const res={};
  for (const vp of [{width:1366,height:900},{width:390,height:844}]) for (const theme of ['light','dark']) {
    const p = await b.newPage({viewport:vp}); const errors=[];
    p.on('pageerror', e=>errors.push('PAGE '+e.message.slice(0,160))); p.on('console', m=>{ if(m.type()==='error' && !/railway|Failed to load|ERR_|umami/.test(m.text())) errors.push(m.text().slice(0,160)); });
    await p.route(/railway\.app|umami/, r=>r.abort());
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1000);
    for (const s of ['pricing','mentions-legales','confidentialite','cgu','account-auth','marketing']) { await p.evaluate(s=>goToSite(s), s); await p.waitForTimeout(150); }
    await p.evaluate(()=>{ localStorage.setItem('mise_et_sure_tour_seen','1'); startPublicDemo(); }); await p.waitForTimeout(500);
    if(theme==='dark') await p.evaluate(()=>setThemePref('dark'));
    const over={}; let crash=0;
    for (const role of ['patron','manager','cuisine','salle']) {
      await p.evaluate(r=>previewRole(r), role);
      const views = await p.evaluate(r=>NAV[r].map(n=>n.id), role);
      for (const v of views) {
        await p.evaluate(v=>setView(v), v); await p.waitForTimeout(120);
        const o = await p.evaluate(()=>({sw:document.documentElement.scrollWidth-document.documentElement.clientWidth, crash:document.body.innerText.includes("problème d'affichage")}));
        if(o.sw>2) over[role+'/'+v]=o.sw; if(o.crash) crash++;
      }
    }
    const mods = await p.evaluate(async()=>{ const bad=[]; const names=Object.keys(window).filter(k=>/^open[A-Z].*Modal$/.test(k) && typeof window[k]==='function' && window[k].length===0); for(const n of names){ try{ await window[n](); }catch(e){ bad.push(n+': '+e.message); } try{ closeModal(); }catch(e){} } return {n:names.length,bad}; });
    res[vp.width+'/'+theme] = {erreurs:[...new Set(errors)], debordements:over, plantages:crash, fenetres:mods.n, fenetres_en_erreur:mods.bad};
    await p.close();
  }
  // Une vérification par combinaison (écran × thème) : aucune erreur, aucun écran d'erreur,
  // aucun débordement horizontal, et toutes les fenêtres s'ouvrent.
  let ok=0, ko=0;
  for (const [k,v] of Object.entries(res)) {
    const good = !v.erreurs.length && !v.plantages && !Object.keys(v.debordements).length && !v.fenetres_en_erreur.length;
    good ? ok++ : ko++;
    console.log((good?'OK  ':'FAIL')+' Toutes les pages et fenêtres de la démo — '+k+(good?'':'  '+JSON.stringify(v)));
  }
  await b.close();
  console.log(`\n${ok} OK / ${ko} FAIL`);
})();
