/* LE FIL DES RANGS, IDENTIQUE SUR TOUTES LES PAGES.
   Sur l'index des artistes, le rang 04 pointait vers /artists/ — vers la page
   elle-même — au lieu de Réseau. Vestige du temps où cet index était la tête
   du rang. Une seule page sur trois cents, et pourtant : un rang qui change de
   destination selon l'endroit d'où on le regarde n'est plus un rang.

   Plutôt que corriger cette page, cette règle réécrit le fil sur toutes :
   six liens, six destinations fixes, et la marque du rang courant déduite de
   data-section — jamais de l'adresse de la page.

   Le libellé de la marque et l'ordre des couleurs viennent du site.

   Run: node outils/nav.js [--verifier]                                      */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var VERIF = process.argv.indexOf("--verifier") > 0;

var SLUG = ["pourquoi", "oeuvres", "transmission", "reseau", "laboratoire", "soutenir"];
var NUM = ["01", "02", "03", "04", "05", "06"];
var COL = ["var(--red)", "var(--mag)", "var(--cy)", "var(--blu)", "var(--grn)", "var(--ink)"];
var L = {
  fr: ["pourquoi", "œuvres", "transmission", "réseau", "lips lab", "soutenir"],
  en: ["why", "works", "transmission", "network", "lips lab", "support"],
  es: ["por qué", "obras", "transmisión", "red", "lips lab", "apoyar"],
  it: ["perché", "opere", "trasmissione", "rete", "lips lab", "sostenere"],
  zh: ["为何", "作品", "传承", "网络", "lips lab", "支持"]
};
/* la section d'une page dit son rang ; l'adresse ne le dit pas */
var RANG = {
  pourquoi: 0,
  oeuvres: 1, productions: 1, parcours: 1,
  transmission: 2,
  reseau: 3, artistes: 3,
  laboratoire: 4,
  soutenir: 5
  /* accueil, actualités, presse, mentions : couches transversales, sans rang */
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

var refaits = 0, corriges = [];

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var pre = lang === "fr" ? "/" : "/" + lang + "/";

  var h = fs.readFileSync(f, "utf8");
  var sec = (h.match(/<body[^>]*data-section="([^"]*)"/) || [, ""])[1];
  var courant = RANG.hasOwnProperty(sec) ? RANG[sec] : -1;

  var rail = SLUG.map(function (s, i) {
    return '<a class="n" href="' + pre + s + '/"' +
      (i === courant ? ' aria-current="page"' : "") +
      ' style="--sec:' + COL[i] + '"><i>' + NUM[i] + "</i>" + L[lang][i] + "</a>";
  }).join("");

  var i = h.indexOf('<div class="nav-rail">');
  if (i < 0) return;
  var j = h.indexOf("</div>", i);
  var avant = h.slice(i + 22, j);
  if (avant === rail) return;

  /* on note ce qui pointait ailleurs que vers la tête de son rang */
  SLUG.forEach(function (s, k) {
    var re = new RegExp('<a class="n" href="([^"]+)"[^>]*><i>' + NUM[k] + "</i>");
    var m = re.exec(avant);
    if (m && m[1] !== pre + s + "/") corriges.push(rel + " : " + NUM[k] + " → " + m[1]);
  });

  refaits++;
  if (!VERIF) fs.writeFileSync(f, h.slice(0, i + 22) + rail + h.slice(j));
});

console.log((VERIF ? "fil à réécrire sur : " : "fil des rangs réécrit sur : ") + refaits + " page(s)");
corriges.slice(0, 12).forEach(function (x) { console.log("   destination fautive — " + x); });
