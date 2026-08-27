"use strict";
/* LA PAGE POURQUOI N'AVAIT AUCUNE IMAGE.
 *
 * Six rangs sur le site, cinq portent des photographies — le seul qui n'en
 * porte aucune est celui qui explique pourquoi le site existe. Le texte cite
 * déjà trois œuvres (OOO, We Expected…, Otages) sans jamais les montrer.
 *
 * Le motif .projects/.ptile existe déjà ailleurs sur le site (parcours,
 * réseau) : une vignette image, un voile, un titre. On ne l'invente pas
 * ici, on le pose là où il manquait — exactement le motif déjà validé,
 * mêmes classes, même dégradé.
 *
 * Idempotent : cherche la marque avant de la reposer.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];

/* Ancre indépendante de la langue affichée : chaque page porte les six
   langues dans ses attributs data-*, et data-fr y figure toujours en
   premier — cette chaîne marque donc le début du paragraphe qui SUIT
   celui où OOO, We Expected… et Otages sont cités, quel que soit le
   texte visible sur la page.
   (Une première version ancrait sur « STOPERA! produit des œuvres »,
   qui ouvre un paragraphe bien plus tôt dans le document — le triptyque
   tombait juste après « Notre ambition », pas après les trois œuvres.) */
var ANCRE = '<p data-fr="Autour de <a href=';
var MARQUE = "pourquoi-triptyque";

var TRIPTYQUE =
  '\n          <ul class="projects thread-grid" data-' + MARQUE + '="1">' +
  '<li class="project"><a class="ptile" href="../productions/ooo/">' +
    '<span class="ptile-img" style="background-image:url(\'/assets/projects/ooo.jpg\')"></span>' +
    '<span class="ptile-scrim"></span><span class="ptile-meta">' +
    '<span class="ptile-title" data-fr="OOO" data-es="OOO" data-en="OOO" data-it="OOO" data-zh="OOO" data-de="OOO" translate="no">OOO</span>' +
    '<span class="ptile-year">2025</span></span></a></li>' +
  '<li class="project"><a class="ptile" href="../productions/salamandres/">' +
    '<span class="ptile-img" style="background-image:url(\'/assets/projects/salamandres.jpg\')"></span>' +
    '<span class="ptile-scrim"></span><span class="ptile-meta">' +
    '<span class="ptile-title" data-fr="We Expected the Disaster… &lt;span class=&quot;it&quot;&gt;but not the salamanders!&lt;/span&gt;" ' +
    'data-es="We Expected the Disaster… &lt;span class=&quot;it&quot;&gt;but not the salamanders!&lt;/span&gt;" ' +
    'data-en="We Expected the Disaster… &lt;span class=&quot;it&quot;&gt;but not the salamanders!&lt;/span&gt;" ' +
    'data-it="We Expected the Disaster… &lt;span class=&quot;it&quot;&gt;but not the salamanders!&lt;/span&gt;" ' +
    'data-zh="We Expected the Disaster… &lt;span class=&quot;it&quot;&gt;but not the salamanders!&lt;/span&gt;" ' +
    'data-de="We Expected the Disaster… &lt;span class=&quot;it&quot;&gt;but not the salamanders!&lt;/span&gt;" translate="no">' +
    'We Expected the Disaster… <span class="it">but not the salamanders!</span></span>' +
    '<span class="ptile-year">2027</span></span></a></li>' +
  '<li class="project"><a class="ptile" href="../productions/otages/">' +
    '<span class="ptile-img" style="background-image:url(\'/assets/projects/otages.jpg\')"></span>' +
    '<span class="ptile-scrim"></span><span class="ptile-meta">' +
    '<span class="ptile-title" data-fr="Otages" data-es="Otages" data-en="Otages" data-it="Otages" data-zh="Otages" data-de="Otages" translate="no">Otages</span>' +
    '<span class="ptile-year">2024</span></span></a></li>' +
  '</ul>';

var poses = 0, deja = 0, sans = 0;

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "pourquoi", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf('data-' + MARQUE + '="1"') >= 0) { deja++; return; }
  var i = h.indexOf(ANCRE);
  if (i < 0) { sans++; console.log("  " + f + " : ancre introuvable, page laissée telle quelle"); return; }
  h = h.slice(0, i) + TRIPTYQUE + "\n          " + h.slice(i);
  fs.writeFileSync(f, h);
  poses++;
});

console.log("triptyque pourquoi : " + poses + " page(s) posée(s), " + deja + " déjà en place, " + sans + " sans ancre");
