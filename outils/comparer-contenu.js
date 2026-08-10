/* CE QUE L'ANCIEN SITE DISAIT ET QUE LE NOUVEAU NE DIT PLUS.
   La comparaison page à page signale trop : quand une liste devient une
   grille, « Dramaturgie & mise en scène — Marcelo Lombardero » se lit sur
   deux lignes au lieu d'une, et une comparaison littérale y voit une perte.
   Ce n'en est pas une.

   Ce contrôle compare donc le CONTENU, débarrassé de la ponctuation, des
   accents et des retours à la ligne, et le cherche dans le site ENTIER —
   pas seulement dans la page de même adresse : une phrase déplacée d'une
   page à l'autre n'est pas perdue.

   Usage : servir docs/ sur 8899, l'ancien site sur 8898, puis
   PW=<…>/playwright-core node outils/comparer-contenu.js                    */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
var ANCIEN = process.env.ANCIEN || "/tmp/ancien/docs";

function routes(base) {
  var out = [];
  (function w(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
      var p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== "assets") w(p); return; }
      if (e.name === "index.html") {
        var r = path.relative(base, d).split(path.sep).join("/");
        out.push(r === "." ? "" : r);
      }
    });
  })(base);
  return out;
}

/* « Renaud Porte » a été corrigé à la source : les deux graphies valent l'une
   pour l'autre, sinon la correction se lirait comme une disparition. */
function cle(s) {
  return s.toLowerCase()
    .replace(/porte renaud|renaud porte/g, "renaudporte")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
var phrases = t => t.split(/(?<=[.!?…])\s+|\n+/)
  .map(s => s.replace(/\s+/g, " ").trim())
  .filter(s => s.split(/\s+/).length >= 5);

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  async function lire(port, r) {
    await pg.goto("http://127.0.0.1:" + port + "/" + (r ? r + "/" : ""), { waitUntil: "load" });
    await pg.waitForTimeout(130);            /* l'ancien site compose en JavaScript */
    return pg.evaluate(() => document.body.innerText);
  }

  var neuf = "";
  for (var r of routes("docs")) neuf += cle(await lire(8899, r)) + " ";

  var perdues = [], occurrences = 0;
  for (var ra of routes(ANCIEN)) {
    var t = await lire(8898, ra);
    for (var s of phrases(t)) {
      var k = cle(s);
      if (k.length >= 25 && neuf.indexOf(k) < 0) { perdues.push([ra, s, k]); occurrences++; }
    }
  }
  await b.close();

  var vues = new Set(), uniques = [];
  perdues.forEach(function (x) { if (!vues.has(x[2])) { vues.add(x[2]); uniques.push(x); } });

  console.log("phrases de l'ancien site introuvables dans le nouveau : " +
    uniques.length + " (" + occurrences + " occurrences)");
  uniques.forEach(x => console.log("  /" + x[0] + "/  « " + x[1].slice(0, 120) + " »"));
})();
