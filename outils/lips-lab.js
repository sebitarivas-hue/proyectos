/* LE NOM DU LABORATOIRE.
   Deux formes coexistaient sur le site :

     · « Laboratoire LIPS » — 10 occurrences, uniquement le titre de la
       section 03 de l'accueil et le texte alternatif de son image. Il restait
       en français dans les cinq langues : c'est la coquille signalée.
     · « LIPS Lab » — 180 occurrences, partout ailleurs, identique dans les
       cinq langues : c'est déjà le nom propre de l'œuvre.

   La direction artistique l'écrit « Lips Lab (prototypes) ». Cette règle
   applique donc deux choses distinctes :

     · là où il était en français, le nom complet — « Lips Lab (prototypes) » ;
     · partout ailleurs, la seule casse — « LIPS Lab » devient « Lips Lab ».

   Le complément « (prototypes) » n'est PAS ajouté aux 180 mentions courantes :
   répété dans chaque phrase, il alourdirait le texte au lieu de le nommer.
   Si la direction artistique le veut partout, une option le fait.

   Run: node outils/lips-lab.js [--partout] [--verifier]                     */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var PARTOUT = process.argv.indexOf("--partout") > 0;
var VERIF = process.argv.indexOf("--verifier") > 0;

var COMPLET = "Lips Lab (prototypes)";
var COURT = "Lips Lab";

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var complets = 0, casses = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* la forme restée en français prend le nom complet */
  h = h.replace(/Laboratoire LIPS/g, function () { complets++; return COMPLET; });

  /* ailleurs : la casse du nom, et le complément seulement si on le demande */
  h = h.replace(/\bLIPS Lab\b/g, function () {
    casses++; return PARTOUT ? COMPLET : COURT;
  });

  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log((VERIF ? "à corriger : " : "corrigé : ") + complets +
  " occurrence(s) au nom complet, " + casses + " à la casse" +
  (PARTOUT ? " et au nom complet" : "") + ", sur " + touchees + " page(s)");
