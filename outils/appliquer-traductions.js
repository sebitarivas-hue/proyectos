/* Pose les traductions de outils/traductions.json là où elles manquaient :
   dans les attributs data-<lang> (la mémoire de traduction du site) ET dans
   le texte affiché des pages en langue étrangère, qui sont statiques.
   Run: node outils/appliquer-traductions.js                                 */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["en", "es", "it", "zh"];
var T = JSON.parse(fs.readFileSync(path.join(__dirname, "traductions.json"), "utf8"));

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function attr(s) { return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
/* le contenu peut être écrit avec ou sans entités : les deux sont cherchés */
function formes(s) { return [s, s.replace(/&/g, "&amp;"), s.replace(/'/g, "&#39;")]; }

var textes = 0, memoire = 0, tp = 0;

pages(DOCS).forEach(function (f) {
  var lang = path.relative(DOCS, f).split(path.sep)[0];
  var etrangere = LANGS.indexOf(lang) >= 0;
  var h = fs.readFileSync(f, "utf8"), avant = h;

  Object.keys(T).forEach(function (fr) {
    /* 1. la mémoire : on complète l'élément qui porte déjà data-fr */
    formes(fr).forEach(function (k) {
      var re = new RegExp('(<[a-z][^>]*\\sdata-fr="' + esc(attr(k).replace(/&amp;amp;/g, "&amp;")) + '")([^>]*>)', "g");
      h = h.replace(re, function (m, a, b) {
        var add = "";
        LANGS.forEach(function (l) {
          if (b.indexOf("data-" + l + '="') < 0 && T[fr][l]) add += ' data-' + l + '="' + attr(T[fr][l]) + '"';
        });
        if (add) memoire++;
        return a + add + b;
      });
    });

    /* 2. le texte affiché, sur les pages en langue étrangère */
    if (!etrangere || !T[fr][lang]) return;
    formes(fr).forEach(function (k, i) {
      var to = [T[fr][lang], T[fr][lang].replace(/&/g, "&amp;"), T[fr][lang].replace(/'/g, "&#39;")][i];
      var re = new RegExp(">(\\s*)" + esc(k) + "(\\s*)<", "g");
      h = h.replace(re, function () { textes++; return ">" + to + "<"; });
    });
  });

  if (h !== avant) { fs.writeFileSync(f, h); tp++; }
});

console.log("textes traduits : " + textes + " · mémoire complétée : " + memoire +
  " · pages touchées : " + tp);
