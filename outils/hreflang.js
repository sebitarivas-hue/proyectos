/* LES VERSIONS D'UNE PAGE SE DÉCLARENT ENTRE ELLES.
   L'ancien site posait six déclarations hreflang par page — fr, es, en, zh,
   it, x-default. La migration les a perdues : le nouveau n'en avait aucune.

   Tant que le pied de page portait la liste des langues, un moteur pouvait
   encore deviner le lien par les liens visibles. Ce filet vient de tomber avec
   la liste : le sélecteur de la barre est un <details>, son contenu n'est pas
   une navigation entre pages équivalentes mais un contrôle. Sans hreflang,
   les cinq versions d'une même page deviennent cinq pages sans rapport, qui se
   font concurrence au lieu de se compléter.

   Une seule règle : chaque page déclare toutes les versions d'elle-même qui
   existent réellement sur le disque, plus x-default vers le français. Une
   version qui n'existe pas n'est pas déclarée — l'allemand entrera de
   lui-même, page par page, quand il sera écrit.

   Run: node outils/hreflang.js [--verifier]                                 */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var SITE = "https://stopera.art";
var LANGS = ["fr", "en", "es", "it", "zh", "de"];
var BALISE = { fr: "fr", en: "en", es: "es", it: "it", zh: "zh-Hans", de: "de" };
var VERIF = process.argv.indexOf("--verifier") > 0;

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var posees = 0, declarations = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  if (route) route += "/";

  var dispo = LANGS.filter(function (l) {
    return fs.existsSync(path.join(DOCS, l === "fr" ? "" : l, route, "index.html"));
  });

  var liens = dispo.map(function (l) {
    return '<link rel="alternate" hreflang="' + BALISE[l] + '" href="' + SITE + "/" +
      (l === "fr" ? "" : l + "/") + route + '" />';
  });
  liens.push('<link rel="alternate" hreflang="x-default" href="' + SITE + "/" + route + '" />');
  /* la page se dit aussi elle-même : une adresse canonique, une seule */
  liens.push('<link rel="canonical" href="' + SITE + "/" +
    (lang === "fr" ? "" : lang + "/") + route + '" />');

  var h = fs.readFileSync(f, "utf8"), avant = h;
  h = h.replace(/\s*<link rel="(?:alternate|canonical)"[^>]*>/g, "");
  var i = h.indexOf("</head>");
  if (i < 0) return;
  h = h.slice(0, i) + liens.join("\n") + "\n" + h.slice(i);
  if (h === avant) return;
  posees++; declarations += liens.length;
  if (!VERIF) fs.writeFileSync(f, h);
});

console.log((VERIF ? "à poser : " : "posé : ") + declarations +
  " déclaration(s) sur " + posees + " page(s)");
