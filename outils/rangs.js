/* L'ORDRE DES RANGS.
   La direction artistique le fixe ainsi : 03 transmission, 05 laboratoire.
   Le laboratoire et la transmission échangent leur place.

   Le rang garde son mot : « laboratoire ». Lips Lab est le nom de l'œuvre qui
   s'y déploie, pas celui de la section — un menu nomme un domaine, pas un
   programme.

   Ce que cette règle change, et ce qu'elle ne change pas :

     · elle change le RANG affiché — le grand numéro d'une page, son surtitre,
       le fil de la navigation, l'ordre des blocs de l'accueil ;
     · elle ne change AUCUNE adresse. /laboratoire/ reste /laboratoire/. Un
       rang est un ordre de lecture, pas une adresse : renuméroter des URL
       casserait tous les liens entrants, les partages et les moteurs, pour
       un gain nul.

   La couleur suit le rang, pas la section : c'est le rang qui structure la
   lecture, et le rouge a toujours été le premier.

   Run: node outils/rangs.js [--verifier]                                    */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh", "de"];
var VERIF = process.argv.indexOf("--verifier") > 0;

/* l'ordre voulu, du premier au dernier */
var ORDRE = ["pourquoi", "oeuvres", "transmission", "reseau", "laboratoire", "soutenir"];
var LIBELLE = {
  pourquoi: { fr: "pourquoi", en: "why", es: "por qué", it: "perché", zh: "为何", de: "warum" },
  oeuvres: { fr: "œuvres", en: "works", es: "obras", it: "opere", zh: "作品", de: "werke" },
  transmission: { fr: "transmission", en: "transmission", es: "transmisión", it: "trasmissione", zh: "传承", de: "vermittlung" },
  reseau: { fr: "réseau", en: "network", es: "red", it: "rete", zh: "网络", de: "netzwerk" },
  laboratoire: { fr: "laboratoire", en: "laboratory", es: "laboratorio", it: "laboratorio", zh: "实验室", de: "labor" },
  soutenir: { fr: "soutenir", en: "support", es: "apoyar", it: "sostenere", zh: "支持", de: "unterstützen" }
};
/* les sections qui relèvent d'un rang, au-delà de sa page de tête */
var RATTACHE = {
  pourquoi: ["pourquoi"],
  oeuvres: ["oeuvres", "productions", "parcours"],
  transmission: ["transmission"],
  reseau: ["reseau", "artistes", "cooperation"],
  laboratoire: ["laboratoire", "recherche", "lips"],
  soutenir: ["soutenir"]
};
var NUM = ["01", "02", "03", "04", "05", "06"];
var COL = ["var(--red)", "var(--mag)", "var(--cy)", "var(--blu)", "var(--grn)", "var(--ink)"];

/* l'ancien rang de chaque section, pour savoir quoi remplacer */
var ANCIEN = { pourquoi: "01", oeuvres: "02", laboratoire: "03", reseau: "04", transmission: "05", soutenir: "06" };
var NOUVEAU = {};
ORDRE.forEach(function (s, i) { NOUVEAU[s] = NUM[i]; });

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function sectionDe(route) {
  var tete = route.split("/")[0];
  for (var s in RATTACHE) if (RATTACHE[s].indexOf(tete) >= 0) return s;
  return null;
}

var numeros = 0, surtitres = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  var sec = sectionDe(route);
  if (!sec) return;                       /* accueil, presse, actualités : sans rang */

  var vieux = ANCIEN[sec], neuf = NOUVEAU[sec];
  if (vieux === neuf) return;

  var h = fs.readFileSync(f, "utf8"), avant = h, n = 0;

  /* le grand numéro */
  h = h.replace(/(<div class="num"[^>]*>)\s*\d\d\s*(<\/div>)/g, function (m, a, b) {
    numeros++; n++; return a + neuf + b;
  });
  /* le surtitre « 03 · laboratoire », dans toutes les langues */
  h = h.replace(new RegExp("(>|\\s)" + vieux + "(\\s*(?:&middot;|·)\\s*)", "g"), function (m, av, ap) {
    surtitres++; n++; return av + neuf + ap;
  });
  /* la couleur de la section suit son rang */
  h = h.replace(/--sec:\s*var\(--[a-z]+\)/g, "--sec:" + COL[NUM.indexOf(neuf)]);

  if (n) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
  void avant;
});

console.log((VERIF ? "à renuméroter : " : "renuméroté : ") + numeros + " grand(s) numéro(s) et " +
  surtitres + " surtitre(s), sur " + touchees + " page(s)");
console.log("ordre : " + ORDRE.map(function (s, i) { return NUM[i] + " " + LIBELLE[s].fr; }).join(" · "));
