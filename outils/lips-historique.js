/* L'HISTORIQUE DES ÉDITIONS DU LIPS, EN CLAIR.
   Les trois éditions passées tenaient sur une ligne de la liste
   « Informations », en petit corps, sans dates et à l'envers. Elles sont
   l'histoire du laboratoire : elles méritent leur bloc.

   Quatre lignes — l'année, le lieu qui a accueilli. Rien d'autre : les
   thèmes, les effectifs et les artistes de chaque édition ne sont pas
   documentés ici, et une histoire ne s'invente pas. La ligne de la liste
   « Informations » est retirée du même geste : elle disait la même chose.

   Les années et les noms de lieux ne se traduisent pas ; seuls l'intitulé du
   bloc et la mention « prochaine édition » portent la mémoire des six langues.

   Run: node outils/lips-historique.js [--verifier]                          */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

var TITRE = {
  fr: "Éditions", en: "Editions", es: "Ediciones",
  it: "Edizioni", zh: "历届", de: "Ausgaben"
};
var PROCHAINE = {
  fr: "prochaine édition", en: "next edition", es: "próxima edición",
  it: "prossima edizione", zh: "下一届", de: "nächste Ausgabe"
};
var EDITIONS = [
  ["2017", "UNSAM — Buenos Aires"],
  ["2020", "GRAME — CNCM, Lyon"],
  ["2023", "Pôle Pixel — Villeurbanne"],
  ["2028", null]                       /* à venir : le lieu n'est pas arrêté */
];

function memoire(table) {
  return LANGS.map(function (l) { return ' data-' + l + '="' + table[l] + '"'; }).join("");
}

function bloc(lang) {
  return '<div class="pd-block"><h4' + memoire(TITRE) + ">" + TITRE[lang] + "</h4>" +
    '<ul class="facts">' +
    EDITIONS.map(function (e) {
      var v = e[1] === null
        ? '<span class="v"' + memoire(PROCHAINE) + ">" + PROCHAINE[lang] + "</span>"
        : '<span class="v">' + e[1] + "</span>";
      return '<li><span class="k">' + e[0] + "</span>" + v + "</li>";
    }).join("") +
    "</ul></div>";
}

/* la ligne qui disait la même chose, en plus petit et sans dates */
var LIGNE = /<li><span class="k" data-fr="Éditions précédentes"[\s\S]*?<\/li>/;

var poses = 0, retirees = 0;

LANGS.forEach(function (l) {
  var f = path.join(DOCS, l === "fr" ? "" : l, "lips", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;

  if (h.indexOf('<h4 data-fr="Éditions"') >= 0) return;      /* déjà posé */

  h = h.replace(LIGNE, function () { retirees++; return ""; });

  /* le bloc s'insère juste avant le générique — après les informations */
  var i = h.indexOf('<div class="pd-block"><h4 data-fr="Générique"');
  if (i < 0) i = h.search(/<div class="pd-block">\s*\n?<h4 data-fr="Générique"/);
  if (i < 0) { console.log("  bloc Générique introuvable : " + f); return; }
  h = h.slice(0, i) + bloc(l) + h.slice(i);
  poses++;

  if (h !== avant && !VERIF) fs.writeFileSync(f, h);
});

console.log("historique LIPS : " + poses + " bloc(s) posé(s), " + retirees + " ligne(s) retirée(s)");
