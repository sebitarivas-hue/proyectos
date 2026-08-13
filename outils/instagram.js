/* LE LIEN INSTAGRAM POINTAIT VERS UN COMPTE QUI N'EST PLUS.
   Confirmé par la direction artistique le 12/08/2026 : le compte est
   __stopera__. Le pied de page menait à stopera_sonic_theatre sur les 360
   pages.

   Ce n'est pas une régression récente : cette adresse figurait déjà sur
   l'ancien site, et c'est de là que je l'avais rapatriée le 09/08 en
   réparant des liens sociaux inventés. J'avais alors vérifié qu'elle existait
   dans la source d'origine — pas qu'elle menait quelque part. Un lien sortant
   ne se contrôle pas depuis le dépôt : il faut le savoir.

   Facebook et YouTube viennent de la même source et n'ont pas été confirmés.
   Ils sont laissés tels quels, et signalés.

   Run: node outils/instagram.js [--verifier]                                */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

var AVANT = "https://instagram.com/stopera_sonic_theatre";
var APRES = "https://instagram.com/__stopera__";

function fichiers(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") fichiers(p, a); return; }
    if (/\.html$/.test(e.name)) a.push(p);
  });
  return a;
}

var faits = 0, touchées = 0, autres = {};

fichiers(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;
  var n = h.split(AVANT).length - 1;
  if (n) { h = h.split(AVANT).join(APRES); faits += n; }
  /* on relève ce qui reste, pour ne pas laisser croire que tout est vérifié */
  (h.match(/https:\/\/(www\.)?(facebook|youtube)\.com\/[^"']+/g) || [])
    .filter(function (u) { return u.indexOf("/embed/") < 0 && u.indexOf("/watch") < 0; })
    .forEach(function (u) { autres[u] = (autres[u] || 0) + 1; });
  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("lien Instagram : " + faits + " occurrence(s) sur " + touchées + " page(s) → " + APRES);
Object.keys(autres).forEach(function (u) {
  console.log("  non vérifié (" + autres[u] + " pages) : " + u);
});
