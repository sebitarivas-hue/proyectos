"use strict";
/* LE PRÉCHARGEMENT DE LA SCÈNE.
 *
 * Le bandeau titre porte la bande basse de la scène d'Einstein en fond CSS.
 * Un fond CSS n'est découvert qu'une fois la feuille de style lue et
 * l'élément mis en page : sur une connexion lente le bandeau reste noir un
 * instant avant que la scène n'apparaisse. La balise de préchargement la fait
 * demander en même temps que la feuille elle-même.
 *
 * Elle ne se pose que là où le bandeau existe — les six pages d'accueil.
 * Ailleurs elle ferait télécharger une image que la page n'affiche jamais.
 *
 * Idempotent, et il retire les balises qui pointent vers une autre image :
 * le jour où le bandeau change de photo, l'ancienne cesse d'être demandée.
 * À rejouer après versions.js, dont il suit la balise.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");

var IMAGE = "/assets/projects/einstein/scene-bandeau.jpg";
var BALISE = '<link rel="preload" as="image" fetchpriority="high" href="' + IMAGE + '" />';
var TOUTE = /\n?<link rel="preload" as="image"[^>]*>/g;
/* la balise de la fonte, posée par versions.js : la nôtre se range après */
var APRES = /<link rel="preload" as="font"[^>]*>/;

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

if (!fs.existsSync(path.join(DOCS, IMAGE.replace(/^\//, "")))) {
  console.error("préchargement du bandeau : " + IMAGE + " est introuvable, rien posé");
  process.exit(1);
}

var poses = 0, retires = 0, sans = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;
  var bandeau = h.indexOf('<header class="mast"') >= 0;
  var juste = h.indexOf('as="image" fetchpriority="high" href="' + IMAGE + '"') >= 0;

  if (!bandeau || !juste) {
    /* on part d'une page nette : toute balise d'image préchargée s'en va */
    var n = (h.match(TOUTE) || []).length;
    if (n) { h = h.replace(TOUTE, ""); retires += n; }
  }
  if (bandeau && !juste) {
    if (!APRES.test(h)) { sans++; }
    else { h = h.replace(APRES, function (m) { return m + "\n" + BALISE; }); poses++; }
  }
  if (h !== avant) fs.writeFileSync(f, h);
});

console.log("préchargement du bandeau : " + poses + " posé(s), " + retires +
  " ancienne(s) balise(s) retirée(s)" +
  (sans ? ", " + sans + " page(s) sans balise de fonte où se ranger" : ""));
