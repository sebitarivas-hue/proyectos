/* LES PHRASES RESTÉES EN FRANÇAIS SUR LES PAGES TRADUITES.
   Le site porte ses traductions dans des attributs data-<lang>. Certaines
   phrases affichaient pourtant le français : le rapprochement se faisait sur
   le texte décodé (« & ») alors que la page écrit l'entité (« &amp; »), et la
   correspondance échouait en silence.

   Ici la table est construite dans les deux écritures, et n'est appliquée
   qu'à des nœuds de texte entiers. Les noms propres, les titres d'œuvres et
   les citations de presse françaises n'ont pas de traduction dans la table :
   ils ne sont donc jamais touchés, ce qui est exactement ce qu'on veut.

   Run: node outils/traduire.js [--verifier]                                 */
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
    .replace(/&gt;/g, ">").replace(/&middot;/g, "·").replace(/&amp;/g, "&");
}
function encode(s) { return s.replace(/&/g, "&amp;"); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/* ---- la table, relevée sur le site lui-même ---- */
var TR = {};
pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), re = /<[a-z][^>]*\sdata-fr="([^"]*)"[^>]*>/gi, m;
  while ((m = re.exec(h))) {
    var fr = decode(m[1]).trim();
    if (!fr) continue;
    TR[fr] = TR[fr] || {};
    LANGS.forEach(function (l) {
      var t = m[0].match(new RegExp('data-' + l + '="([^"]*)"'));
      if (t) { var v = decode(t[1]).trim(); if (v) TR[fr][l] = v; }
    });
  }
});
var cles = Object.keys(TR).sort(function (a, b) { return b.length - a.length; });

/* ---- application ---- */
var faites = 0, touchees = 0, restes = [];

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, f).split(path.sep)[0];
  if (LANGS.indexOf(rel) < 0) return;                 /* le français est la source */
  var lang = rel, h = fs.readFileSync(f, "utf8"), n = 0;
  var i = h.indexOf("<body"), head = h.slice(0, i), body = h.slice(i);

  cles.forEach(function (fr) {
    var to = TR[fr][lang];
    if (!to || to === fr) return;
    [[fr, to], [encode(fr), encode(to)]].forEach(function (pair) {
      var re = new RegExp(">(\\s*)" + esc(pair[0]) + "(\\s*)<", "g");
      body = body.replace(re, function () { n++; return ">" + pair[1] + "<"; });
    });
  });

  if (n) {
    faites += n; touchees++;
    if (!VERIF) fs.writeFileSync(f, head + body);
  }
});

console.log((VERIF ? "à traduire : " : "phrases traduites : ") + faites +
  " sur " + touchees + " page(s)");
void restes;
