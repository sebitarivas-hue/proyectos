/* LE RANG 04 N'A QU'UNE TÊTE : RÉSEAU.
   Le fil de retour disait trois choses différentes selon la page : quatre-
   vingt-cinq fiches d'artistes remontaient vers /artists/, cinq pages de
   coopération vers l'accueil, cinq fiches vers /reseau/. Un rang de la
   navigation doit mener à une seule page, sinon il n'est plus un rang.

   Tout ce qui relève du 04 remonte donc vers Réseau, dans sa langue. Et pour
   qu'aucune page ne devienne orpheline au passage, Réseau reçoit le lien vers
   l'index des artistes — c'est lui qui perdait son unique entrée.

   Le libellé n'est pas inventé : « réseau » et « artistes » sont les mots que
   le site emploie déjà dans son fil des rangs.

   Run: node outils/rang-04.js                                               */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];

var RESEAU = { fr: "Réseau", en: "Network", es: "Red", it: "Rete", zh: "网络" };
var ARTISTES = { fr: "Artistes", en: "Artists", es: "Artistas", it: "Artisti", zh: "艺术家" };

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function attrs(table) {
  return LANGS.map(l => ' data-' + l + '="' + table[l] + '"').join("");
}

var fils = 0, entrees = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var pre = lang === "fr" ? "/" : "/" + lang + "/";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");

  var h = fs.readFileSync(f, "utf8"), avant = h;
  if (h.indexOf('data-section="artistes"') < 0 && h.indexOf('data-section="reseau"') < 0) return;

  /* le fil de retour : une seule tête pour tout le rang */
  if (route !== "reseau") {
    var fil = '<p class="pd-eyebrow"><a href="' + pre + 'reseau/"' + attrs(RESEAU) + ">← " +
      RESEAU[lang] + "</a></p>";
    if (/<p class="pd-eyebrow">[\s\S]*?<\/p>/.test(h)) {
      h = h.replace(/<p class="pd-eyebrow">[\s\S]*?<\/p>/, fil);
    } else {
      h = h.replace(/(<div class="body">)/, "$1\n      " + fil);
    }
    if (h !== avant) fils++;
  }

  /* Réseau reprend l'entrée vers l'index des artistes, qui la perdait */
  if (route === "reseau" && h.indexOf(pre + 'artists/"') < 0) {
    var lien = '<p class="more-link"><a class="more" href="' + pre + 'artists/"' +
      attrs(ARTISTES) + ">" + ARTISTES[lang] + ' <span aria-hidden="true">→</span></a></p>';
    var i = h.indexOf('<footer class="foot">');
    var j = h.lastIndexOf("</div></div></section>", i);
    if (j > 0) { h = h.slice(0, j) + lien + h.slice(j); entrees++; }
  }

  if (h !== avant) fs.writeFileSync(f, h);
});

console.log("fil de retour ramené vers Réseau : " + fils + " page(s)");
console.log("entrée vers l'index des artistes posée sur Réseau : " + entrees + " page(s)");
