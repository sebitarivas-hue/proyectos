/* L'ACCUEIL : LE RANG 04 MÈNE À RÉSEAU, ET SES APPELS PARLENT LA LANGUE.
   Deux défauts au même endroit.

   Le bloc du rang 04 portait le titre « Artistes » et menait à /artists/,
   alors que son propre surtitre et son bloc de collision disaient déjà
   « réseau ». Le rang menait donc ailleurs que là où il s'annonçait.

   Et quatre des six appels de l'accueil étaient restés en français dans les
   quatre autres langues : « Le laboratoire », « Voir les artistes », « La
   transmission », « Soutenir & coopérer » s'affichaient tels quels en
   anglais, en espagnol, en italien et en chinois. Ils étaient trop courts
   pour que le contrôle de traduction les repère — il ne compte que les
   phrases d'au moins cinq mots.

   Les libellés viennent du site : ce sont les mots de son fil des rangs et
   les titres de ses propres sections.

   Run: node outils/accueil-04.js                                            */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];

var TITRE_04 = { fr: "Réseau", en: "Network", es: "Red", it: "Rete", zh: "网络" };

/* les six appels, dans l'ordre des rangs ; null = déjà juste, on n'y touche pas */
var APPELS = {
  "laboratoire/": { fr: "Le laboratoire", en: "The laboratory", es: "El laboratorio",
    it: "Il laboratorio", zh: "实验室" },
  "reseau/": { fr: "Le réseau", en: "The network", es: "La red", it: "La rete", zh: "网络" },
  "transmission/": { fr: "La transmission", en: "Transmission", es: "La transmisión",
    it: "La trasmissione", zh: "传承" },
  "soutenir/": { fr: "Soutenir & coopérer", en: "Support & cooperate",
    es: "Apoyar & cooperar", it: "Sostenere & cooperare", zh: "支持与合作" }
};

function attrs(table) {
  return LANGS.map(l => ' data-' + l + '="' + table[l].replace(/&/g, "&amp;") + '"').join("");
}

var faits = 0, appels = 0;

LANGS.forEach(function (lang) {
  var f = path.join(DOCS, lang === "fr" ? "" : lang, "index.html");
  if (!fs.existsSync(f)) return;
  var pre = lang === "fr" ? "/" : "/" + lang + "/";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* le bloc du rang 04 : titre et destination */
  var m = /<div class="num"[^>]*>\s*04\s*<\/div>/.exec(h);
  if (m) {
    var fin = h.indexOf("</section>", m.index);
    var bloc = h.slice(m.index, fin);
    var neuf = bloc
      .replace(/<h2[^>]*>[\s\S]*?<\/h2>/, "<h2" + attrs(TITRE_04) + ">" + TITRE_04[lang] + "</h2>")
      .replace(/<a class="more" href="[^"]*artists\/"[^>]*>[\s\S]*?<\/a>/,
        '<a class="more" href="' + pre + 'reseau/"' + attrs(APPELS["reseau/"]) + ">" +
        APPELS["reseau/"][lang] + " →</a>");
    if (neuf !== bloc) { h = h.slice(0, m.index) + neuf + h.slice(fin); faits++; }
  }

  /* les appels restés en français */
  Object.keys(APPELS).forEach(function (route) {
    var re = new RegExp('(<a class="more" href="' + pre.replace("/", "\\/") + route.replace("/", "\\/") + '"[^>]*>)([\\s\\S]*?)(<\\/a>)');
    h = h.replace(re, function (tout, ouvre, texte, ferme) {
      var voulu = APPELS[route][lang] + " →";
      if (texte.trim() === voulu) return tout;
      appels++;
      var balise = ouvre.indexOf("data-fr=") >= 0 ? ouvre
        : ouvre.replace(/>$/, attrs(APPELS[route]) + ">");
      return balise + voulu + ferme;
    });
  });

  if (h !== avant) fs.writeFileSync(f, h);
});

console.log("rang 04 de l'accueil ramené vers Réseau : " + faits + " page(s)");
console.log("appels remis dans la langue de la page : " + appels);
