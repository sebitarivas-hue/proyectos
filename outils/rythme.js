"use strict";
/* PASSE DE RYTHME — 12/09/2026.
 *
 * Le système graphique tient. Ce qui fatigue, c'est sa régularité : on
 * devine le bloc suivant. Cette passe ne change ni le style, ni la
 * palette, ni un mot du contenu. Elle pose des marqueurs dans le HTML
 * pour que la feuille de style puisse, à huit endroits précis, cesser
 * d'appliquer la règle mécaniquement.
 *
 * Trois marqueurs :
 *
 *   1. plan-rang--8-4, --5-4-3, --court  sur l'index des œuvres : trois
 *      rangs sur six cessent d'avoir des tuiles de poids égal. Le rang
 *      « salamandres / A World to Blast » passe en 8/4 parce que la photo
 *      de plateau tient la page et que les deux portraits d'archive font
 *      275 px de large : les gonfler à une demi-page les abîmait.
 *
 *   2. collide--filet  sur l'accueil : le second aplat de couleur, celui
 *      du 04, redevient un filet. Les mots restent, le rectangle part.
 *      Un aplat qui revient à chaque section est une fonction ; un aplat
 *      qui apparaît une fois est un événement.
 *
 *   3. fig--menue  sur les deux fiches dont la photographie source fait
 *      275 px de large. Elles étaient affichées en pleine largeur, soit
 *      un agrandissement de plus de cinq fois. L'image reprend sa taille
 *      et se tient à droite. Une image peut être volontairement petite.
 *
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];

var bilan = { rangs: 0, collide: 0, menues: 0 };

/* ── 1 · les rangs de l'index des œuvres ───────────────────────────── */
/* On repère chaque rang par les œuvres qu'il contient, jamais par son
   numéro d'ordre : l'ordre du catalogue changera, les œuvres non.       */
var RANGS = [
  { oeuvres: ["rut", "war-madrigals", "insistir"], classe: "plan-rang--5-4-3" },
  { oeuvres: ["salamandres", "america"],           classe: "plan-rang--8-4" },
  { oeuvres: ["nous"],                             classe: "plan-rang--court" }
];

function marquerRangs(fichier) {
  var h = fs.readFileSync(fichier, "utf8"), avant = h;
  var morceaux = h.split(/(<div class="plan-rang[^"]*">)/);
  for (var i = 1; i < morceaux.length; i += 2) {
    var ouvrant = morceaux[i], contenu = morceaux[i + 1] || "";
    // on ne regarde que jusqu'au rang suivant
    var bloc = contenu.split('<div class="plan-rang')[0];
    RANGS.forEach(function (r) {
      if (ouvrant.indexOf(r.classe) >= 0) return;                 // déjà posé
      var complet = r.oeuvres.every(function (s) {
        return bloc.indexOf("productions/" + s + '/"') >= 0;
      });
      if (!complet) return;
      morceaux[i] = ouvrant.replace('plan-rang ', 'plan-rang ' + r.classe + ' ');
      ouvrant = morceaux[i];
      bilan.rangs++;
    });
  }
  h = morceaux.join("");
  if (h !== avant) fs.writeFileSync(fichier, h);
}

/* ── 2 · le second aplat de l'accueil ──────────────────────────────── */
function marquerCollide(fichier) {
  var h = fs.readFileSync(fichier, "utf8");
  var i = h.indexOf('<div class="collide"><div class="cc-out">');
  if (i < 0) return;                                              // déjà posé
  h = h.slice(0, i) + '<div class="collide collide--filet"><div class="cc-out">' +
      h.slice(i + '<div class="collide"><div class="cc-out">'.length);
  fs.writeFileSync(fichier, h);
  bilan.collide++;
}

/* ── 3 · les deux images trop petites pour la pleine largeur ───────── */
var MENUES = ["america-scarfo.jpg", "snow.jpg"];

/* Selon la langue, la figure d'ouverture porte fig-full ou pd-media : les
   deux existent dans le dépôt. On marque la figure qui contient l'image,
   quelle que soit sa classe. */
function marquerMenues(fichier) {
  var h = fs.readFileSync(fichier, "utf8"), avant = h;
  MENUES.forEach(function (nom) {
    var rx = /<figure class="([^"]*)">/g, m;
    while ((m = rx.exec(h)) !== null) {
      if (m[1].indexOf("fig--menue") >= 0) continue;              // déjà posé
      var fin = h.indexOf("</figure>", m.index);
      if (h.slice(m.index, fin).indexOf(nom) < 0) continue;
      var neuf = '<figure class="' + m[1] + ' fig--menue">';
      h = h.slice(0, m.index) + neuf + h.slice(m.index + m[0].length);
      bilan.menues++;
      break;
    }
  });
  if (h !== avant) fs.writeFileSync(fichier, h);
}

LANGUES.forEach(function (lg) {
  var oeuvres = path.join(DOCS, lg, "oeuvres", "index.html");
  if (fs.existsSync(oeuvres)) marquerRangs(oeuvres);

  var accueil = path.join(DOCS, lg, "index.html");
  if (fs.existsSync(accueil)) marquerCollide(accueil);

  ["america", "snow-on-her-lips"].forEach(function (slug) {
    var f = path.join(DOCS, lg, "productions", slug, "index.html");
    if (fs.existsSync(f)) marquerMenues(f);
  });
});

console.log("rangs marqués : " + bilan.rangs +
            " · aplats ramenés au filet : " + bilan.collide +
            " · images rendues à leur taille : " + bilan.menues);
