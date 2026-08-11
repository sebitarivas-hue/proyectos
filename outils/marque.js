/* LA MARQUE — QUATRE PROPOSITIONS, DESSINÉES DANS LA LANGUE DU SITE.
   Le logotype de la barre est celui d'avant : un mot en capitales grasses à
   filet intérieur, qui ne partage rien avec la direction artistique — ni la
   géométrie large de Neutrix, ni le trait fin des numéros de rang, ni les six
   couleurs. Il était de surcroît servi en PNG, donc flou et intraduisible.

   Quatre marques, toutes tirées du vocabulaire de la feuille de style. Une
   première série de formes primitives a été écartée — « c'est trop simple ».
   Celles-ci sont construites : arcs, épaisseurs et couleurs viennent du site.

   Rien n'est posé sur le site tant que le choix n'est pas fait.

   Run: node outils/marque.js [<dossier de sortie>]                          */
"use strict";
var fs = require("fs"), path = require("path");
var SORTIE = process.argv[2] || path.resolve(__dirname, "..", "marques");

var INK = "#0A0A0C", MAG = "#FF0080", PAPER = "#F2EDE4";
/* les six rangs, dans l'ordre : pourquoi, œuvres, transmettre, réseau, labo, soutenir */
var RANGS = ["#E0230F", "#FF0080", "#00A9BC", "#1F1BD8", "#00A050", "#0A0A0C"];
var RANGS_SOMBRE = ["#E0230F", "#FF0080", "#00A9BC", "#4B48F0", "#00C060", "#F2EDE4"];

/* Une lentille : deux arcs de cercle qui se rejoignent en pointe. C'est la
   bouche ouverte, et c'est aussi le O que Neutrix dessine large et bas. */
function lentille(cx, cy, a, b) {
  var r = (a * a + b * b) / (2 * b);
  return "M " + (cx - a) + " " + cy +
    " A " + r + " " + r + " 0 0 1 " + (cx + a) + " " + cy +
    " A " + r + " " + r + " 0 0 1 " + (cx - a) + " " + cy + " Z";
}

var M = {};

/* F — LA MAISON QUI CHANTE.
   En français comme en allemand, un opéra est une maison — Opernhaus. Celle-ci
   a une bouche pour fenêtre. Le trait est celui des grands numéros de rang. */
M["maison-chante"] = function (ink, acc) {
  return '<path d="M8 44 L50 9 L92 44" fill="none" stroke="' + ink +
      '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M17 42 L17 90 L83 90 L83 42" fill="none" stroke="' + ink +
      '" stroke-width="7" stroke-linejoin="round"/>' +
    '<path d="' + lentille(50, 64, 25, 13) + '" fill="' + acc + '"/>' +
    '<path d="' + lentille(50, 64, 25, 13) + '" fill="none" stroke="' + ink +
      '" stroke-width="4"/>';
};

/* G — LA BOUCHE À VOIX MULTIPLES.
   La bouche ouverte, et la voix qui en sort par lentilles successives. Cinq
   passages, cinq couleurs de rang : le son traverse toutes les sections. */
M["bouche-voix"] = function (ink, acc, cols) {
  var o = "";
  for (var i = 5; i >= 2; i--) {
    o += '<path d="' + lentille(50, 50, 9 + i * 7.6, 4 + i * 3.9) +
      '" fill="none" stroke="' + cols[i - 1] + '" stroke-width="4.6"/>';
  }
  return o + '<path d="' + lentille(50, 50, 16.6, 7.9) + '" fill="' + acc + '"/>';
};

/* H — L'O SUSPENDU.
   Le O de l'opéra, coupé en deux moitiés qui ont glissé l'une par rapport à
   l'autre. « Le STOP n'est pas un refus de l'opéra : c'est une suspension. » */
M["o-suspendu"] = function (ink, acc) {
  return '<path d="M50 14 A36 36 0 0 0 50 86" fill="none" stroke="' + ink +
      '" stroke-width="8" transform="translate(-4,7)"/>' +
    '<path d="M50 14 A36 36 0 0 1 50 86" fill="none" stroke="' + ink +
      '" stroke-width="8" transform="translate(4,-7)"/>' +
    '<path d="' + lentille(50, 50, 15, 7) + '" fill="' + acc + '"/>';
};

/* I — LA SCÈNE.
   La salle vue de dessus : six rangs concentriques ouverts vers le plateau,
   qui est la bouche. Les six couleurs des six sections du site. */
M["scene"] = function (ink, acc, cols) {
  var o = "";
  for (var i = 0; i < 6; i++) {
    var r = 16 + i * 11;
    o += '<path d="M ' + (50 - r * 0.94) + " " + (74 - r * 0.34) +
      " A " + r + " " + r + " 0 0 1 " + (50 + r * 0.94) + " " + (74 - r * 0.34) +
      '" fill="none" stroke="' + cols[i] + '" stroke-width="5.4"/>';
  }
  return o + '<path d="' + lentille(50, 76, 17, 7.5) + '" fill="' + acc + '"/>';
};

function svg(nom, fond, ink, acc, cols) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ' +
    'width="100" height="100" role="img" aria-label="STOPERA!">' +
    (fond ? '<rect width="100" height="100" fill="' + fond + '"/>' : "") +
    M[nom](ink, acc, cols) + "</svg>";
}

fs.mkdirSync(SORTIE, { recursive: true });
Object.keys(M).forEach(function (n) {
  fs.writeFileSync(path.join(SORTIE, n + "-clair.svg"), svg(n, PAPER, INK, MAG, RANGS));
  fs.writeFileSync(path.join(SORTIE, n + "-sombre.svg"), svg(n, INK, PAPER, MAG, RANGS_SOMBRE));
  /* la version à poser sur le site : sans fond, elle prend celui de la page */
  fs.writeFileSync(path.join(SORTIE, n + ".svg"), svg(n, null, INK, MAG, RANGS));
});
console.log("marques écrites dans " + SORTIE + " : " + Object.keys(M).join(", "));
