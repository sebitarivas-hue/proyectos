/* LES IMAGES D'EINSTEIN, QUAND ELLES SERONT LÀ.
   La fiche a été écrite sans image : celles qui circulaient étaient
   © Prensa Teatro Colón et n'avaient pas été cédées. STOPERA! dispose des
   visuels — il ne reste qu'à les déposer.

   Cet outil ne fabrique rien. Il regarde deux endroits et pose ce qu'il y
   trouve, sur les six langues :

     docs/assets/projects/einstein.jpg          l'image principale
       → la carte de l'index des œuvres, et le grand plan de la fiche
     docs/assets/projects/einstein/*.jpg        la galerie
       → le bloc « Documents de production » de la fiche

   Tant que rien n'est déposé, il ne touche à rien et le dit.

   Le traitement chromatique n'est pas de son ressort : outils/registre.js
   pose le filtre d'après la route — magenta pour une œuvre, brut pour une
   actualité — et il faut le relancer après. C'est la règle du point 05 de la
   DA : le traitement dit la section, jamais l'image.

   Run: node outils/einstein-images.js [--verifier]                          */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];
var SLUG = "productions/einstein-on-the-beach";
var TITRE = "Einstein on the Beach";

var PRINCIPALE = path.join(DOCS, "assets", "projects", "einstein.jpg");
var DOSSIER = path.join(DOCS, "assets", "projects", "einstein");

var GAL_K = {
  fr: "Documents de production", en: "Production documents", es: "Documentos de producción",
  it: "Documenti di produzione", zh: "制作资料", de: "Produktionsunterlagen"
};
function mem(t) {
  return LANGS.map(function (l) { return ' data-' + l + '="' + t[l] + '"'; }).join("");
}

var aPrincipale = fs.existsSync(PRINCIPALE);
var galerie = fs.existsSync(DOSSIER)
  ? fs.readdirSync(DOSSIER).filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f); }).sort()
  : [];

if (!aPrincipale && !galerie.length) {
  console.log("aucune image déposée — rien n'est posé.");
  console.log("  attendus : docs/assets/projects/einstein.jpg (l'image principale)");
  console.log("             docs/assets/projects/einstein/*.jpg (la galerie)");
  process.exit(0);
}

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var plans = 0, cartes = 0, galeries = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* le grand plan, après le chapeau de la fiche */
  if (route === SLUG && aPrincipale && h.indexOf("projects/einstein.jpg") < 0) {
    var fin = h.indexOf("</section>");
    if (fin > 0) {
      fin += "</section>".length;
      h = h.slice(0, fin) + '<figure class="fig-full"><img src="/assets/projects/einstein.jpg" alt="' +
        TITRE + '" /></figure>' + h.slice(fin);
      plans++;
    }
  }

  /* la galerie, avant le bloc de presse */
  if (route === SLUG && galerie.length && h.indexOf('class="gal"') < 0) {
    var p = h.indexOf('<div class="pd-block pd-full pd-press">');
    if (p > 0) {
      h = h.slice(0, p) + '<div class="gal"><p class="gal-k"' + mem(GAL_K) + ">" + GAL_K[lang] + "</p>" +
        '<div class="gal-g">' + galerie.map(function (g) {
          return '<figure class="gal-i"><img src="/assets/projects/einstein/' + g +
            '" alt="' + TITRE + '" loading="lazy" /></figure>';
        }).join("") + "</div></div>" + h.slice(p);
      galeries++;
    }
  }

  /* la carte de l'index, qui n'avait pas d'image */
  if (route === "oeuvres" && aPrincipale) {
    var c = h.indexOf('<a href="' + (lang === "fr" ? "/" : "/" + lang + "/") + SLUG + '/">');
    if (c > 0 && h.slice(c, c + 300).indexOf("oeu-img") < 0) {
      var ins = h.indexOf(">", c) + 1;
      h = h.slice(0, ins) + '<figure class="oeu-img"><img src="/assets/projects/einstein.jpg" alt="' +
        TITRE + '" loading="lazy" /></figure>' + h.slice(ins);
      cartes++;
    }
  }

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("images d'Einstein : " + plans + " grand(s) plan(s), " + galeries +
  " galerie(s) de " + galerie.length + " image(s), " + cartes + " carte(s) — " +
  touchées + " page(s)");
console.log("  à relancer ensuite : node outils/registre.js (le filtre magenta des œuvres)");
