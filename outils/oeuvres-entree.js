/* /oeuvres/ : entrer dans les œuvres tout de suite.

   Constat du 09/09/2026, mesuré au navigateur : sur un écran de 900 px,
   la première image apparaissait à 661 px. Avant elle, six éléments de
   préambule — le grand 02, un titre d'affiche, le bloc de couleur
   « créations & productions », un chapeau, puis le bandeau de groupe et sa
   phrase d'explication. On arrivait sur une page de texte, pas sur des œuvres.

   Le manifeste a déjà sa page (/pourquoi/) et le bloc de couleur vit sur
   l'accueil. Ici, la page est un catalogue : le sur-titre, le titre, puis
   les œuvres. Les bandeaux de groupe gardent leur nom et perdent leur
   phrase — « À l'affiche » se comprend sans qu'on l'explique.

   node outils/oeuvres-entree.js                                            */
"use strict";
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..", "docs");
const LANGS = ["fr", "en", "es", "it", "zh", "de"];

function retirerBloc(s, ouverture) {
  // retire un <div> et son contenu en comptant les niveaux : les blocs
  // visés sont imbriqués, une expression rationnelle gloutonne emportait
  // la fermeture de la section entière.
  const i = s.indexOf(ouverture);
  if (i < 0) return s;
  let n = 0, j = i;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = i;
  let m;
  while ((m = re.exec(s))) {
    n += m[0] === "</div>" ? -1 : 1;
    if (n === 0) { j = m.index + m[0].length; break; }
  }
  return s.slice(0, i) + s.slice(j);
}

for (const l of LANGS) {
  const f = path.join(RACINE, l === "fr" ? "" : l, "oeuvres", "index.html");
  let s = fs.readFileSync(f, "utf8"), av = s;

  // 1. la section d'entrée passe en mode catalogue (marges réduites, titre plus petit)
  s = s.replace(/<section class="sec\s*"/, '<section class="sec sec--catalogue"');

  // 2. l'ornement chiffré, le bloc de couleur et le chapeau s'effacent
  s = retirerBloc(s, '<div class="num" aria-hidden="true">');
  s = retirerBloc(s, '<div class="collide">');
  s = s.replace(/<p class="lead">.*?<\/p>/s, "");

  // 3. les bandeaux de groupe perdent leur phrase d'explication
  s = s.replace(/<p class="oeu-groupe-s"[^>]*>.*?<\/p>/gs, "");

  if (s === av) { console.log(`  ${l} — rien à faire`); continue; }
  fs.writeFileSync(f, s);
  console.log(`  ${l} — entrée dégagée`);
}
