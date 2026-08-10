/* LE CONTENU AFFICHÉ SUIT LA TRADUCTION QU'IL PORTE.
   Chaque élément traduisible du site porte ses versions dans des attributs
   data-<lang>. Les pages sont statiques : c'est le contenu écrit dans
   l'élément qui s'affiche, et rien ne garantissait qu'il corresponde à la
   langue de la page. Des paragraphes entiers affichaient le français tout en
   portant leur traduction à un centimètre de là, dans leur propre attribut.

   Deux précautions, sans lesquelles cet outil casse plus qu'il ne répare :

   1. Les valeurs d'attribut contiennent du HTML (« <strong> »). Une balise ne
      se termine donc PAS au premier « > » : il faut lire caractère par
      caractère en sachant si l'on se trouve dans une valeur entre guillemets.
      Toute expression régulière du type <p[^>]*> se trompe ici.

   2. On ne remplace QUE ce qui affiche encore le français. Un contenu déjà
      traduit a pu être enrichi depuis — les renvois éditoriaux, par exemple —
      et le réécrire depuis l'attribut effacerait ces liens.

   Run: node outils/synchroniser.js [--verifier]                             */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["en", "es", "it", "zh"];
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
function decode(s) {
  return s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
var nu = x => decode(String(x).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/* fin de la balise ouverte en i — en tenant compte des « > » dans les valeurs */
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
/* fin du contenu de l'élément <nom> ouvert juste avant `from` */
function finContenu(h, from, nom) {
  var d = 0, i = from, ouvre = "<" + nom, ferme = "</" + nom, bas = h.toLowerCase();
  while (i < h.length) {
    var a = bas.indexOf(ouvre, i), b = bas.indexOf(ferme, i);
    if (b < 0) return -1;
    if (a >= 0 && a < b && /[\s>/]/.test(h[a + ouvre.length] || "")) { d++; i = a + ouvre.length; continue; }
    if (d === 0) return b;
    d--; i = b + ferme.length;
  }
  return -1;
}
function valeur(balise, nom) {
  var i = balise.indexOf(" data-" + nom + '="');
  if (i < 0) return null;
  var j = balise.indexOf('"', i + nom.length + 8);
  return balise.slice(i + nom.length + 8, j);
}

var poses = 0, tp = 0, ex = [];

pages(DOCS).forEach(function (f) {
  var lang = path.relative(DOCS, f).split(path.sep)[0];
  if (LANGS.indexOf(lang) < 0) return;              /* le français est la source */
  var h = fs.readFileSync(f, "utf8"), out = "", pos = 0, n = 0, i = 0;

  while ((i = h.indexOf("<", i)) >= 0) {
    if (!/[a-zA-Z]/.test(h[i + 1] || "")) { i++; continue; }
    var fb = finBalise(h, i);
    if (fb < 0) break;
    var balise = h.slice(i, fb + 1);
    if (balise.indexOf(" data-fr=") < 0) { i = i + 1; continue; }

    var fr = valeur(balise, "fr"), tr = valeur(balise, lang);
    var nom = (balise.match(/^<([a-zA-Z]+)/) || [, ""])[1].toLowerCase();
    var fin = finContenu(h, fb + 1, nom);
    if (!fr || !tr || fin < 0) { i = fb + 1; continue; }

    var actuel = h.slice(fb + 1, fin);
    if (nu(actuel) === nu(fr) && nu(actuel) !== nu(tr)) {
      if (ex.length < 5) ex.push(path.relative(DOCS, f) + " · " + nu(actuel).slice(0, 46));
      out += h.slice(pos, fb + 1) + decode(tr);
      pos = fin; n++;
    }
    i = fin;
  }
  out += h.slice(pos);
  if (n) { poses += n; tp++; if (!VERIF) fs.writeFileSync(f, out); }
});

console.log((VERIF ? "à resynchroniser : " : "éléments resynchronisés : ") + poses +
  " sur " + tp + " page(s)");
ex.forEach(e => console.log("   ex. " + e));
