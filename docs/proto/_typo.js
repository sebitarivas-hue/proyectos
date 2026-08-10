/* Audit typographique — combien de voix parlent sur une page ?
   La DA en autorise trois : Neutrix 400 pour les titres, Bricolage 800 pour
   les chiffres / la navigation / les étiquettes, Archivo pour le texte courant.
   Toute autre famille est un accident.
   Usage : servir docs/ sur 8899, puis `node docs/proto/_typo.js`            */
const {chromium} = require(process.env.PW || '/tmp/pw/node_modules/playwright-core');
const fs = require('fs'), path = require('path');

function pages(d, a = []) {
  for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) pages(p, a);
    else if (e.name === 'index.html') a.push(p);
  }
  return a;
}

(async () => {
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const pg = await b.newPage({viewport: {width: 390, height: 844}});
  const list = pages('docs/proto'), glob = new Map(), perPage = [];

  for (const f of list) {
    await pg.goto('http://127.0.0.1:8899/' + f.replace(/^docs\//, ''), {waitUntil: 'load'});
    const r = await pg.evaluate(() => {
      const seen = new Map();
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!n.nodeValue.trim()) continue;
        const e = n.parentElement;
        if (!e || e.closest('svg')) continue;
        const cs = getComputedStyle(e);
        const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '');
        const key = fam + ' ' + cs.fontWeight + (cs.fontStyle === 'italic' ? ' italic' : '');
        if (!seen.has(key)) seen.set(key, {n: 0, ex: ''});
        const v = seen.get(key); v.n++;
        if (!v.ex) v.ex = (e.className ? '.' + String(e.className).split(' ')[0] : e.tagName) +
          ' « ' + n.nodeValue.trim().slice(0, 28) + ' »';
      }
      return [...seen].map(([k, v]) => [k, v.n, v.ex]);
    });
    perPage.push([f, r.length]);
    for (const [k, n, ex] of r) {
      if (!glob.has(k)) glob.set(k, {n: 0, ex, pages: 0});
      const g = glob.get(k); g.n += n; g.pages++;
    }
  }
  await b.close();

  console.log('=== VOIX TYPOGRAPHIQUES SUR LES ' + list.length + ' PAGES ===');
  [...glob].sort((a, b) => b[1].pages - a[1].pages)
    .forEach(([k, v]) => console.log(String(v.pages).padStart(4), 'pages |', k.padEnd(30), '| ex.', v.ex));

  const h = {}; perPage.forEach(([, n]) => h[n] = (h[n] || 0) + 1);
  console.log('\n=== VOIX PAR PAGE ===');
  Object.keys(h).sort().forEach(k => console.log(k + ' voix :', h[k], 'pages'));
  console.log('\npire :', perPage.sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0] + '(' + x[1] + ')').join(' · '));
})();
