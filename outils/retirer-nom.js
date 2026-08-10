/* LE RÉCIT DU NOM S'EN VA.
   Le bloc « STOP · OPERA » expliquait la méthode par le nom : la suspension,
   le silence qui donne sa forme au son, le temps d'avant la première. La
   direction artistique le retire.

   Le bloc entier part — la marque, les deux paragraphes et son filet. Rien
   d'autre n'est touché : la page garde son chapeau, ses déclarations et son
   accent. Le reste du site ne renvoie pas à ce passage.

   Run: node outils/retirer-nom.js [--verifier]                              */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
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
/* fin du <div> ouvert en i, en suivant la profondeur — les attributs de
   traduction contiennent du HTML, une expression régulière s'y perdrait */
function finDiv(h, from) {
  var d = 0, i = from;
  while (i < h.length) {
    var a = h.indexOf("<div", i), b = h.indexOf("</div>", i);
    if (b < 0) return -1;
    if (a >= 0 && a < b) { d++; i = a + 4; continue; }
    if (d === 0) return b + 6;
    d--; i = b + 6;
  }
  return -1;
}

var retires = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8");
  var i = h.indexOf('<div class="name-note">');
  if (i < 0) return;
  var j = finDiv(h, i + 23);
  if (j < 0) return;
  retires++;
  if (!VERIF) fs.writeFileSync(f, h.slice(0, i) + h.slice(j));
  console.log("  " + path.relative(DOCS, f).replace(/\/index\.html$/, "/"));
});

console.log((VERIF ? "à retirer : " : "retiré : ") + retires + " bloc(s)");
