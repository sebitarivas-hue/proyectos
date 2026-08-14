/* L'INDEX DES ACTUALITÉS EST TENU PAR UNE RÈGLE, PLUS À LA MAIN.
   Deux brèves ont été écrites sans que rien ne les liste : elles existaient à
   leur adresse, invisibles depuis la page Actualités. Les contrôles de liens
   ne le voient pas — ils vérifient qu'aucun lien ne casse, pas qu'une page
   soit atteignable.

   L'index est donc reconstruit depuis les brèves elles-mêmes : chaque
   dossier de news/ donne sa date, son titre et ses six traductions, relevés
   dans la page. La liste se range de la plus récente à la plus ancienne.
   Ajouter une brève suffit désormais à la voir apparaître.

   Run: node outils/actus-index.js [--verifier]                              */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

function lire(h, motif) {
  var m = h.match(motif);
  return m ? m[1] : null;
}
/* la mémoire d'un élément, telle qu'elle est écrite dans la page */
function memoire(balise) {
  var out = "";
  LANGS.forEach(function (l) {
    var m = balise.match(new RegExp('\\sdata-' + l + '="([^"]*)"'));
    if (m) out += " data-" + l + '="' + m[1] + '"';
  });
  return out;
}

var faits = 0;

LANGS.forEach(function (lang) {
  var base = path.join(DOCS, lang === "fr" ? "" : lang, "news");
  if (!fs.existsSync(base)) return;
  var index = path.join(base, "index.html");
  if (!fs.existsSync(index)) return;

  /* on relève chaque brève */
  var breves = [];
  fs.readdirSync(base, { withFileTypes: true }).forEach(function (e) {
    if (!e.isDirectory()) return;
    var f = path.join(base, e.name, "index.html");
    if (!fs.existsSync(f)) return;
    var h = fs.readFileSync(f, "utf8");
    var date = lire(h, /<span class="pd-tag">([^<]*)<\/span>/);
    var bal = lire(h, /(<h1 class="pd-title pd-title--page"[^>]*>)/);
    var titre = lire(h, /<h1 class="pd-title pd-title--page"[^>]*>([\s\S]*?)<\/h1>/);
    var pitch = lire(h, /(<p class="pd-pitch"[^>]*>)/);
    var ptxt = lire(h, /<p class="pd-pitch"[^>]*>([\s\S]*?)<\/p>/);
    if (!date || !titre) return;
    breves.push({
      slug: e.name, date: date,
      titre: titre.trim(), memTitre: bal ? memoire(bal) : "",
      pitch: (ptxt || "").trim(), memPitch: pitch ? memoire(pitch) : ""
    });
  });
  if (!breves.length) return;

  /* la plus récente en tête */
  breves.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });

  var liste = breves.map(function (b) {
    return '<li class="news-item"><a href="' + b.slug + '/">' +
      '<span class="news-date">' + b.date + "</span>" +
      '<span class="news-h"' + b.memTitre + ">" + b.titre + "</span>" +
      '<span class="news-s"' + b.memPitch + ">" + b.pitch + "</span>" +
      "</a></li>";
  }).join("");

  var h = fs.readFileSync(index, "utf8"), avant = h;
  var i = h.indexOf('<li class="news-item">');
  if (i < 0) return;
  /* On borne sur le </ul> qui ferme la liste, jamais sur le dernier </li> du
     document : celui-là est dans le pied de page, et le prendre pour fin de
     liste efface tout ce qui sépare les deux. */
  var j = h.indexOf("</ul>", i);
  if (j < 0) return;
  h = h.slice(0, i) + liste + h.slice(j);
  if (h !== avant) { faits++; if (!VERIF) fs.writeFileSync(index, h); }
});

console.log("index des actualités reconstruit : " + faits + " page(s)");
