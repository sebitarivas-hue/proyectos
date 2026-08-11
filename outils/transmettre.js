/* « TRANSMETTRE » PLUTÔT QUE « TRANSMISSION ».
   Un verbe, pas un nom : ce qui se fait, pas ce qui se constate.

   La traduction n'est pas un calque. « Transmission » se dit littéralement en
   espagnol et en italien, où le mot garde le sens culturel français ; il ne
   se dit PAS ainsi en anglais, où « transmission » évoque une boîte de
   vitesses ou une émission de radio. Le secteur culturel anglophone dit
   « passing on » quand il s'agit de faire passer une pratique à qui vient
   après. Le chinois 传承 est déjà un verbe — transmettre un héritage — et n'a
   pas besoin d'être changé, seulement d'être compris comme tel. L'allemand
   dira « weitergeben », le verbe exact, plutôt que le savant
   « Vermittlung » qui veut dire médiation.

   Le mot change partout où il nomme la section : le fil des rangs, le
   surtitre, le titre de la page, le titre du bloc de l'accueil, et l'intitulé
   de la dimension sur les soixante fiches d'œuvres.

   Run: node outils/transmettre.js [--verifier]                              */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var VERIF = process.argv.indexOf("--verifier") > 0;

/* le verbe, dans l'esprit de chaque langue */
var BAS = { fr: "transmettre", en: "passing on", es: "transmitir", it: "trasmettere", zh: "传承" };
var HAUT = { fr: "Transmettre", en: "Passing on", es: "Transmitir", it: "Trasmettere", zh: "传承" };
/* ce qu'on remplace, par langue */
var ANCIEN = {
  fr: ["transmission", "Transmission"],
  en: ["transmission", "Transmission"],
  es: ["transmisión", "Transmisión"],
  it: ["trasmissione", "Trasmissione"],
  zh: ["传承"]
};

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function attrs(t) {
  return LANGS.map(function (l) { return " data-" + l + '="' + t[l] + '"'; }).join("");
}
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

var n = { "fil": 0, "surtitre": 0, "titre": 0, "bloc": 0, "dimension": 0 };
var touchees = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  ANCIEN[lang].forEach(function (vieux) {
    var haut = /^[A-ZÀ-Þ传]/.test(vieux);
    var neuf = haut ? HAUT[lang] : BAS[lang];
    var v = esc(vieux);

    /* le fil des rangs */
    h = h.replace(new RegExp("(<i>03</i>)" + v + "(?=</a>)", "g"), function () { n.fil++; return "$&".replace("$&", "<i>03</i>" + BAS[lang]); });
    /* le surtitre « 03 · transmission » */
    h = h.replace(new RegExp("(>03\\s*(?:&middot;|·)\\s*)" + v + "(?=<)", "g"), function (m, a) { n.surtitre++; return a + BAS[lang]; });
    /* le titre de la page et celui du bloc */
    h = h.replace(new RegExp("(<h1[^>]*>)" + v + "(</h1>)", "g"), function (m, a, b) { n.titre++; return a + HAUT[lang] + b; });
    h = h.replace(new RegExp("(<h2[^>]*>)" + v + "(</h2>)", "g"), function (m, a, b) { n.bloc++; return a + HAUT[lang] + b; });
    /* l'intitulé de la dimension sur les fiches */
    h = h.replace(new RegExp(">" + v + " ↗<", "g"), function () { n.dimension++; return ">" + HAUT[lang] + " ↗<"; });
    void neuf;
  });

  /* les attributs de traduction suivent, pour que la mémoire reste juste */
  h = h.replace(/data-fr="Transmission"/g, function () { return 'data-fr="Transmettre"'; });
  h = h.replace(/data-en="Transmission"/g, function () { return 'data-en="Passing on"'; });
  h = h.replace(/data-es="Transmisión"/g, function () { return 'data-es="Transmitir"'; });
  h = h.replace(/data-it="Trasmissione"/g, function () { return 'data-it="Trasmettere"'; });
  h = h.replace(/data-fr="transmission"/g, 'data-fr="transmettre"');
  h = h.replace(/data-en="transmission"/g, 'data-en="passing on"');
  h = h.replace(/data-es="transmisión"/g, 'data-es="transmitir"');
  h = h.replace(/data-it="trasmissione"/g, 'data-it="trasmettere"');
  h = h.replace(/data-fr="Transmission ↗"/g, 'data-fr="Transmettre ↗"');
  h = h.replace(/data-en="Transmission ↗"/g, 'data-en="Passing on ↗"');
  h = h.replace(/data-es="Transmisión ↗"/g, 'data-es="Transmitir ↗"');
  h = h.replace(/data-it="Trasmissione ↗"/g, 'data-it="Trasmettere ↗"');

  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log((VERIF ? "à changer : " : "changé : ") +
  Object.keys(n).map(function (k) { return n[k] + " " + k; }).join(" · ") +
  " — sur " + touchees + " page(s)");
void attrs;
