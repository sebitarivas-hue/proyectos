/* LE SÉLECTEUR DE LANGUE DU PIED.
   Il était cassé sur les 236 pages non françaises : les cinq liens menaient
   tous à la page courante. Depuis l'italien, « English » ramenait à l'italien.
   Le site était monolingue dès qu'on quittait le français.

   La cause : la règle qui ramène chaque lien dans la langue de sa page a été
   appliquée au sélecteur, dont le travail est précisément l'inverse. Ici il
   est reconstruit à partir de la route de la page — la seule information dont
   il a besoin — et ses deux intitulés sont dits dans la langue de la page.

   Run: node outils/pied.js                                                  */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var NOM = { fr: "Français", en: "English", es: "Español", it: "Italiano", zh: "中文" };
var LAB = {
  fr: ["Langues", "Réseaux"], en: ["Languages", "Social"],
  es: ["Idiomas", "Redes"], it: ["Lingue", "Social"], zh: ["语言", "社交"]
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

var repare = 0, labels = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  if (route) route += "/";

  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* la liste des langues, reconstruite : chaque lien mène à SA langue */
  var liste = LANGS.map(function (l) {
    if (l === lang) return '<span aria-current="true">' + NOM[l] + "</span>";
    return '<a href="/' + (l === "fr" ? "" : l + "/") + route + '">' + NOM[l] + "</a>";
  }).join(" · ");

  h = h.replace(/(<p class="lab"[^>]*>)[^<]*(<\/p><ul><li>)[\s\S]*?(<\/li><\/ul>)/,
    "$1" + LAB[lang][0] + "$2" + liste + "$3");

  /* et l'intitulé des réseaux, dans la langue de la page */
  h = h.replace(/(<p class="lab" style="margin-top:1rem">)[^<]*(<\/p>)/,
    "$1" + LAB[lang][1] + "$2");

  if (h !== avant) { fs.writeFileSync(f, h); repare++; if (lang !== "fr") labels++; }
});

console.log("sélecteur de langue refait sur " + repare + " page(s) ; " +
  labels + " dans une langue autre que le français");
