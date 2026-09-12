"use strict";
/* LES SIX CHIFFRES DE L'ACCUEIL — 12/09/2026.
 *
 * Sur téléphone, les six numéros de chapitre portaient exactement la même
 * taille : 72 px chacun, du 01 au 06, l'un sous l'autre. C'est la
 * répétition la plus visible du site, et c'est elle qu'on anticipe.
 *
 * Sur grand écran la variation existait déjà, mais elle venait d'un effet
 * de mise en page (sec--bleed, qui sort le chiffre de sa colonne) et cet
 * effet est lui-même enfermé au dessus de 900 px. En dessous, plus rien.
 *
 * Cet outil pose sur chaque section de l'accueil une classe sec--rang-NN
 * prise sur le chiffre qu'elle porte, pour que la feuille de style puisse
 * donner une échelle à chacun. La classe suit le chapitre, pas sa position
 * dans la page : si l'ordre des sections change un jour, l'échelle suit
 * son chapitre.
 *
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];

var posees = 0, pages = 0;

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* On avance section par section : pour chacune, on lit le premier
     .num qu'elle contient avant la section suivante. */
  var rx = /<section class="(sec[^"]*)"/g, m;
  var sorties = [];
  var dernier = 0;
  while ((m = rx.exec(h)) !== null) {
    sorties.push({ index: m.index, classes: m[1], fin: m.index + m[0].length });
  }
  for (var i = sorties.length - 1; i >= 0; i--) {
    var s = sorties[i];
    var borne = (i + 1 < sorties.length) ? sorties[i + 1].index : h.length;
    var bloc = h.slice(s.index, borne);
    if (/sec--rang-\d\d/.test(s.classes)) continue;            // déjà posée
    var num = bloc.match(/<div class="num"[^>]*>\s*(\d\d)\s*</);
    if (!num) continue;
    var neuf = '<section class="' + s.classes + ' sec--rang-' + num[1] + '"';
    h = h.slice(0, s.index) + neuf + h.slice(s.fin);
    posees++;
  }

  if (h !== avant) { fs.writeFileSync(f, h); pages++; }
});

console.log("classes de rang posées : " + posees + " sur " + pages + " accueil(s)");
