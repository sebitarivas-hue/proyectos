/* LE PIED DE PAGE, RECONSTRUIT EN ENTIER.
   Il ne suffit pas de réparer le sélecteur de langue : sur onze fiches de
   production, le pied portait DEUX listes de langues et une note égarée
   (« Couche transversale : la presse n'est pas une section numérotée »)
   venue d'une autre section. Réparer le premier bloc rencontré laissait
   l'autre en place — d'où deux « LANGUES » l'un sous l'autre.

   Un pied a une forme, et une seule. Il est donc réécrit entier : trois
   colonnes — la marque, l'adresse, les réseaux — et rien d'autre. Le choix de
   la langue est monté dans la barre ; le répéter ici l'enterrait.

   Run: node outils/pied.js [--verifier]                                     */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh", "de"];
var NOM = { fr: "Français", en: "English", es: "Español", it: "Italiano", zh: "中文", de: "Deutsch" };
var LAB = {
  fr: ["Langues", "Réseaux"], en: ["Languages", "Social"],
  es: ["Idiomas", "Redes"], it: ["Lingue", "Social"], zh: ["语言", "社交"], de: ["Sprachen", "Soziale Netzwerke"]
};
/* Les crédits du site — la ligne du bas. La page des mentions légales
   existait depuis toujours, et rien n'y menait : aucune page du site ne la
   liait. Une association loi 1901 doit pourtant les rendre accessibles. */
var MENTIONS = {
  fr: "Mentions légales &amp; confidentialité", en: "Legal notice &amp; privacy",
  es: "Aviso legal &amp; privacidad", it: "Note legali &amp; privacy",
  zh: "法律声明与隐私", de: "Impressum &amp; Datenschutz"
};
/* Le français met une espace insécable avant le deux-points ; l'allemand,
   l'anglais, l'espagnol et l'italien n'en mettent aucune ; le chinois a son
   propre signe, pleine chasse. */
var DEUXPOINTS = { fr: "\u00a0: ", en: ": ", es: ": ", it: ": ", zh: "：", de: ": " };
var TYPOS = {
  fr: "Typographies", en: "Typefaces", es: "Tipografías",
  it: "Caratteri", zh: "字体", de: "Schriften"
};
var ASSO = {
  fr: "association loi 1901", en: "non-profit association (French law of 1901)",
  es: "asociación sin ánimo de lucro (ley francesa de 1901)",
  it: "associazione senza scopo di lucro (legge francese del 1901)",
  zh: "非营利协会（法国 1901 年法）", de: "gemeinnütziger Verein (loi 1901)"
};
var ANNEE = "2026";
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

function pied(lang) {
  /* Le choix de la langue vit désormais dans la barre, en haut. Le répéter ici
     ne l'aidait pas : il l'enterrait à cinq écrans de là. Le pied garde ce qui
     lui appartient — la marque, l'adresse, les réseaux. */
  return '<footer class="foot"><div class="wrap">' +
    "<div><h2 translate=\"no\">Stopera!</h2></div>" +
    '<div><p class="small">Sonic Theatre Opera Performance</p>' +
    '<p style="margin-top:.7rem"><a href="mailto:info@stopera.art">info@stopera.art</a></p></div>' +
    '<div><p class="lab">' + LAB[lang][1] + "</p><ul>" +
    /* Les comptes du site, relevés sur l'ancien : ceux qui figuraient ici
       jusqu'ici — stopera.art — n'existaient nulle part et menaient dans le
       vide, sur les 300 pages. Facebook avait purement disparu. */
    '<li><a href="https://instagram.com/__stopera__">Instagram</a> · ' +
    '<a href="https://www.youtube.com/@stopera-sonictheatre">YouTube</a> · ' +
    '<a href="https://www.facebook.com/stopera.sonictheatre">Facebook</a></li></ul></div>' +
    /* Les crédits, sur toute la largeur : ce que la loi demande, et ce que la
       page doit à d'autres. Les typographies sont celles de la feuille de
       style, relevées sur elle et non sur une intention. */
    '<div class="foot-credits"><p class="small">' +
    "&copy; " + ANNEE + ' <span translate="no">STOPERA!</span> — Sonic Theatre Opera Performance, ' +
    ASSO[lang] + ". " +
    '<a href="' + (lang === "fr" ? "/" : "/" + lang + "/") + 'mentions-legales/">' +
    MENTIONS[lang] + "</a></p>" +
    '<p class="small">' + TYPOS[lang] + DEUXPOINTS[lang] + '<span translate="no">Neutrix</span>, ' +
    '<span translate="no">Bricolage Grotesque</span>, <span translate="no">Archivo</span>.</p></div>' +
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
