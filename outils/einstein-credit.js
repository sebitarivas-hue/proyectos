/* LE CRÉDIT PHOTOGRAPHIQUE D'EINSTEIN.
   Les mentions légales promettent depuis toujours que « les crédits
   photographiques figurent sur les pages des productions concernées ». Sur
   OOO c'est vrai — « Photos : Lucía Rivero. » Il fallait que ce le soit ici
   aussi : les images viennent du dossier de production, et leur nom de
   fichier porte le nom du photographe, Máximo Parpagnoli, que la critique
   d'Olyrix crédite également au titre de la Prensa du Teatro Colón.

   Un crédit n'est pas une politesse : c'est ce qui rend la promesse des
   mentions légales exacte, et ce qui protège l'usage des images.

   Run: node outils/einstein-credit.js [--verifier]                          */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];
var SLUG = "productions/einstein-on-the-beach";

var CREDIT = {
  fr: "Photos : Máximo Parpagnoli — Prensa Teatro Colón.",
  en: "Photos: Máximo Parpagnoli — Prensa Teatro Colón.",
  es: "Fotos: Máximo Parpagnoli — Prensa Teatro Colón.",
  it: "Foto: Máximo Parpagnoli — Prensa Teatro Colón.",
  zh: "摄影：Máximo Parpagnoli — 科隆剧院新闻部。",
  de: "Fotos: Máximo Parpagnoli — Prensa Teatro Colón."
};

function mem(t) {
  return LANGS.map(function (l) { return ' data-' + l + '="' + t[l] + '"'; }).join("");
}
function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var posés = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  if (route !== SLUG) return;
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf("Parpagnoli") >= 0) return;

  /* le crédit prend place à la fin de la note de territoire, comme sur OOO */
  var i = h.indexOf('<p class="pd-dim-text"');
  if (i < 0) return;
  var j = h.indexOf("</p>", i);
  if (j < 0) return;
  h = h.slice(0, j) + " <span" + mem(CREDIT) + ">" + CREDIT[lang] + "</span>" + h.slice(j);
  posés++;
  if (!VERIF) fs.writeFileSync(f, h);
});

console.log("crédit photographique : " + posés + " page(s)");
