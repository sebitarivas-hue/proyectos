/* COUVERTURE DES TRADUCTIONS — mesurée sur le texte réellement affiché.
   Une phrase d'au moins six mots, identique au français sur une page qui ne
   l'est pas, est une phrase non traduite. Les noms propres, les titres
   d'œuvres et les intitulés courts sont hors du compte : ils ne se traduisent
   pas.
   Usage : servir docs/ sur 8899, puis  PW=<…>/playwright-core node outils/langues.js */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
var LANGS = ["en", "es", "it", "zh"];

function routes(d, base, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets" && LANGS.indexOf(e.name) < 0) routes(p, base, a); return; }
    if (e.name === "index.html") a.push(path.relative(base, d).split(path.sep).join("/").replace(/^\.$/, ""));
  });
  return a;
}
var phrases = t => t.split(/(?<=[.!?…])\s+|\n+/).map(s => s.replace(/\s+/g, " ").trim())
  .filter(s => s.split(/\s+/).length >= 6);

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  var url = r => "http://127.0.0.1:8899/" + (r ? r + "/" : "");
  var visible = async u => { await pg.goto(u, { waitUntil: "load" }); return pg.evaluate(() => {
    /* la navigation et le pied sont mesurés à part : ils ne sont pas du contenu */
    var n = document.querySelector("main") || document.body;
    return [...n.children].filter(e => !e.matches("nav, footer, script, style, svg, .nav, .foot")).map(e => e.innerText).join("\n");
  }); };

  var rs = routes("docs", "docs"), par = {}, ex = {}, TOUT = {};
  for (var r of rs) {
    var fr = new Set(phrases(await visible(url(r))));
    if (!fr.size) continue;
    for (var l of LANGS) {
      var t;
      try { t = await visible(url(l + (r ? "/" + r : ""))); } catch (_) { continue; }
      var reste = phrases(t).filter(s => fr.has(s));
      if (!reste.length) continue;
      var sec = (r.split("/")[0] || "(accueil)");
      par[l + " · " + sec] = (par[l + " · " + sec] || 0) + reste.length;
      if (!ex[l + " · " + sec]) ex[l + " · " + sec] = reste[0].slice(0, 78);
      (TOUT[l] = TOUT[l] || []).push(...reste);
    }
  }
  await b.close();
  var tot = Object.values(par).reduce((a, b) => a + b, 0);
  console.log("phrases affichées encore en français : " + tot);
  Object.entries(par).sort((a, b) => b[1] - a[1]).forEach(([k, v]) =>
    console.log("  " + k.padEnd(24) + String(v).padStart(4) + "   « " + ex[k] + " »"));
  var uniq = [...new Set(Object.values(TOUT).flat())].filter(s => !/^[^.!?]*·[^.!?]*$/.test(s));
  console.log("\n=== phrases distinctes, listes de noms propres exclues (" + uniq.length + ") ===");
  uniq.slice(0, 30).forEach(s => console.log("  « " + s.slice(0, 96) + " »"));
})();
