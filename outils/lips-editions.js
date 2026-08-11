/* LES TROIS ÉDITIONS DU LIPS, ET LA CADENCE QU'IL N'A JAMAIS EUE.
   Les dates, données par la direction artistique le 11/08/2026 :
     2017 — UNSAM, Buenos Aires
     2020 — GRAME, Lyon
     2023 — Pôle Pixel, Villeurbanne
     2028 — prochaine édition

   Le site disait trois choses fausses, dans les six langues :
   — « Créé en 2019 » : la première édition est de 2017 ;
   — « biennal », « tous les deux ans » : trois ans séparent les éditions
     passées, cinq la dernière de la prochaine. Aucune cadence régulière ne
     décrit cette suite ; plutôt que d'en inventer une autre, la mention est
     retirée et les dates parlent seules ;
   — les éditions précédentes étaient listées sans dates et à l'envers.

   Une année ne se traduit pas : la liste des éditions et la vignette de la
   page 02 sont écrites en chiffres, identiques dans les six langues.

   Run: node outils/lips-editions.js [--verifier]                            */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

/* chaque remplacement vaut pour l'attribut de mémoire comme pour le texte
   affiché : les deux portent la même chaîne, à l'identique */
var REMPLACEMENTS = [
  /* la première édition */
  ["Créé en 2019,", "Créé en 2017,"],
  ["Founded in 2019,", "Founded in 2017,"],
  ["Creado en 2019,", "Creado en 2017,"],
  ["Creato nel 2019,", "Creato nel 2017,"],
  ["创立于2019年", "创立于2017年"],
  ["2019 gegründet,", "2017 gegründet,"],

  /* la cadence */
  ["Biennal — prochaine édition 2028", "Prochaine édition 2028"],
  ["Biennial — next edition 2028", "Next edition 2028"],
  ["Bienal — próxima edición 2028", "Próxima edición 2028"],
  ["Biennale — prossima edizione 2028", "Prossima edizione 2028"],
  ["双年制 — 下一届 2028", "下一届 2028"],
  ["Biennal — nächste Ausgabe 2028", "Nächste Ausgabe 2028"],

  ["Un réseau de partenaires en France et à l'international, tous les deux ans.",
   "Un réseau de partenaires en France et à l'international."],
  ["A network of partners in France and abroad, every two years.",
   "A network of partners in France and abroad."],
  ["Una red de socios en Francia y en el extranjero, cada dos años.",
   "Una red de socios en Francia y en el extranjero."],
  ["Una rete di partner in Francia e all'estero, ogni due anni.",
   "Una rete di partner in Francia e all'estero."],
  ["每两年一届，连接法国与国际的伙伴网络。", "连接法国与国际的伙伴网络。"],
  ["Ein Partnernetzwerk in Frankreich und international, alle zwei Jahre.",
   "Ein Partnernetzwerk in Frankreich und international."],

  ["Le laboratoire international de prototypes scéniques et sonores revient en 2028, tous les deux ans.",
   "Le laboratoire international de prototypes scéniques et sonores revient en 2028."],
  ["The international laboratory of scenic and sound prototypes returns in 2028, every two years.",
   "The international laboratory of scenic and sound prototypes returns in 2028."],
  ["El laboratorio internacional de prototipos escénicos y sonoros vuelve en 2028, cada dos años.",
   "El laboratorio internacional de prototipos escénicos y sonoros vuelve en 2028."],
  ["Il laboratorio internazionale di prototipi scenici e sonori torna nel 2028, ogni due anni.",
   "Il laboratorio internazionale di prototipi scenici e sonori torna nel 2028."],
  ["国际舞台与声音原型工作坊将于 2028 年回归，每两年一届。",
   "国际舞台与声音原型工作坊将于 2028 年回归。"],
  ["Das internationale Labor für szenische und klangliche Prototypen kehrt 2028 zurück, alle zwei Jahre.",
   "Das internationale Labor für szenische und klangliche Prototypen kehrt 2028 zurück."],

  /* les éditions, dans l'ordre où elles ont eu lieu, avec leurs dates */
  ["Pôle Pixel (Villeurbanne) · GRAME (Lyon) · UNSAM (Buenos Aires)",
   "UNSAM (Buenos Aires), 2017 · GRAME (Lyon), 2020 · Pôle Pixel (Villeurbanne), 2023"],

  /* la vignette de la page 02 : les quatre dates, rien d'autre */
  ['<span class="oeu-y">Biennal · 2028</span>',
   '<span class="oeu-y">2017 · 2020 · 2023 · 2028</span>']
];

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var faits = {}, touchees = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;
  REMPLACEMENTS.forEach(function (r) {
    var n = h.split(r[0]).length - 1;
    if (!n) return;
    h = h.split(r[0]).join(r[1]);
    faits[r[0]] = (faits[r[0]] || 0) + n;
  });
  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

var total = Object.keys(faits).reduce(function (s, k) { return s + faits[k]; }, 0);
console.log("LIPS : " + total + " mention(s) corrigée(s) sur " + touchees + " page(s)");
REMPLACEMENTS.filter(function (r) { return !faits[r[0]]; }).forEach(function (r) {
  console.log("  jamais rencontré : " + JSON.stringify(r[0].slice(0, 60)));
});
