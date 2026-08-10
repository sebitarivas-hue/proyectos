/* L'ACCUEIL SUIT L'ORDRE DES RANGS.
   Renuméroter les pages ne suffit pas : l'accueil énumère les six sections
   dans l'ordre, et il les gardait dans l'ancien — on y lisait 01, 02, 05, 04,
   03, 06. Un fil des rangs qui ne monte pas n'est plus un fil.

   Les blocs sont donc remis dans l'ordre voulu, avec leur numéro, leur
   surtitre et leur couleur. Le contenu de chaque bloc n'est pas touché : on
   déplace, on ne réécrit pas.

   Les appels du chapeau suivent le même ordre et les mêmes mots.

   Run: node outils/accueil-rangs.js [--verifier]                            */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var VERIF = process.argv.indexOf("--verifier") > 0;

var ORDRE = ["pourquoi", "oeuvres", "transmission", "reseau", "laboratoire", "soutenir"];
var NUM = ["01", "02", "03", "04", "05", "06"];
var COL = ["var(--red)", "var(--mag)", "var(--cy)", "var(--blu)", "var(--grn)", "var(--ink)"];
var L = {
  pourquoi: { fr: "pourquoi", en: "why", es: "por qué", it: "perché", zh: "为何" },
  oeuvres: { fr: "œuvres", en: "works", es: "obras", it: "opere", zh: "作品" },
  transmission: { fr: "transmission", en: "transmission", es: "transmisión", it: "trasmissione", zh: "传承" },
  reseau: { fr: "réseau", en: "network", es: "red", it: "rete", zh: "网络" },
  laboratoire: { fr: "laboratoire", en: "laboratory", es: "laboratorio", it: "laboratorio", zh: "实验室" },
  soutenir: { fr: "soutenir", en: "support", es: "apoyar", it: "sostenere", zh: "支持" }
};
/* les appels du chapeau : quatre raccourcis, pas six */
var APPELS = ["pourquoi", "transmission", "reseau", "soutenir"];

function attrs(t) {
  return LANGS.map(l => ' data-' + l + '="' + t[l] + '"').join("");
}

var faits = 0;

LANGS.forEach(function (lang) {
  var f = path.join(DOCS, lang === "fr" ? "" : lang, "index.html");
  if (!fs.existsSync(f)) return;
  var pre = lang === "fr" ? "/" : "/" + lang + "/";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* on relève les six blocs et la section à laquelle chacun renvoie */
  var blocs = [], re = /<section class="sec[^"]*"[^>]*>[\s\S]*?<\/section>/g, m;
  while ((m = re.exec(h))) {
    var t = m[0];
    var lien = t.match(/<a class="more"[^>]*href="[^"]*?\/([a-z-]+)\/"/);
    if (!lien) continue;
    blocs.push({ html: t, sec: lien[1], debut: m.index, fin: m.index + t.length });
  }
  if (blocs.length !== 6) { console.log("  " + lang + " : " + blocs.length + " blocs, attendu 6"); return; }

  /* chacun reçoit son rang, sa couleur, son surtitre — puis on les remet en ordre */
  var remis = ORDRE.map(function (sec, i) {
    var b = blocs.find(function (x) { return x.sec === sec; });
    if (!b) return null;
    var t = b.html;
    t = t.replace(/(<div class="num"[^>]*>)\s*\d\d\s*(<\/div>)/, "$1" + NUM[i] + "$2");
    t = t.replace(/--sec:\s*var\(--[a-z]+\)/g, "--sec:" + COL[i]);
    t = t.replace(/<p class="eyebrow">[\s\S]*?<\/p>/,
      '<p class="eyebrow"' + attrs(L[sec]) + ">" + NUM[i] + " &middot; " + L[sec][lang] + "</p>");
    t = t.replace(/(<div class="cc-out"><span class="t num-t">)\d\d(<\/span>)/, "$1" + NUM[i] + "$2");
    return t;
  });
  if (remis.some(function (x) { return !x; })) { console.log("  " + lang + " : une section manque"); return; }

  h = h.slice(0, blocs[0].debut) + remis.join("") + h.slice(blocs[5].fin);

  /* les appels du chapeau */
  var acts = APPELS.map(function (sec) {
    var i = ORDRE.indexOf(sec);
    return '<a href="' + pre + sec + '/"' + attrs(L[sec]) + "><i>" + NUM[i] + "</i>" + L[sec][lang] + "</a>";
  }).join("");
  h = h.replace(/<div class="acts">[\s\S]*?<\/div>/, '<div class="acts">' + acts + "</div>");

  if (h === avant) return;
  faits++;
  if (!VERIF) fs.writeFileSync(f, h);
});

console.log((VERIF ? "à remettre en ordre : " : "accueil remis en ordre : ") + faits + " page(s)");
