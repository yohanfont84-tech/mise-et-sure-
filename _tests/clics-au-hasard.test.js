// Le « robot » : en mode démo, clique sur tous les boutons, menus et cases de chaque page de
// chaque rôle, puis dans chaque fenêtre ouverte, et vérifie que rien ne plante.
// Usage : node clics-au-hasard.test.js [mobile]
const { chromium } = require('playwright');
const SKIP = /deleteRestaurant|requestAccountDeletion|logout|exitPublicDemo|goToSite|signOutAccount|location|reload|goToLogin|goToAdminPage|startPublicDemo|backToWorkspace|window\.open|print\(|openBillingPortal|startCheckout|choosePlan|enablePushNotifications|startGuidedTour/;
(async()=>{
  const b = await chromium.launch(); const vp = process.argv[2]==='mobile' ? {width:390,height:844} : {width:1366,height:900};
  const ctx = await b.newContext({viewport:vp, acceptDownloads:true}); const p = await ctx.newPage();
  const errors=[]; let lbl='';
  p.on('pageerror', e=>errors.push(lbl+' → '+e.message.slice(0,200))); p.on('console', m=>{ if(m.type()==='error' && !/railway|ERR_|Failed to load|favicon|umami/.test(m.text())) errors.push(lbl+' → '+m.text().slice(0,200)); });
  p.on('dialog', d=>d.accept().catch(()=>{})); ctx.on('page', np=>np.close().catch(()=>{}));
  await p.route(/railway\.app|umami|nominatim|openstreetmap|tile/, r=>r.abort());
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(900);
  await p.evaluate(()=>{ localStorage.setItem('mise_et_sure_tour_seen','1'); localStorage.setItem('mise_et_sure_cookie_consent','1'); startPublicDemo(); }); await p.waitForTimeout(600);
  const crashed = () => p.evaluate(()=>document.body.innerText.includes("problème d'affichage"));
  let clicks=0; const crashes=[]; const SEL='.content [onclick], .content button, .content select, .content input[type=checkbox], .topbar [onclick]';
  for (const role of ['patron','manager','cuisine','salle']) {
    const views = await p.evaluate(r=>{ previewRole(r); return NAV[r].map(n=>n.id); }, role);
    for (const v of views) {
      const reset = async () => { await p.evaluate(([r,v])=>{ try{closeModal();}catch(e){} if(state.role!==r) previewRole(r); try{ setView(v);}catch(e){} }, [role,v]); await p.waitForTimeout(50); };
      await reset(); const n = await p.evaluate(sel=>document.querySelectorAll(sel).length, SEL);
      for (let i=0;i<n;i++){
        await reset();
        const info = await p.evaluate(([i,skip,sel])=>{ const el=[...document.querySelectorAll(sel)][i]; if(!el) return null; const oc=el.getAttribute('onclick')||el.getAttribute('onchange')||'';
          if(new RegExp(skip).test(oc)) return {skip:true}; const r=el.getBoundingClientRect(); if(!r.width||!r.height||el.disabled) return {skip:true};
          const label=(el.textContent||el.getAttribute('aria-label')||el.title||el.tagName).trim().replace(/\s+/g,' ').slice(0,40);
          try{ if(el.tagName==='SELECT'){ if(el.options.length>1){ el.selectedIndex=el.options.length-1; el.dispatchEvent(new Event('change',{bubbles:true})); } } else el.click(); }catch(e){ return {label,err:e.message}; } return {label}; }, [i,SKIP.source,SEL]);
        if(!info||info.skip) continue; clicks++; lbl=`${role}/${v} « ${info.label} »`; if(info.err) errors.push(lbl+' → '+info.err);
        await p.waitForTimeout(80);
        if(await crashed()){ crashes.push(lbl+' :: '+(await p.evaluate(()=>document.body.innerText.slice(-260))).replace(/\s+/g,' ')); await p.evaluate(()=>render()); }
        const mn = await p.evaluate(()=>document.getElementById('modalBg').classList.contains('open') ? document.querySelectorAll('#modalContent button, #modalContent [onclick], #modalContent select').length : 0);
        for (let j=0;j<Math.min(mn,12);j++){
          const mi = await p.evaluate(([j,skip])=>{ if(!document.getElementById('modalBg').classList.contains('open')) return null; const el=[...document.querySelectorAll('#modalContent button, #modalContent [onclick], #modalContent select')][j]; if(!el) return null; const oc=el.getAttribute('onclick')||el.getAttribute('onchange')||''; if(new RegExp(skip).test(oc)||/closeModal/.test(oc)) return {skip:true}; const label=(el.textContent||el.title||el.tagName).trim().replace(/\s+/g,' ').slice(0,30); try{ if(el.tagName==='SELECT'){ if(el.options.length>1){ el.selectedIndex=1; el.dispatchEvent(new Event('change',{bubbles:true})); } } else el.click(); }catch(e){ return {label,err:e.message}; } return {label}; }, [j,SKIP.source]);
          if(!mi) break; if(mi.skip) continue; clicks++; const l2=lbl+' > « '+mi.label+' »'; lbl=l2; if(mi.err) errors.push(l2+' → '+mi.err);
          await p.waitForTimeout(80); if(await crashed()){ crashes.push(l2); await p.evaluate(()=>render()); break; }
        }
      }
    }
  }
  console.log(`${vp.width}px — ${clicks} clics | plantages ${crashes.length} | erreurs ${[...new Set(errors)].length}`); crashes.forEach(c=>console.log('  ✖',c)); [...new Set(errors)].forEach(e=>console.log('  •',e));
  await b.close();
  const good = clicks > 200 && !crashes.length && ![...new Set(errors)].length;
  console.log((good?'OK  ':'FAIL')+` Clics au hasard (${vp.width}px) : ${clicks} clics sans plantage ni erreur`);
  console.log(`\n${good?1:0} OK / ${good?0:1} FAIL`);
})();
