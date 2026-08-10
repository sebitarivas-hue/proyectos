/* COMPARAISON AVEC LE SITE D'AVANT LA V2.
   La migration a remplacé 295 pages. Ce contrôle répond à une seule question :
   quelque chose est-il passé à la trappe ?

   Il compare, route par route, le texte réellement affiché, les liens
   sortants, les images et les documents. Une phrase de l'ancien site absente
   du nouveau est signalée ; l'inverse ne l'est pas — le nouveau site a le
   droit d'en dire plus.

   La comparaison porte sur le texte, pas sur le balisage : les deux sites
   n'ont pas le même vocabulaire de classes, et comparer du HTML ne dirait
   rien d'utile.

   Usage : servir docs/ sur 8899 et l'ancien site sur 8898, puis
   PW=<…>/playwright-core node outils/comparer-ancien.js                     */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
var ANCIEN = process.env.ANCIEN || "/tmp/ancien/docs";
var NOUVEAU = "docs";

function routes(base) {
  var out = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
      var p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== "assets") walk(p); return; }
      if (e.name === "index.html") {
        var r = path.relative(base, d).split(path.sep).join("/");
        out.push(r === "." ? "" : r);
      }
    });
  })(base);
  return out;
}

/* On compare le SENS, pas la forme : la casse a changé par décision de DA, et
   « - porte renaud - » a été corrigé en « Renaud Porte » à la source. Sans
   normaliser, ces deux corrections voulues se lisent comme des pertes. */
var norm = s => s.toLowerCase()
  .replace(/-\s*porte renaud\s*-/g, "renaud porte")
  .replace(/[’']/g, "'").replace(/[«»"]/g, "")
  .replace(/\s+/g, " ").trim();
var phrases = t => t.split(/(?<=[.!?…])\s+|\n+/)
  .map(s => s.replace(/\s+/g, " ").trim())
  .filter(s => s.split(/\s+/).length >= 5);

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage({ viewport: { width: 1280, height: 900 } });

  async function lire(port, r) {
    await pg.goto("http://127.0.0.1:" + port + "/" + (r ? r + "/" : ""), { waitUntil: "load" });
    await pg.waitForTimeout(140);          /* l'ancien site compose en JavaScript */
    return pg.evaluate(() => ({
      texte: document.body.innerText,
      liens: [...document.querySelectorAll("a[href^='http']")].map(a => a.href),
      images: [...document.querySelectorAll("img")].map(i => new URL(i.getAttribute("src"), location).pathname),
      docs: [...document.querySelectorAll("a[href$='.pdf']")].map(a => new URL(a.getAttribute("href"), location).pathname),
    }));
  }

  var rA = routes(ANCIEN), rN = new Set(routes(NOUVEAU));
  var disparues = rA.filter(r => !rN.has(r));
  console.log("routes de l'ancien site : " + rA.length + " · du nouveau : " + rN.size);
  console.log("routes disparues : " + disparues.length);
  disparues.forEach(r => console.log("   /" + r + "/"));

  var totPhrases = 0, totLiens = 0, totImg = 0, totDoc = 0, detail = [];

  for (var r of rA) {
    if (!rN.has(r)) continue;
    var a, n;
    try { a = await lire(8898, r); n = await lire(8899, r); } catch (_) { continue; }

    var pn = new Set(phrases(n.texte).map(norm));
    var perdues = phrases(a.texte).filter(s => !pn.has(norm(s)));

    var ln = new Set(n.liens), li = [...new Set(a.liens)].filter(u => !ln.has(u));
    var imn = new Set(n.images), im = [...new Set(a.images)].filter(u => !imn.has(u));
    var dn = new Set(n.docs), dc = [...new Set(a.docs)].filter(u => !dn.has(u));

    if (perdues.length || li.length || im.length || dc.length) {
      detail.push({ r: r, ph: perdues, li: li, im: im, dc: dc });
      totPhrases += perdues.length; totLiens += li.length; totImg += im.length; totDoc += dc.length;
    }
  }
  await b.close();

  var gl = new Map(), gi = new Map();
  detail.forEach(d => { d.li.forEach(u => gl.set(u, (gl.get(u)||0)+1)); d.im.forEach(u => gi.set(u,(gi.get(u)||0)+1)); });
  console.log("\n=== LIENS SORTANTS PERDUS (distincts) ===");
  [...gl].sort((a,b)=>b[1]-a[1]).forEach(([u,n]) => console.log("  " + String(n).padStart(4) + " pages  " + u));
  console.log("\n=== IMAGES PERDUES (distinctes) ===");
  [...gi].sort((a,b)=>b[1]-a[1]).forEach(([u,n]) => console.log("  " + String(n).padStart(4) + " pages  " + u));
  console.log("\nphrases de l'ancien site absentes du nouveau : " + totPhrases);
  console.log("liens sortants perdus : " + totLiens);
  console.log("images perdues : " + totImg);
  console.log("documents perdus : " + totDoc);

  detail.sort((x, y) => (y.ph.length + y.li.length + y.im.length + y.dc.length) -
    (x.ph.length + x.li.length + x.im.length + x.dc.length));
  detail.slice(0, 25).forEach(function (d) {
    console.log("\n/" + d.r + "/");
    d.ph.slice(0, 4).forEach(s => console.log("   texte   « " + s.slice(0, 92) + " »"));
    if (d.ph.length > 4) console.log("   texte   … et " + (d.ph.length - 4) + " autres");
    d.li.slice(0, 4).forEach(s => console.log("   lien    " + s));
    d.im.slice(0, 4).forEach(s => console.log("   image   " + s));
    d.dc.forEach(s => console.log("   doc     " + s));
  });
})();
