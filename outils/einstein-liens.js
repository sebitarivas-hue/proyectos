/* LA FICHE EINSTEIN, RELIÉE AU RESTE DU SITE.
   Une fiche que rien ne lie n'existe pas : les contrôles de liens vérifient
   qu'aucun lien ne casse, pas qu'une page soit atteignable. Trois raccords :

   — l'index des œuvres, où elle prend sa carte ;
   — les pages de Léo Warynski et de Martín Bauer, qui ne déclaraient l'un
     que War Madrigals, l'autre que Mamma Roma et Insistir — alors qu'ils
     signent ensemble la première latino-américaine d'Einstein ;
   — la revue de presse, qui gagne son groupe.

   Run: node outils/einstein-liens.js [--verifier]                           */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

var TITRE = "Einstein on the Beach";
var SLUG = "productions/einstein-on-the-beach";

var RESUME = {
  fr: "Première latino-américaine de l'opéra de Philip Glass.",
  en: "The Latin American premiere of Philip Glass's opera.",
  es: "Estreno latinoamericano de la ópera de Philip Glass.",
  it: "Prima latinoamericana dell'opera di Philip Glass.",
  zh: "菲利普·格拉斯歌剧的拉丁美洲首演。",
  de: "Lateinamerikanische Erstaufführung der Oper von Philip Glass."
};
var CITATION = {
  fr: "« Une standing ovation vient honorer l'ensemble des artistes pour clore ce spectacle hors du commun. »",
  en: "“A standing ovation honours all the artists at the close of this extraordinary show.”",
  es: "«Una ovación de pie honra al conjunto de los artistas para cerrar este espectáculo fuera de lo común.»",
  it: "«Una standing ovation onora l'insieme degli artisti a chiusura di questo spettacolo fuori dal comune.»",
  zh: "“全场起立鼓掌，向所有艺术家致敬，为这场非凡的演出画上句点。”",
  de: "„Eine Standing Ovation ehrt alle Beteiligten zum Abschluss dieses außergewöhnlichen Abends.“"
};
var SOURCE = "https://www.olyrix.com/articles/production/6881/einstein-on-the-beach-glass-bob-wilson-14-juin-2023-critique-compte-rendu-warynski-bauer-moguillansky-casella-gutman-tirantte-sendon-rivas-osorio-caso-ferro-miceli-fernandez-nosetto-dattoli-stefano-alvarez-couceyro-garcia-holm-giancaspro-lesgart-colon";

/* la ligne que chaque artiste gagne, dans sa page */
var LIGNE = {
  warynski: {
    fr: "Il assure la direction musicale de la première latino-américaine d'<em>Einstein on the Beach</em>, au Teatro Colón.",
    en: "He conducts the Latin American premiere of <em>Einstein on the Beach</em> at the Teatro Colón.",
    es: "Asume la dirección musical del estreno latinoamericano de <em>Einstein on the Beach</em>, en el Teatro Colón.",
    it: "Firma la direzione musicale della prima latinoamericana di <em>Einstein on the Beach</em>, al Teatro Colón.",
    zh: "他担任《Einstein on the Beach》拉丁美洲首演的音乐总监，演出于科隆剧院。",
    de: "Er übernimmt die musikalische Leitung der lateinamerikanischen Erstaufführung von <em>Einstein on the Beach</em> am Teatro Colón."
  },
  bauer: {
    fr: "Il signe la mise en scène de la première latino-américaine d'<em>Einstein on the Beach</em>, au Teatro Colón.",
    en: "He directs the Latin American premiere of <em>Einstein on the Beach</em> at the Teatro Colón.",
    es: "Firma la puesta en escena del estreno latinoamericano de <em>Einstein on the Beach</em>, en el Teatro Colón.",
    it: "Firma la regia della prima latinoamericana di <em>Einstein on the Beach</em>, al Teatro Colón.",
    zh: "他执导《Einstein on the Beach》的拉丁美洲首演，演出于科隆剧院。",
    de: "Er inszeniert die lateinamerikanische Erstaufführung von <em>Einstein on the Beach</em> am Teatro Colón."
  }
};

function mem(t) {
  return LANGS.map(function (l) { return ' data-' + l + '="' + t[l].replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"'; }).join("");
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

var cartes = 0, artistes = 0, presses = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  var pre = lang === "fr" ? "/" : "/" + lang + "/";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* 1. l'index des œuvres — la carte se place en tête, c'est la plus récente
        des créations passées et celle qui tourne */
  if (route === "oeuvres" && h.indexOf(SLUG) < 0) {
    var i = h.indexOf('<article class="oeu');
    if (i > 0) {
      var fin = h.indexOf(">", i) + 1;
      var cls = h.slice(i, fin).match(/class="([^"]*)"/)[1];
      h = h.slice(0, i) + '<article class="' + cls + '"><a href="' + pre + SLUG + '/">' +
        '<div class="oeu-txt">' +
        '<h2 class="oeu-t" data-fr="' + TITRE + '" translate="no">' + TITRE + "</h2>" +
        '<span class="oeu-y">2023</span>' +
        '<p class="oeu-s"' + mem(RESUME) + ">" + RESUME[lang] + "</p>" +
        "</div></a></article>" + h.slice(i);
      cartes++;
    }
  }

  /* 2. les deux artistes */
  ["warynski", "bauer"].forEach(function (qui) {
    if (route.indexOf("artists/leo-warynski") < 0 && qui === "warynski") return;
    if (route.indexOf("artists/martin-bauer") < 0 && qui === "bauer") return;
    if (h.indexOf(SLUG) >= 0) return;
    /* la ligne de biographie, ajoutée au dernier paragraphe de la notice */
    var b = h.lastIndexOf("</p>", h.indexOf('class="pd-grid"'));
    if (b > 0) h = h.slice(0, b) + " <span" + mem(LIGNE[qui]) + ">" + LIGNE[qui][lang] + "</span>" + h.slice(b);
    /* et la production liée */
    var u = h.indexOf('<ul class="taglist">');
    if (u > 0) {
      var ins = u + '<ul class="taglist">'.length;
      h = h.slice(0, ins) + "<li><a href=\"../../" + SLUG + "/\" data-fr=\"" + TITRE +
        "\" translate=\"no\">" + TITRE + "</a></li>" + h.slice(ins);
    }
    artistes++;
  });

  /* 3. la revue de presse */
  if (route === "presse" && h.indexOf(SLUG) < 0) {
    var g = h.indexOf('<div class="press-group">');
    if (g > 0) {
      h = h.slice(0, g) + '<div class="press-group"><h3 class="press-prod">' +
        '<a href="../' + SLUG + '/" data-fr="' + TITRE + '" translate="no">' + TITRE + "</a></h3>" +
        '<blockquote class="pdq"><span' + mem(CITATION) + ">" + CITATION[lang] + "</span>" +
        '<cite><a href="' + SOURCE + '" target="_blank" rel="noopener">Olyrix</a></cite>' +
        "</blockquote></div>" + h.slice(g);
      presses++;
    }
  }

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("Einstein relié : " + cartes + " carte(s) d'index, " + artistes +
  " page(s) d'artiste, " + presses + " groupe(s) de presse — " + touchées + " page(s)");
