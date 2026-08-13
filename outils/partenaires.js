/* LES LOGOS DES PARTENAIRES, QUAND ILS ARRIVENT.
   Le site n'en portait aucun : tous les partenaires — CETC, GRAME, Opéra de
   Lyon, Radio France, Les Métaboles, Cie Trilobite — étaient nommés en texte,
   sur une seule ligne, sous « Partenariats & territoire ». Une coproduction
   ne se montre pas comme une mention de bas de page.

   Cet outil ne dessine rien. Il regarde ce qu'il y a dans
   docs/assets/partners/ et pose chaque logo à côté du nom qu'il porte déjà.
   Tant que le dossier est vide, il ne touche à rien et le dit.

   Un logo est la marque d'autrui : il n'est ni redessiné, ni recoloré, ni
   détouré. Il est posé tel qu'il a été fourni, à hauteur constante, avec sa
   zone de protection. Le nom reste en texte à côté — pour les lecteurs
   d'écran, pour les moteurs, et pour le jour où le fichier changerait.

   NOMMAGE — le fichier prend le nom qui figure dans la fiche, réduit :
     CETC — Teatro Colón (Buenos Aires) → cetc.svg
     GRAME — CNCM (Lyon)               → grame.svg
     Opéra de Lyon                      → opera-de-lyon.svg
   Formats acceptés : .svg de préférence, sinon .png à fond transparent.

   Run: node outils/partenaires.js [--verifier]                              */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var DOSSIER = path.join(DOCS, "assets", "partners");
var VERIF = process.argv.indexOf("--verifier") > 0;

/* le nom écrit dans la fiche → le fichier attendu */
var CLES = {
  "CETC — Teatro Colón (Buenos Aires)": "cetc",
  "GRAME — CNCM (Lyon)": "grame",
  "GRAME": "grame",
  "Opéra de Lyon": "opera-de-lyon",
  "Théâtre de la Croix-Rousse": "croix-rousse",
  "Les Métaboles": "les-metaboles",
  "Cie Trilobite": "cie-trilobite",
  "Printemps des Arts de Monte-Carlo": "printemps-des-arts",
  "Radio France — France Musique (Création Mondiale)": "radio-france"
};

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function attr(s) { return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

/* ce qui est réellement là */
var DISPO = {};
if (fs.existsSync(DOSSIER)) {
  fs.readdirSync(DOSSIER).forEach(function (f) {
    var m = f.match(/^(.+)\.(svg|png)$/i);
    if (m) DISPO[m[1]] = f;
  });
}
var noms = Object.keys(DISPO);
if (!noms.length) {
  console.log("aucun logo dans docs/assets/partners/ — rien n'est posé.");
  console.log("  attendus, d'après les fiches : " +
    [...new Set(Object.values(CLES))].sort().join(", "));
  process.exit(0);
}

var posés = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;

  Object.keys(CLES).forEach(function (nom) {
    var fichier = DISPO[CLES[nom]];
    if (!fichier) return;
    /* on n'habille que le lien qui porte exactement ce nom, et une seule fois */
    var re = new RegExp('(<li>(?:(?!</li>)[\\s\\S])*?)>' + attr(nom)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "</a>", "g");
    h = h.replace(re, function (m, debut) {
      if (m.indexOf("logo-partenaire") >= 0) return m;
      posés++;
      return debut + '><img class="logo-partenaire" src="/assets/partners/' + fichier +
        '" alt="" aria-hidden="true" />' + attr(nom) + "</a>";
    });
  });

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("logos de partenaires : " + posés + " posé(s) sur " + touchées + " page(s)");
console.log("  fichiers trouvés : " + noms.sort().join(", "));
