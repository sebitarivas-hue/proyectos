/* LA SECTION DE LA PAGE, INSCRITE DANS LA PAGE.
   Une même classe ne joue pas le même rôle partout : sur une fiche d'œuvre,
   le chapeau EST la présentation — il se dit à l'échelle d'un titre ; sur la
   page « pourquoi », le même chapeau est de la prose et doit se lire comme
   telle. Sans savoir de quelle section relève la page, la feuille ne peut
   pas faire cette différence, et l'on finit par choisir la mauvaise pour
   l'une des deux.

   L'attribut data-section, posé sur <body> depuis la route, donne cette
   information une fois pour toutes. Il sert aussi à rapprocher les deux
   vocabulaires de balisage que le site porte : les fiches composées
   (.lead, .meta) et les fiches reprises du site (.pd-pitch, .pd-block)
   doivent se lire pareil, quelle que soit la langue.

   Run: node outils/section.js                                              */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["en", "es", "it", "zh"];

var REGLES = [
  [/^productions(\/|$)/, "productions"],
  [/^parcours(\/|$)/, "parcours"],
  [/^artists(\/|$)/, "artistes"],
  [/^news(\/|$)/, "actualites"],
  [/^presse(\/|$)/, "presse"],
  [/^recherche(\/|$)|^lips(\/|$)|^laboratoire(\/|$)/, "laboratoire"],
  [/^reseau(\/|$)|^cooperation(\/|$)/, "reseau"],
  [/^oeuvres(\/|$)/, "oeuvres"],
  [/^pourquoi(\/|$)/, "pourquoi"],
  [/^transmission(\/|$)/, "transmission"],
  [/^soutenir(\/|$)/, "soutenir"],
  [/^mentions-legales(\/|$)/, "mentions"],
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

var poses = 0, repartition = {};

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var route = LANGS.indexOf(rel.split("/")[0]) >= 0 ? rel.split("/").slice(1).join("/") : rel;

  var sec = "accueil";
  if (route) { sec = "autre"; for (var i = 0; i < REGLES.length; i++) if (REGLES[i][0].test(route)) { sec = REGLES[i][1]; break; } }

  var h = fs.readFileSync(f, "utf8");
  var avant = h;
  h = h.replace(/<body(\s[^>]*)?>/, function (m, attrs) {
    attrs = (attrs || "").replace(/\sdata-section="[^"]*"/, "");
    return "<body" + attrs + ' data-section="' + sec + '">';
  });
  if (h !== avant) { fs.writeFileSync(f, h); poses++; }
  repartition[sec] = (repartition[sec] || 0) + 1;
});

console.log("data-section posé sur " + poses + " page(s)");
Object.keys(repartition).sort().forEach(function (k) {
  console.log("  " + k.padEnd(14) + repartition[k]);
});
