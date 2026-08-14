/* BOGOTÁ : LES HORAIRES ET LA BILLETTERIE.
   La fiche annonçait « 26 et 27 septembre 2026 » sans dire à quelle heure ni
   où prendre une place. Une page qui annonce une représentation dans six
   semaines et ne mène pas à la billetterie ne sert à rien.

   Confirmé par la billetterie le 14/08/2026, reçu de la direction artistique :
     samedi 26 septembre 2026, 19 h
     dimanche 27 septembre 2026, 16 h
     Teatro Jorge Eliécer Gaitán, Bogotá

   Le jour de la semaine entre avec l'heure : c'est ce qu'on regarde d'abord
   quand on décide d'y aller. Chaque langue écrit l'heure à sa façon — 19 h en
   français, 7 pm en anglais, 19:00 en espagnol, 19.00 en italien, 19 Uhr en
   allemand, et le chinois met le jour entre parenthèses.

   Run: node outils/bogota-horaires.js [--verifier]                          */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

var BILLETTERIE = "https://tuboleta.com/es/eventos/einstein-beach-philip-glass";

var DATES = {
  fr: "Teatro Jorge Eliécer Gaitán (Bogotá) — samedi 26 septembre, 19 h · dimanche 27 septembre, 16 h",
  en: "Teatro Jorge Eliécer Gaitán (Bogotá) — Saturday 26 September, 7 pm · Sunday 27 September, 4 pm",
  es: "Teatro Jorge Eliécer Gaitán (Bogotá) — sábado 26 de septiembre, 19:00 · domingo 27 de septiembre, 16:00",
  it: "Teatro Jorge Eliécer Gaitán (Bogotá) — sabato 26 settembre, 19.00 · domenica 27 settembre, 16.00",
  zh: "豪尔赫·埃列塞尔·盖坦剧院（波哥大）— 9月26日（周六）19:00 · 9月27日（周日）16:00",
  de: "Teatro Jorge Eliécer Gaitán (Bogotá) — Samstag, 26. September, 19 Uhr · Sonntag, 27. September, 16 Uhr"
};
var K_BILLET = { fr: "Billetterie", en: "Tickets", es: "Entradas", it: "Biglietteria", zh: "购票", de: "Tickets" };
var V_BILLET = { fr: "Tuboleta ↗", en: "Tuboleta ↗", es: "Tuboleta ↗", it: "Tuboleta ↗", zh: "Tuboleta ↗", de: "Tuboleta ↗" };

/* la phrase de la brève gagne ses horaires */
var AVANT = {
  fr: ["au Teatro Jorge Eliécer Gaitán, les 26 et 27 septembre 2026.",
       "au Teatro Jorge Eliécer Gaitán, le samedi 26 septembre 2026 à 19 h et le dimanche 27 à 16 h."],
  en: ["at the Teatro Jorge Eliécer Gaitán, on 26 and 27 September 2026.",
       "at the Teatro Jorge Eliécer Gaitán, on Saturday 26 September 2026 at 7 pm and Sunday 27 at 4 pm."],
  es: ["en el Teatro Jorge Eliécer Gaitán, el 26 y el 27 de septiembre de 2026.",
       "en el Teatro Jorge Eliécer Gaitán, el sábado 26 de septiembre de 2026 a las 19:00 y el domingo 27 a las 16:00."],
  it: ["al Teatro Jorge Eliécer Gaitán, il 26 e il 27 settembre 2026.",
       "al Teatro Jorge Eliécer Gaitán, sabato 26 settembre 2026 alle 19.00 e domenica 27 alle 16.00."],
  zh: ["首次登陆波哥大，演出于豪尔赫·埃列塞尔·盖坦剧院。",
       "首次登陆波哥大，演出于豪尔赫·埃列塞尔·盖坦剧院：9月26日（周六）19:00，9月27日（周日）16:00。"],
  de: ["erstmals in Bogotá gezeigt, im Teatro Jorge Eliécer Gaitán.",
       "erstmals in Bogotá gezeigt, im Teatro Jorge Eliécer Gaitán: Samstag, 26. September, 19 Uhr, und Sonntag, 27. September, 16 Uhr."]
};

function mem(t) {
  return LANGS.map(function (l) {
    return ' data-' + l + '="' + t[l].replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"';
  }).join("");
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

var horaires = 0, billets = 0, phrases = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  var fiche = route === "productions/einstein-on-the-beach";
  var breve = route === "news/einstein-bogota";
  if (!fiche && !breve) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;

  if (fiche) {
    /* l'heure entre dans la valeur des prochaines dates */
    LANGS.forEach(function (l) {
      var vieux = "Teatro Jorge Eliécer Gaitán (Bogotá), " +
        { fr: "26 et 27 septembre 2026", en: "26 and 27 September 2026",
          es: "26 y 27 de septiembre de 2026", it: "26 e 27 settembre 2026",
          de: "26. und 27. September 2026" }[l];
      if (l === "zh") vieux = "豪尔赫·埃列塞尔·盖坦剧院（波哥大），2026年9月26日与27日";
      if (h.indexOf(vieux) >= 0) { h = h.split(vieux).join(DATES[l]); horaires++; }
    });
    /* la billetterie, juste après */
    if (h.indexOf("tuboleta") < 0) {
      var i = h.indexOf('<dt data-fr="Durée"');
      if (i > 0) {
        h = h.slice(0, i) + "<dt" + mem(K_BILLET) + ">" + K_BILLET[lang] + "</dt><dd><a href=\"" +
          BILLETTERIE + '" target="_blank" rel="noopener"' + mem(V_BILLET) + ">" + V_BILLET[lang] +
          "</a></dd>" + h.slice(i);
        billets++;
      }
    }
  }

  if (breve) {
    LANGS.forEach(function (l) {
      if (h.indexOf(AVANT[l][0]) >= 0) { h = h.split(AVANT[l][0]).join(AVANT[l][1]); phrases++; }
    });
  }

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("Bogotá : " + horaires + " date(s) horodatée(s), " + billets +
  " billetterie(s), " + phrases + " phrase(s) précisée(s) — " + touchées + " page(s)");
