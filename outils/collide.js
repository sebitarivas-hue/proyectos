/* « CRÉATIONS & PRODUCTIONS », LE BLOC DE TÊTE DE LA SECTION 02.
   Il portait ce libellé en français dans les six langues — un anglophone
   lisait « créations & productions ». Le mot est coupé par un <br> : c'est
   une composition sur deux lignes, pas une phrase. Cette coupure le rendait
   invisible à la mémoire du site, qui garde les phrases entières, et donc à
   tous les contrôles de traduction.

   On lui donne la mémoire des autres langues et le texte de sa page, sans
   toucher au retour à la ligne, qui appartient au dessin.

   Run: node outils/collide.js [--verifier]                                  */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

var T = {
  fr: ["créations", "&amp; productions"],
  en: ["creations", "&amp; productions"],
  es: ["creaciones", "&amp; producciones"],
  it: ["creazioni", "&amp; produzioni"],
  zh: ["创作", "与制作"],
  de: ["kreationen", "&amp; produktionen"]
};
/* le chinois n'a pas d'espace entre les mots */
var MEMOIRE = LANGS.map(function (l) {
  return ' data-' + l + '="' + T[l].join(l === "zh" ? "" : " ") + '"';
}).join("");

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

/* le libellé, dans l'une quelconque des six écritures possibles */
var CORPS = LANGS.map(function (l) { return T[l][0] + "<br>" + T[l][1]; });
var faits = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  CORPS.forEach(function (c) {
    var re = new RegExp('<span class="t"([^>]*)>' + c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "</span>", "g");
    h = h.replace(re, function () {
      faits++;
      return '<span class="t"' + MEMOIRE + ">" + T[lang][0] + "<br>" + T[lang][1] + "</span>";
    });
  });

  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("« créations & productions » : " + faits + " libellé(s) sur " + touchees + " page(s)");
