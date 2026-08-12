/* LA MESURE D'AUDIENCE, REMISE OÙ ELLE ÉTAIT.
   Signalé le 11/08/2026 : « 0 visites référencées sur Cloudflare ». Ce
   n'était pas un défaut de Cloudflare — la balise avait disparu du site.

   Elle avait été posée sur toutes les pages le 26/07 (241e6e3c). Le 27/07,
   la migration du prototype V2 vers le site (bf14d08a) a remplacé les pages
   par celles du prototype, qui ne l'avaient jamais eue. Depuis, aucune page
   ne la portait : la mesure s'est arrêtée ce jour-là, en silence, et rien ne
   pouvait le signaler puisqu'un compteur à zéro ressemble à un site sans
   visiteurs.

   La page introuvable, elle, l'avait gardée jusqu'à ce que je la réécrive
   avant-hier : je l'ai perdue là, et c'est le seul des 367 cas qui soit de
   mon fait.

   La balise se pose juste avant </body>, comme Cloudflare la fournit, et son
   jeton est celui du compte — relevé dans l'historique du dépôt, pas inventé.

   Les mentions légales décrivent déjà cet outil : sans cookie, sans
   identifiant persistant. La page disait vrai d'un outil qui ne tournait
   plus ; elle redevient exacte.

   Run: node outils/mesure.js [--verifier]                                   */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

var JETON = "f3dca4355e1c4362b402b3fa96218469";
var BALISE = "<!-- Cloudflare Web Analytics -->" +
  '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" ' +
  "data-cf-beacon='{\"token\": \"" + JETON + "\"}'></script>" +
  "<!-- End Cloudflare Web Analytics -->";

function fichiers(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") fichiers(p, a); return; }
    if (/\.html$/.test(e.name)) a.push(p);
  });
  return a;
}

var posées = 0, déjà = 0, sans = [];

fichiers(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf("cloudflareinsights") >= 0) { déjà++; return; }
  var i = h.lastIndexOf("</body>");
  if (i < 0) { sans.push(path.relative(DOCS, f)); return; }
  h = h.slice(0, i) + BALISE + "\n" + h.slice(i);
  posées++;
  if (!VERIF) fs.writeFileSync(f, h);
});

console.log("mesure d'audience : " + posées + " page(s) rééquipée(s), " + déjà +
  " déjà pourvue(s)" + (sans.length ? ", " + sans.length + " sans </body> : " + sans.join(", ") : ""));
