"use strict";
/* Raccorde Espaces bruts au reste du site :
 *   1. une carte à la fin de l'index des œuvres, avant le Lips Lab qui
 *      n'est pas une production ;
 *   2. un bloc « Productions liées » sur la fiche de Dmitri Kourliandski,
 *      qui n'en avait pas puisque aucune œuvre ne lui était rattachée.
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];
var CODE = { "": "fr", en: "en", es: "es", it: "it", zh: "zh", de: "de" };
var ORDRE = ["fr", "es", "it", "zh", "en", "de"];
var SLUG = "espaces-bruts";
var TITRE = "Espaces bruts. Re-inhabitation";

function A(d) {
  return ORDRE.map(function (c) {
    return 'data-' + c + '="' + String(d[c]).replace(/"/g, "&quot;") + '"';
  }).join(" ");
}

var SOUS = {
  fr: "Installation performative pour six espaces, de Dmitri Kourliandski.",
  en: "A performance installation for six spaces, by Dmitri Kourliandski.",
  es: "Instalación performativa para seis espacios, de Dmitri Kourliandski.",
  it: "Installazione performativa per sei spazi, di Dmitri Kourliandski.",
  zh: "Dmitri Kourliandski 的六空间表演性装置。",
  de: "Performative Installation für sechs Räume, von Dmitri Kourliandski."
};
var ALT = { fr: "Les six espaces", en: "The six spaces", es: "Los seis espacios", it: "I sei spazi", zh: "六个空间", de: "Die sechs Räume" };
var LIEES = { fr: "Productions liées", es: "Producciones vinculadas", en: "Related productions", it: "Produzioni collegate", zh: "相关作品", de: "Verwandte Produktionen" };

var titreDict = {}; ORDRE.forEach(function (c) { titreDict[c] = TITRE; });

var cartes = 0, blocs = 0;

/* ── 1. index des œuvres ── */
LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "oeuvres", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf("productions/" + SLUG + "/") >= 0) return;

  var p = lg ? "/" + lg : "";
  var ancre = h.indexOf('<article class="oeu oeu--c"><a href="' + p + '/lips/"');
  if (ancre < 0) { console.log("  " + f + " : le Lips Lab n'a pas été trouvé, carte non posée"); return; }

  var carte = '<article class="oeu oeu--b"><a href="' + p + '/productions/' + SLUG + '/">' +
    '<figure class="oeu-img"><img class="im-oeuvres   " src="/assets/projects/' + SLUG + '-carte.jpg" alt="' + TITRE + '" loading="lazy" /></figure>' +
    '<div class="oeu-txt">' +
    '<h2 class="oeu-t" ' + A(titreDict) + ' translate="no">' + TITRE + '</h2>' +
    '<span class="oeu-y">2027</span>' +
    '<p class="oeu-s" ' + A(SOUS) + '>' + SOUS[CODE[lg]] + '</p>' +
    '</div></a></article>';

  fs.writeFileSync(f, h.slice(0, ancre) + carte + h.slice(ancre));
  cartes++;
});

/* ── 2. fiche artiste ── */
LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "artists", "dmitri-kourliandski", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf("productions/" + SLUG + "/") >= 0) return;

  var i = h.indexOf("</div></div></section>");
  if (i < 0) { console.log("  " + f + " : fin de corps introuvable"); return; }

  var bloc = '<div class="pd-grid"><div class="pd-block pd-full">' +
    "<h4 " + A(LIEES) + ">" + LIEES[CODE[lg]] + "</h4>" +
    '<ul class="taglist"><li><a href="../../productions/' + SLUG + '/" ' + A(titreDict) + ' translate="no">' + TITRE + "</a></li></ul>" +
    "</div></div>";

  fs.writeFileSync(f, h.slice(0, i) + bloc + h.slice(i));
  blocs++;
});

console.log("carte posée sur " + cartes + " index d'œuvres, bloc « Productions liées » sur " + blocs + " fiche(s) artiste");
