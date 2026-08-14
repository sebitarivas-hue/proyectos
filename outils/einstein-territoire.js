/* « SUR LE MODÈLE D'OOO » N'A RIEN À FAIRE SUR UNE PAGE PUBLIQUE.
   La fiche Einstein portait, sous Partenariats & territoire : « STOPERA!
   accompagne la diffusion de la production en Europe, sur le modèle d'OOO. »
   Retiré à la demande de la direction artistique, le 14/08/2026.

   La phrase disait deux choses de trop. « Sur le modèle d'OOO » est un repère
   interne : un lecteur ne sait pas ce qu'est ce modèle, et il n'a pas à le
   savoir — c'est un arrangement entre partenaires, pas une information sur
   l'œuvre. Et « accompagne la diffusion » redisait, en plus vague, ce que la
   ligne « Diffusion internationale : STOPERA! » énonce déjà dans les
   informations de la fiche.

   Le crédit photographique vivait dans le même paragraphe : il reste, seul.

   Run: node outils/einstein-territoire.js [--verifier]                      */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];
var SLUG = "productions/einstein-on-the-beach";

/* la phrase à retirer, dans chaque langue */
var PHRASE = {
  fr: "STOPERA! accompagne la diffusion de la production en Europe, sur le modèle d'OOO.",
  en: "STOPERA! supports the production's touring in Europe, on the OOO model.",
  es: "STOPERA! acompaña la difusión de la producción en Europa, según el modelo de OOO.",
  it: "STOPERA! accompagna la diffusione della produzione in Europa, sul modello di OOO.",
  zh: "STOPERA! 以 OOO 的模式支持该制作在欧洲的巡演。",
  de: "STOPERA! begleitet die europäische Verbreitung der Produktion, nach dem Modell von OOO."
};
/* le crédit reste, et devient le seul contenu du paragraphe */
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

var faites = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  if (route !== SLUG) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* le paragraphe entier est refait : il ne porte plus que le crédit */
  var i = h.indexOf('<p class="pd-dim-text"');
  if (i < 0) return;
  var j = h.indexOf("</p>", i);
  if (j < 0) return;
  h = h.slice(0, i) + '<p class="pd-dim-text"' + mem(CREDIT) + ">" + CREDIT[lang] + h.slice(j);

  if (h !== avant) { faites++; if (!VERIF) fs.writeFileSync(f, h); }
});

/* rien ne doit subsister ailleurs — la brève d'actualité portait la même idée */
var restes = [];
pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8");
  LANGS.forEach(function (l) {
    if (h.indexOf(PHRASE[l]) >= 0) restes.push(path.relative(DOCS, f) + " [" + l + "]");
  });
});

console.log("« sur le modèle d'OOO » retiré : " + faites + " page(s)");
if (restes.length) {
  console.log("  subsiste ailleurs : " + restes.length);
  restes.slice(0, 12).forEach(function (r) { console.log("    " + r); });
}
