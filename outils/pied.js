/* LE PIED DE PAGE, RECONSTRUIT EN ENTIER.
   Il ne suffit pas de réparer le sélecteur de langue : sur onze fiches de
   production, le pied portait DEUX listes de langues et une note égarée
   (« Couche transversale : la presse n'est pas une section numérotée »)
   venue d'une autre section. Réparer le premier bloc rencontré laissait
   l'autre en place — d'où deux « LANGUES » l'un sous l'autre.

   Un pied a une forme, et une seule. Il est donc réécrit entier, à partir de
   la route de la page : trois colonnes, un sélecteur, et rien d'autre.
   Chaque langue mène à LA MÊME page, et les intitulés se disent dans la
   langue de la page.

   Run: node outils/pied.js [--verifier]                                     */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var NOM = { fr: "Français", en: "English", es: "Español", it: "Italiano", zh: "中文" };
var LAB = {
  fr: ["Langues", "Réseaux"], en: ["Languages", "Social"],
  es: ["Idiomas", "Redes"], it: ["Lingue", "Social"], zh: ["语言", "社交"]
};
var VERIF = process.argv.indexOf("--verifier") > 0;

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

function pied(lang, route) {
  var liste = LANGS.map(function (l) {
    if (l === lang) return '<span aria-current="true">' + NOM[l] + "</span>";
    return '<a href="/' + (l === "fr" ? "" : l + "/") + route + '">' + NOM[l] + "</a>";
  }).join(" · ");
  return '<footer class="foot"><div class="wrap">' +
    "<div><h2>stopera!</h2></div>" +
    '<div><p class="small">Sonic Theatre Opera Performance — Gentilly (Paris)</p>' +
    '<p style="margin-top:.7rem"><a href="mailto:info@stopera.art">info@stopera.art</a></p></div>' +
    '<div><p class="lab">' + LAB[lang][0] + "</p><ul><li>" + liste + "</li></ul>" +
    '<p class="lab" style="margin-top:1rem">' + LAB[lang][1] + "</p><ul>" +
    /* Les comptes du site, relevés sur l'ancien : ceux qui figuraient ici
       jusqu'ici — stopera.art — n'existaient nulle part et menaient dans le
       vide, sur les 300 pages. Facebook avait purement disparu. */
    '<li><a href="https://instagram.com/stopera_sonic_theatre">Instagram</a> · ' +
    '<a href="https://www.youtube.com/@stopera-sonictheatre">YouTube</a> · ' +
    '<a href="https://www.facebook.com/stopera.sonictheatre">Facebook</a></li></ul></div>' +
    "</div></footer>";
}

var refaits = 0, doubles = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  if (route) route += "/";

  var h = fs.readFileSync(f, "utf8");
  var i = h.indexOf('<footer class="foot">');
  if (i < 0) return;
  var j = h.indexOf("</footer>", i) + 9;
  var avant = h.slice(i, j), apres = pied(lang, route);
  if (avant === apres) return;

  if ((avant.match(/class="lab"/g) || []).length > 2) doubles++;
  refaits++;
  if (!VERIF) fs.writeFileSync(f, h.slice(0, i) + apres + h.slice(j));
});

console.log((VERIF ? "à refaire : " : "pieds refaits : ") + refaits +
  " page(s), dont " + doubles + " qui portaient deux sélecteurs");
