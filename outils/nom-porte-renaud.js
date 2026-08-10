/* « - porte renaud - » — le nom, tel qu'il s'écrit.
   J'avais pris cette graphie pour un défaut de données et l'avais « corrigée »
   en la forme prénom-nom capitalisée à la source, sur tout le site. C'était le nom d'artiste,
   choisi : minuscules, encadré de tirets. L'ancien site l'écrivait ainsi 323
   fois et n'employait jamais l'autre forme. Le slug de sa fiche le dit
   d'ailleurs depuis toujours : /artists/porte-renaud/.

   Cette règle remet la graphie partout — dans le texte affiché comme dans les
   attributs de traduction, dans les cinq langues, et dans les fichiers de
   données. Elle laisse le slug tranquille : une adresse n'est pas un nom.

   Run: node outils/nom-porte-renaud.js [--verifier]                         */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.resolve(__dirname, "..");
var VERIF = process.argv.indexOf("--verifier") > 0;

var NOM = "- porte renaud -";
/* les graphies que j'avais introduites, y compris capitalisées par le contenu */
/* Les motifs sont CONSTRUITS, jamais écrits en toutes lettres : à la première
   exécution, ce fichier s'était substitué à lui-même et ses expressions
   régulières ne cherchaient plus que la graphie déjà juste. */
var P = String.fromCharCode(80,111,114,116,101);      /* P-o-r-t-e */
var R = String.fromCharCode(82,101,110,97,117,100);   /* R-e-n-a-u-d */
var FAUTIVES = [new RegExp(R + ' ' + P, 'g'),
                new RegExp(R.toUpperCase() + ' ' + P.toUpperCase(), 'g'),
                new RegExp(R.toLowerCase() + ' ' + P.toLowerCase(), 'g')];

function fichiers(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === ".git" || e.name === "node_modules" || e.name === "assets") return;
      fichiers(p, a); return;
    }
    if (path.resolve(p) === path.resolve(__filename)) return;   /* jamais soi-même */
    if (/\.(html|js|json|css)$/.test(e.name)) a.push(p);
  });
  return a;
}

var total = 0, touches = 0;

fichiers(ROOT).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h, n = 0;
  FAUTIVES.forEach(function (re) {
    h = h.replace(re, function () { n++; return NOM; });
  });
  /* on ne double jamais les tirets si la graphie était déjà juste */
  h = h.replace(/-\s*-\s*porte renaud\s*-\s*-/g, NOM);
  if (h !== avant) {
    total += n; touches++;
    console.log("  " + path.relative(ROOT, f) + " : " + n);
    if (!VERIF) fs.writeFileSync(f, h);
  }
});

console.log((VERIF ? "à remettre : " : "graphie rétablie : ") + total +
  " occurrence(s) sur " + touches + " fichier(s)");
