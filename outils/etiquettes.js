/* LES DERNIÈRES ÉTIQUETTES RESTÉES EN FRANÇAIS.
   Trouvées le 11/08/2026 en vérifiant le chinois. Elles ne lui sont pas
   propres : aucune des phrases restées en français sur les pages chinoises
   ne l'est — les 71 relevées sont identiques sur les pages anglaises. Ce
   sont donc des étiquettes du site, écrites une fois en dur et jamais
   confiées à la mémoire de traduction : un lecteur chinois, anglais,
   espagnol, italien ou allemand lit « Captation » et « voir sur YouTube ».

   Trois seulement, mais elles reviennent sur dix-huit fiches :
     « Captation »        — la légende d'une vidéo
     « voir sur YouTube » — le lien qui l'accompagne
     « Assemblée du réseau » — sur la carte des coopérations

   Le reste des 71 sont des noms propres, des institutions et des
   distributions : ils ne se traduisent pas et n'ont rien à faire ici.

   Run: node outils/etiquettes.js [--verifier]                               */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

var T = {
  "Captation": { fr: "Captation", en: "Recording", es: "Grabación",
                 it: "Ripresa", zh: "现场录像", de: "Mitschnitt" },
  "voir sur YouTube": { fr: "voir sur YouTube", en: "watch on YouTube",
                        es: "ver en YouTube", it: "guarda su YouTube",
                        zh: "在 YouTube 观看", de: "auf YouTube ansehen" },
  "Assemblée du réseau": { fr: "Assemblée du réseau", en: "Network assembly",
                           es: "Asamblea de la red", it: "Assemblea della rete",
                           zh: "网络大会", de: "Netzwerkversammlung" }
};

function memoire(k) {
  return LANGS.map(function (l) { return ' data-' + l + '="' + T[k][l] + '"'; }).join("");
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
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

var posées = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, f).split(path.sep)[0];
  var lang = LANGS.indexOf(rel) > 0 ? rel : "fr";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* la légende de vidéo : <span class="vid-k">Captation</span> */
  h = h.replace(/<span class="vid-k">([^<]*)<\/span>/g, function (m, t) {
    if (!T["Captation"][lang] && t) return m;
    if (m.indexOf("data-fr=") >= 0) return m;
    posées++;
    return '<span class="vid-k"' + memoire("Captation") + ">" + T["Captation"][lang] + "</span>";
  });

  /* le lien qui suit, et l'assemblée de la carte : le texte seul change */
  ["voir sur YouTube", "Assemblée du réseau"].forEach(function (k) {
    LANGS.forEach(function (l) {
      var re = new RegExp(">" + esc(T[k][l]) + "(?=<| &middot;| ·)", "g");
      h = h.replace(re, function () { posées++; return ">" + T[k][lang]; });
    });
  });

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("étiquettes traduites : " + posées + " sur " + touchées + " page(s)");
