/* LE SÉLECTEUR DE LANGUE MONTE DANS LA BARRE.
   Il vivait au pied de page, à cinq écrans de défilement du haut sur une
   fiche d'œuvre. Il devient un bouton compact à droite du fil des rangs : le
   code de la langue courante, qui déplie la liste des six.

   Écrit en <details>/<summary> : le navigateur ouvre, ferme, gère le clavier
   et la touche d'échappement. Aucun JavaScript — donc rien qui puisse ne pas
   se charger.

   Le pied garde sa liste : elle sert de plan, et un lien de langue en fin de
   page reste utile à qui a tout lu.

   Run: node outils/selecteur.js [--verifier]                                */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

var LANGS = ["fr", "en", "es", "it", "zh", "de"];
var CODE = { fr: "FR", en: "EN", es: "ES", it: "IT", zh: "中文", de: "DE" };
var NOM = { fr: "Français", en: "English", es: "Español", it: "Italiano", zh: "中文", de: "Deutsch" };
/* « changer de langue », dit dans la langue de la page */
var TITRE = {
  fr: "Changer de langue", en: "Change language", es: "Cambiar de idioma",
  it: "Cambia lingua", zh: "切换语言", de: "Sprache wechseln"
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

var poses = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  if (route) route += "/";

  /* une langue n'est proposée que si la page existe dans cette langue */
  var dispo = LANGS.filter(function (l) {
    var p = path.join(DOCS, l === "fr" ? "" : l, route, "index.html");
    return fs.existsSync(p);
  });

  var liste = dispo.map(function (l) {
    if (l === lang) return '<span aria-current="true" lang="' + l + '">' + NOM[l] + "</span>";
    return '<a href="/' + (l === "fr" ? "" : l + "/") + route + '" lang="' + l + '">' + NOM[l] + "</a>";
  }).join("");

  var bloc = '<details class="lang"><summary aria-label="' + TITRE[lang] + '" title="' +
    TITRE[lang] + '">' + CODE[lang] + '</summary><div class="lang-liste">' + liste + "</div></details>";

  var h = fs.readFileSync(f, "utf8"), avant = h;
  h = h.replace(/<details class="lang">[\s\S]*?<\/details>/, "");
  /* il se pose après le rail, dans la barre — jamais dedans : le rail défile */
  var i = h.indexOf('<div class="nav-rail">');
  if (i < 0) return;
  var j = h.indexOf("</div>", i) + 6;
  h = h.slice(0, j) + bloc + h.slice(j);
  if (h === avant) return;
  poses++;
  if (!VERIF) fs.writeFileSync(f, h);
});

console.log((VERIF ? "à poser sur : " : "sélecteur posé sur : ") + poses + " page(s)");
