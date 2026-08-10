/* AUDIT TYPOGRAPHIQUE — combien de voix parlent sur une page ?
   La DA en autorise trois : Neutrix 400 pour les titres, Bricolage 800 pour
   les chiffres, la navigation et les étiquettes, Archivo pour le texte
   courant. Son italique (Neutrix Slant) porte l'accent. Toute autre famille
   est un accident : une police non nommée par la feuille, un faux gras, un
   contrôle de formulaire qui retombe sur l'Arial du navigateur.
   Usage : servir docs/ sur 8899, puis  PW=<…>/playwright-core node outils/typo.js */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  var list = pages("docs"), glob = new Map(), perPage = [];
  for (var f of list) {
    await pg.goto("http://127.0.0.1:8899/" + f.replace(/^docs\//, ""), { waitUntil: "load" });
    var r = await pg.evaluate(() => {
      var seen = new Map(), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        if (!n.nodeValue.trim()) continue;
        var e = n.parentElement; if (!e || e.closest("svg")) continue;
        var cs = getComputedStyle(e);
        var k = cs.fontFamily.split(",")[0].replace(/["']/g, "") + " " + cs.fontWeight +
          (cs.fontStyle === "italic" ? " italic" : "");
        if (!seen.has(k)) seen.set(k, { ex: (e.className ? "." + String(e.className).split(" ")[0] : e.tagName) + " « " + n.nodeValue.trim().slice(0, 26) + " »" });
      }
      return [...seen].map(([k, v]) => [k, v.ex]);
    });
    perPage.push([f, r.length]);
    for (var [k, ex] of r) { if (!glob.has(k)) glob.set(k, { ex, pages: 0 }); glob.get(k).pages++; }
  }
  await b.close();
  console.log("=== VOIX TYPOGRAPHIQUES SUR LES " + list.length + " PAGES ===");
  [...glob].sort((a, b) => b[1].pages - a[1].pages)
    .forEach(([k, v]) => console.log(String(v.pages).padStart(4), "pages |", k.padEnd(30), "| ex.", v.ex));
  var h = {}; perPage.forEach(([, n]) => h[n] = (h[n] || 0) + 1);
  console.log("\n=== VOIX PAR PAGE ===");
  Object.keys(h).sort().forEach(k => console.log(k + " voix : " + h[k] + " pages"));
})();
