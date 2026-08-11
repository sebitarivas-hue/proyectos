/* LE TITRE DE L'ONGLET.
   Deux défauts, sur les six langues.

   Le premier : une esperluette écrite deux fois. « Corps &amp;amp; présence »
   s'affiche tel quel dans l'onglet et dans les résultats de recherche — le
   titre a été encodé une fois de trop. Vingt-huit pages.

   Le second : le rang 03 a été renommé « transmettre » — un verbe, pas un
   nom — partout sauf ici. L'onglet disait encore « Transmission ».

   Run: node outils/titres.js [--verifier]                                   */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

/* le rang 03, dit comme un geste dans chaque langue */
var TRANSMETTRE = {
  fr: "Transmettre", en: "Passing on", es: "Transmitir",
  it: "Trasmettere", zh: "传承", de: "Weitergeben"
};
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var doubles = 0, rebaptises = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");

  var h = fs.readFileSync(f, "utf8"), avant = h;

  h = h.replace(/<title>([^<]*)<\/title>/, function (m, t) {
    if (t.indexOf("&amp;amp;") >= 0) { t = t.replace(/&amp;amp;/g, "&amp;"); doubles++; }
    if (route === "transmission") { t = TRANSMETTRE[lang] + " — STOPERA!"; rebaptises++; }
    return "<title>" + t + "</title>";
  });

  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("esperluettes doublées : " + doubles + " · rang 03 rebaptisé : " + rebaptises +
  " · pages touchées : " + touchees);
