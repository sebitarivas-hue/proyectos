/* CE QUI NE SE TRADUIT PAS, DIT AUX MACHINES.
   Signalé le 11/08/2026 : la page allemande, relue à travers un traducteur
   automatique, annonçait « Saint Opéra ! ». Le mot « Saint » n'existe nulle
   part dans le site — le logo s'écrit « stop » puis « era! », en deux
   morceaux, et la machine y a lu l'abréviation de « Saint ». Le nom de la
   compagnie était traduit sous les yeux du visiteur.

   L'attribut translate="no" est fait pour cela : navigateurs et traducteurs
   automatiques laissent l'élément intact. On le pose sur ce qui est un nom
   propre et rien d'autre :

   — le logo, la marque de la barre, la signature du pied ;
   — tout élément dont les six versions de la mémoire sont identiques : si une
     phrase s'écrit pareil en français, en anglais, en espagnol, en italien,
     en chinois et en allemand, c'est un nom — d'œuvre, de personne, de lieu.

   Au passage, vingt-huit pages annonçaient encore aux lecteurs d'écran
   « STOPERA! — accueil du prototype » : en français sur les pages étrangères,
   et parlant d'un prototype qui n'existe plus depuis la migration.

   Run: node outils/intraduisible.js [--verifier]                            */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function lire(attrs, nom) {
  var m = attrs.match(new RegExp("\\s" + nom + '="([^"]*)"'));
  return m ? m[1] : null;
}

var logos = 0, noms = 0, prototypes = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* le libellé d'accessibilité de la marque : une seule forme, sans langue */
  h = h.replace(/aria-label="STOPERA! — accueil du prototype"/g, function () {
    prototypes++; return 'aria-label="STOPERA!"';
  });

  /* le logo, la marque, la signature */
  h = h.replace(/<h1>stop<span class="m">era!<\/span><\/h1>/g, function () {
    logos++; return '<h1 translate="no">stop<span class="m">era!</span></h1>';
  });
  h = h.replace(/<a class="brand" (?!translate=)/g, function () {
    logos++; return '<a class="brand" translate="no" ';
  });
  h = h.replace(/<h2>stopera!<\/h2>/g, function () {
    logos++; return '<h2 translate="no">stopera!</h2>';
  });

  /* un nom propre : les six langues l'écrivent pareil */
  h = h.replace(/<([a-z][a-z0-9]*)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*>/g, function (m, tag, attrs) {
    if (attrs.indexOf('translate="no"') >= 0) return m;
    var fr = lire(attrs, "data-fr");
    if (fr === null) return m;
    var vues = LANGS.map(function (l) { return lire(attrs, "data-" + l); })
      .filter(function (v) { return v !== null; });
    if (vues.length < LANGS.length) return m;          /* mémoire incomplète : on s'abstient */
    if (vues.some(function (v) { return v !== fr; })) return m;
    if (!/[A-Za-zÀ-ÿ]/.test(fr)) return m;
    noms++;
    return "<" + tag + attrs + ' translate="no">';
  });

  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("intraduisible : " + logos + " marques, " + noms + " noms propres, " +
  prototypes + " libellés « prototype » corrigés — " + touchees + " page(s)");
