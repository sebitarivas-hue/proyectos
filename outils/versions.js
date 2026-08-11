/* LE JETON ANTI-CACHE, CALCULÉ ET NON PLUS ÉCRIT À LA MAIN.
   Signalé le 11/08/2026 : « le site mobile n'inclut pas la police Neutrix ».
   La police est bien là, et se charge — mais le navigateur du téléphone ne
   voyait pas la même feuille de style que celui du bureau.

   Les pages appelaient /styles.css?v=c2c2cbd9. Ce jeton avait été écrit une
   fois, à la main, et n'avait plus bougé — alors que la feuille, elle, avait
   changé plusieurs fois depuis. Une adresse identique pour un contenu
   différent : le navigateur qui avait déjà la feuille en cache n'allait plus
   jamais la rechercher. Selon l'ancienneté du cache, chaque appareil voyait
   une version différente du site.

   /assets/fonts/fonts.css, lui, n'avait aucun jeton du tout — c'est le
   fichier qui déclare Neutrix. Un téléphone l'ayant mis en cache avant que
   Neutrix n'y soit ajoutée ne l'a jamais redemandé : d'où une page composée
   dans la police de repli, sur ce téléphone-là seulement.

   Le jeton est désormais l'empreinte du fichier. Il change quand le contenu
   change, et lui seul. Cet outil se relance à chaque construction.

   Au passage, Neutrix est préchargée : elle porte tous les titres du site, et
   sur une connexion mobile lente le texte s'affichait d'abord dans la police
   de repli avant de basculer.

   Run: node outils/versions.js [--verifier]                                 */
"use strict";
var fs = require("fs"), path = require("path"), crypto = require("crypto");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

function empreinte(f) {
  return crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex").slice(0, 8);
}
var VS = empreinte(path.join(DOCS, "styles.css"));
var VF = empreinte(path.join(DOCS, "assets", "fonts", "fonts.css"));

/* Neutrix porte tous les titres : elle est demandée avant tout le reste.
   crossorigin est obligatoire pour une fonte, même servie par le même hôte. */
var PRECHARGE = '<link rel="preload" as="font" type="font/woff2" crossorigin ' +
  'href="/assets/fonts/Neutrix-Regular.woff2" />';

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var styles = 0, fontes = 0, precharges = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;

  h = h.replace(/href="\/styles\.css(\?v=[0-9a-f]+)?"/g, function (m) {
    if (m.indexOf(VS) < 0) styles++;
    return 'href="/styles.css?v=' + VS + '"';
  });
  h = h.replace(/href="\/assets\/fonts\/fonts\.css(\?v=[0-9a-f]+)?"/g, function (m) {
    if (m.indexOf(VF) < 0) fontes++;
    return 'href="/assets/fonts/fonts.css?v=' + VF + '"';
  });

  if (h.indexOf('href="/assets/fonts/Neutrix-Regular.woff2"') < 0) {
    var i = h.indexOf('<link rel="stylesheet" href="/assets/fonts/fonts.css');
    if (i >= 0) { h = h.slice(0, i) + PRECHARGE + "\n" + h.slice(i); precharges++; }
  }

  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("jetons : styles.css=" + VS + " (" + styles + " à jour), fonts.css=" + VF +
  " (" + fontes + " à jour) · préchargement posé : " + precharges + " — " +
  touchees + " page(s)");
