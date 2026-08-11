/* LA PHRASE D'APPEL DE LA SECTION 06 SE MET À DÉFILER.
   « STOPERA! est une infrastructure légère : chaque soutien rend possible la
   recherche, la création et la transmission. » — deux lignes de texte courant
   au bas d'une page qui demande un soutien. Elle passe en Neutrix, à
   l'échelle d'un titre, et glisse de droite à gauche.

   Le texte est écrit deux fois dans la piste, et l'animation ne parcourt que
   la moitié : la boucle est continue, sans saut ni blanc au raccord. La
   seconde copie porte aria-hidden — une technologie d'assistance ne doit pas
   lire la phrase deux fois.

   Le nom de la compagnie prend la couleur de la section : c'est lui que l'œil
   doit accrocher au passage.

   Run: node outils/defile.js [--verifier]                                   */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var VERIF = process.argv.indexOf("--verifier") > 0;

/* la phrase, telle qu'elle est déjà écrite sur le site */
var MARQUEUR = /STOPERA!\s*(est une infrastructure légère|is a light infrastructure|es una infraestructura ligera|è un'infrastruttura leggera|是一个轻量的基础设施)/;

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
/* fin de la balise ouverte en i — les attributs contiennent du HTML */
function finBalise(h, i) {
  var q = 0;
  for (var k = i + 1; k < h.length; k++) {
    var c = h[k];
    if (q) { if (c === q) q = 0; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === ">") return k;
  }
  return -1;
}
function attrsDe(balise) {
  var out = {};
  LANGS.forEach(function (l) {
    var m = balise.match(new RegExp(' data-' + l + '="([^"]*)"'));
    if (m) out[l] = m[1];
  });
  return out;
}
/* le nom prend la couleur : on le sort du fil de la phrase */
function marquer(t) {
  return t.replace(/^STOPERA!/, '<span class="m">STOPERA!</span>');
}

var poses = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf("st-defile") >= 0) return;              /* déjà posé */

  var i = h.search(/<p class="section-note"[^>]*>/);
  while (i >= 0) {
    var fb = finBalise(h, i);
    var balise = h.slice(i, fb + 1);
    var fin = h.indexOf("</p>", fb);
    var texte = h.slice(fb + 1, fin);
    if (MARQUEUR.test(texte)) {
      var tr = attrsDe(balise);
      var part = '<span class="part">' + marquer(texte) + "</span>";
      var copie = '<span class="part" aria-hidden="true">' + marquer(texte) + "</span>";
      var attrs = LANGS.filter(function (l) { return tr[l]; })
        .map(function (l) { return ' data-' + l + '="' + tr[l] + '"'; }).join("");
      var bloc = '<div class="st-defile"><p class="piste"' + attrs + ">" + part + copie + "</p></div>";
      h = h.slice(0, i) + bloc + h.slice(fin + 4);
      poses++;
      if (!VERIF) fs.writeFileSync(f, h);
      console.log("  " + (rel || "/") + "  [" + lang + "]");
      return;
    }
    i = h.indexOf('<p class="section-note"', fin);
  }
});

console.log((VERIF ? "à poser : " : "défilé posé sur : ") + poses + " page(s)");
