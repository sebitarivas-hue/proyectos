"use strict";
/* LE 00 DANS LE FIL DES RANGS — 12/09/2026.
 *
 * Le rail de navigation commençait à 01. On y ajoute le rang 00, qui
 * ramène à l'accueil, avant tous les autres. La marque So! y menait déjà,
 * mais un logo n'est pas une entrée de menu : rien ne disait que l'accueil
 * portait lui aussi un rang dans la suite 00 à 06.
 *
 * La couleur : l'encre. Les six couleurs vives sont prises par les six
 * chapitres, et l'accueil n'est pas un chapitre de plus, c'est le point
 * d'où ils partent.
 *
 * Sur la page d'accueil elle-même, l'entrée porte aria-current="page",
 * comme le fait déjà chaque section pour la sienne.
 *
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];
var CODE = { "": "fr", en: "en", es: "es", it: "it", zh: "zh", de: "de" };

var MOT = {
  fr: "accueil", en: "home", es: "inicio",
  it: "home", zh: "首页", de: "start"
};
var ORDRE = ["fr", "es", "it", "zh", "en", "de"];

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

/* La langue d'une page se lit sur son chemin : /en/… , /de/… , sinon le
   français à la racine. */
function langueDe(f) {
  var rel = path.relative(DOCS, f).split(path.sep);
  return LANGUES.indexOf(rel[0]) > 0 ? rel[0] : "";
}

var posees = 0, courantes = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;
  var i = h.indexOf('<div class="nav-rail">');
  if (i < 0) return;
  if (h.indexOf('><i>00</i>', i) >= 0) return;            // déjà posée

  var lg = langueDe(f);
  var code = CODE[lg];
  var accueil = lg ? "/" + lg + "/" : "/";

  /* la page d'accueil de cette langue est la seule à marquer l'entrée */
  var estAccueil = path.relative(DOCS, f) === path.join(lg, "index.html")
                || (lg === "" && path.relative(DOCS, f) === "index.html");

  var attrs = ORDRE.map(function (c) {
    return 'data-' + c + '="' + MOT[c] + '"';
  }).join(" ");

  var lien = '<a class="n" href="' + accueil + '"' +
    (estAccueil ? ' aria-current="page"' : "") +
    ' style="--sec:var(--ink)"><i>00</i><span ' + attrs + '>' + MOT[code] + "</span></a>";

  var fin = i + '<div class="nav-rail">'.length;
  h = h.slice(0, fin) + lien + h.slice(fin);

  fs.writeFileSync(f, h);
  posees++;
  if (estAccueil) courantes++;
});

console.log("entrée 00 posée sur " + posees + " page(s), marquée courante sur " + courantes);
