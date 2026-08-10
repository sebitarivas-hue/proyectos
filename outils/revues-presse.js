/* LES REVUES DE PRESSE DES FICHES FRANÇAISES.
   Trois fiches — Otages, OOO, Snow on Her Lips — avaient perdu leur revue de
   presse. Pas les autres langues : elles sont composées à partir des pages
   publiées, qui la portaient. Les fiches françaises, elles, ont été composées
   à la main à partir d'un sous-ensemble des données, et la presse n'en
   faisait pas partie. Treize citations et un lien de téléchargement ont
   disparu au passage.

   Le contenu est repris tel quel de la version française publiée (branche
   claude/brave-ride-ftbrhu) : aucune citation n'est réécrite, aucune n'est
   retraduite — les attributs data-<lang> d'origine sont conservés.

   Usage :
     git show <ref>:docs/<route>/index.html  →  bloc de presse extrait
     node outils/revues-presse.js [--verifier]                              */
"use strict";
var fs = require("fs"), path = require("path"), cp = require("child_process");
var ROOT = path.resolve(__dirname, "..");
var DOCS = path.join(ROOT, "docs");
var SOURCE = "origin/claude/brave-ride-ftbrhu";      /* le site français d'avant la V2 */
var VERIF = process.argv.indexOf("--verifier") > 0;

/* fin de l'élément <div> ouvert en `from`, en suivant la profondeur */
function finDiv(h, from) {
  var d = 0, i = from;
  while (i < h.length) {
    var a = h.indexOf("<div", i), b = h.indexOf("</div>", i);
    if (b < 0) return -1;
    if (a >= 0 && a < b) { d++; i = a + 4; continue; }
    if (d === 0) return b + 6;
    d--; i = b + 6;
  }
  return -1;
}

function blocPresse(html) {
  /* le bloc se reconnaît à sa classe pd-press, qui accompagne pd-block —
     chercher « pd-block" » exactement le manquait, la classe étant composée */
  var j = html.search(/<div class="[^"]*\bpd-press\b[^"]*">/);
  if (j < 0) {
    var i = html.indexOf('<blockquote class="pdq"');
    if (i < 0) return null;
    j = html.lastIndexOf("<div class=", i);
    if (j < 0) return null;
  }
  var ouvre = html.indexOf(">", j) + 1;
  var k = finDiv(html, ouvre);
  return k < 0 ? null : html.slice(j, k);
}

var routes = [];
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); return; }
    if (e.name === "index.html") routes.push(path.relative(DOCS, d).split(path.sep).join("/"));
  });
})(path.join(DOCS, "productions"));

var poses = 0, citations = 0;

routes.forEach(function (r) {
  var cible = path.join(DOCS, r, "index.html");
  var h = fs.readFileSync(cible, "utf8");
  if (h.indexOf('class="pdq"') >= 0) return;          /* la fiche l'a déjà */

  var ancien;
  try { ancien = cp.execSync("git show " + SOURCE + ":docs/" + r + "/index.html",
    { cwd: ROOT, maxBuffer: 1 << 24 }).toString(); } catch (_) { return; }

  var bloc = blocPresse(ancien);
  if (!bloc) return;

  /* deux formes coexistent : la citation en exergue et la référence */
  var n = (bloc.match(/class="(?:pdq|press-ref)"/g) || []).length;
  citations += n; poses++;
  console.log("  " + r + " : " + n + " citation(s)" +
    (bloc.indexOf("revue-presse.pdf") >= 0 ? " + la revue en PDF" : ""));

  if (VERIF) return;

  /* le bloc se pose en fin de contenu, avant le retour à l'index */
  var ancre = h.lastIndexOf('<a class="more"');
  if (ancre < 0) ancre = h.indexOf('<footer class="foot">');
  fs.writeFileSync(cible, h.slice(0, ancre) + bloc + h.slice(ancre));
});

console.log((VERIF ? "à rétablir : " : "revues de presse rétablies : ") + poses +
  " fiche(s), " + citations + " citation(s)");
