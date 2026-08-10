/* « GENTILLY » — RETIRÉ DE CE QUI SE PRÉSENTE, GARDÉ LÀ OÙ IL S'IMPOSE.
   La direction artistique le dit : ce n'est pas le terrain de jeu de la
   compagnie, et le site n'a pas à s'y ancrer.

   Le mot occupe pourtant quatre rôles très différents. Cette règle ne touche
   que les deux premiers :

     · le pied de page — « Sonic Theatre Opera Performance — Gentilly (Paris) »
       sur les 300 pages. C'est moi qui l'y avais mis ; il s'en va.
     · les phrases de présentation — « Ancrée à Gentilly et active de Lyon à
       Buenos Aires… », « Depuis Gentilly, STOPERA! développe… ». La localité
       est retirée par simple suppression : la phrase reprend à son sujet,
       rien n'est réécrit ni inventé.

   Ce qui reste, et pourquoi :

     · les MENTIONS LÉGALES. Une association loi 1901 qui édite un site doit
       publier le siège de son association. Le retirer ne serait pas une
       décision éditoriale, ce serait un défaut légal.
     · les NOMS DE PARTENAIRES — Ville de Gentilly, Le Générateur — Gentilly,
       Lavoir Numérique — Gentilly. Ce sont des institutions réelles ; les
       effacer reviendrait à retirer des partenaires.

   Run: node outils/gentilly.js [--verifier]                                 */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

/* les amorces de phrase, dans les cinq langues, retirées telles quelles */
var AMORCES = [
  /Ancrée à Gentilly et active de Lyon à Buenos Aires,\s*/g,
  /Rooted in Gentilly and active from Lyon to Buenos Aires,\s*/g,
  /Arraigada en Gentilly y activa de Lyon a Buenos Aires,\s*/g,
  /Radicata a Gentilly e attiva da Lione a Buenos Aires,\s*/g,
  /STOPERA! 扎根于让蒂伊，活动范围从里昂延伸至布宜诺斯艾利斯：/g,
  /Depuis Gentilly,\s*/g,
  /From Gentilly,\s*/g,
  /Desde Gentilly,\s*/g,
  /Da Gentilly,\s*/g,
  /从让蒂伊出发，/g
];

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var pieds = 0, phrases = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var legale = /mentions-legales/.test(f);
  var h = fs.readFileSync(f, "utf8"), avant = h, n = 0;

  /* le pied : la mention du lieu s'en va, la raison sociale reste */
  h = h.replace(/Sonic Theatre Opera Performance — Gentilly \(Paris\)/g, function () {
    n++; pieds++; return "Sonic Theatre Opera Performance";
  });

  /* les phrases de présentation — jamais dans les mentions légales */
  if (!legale) {
    AMORCES.forEach(function (re) {
      h = h.replace(re, function (m) {
        /* une phrase qui perd son amorce reprend par une capitale */
        n++; phrases++; return /[：:]$/.test(m.trim()) ? "STOPERA! " : "";
      });
    });
  }

  if (n) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
  void avant;
});

console.log((VERIF ? "à retirer : " : "retiré : ") + pieds + " mention(s) de pied et " +
  phrases + " amorce(s) de phrase, sur " + touchees + " page(s)");
