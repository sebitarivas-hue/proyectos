/* CE QUE LA COMPOSITION AVAIT LAISSÉ DERRIÈRE ELLE.
   Les fiches d'œuvres françaises ont été composées à la main à partir d'un
   sous-ensemble des données : elles ont perdu des blocs entiers que leur
   version publiée portait — la revue de presse, les financeurs, les
   partenaires. Les quatre autres langues, composées à partir des pages
   publiées, les avaient gardés. Une même œuvre n'avait donc pas le même
   contenu selon la langue.

   La règle : une fiche française porte tous les blocs que portait sa version
   publiée. Un bloc n'est rétabli que si son intitulé n'a pas déjà son
   équivalent dans la fiche — les deux vocabulaires (.pd-block et .meta)
   nomment les mêmes choses, il ne s'agit pas de les empiler.

   Le contenu est repris tel quel, attributs data-<lang> compris : aucune
   citation réécrite, aucune traduction refaite.

   Run: node outils/blocs-fiches.js [--verifier]                             */
"use strict";
var fs = require("fs"), path = require("path"), cp = require("child_process");
var ROOT = path.resolve(__dirname, "..");
var DOCS = path.join(ROOT, "docs");
var SOURCE = "origin/claude/brave-ride-ftbrhu";     /* le site français d'avant la V2 */
var VERIF = process.argv.indexOf("--verifier") > 0;

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
var nu = s => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase();

/* tous les blocs d'une page, avec leur intitulé */
function blocs(h) {
  var out = [], re = /<div class="[^"]*\bpd-block\b[^"]*">/g, m;
  while ((m = re.exec(h))) {
    var deb = m.index, ouvre = deb + m[0].length, fin = finDiv(h, ouvre);
    if (fin < 0) continue;
    var corps = h.slice(ouvre, fin);
    var t = corps.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/);
    out.push({ titre: t ? nu(t[1]) : "", html: h.slice(deb, fin) });
    re.lastIndex = fin;
  }
  return out;
}
/* les intitulés déjà présents, dans les deux vocabulaires */
function titresPresents(h) {
  var t = [];
  (h.match(/<h[234][^>]*>[\s\S]*?<\/h[234]>/g) || []).forEach(function (x) { t.push(nu(x)); });
  return t;
}

var routes = [];
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); return; }
    if (e.name === "index.html") routes.push(path.relative(DOCS, d).split(path.sep).join("/"));
  });
})(path.join(DOCS, "productions"));

var fiches = 0, total = 0;

routes.forEach(function (r) {
  var cible = path.join(DOCS, r, "index.html");
  var h = fs.readFileSync(cible, "utf8");
  var ancien;
  try {
    ancien = cp.execSync("git show " + SOURCE + ":docs/" + r + "/index.html",
      { cwd: ROOT, maxBuffer: 1 << 24 }).toString();
  } catch (_) { return; }

  var deja = titresPresents(h);
  var manquants = blocs(ancien).filter(function (b) {
    return b.titre && deja.indexOf(b.titre) < 0;
  });
  if (!manquants.length) return;

  fiches++; total += manquants.length;
  console.log("  " + r + " ← " + manquants.map(b => b.titre).join(" · "));
  if (VERIF) return;

  var ancre = h.lastIndexOf('<a class="more"');
  if (ancre < 0) ancre = h.indexOf('<footer class="foot">');
  fs.writeFileSync(cible, h.slice(0, ancre) + manquants.map(b => b.html).join("") + h.slice(ancre));
});

console.log((VERIF ? "à rétablir : " : "blocs rétablis : ") + total +
  " sur " + fiches + " fiche(s)");
