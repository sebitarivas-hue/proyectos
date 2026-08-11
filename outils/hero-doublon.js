/* LE SECOND MENU SOUS LE HERO S'EN VA.
   Sous l'appel « voir les œuvres », la page d'accueil reprenait quatre rangs
   — 01, 03, 04, 06 — déjà présents dans la barre du haut, deux centimètres
   plus haut, et là au complet. Deux menus qui disent presque la même chose ne
   font pas un menu deux fois plus utile : ils font hésiter. Et celui-ci ne
   disait que quatre rangs sur six, ce qui laissait croire que les deux autres
   comptaient moins.

   Signalé le 11/08/2026 : « ça confond ». Le bloc est retiré des six pages
   d'accueil. La barre reste seule à porter les rangs, ce qui est son travail.

   Les règles .acts de la feuille de style ne servaient qu'ici : elles partent
   avec, sans quoi elles resteraient à attendre un bloc qui ne reviendra pas.

   Run: node outils/hero-doublon.js [--verifier]                             */
"use strict";
var fs = require("fs"), path = require("path");
var RACINE = path.resolve(__dirname, "..");
var DOCS = path.join(RACINE, "docs");
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

var retirés = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;
  h = h.replace(/\s*<div class="acts">[\s\S]*?<\/div>/g, function () { retirés++; return ""; });
  if (h !== avant && !VERIF) fs.writeFileSync(f, h);
});

/* la feuille de style : les règles du bloc partent avec lui */
var css = path.join(DOCS, "styles.css");
var s = fs.readFileSync(css, "utf8"), avant = s;
s = s.replace(/\/\* le second menu du hero[\s\S]*?\n(?=\S)/, "");
s = s.replace(/^\.acts\{[^}]*\}\n/m, "");
s = s.replace(/^\.acts a\{[\s\S]*?\}\n/m, "");
s = s.replace(/^\.acts a i\{[\s\S]*?\}\n/m, "");
s = s.replace(/^\.acts a:hover,\.acts a:focus-visible\{[^}]*\}\n/m, "");
s = s.replace(/^\.mast \.acts a\{[^}]*\}\n/m, "");
s = s.replace(/^\.mast \.acts a:hover\{[^}]*\}\n/m, "");
if (s !== avant && !VERIF) fs.writeFileSync(css, s);

console.log("second menu du hero : " + retirés + " bloc(s) retiré(s) · règles .acts restantes : " +
  (s.match(/\.acts/g) || []).length);
