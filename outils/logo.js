/* LA MARQUE REMPLACE L'ANCIEN LOGOTYPE.
   La barre portait un mot en capitales grasses à filet intérieur, servi en
   PNG : rien de la direction artistique — ni la géométrie large de Neutrix,
   ni le trait des numéros de rang, ni les six couleurs — et flou sur les
   écrans denses.

   À sa place, l'O suspendu : le O de l'opéra coupé en deux moitiés qui ont
   glissé l'une contre l'autre, une bouche magenta au centre. C'est le récit
   déjà écrit sur la page Pourquoi — « le STOP n'est pas un refus de l'opéra :
   c'est une suspension ». Choisi le 11/08/2026, seul, sans le mot.

   Les proportions ont été réglées à l'essai, aux tailles où la marque vit
   vraiment : décalage 6, trait 11, bouche 18×8,5. Au-delà de 8 de décalage
   l'anneau s'ouvre trop et cesse de se lire comme un O sous 20 px.

   Le tracé est posé en SVG dans la page — pas en image : il est net à toute
   taille, il pèse trois cents octets, et l'anneau prend currentColor, donc la
   couleur de la barre où qu'elle aille. Seule la bouche est fixe.

   Run: node outils/logo.js [--verifier]                                     */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var MAG = "#FF0080";

/* la bouche : deux arcs qui se rejoignent en pointe. r se déduit de la demi-
   largeur et de la demi-hauteur — c'est un arc de cercle, pas une courbe de
   Bézier : la pointe reste franche à toute échelle. */
function bouche(cx, cy, a, b) {
  var r = Math.round(((a * a + b * b) / (2 * b)) * 100) / 100;
  return "M" + (cx - a) + " " + cy + "A" + r + " " + r + " 0 0 1 " + (cx + a) + " " + cy +
    "A" + r + " " + r + " 0 0 1 " + (cx - a) + " " + cy + "Z";
}

function tracé(couleur) {
  return '<path d="M50 14A36 36 0 0 0 50 86" fill="none" stroke="' + couleur +
      '" stroke-width="11" transform="translate(-4,6)"/>' +
    '<path d="M50 14A36 36 0 0 1 50 86" fill="none" stroke="' + couleur +
      '" stroke-width="11" transform="translate(4,-6)"/>' +
    '<path d="' + bouche(50, 50, 18, 8.5) + '" fill="' + MAG + '"/>';
}

/* dans la page : l'anneau suit la couleur du texte, la bouche ne bouge pas */
var MARQUE = '<svg class="marque" viewBox="0 0 100 100" width="26" height="26" ' +
  'aria-hidden="true" focusable="false">' + tracé("currentColor") + "</svg>";

/* le fichier autonome : pour l'onglet, les partages, les dossiers */
var FICHIER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ' +
  'width="100" height="100" role="img" aria-label="STOPERA!">' +
  '<rect width="100" height="100" fill="#F2EDE4"/>' + tracé("#0A0A0C") + "</svg>";

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html" || e.name === "404.html") a.push(p);
  });
  return a;
}

var posées = 0, icônes = 0, touchées = 0;

if (!VERIF) fs.writeFileSync(path.join(DOCS, "assets", "marque.svg"), FICHIER + "\n");

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* l'ancien logotype cède la place, le lien et son libellé restent */
  h = h.replace(/(<a class="brand"[^>]*>)\s*<img[^>]*>\s*(<\/a>)/g,
    function (m, ouvre, ferme) { posées++; return ouvre + MARQUE + ferme; });

  /* l'onglet : le SVG d'abord, le PNG en secours pour les navigateurs anciens */
  if (h.indexOf('href="/assets/marque.svg"') < 0)
  h = h.replace(/<link rel="icon" type="image\/png" href="\/assets\/favicon\.png" \/>/,
    function () {
      icônes++;
      return '<link rel="icon" type="image/svg+xml" href="/assets/marque.svg" />\n' +
        '<link rel="icon" type="image/png" href="/assets/favicon.png" />';
    });

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("marque posée : " + posées + " barres, " + icônes + " onglets — " +
  touchées + " page(s)");
