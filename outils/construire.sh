#!/bin/sh
# L'ORDRE DE CONSTRUCTION.
# Les outils ne sont pas commutatifs : la mémoire se pose avant que l'arbre
# allemand n'en soit déduit, et les pièces communes — barre, pied, sélecteur,
# hreflang — se reposent après, sur les 360 pages, allemand compris.
#
# À rejouer depuis un docs/ propre :  git checkout -- docs && rm -rf docs/de
# Usage : sh outils/construire.sh
set -e
cd "$(dirname "$0")/.."

node outils/allemand.js      # mémoire data-de + les 60 pages allemandes
node outils/collide.js       # « créations & productions », six langues
node outils/allemand-registre.js # Kreation, pas Schöpfung
node outils/marque-icone.js  # « So! » aplati en icône d'onglet
node outils/logo.js          # « So! » dans la barre, l'icône dans l'onglet
node outils/hero-doublon.js  # le second menu sous le hero s'en va
node outils/hero-nom.js      # le nom se coupe après « stop », plus après « st »
node outils/mentions.js      # doublon, lien cassé, entité en clair
node outils/etiquettes.js  # les dernières étiquettes restées en français
node outils/ponctuation.js # guillemets et espaces, dans la langue de chacun
node outils/lips-editions.js # les dates du LIPS, la cadence retirée
node outils/lips-historique.js # le bloc des quatre éditions
node outils/section.js       # data-section sur <body>
node outils/nav.js           # le fil des rangs
node outils/pied.js          # le pied de page
node outils/selecteur.js     # le sélecteur de langue, dans la barre
node outils/hreflang.js      # les alternates et le canonique
node outils/titres.js        # les titres d'onglet
node outils/intraduisible.js # le nom propre, protégé des traducteurs
node outils/versions.js      # le jeton anti-cache, calculé sur le contenu
node outils/page-404.js      # la page introuvable, aux couleurs du site

node - <<'JS'
/* le plan du site, relevé sur le disque */
var fs = require("fs"), path = require("path"), DOCS = "docs", a = [];
(function w(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") w(p); return; }
    if (e.name === "index.html") {
      var r = path.relative(DOCS, d).split(path.sep).join("/");
      a.push(r === "." ? "" : r + "/");
    }
  });
})(DOCS);
a.sort();
fs.writeFileSync("docs/sitemap.xml", ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(a.map(function (r) { return "  <url><loc>https://stopera.art/" + r + "</loc></url>"; }))
  .concat(["</urlset>", ""]).join("\n"));
console.log("plan du site : " + a.length + " adresses");
JS
