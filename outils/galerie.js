/* LA FRESQUE DE PRODUCTION D'UNE ŒUVRE.
   Une fiche gagne sa fresque dès qu'un dossier porte son nom dans les
   ressources : /assets/projects/<slug>/. Les images y sont prises dans
   l'ordre du nom de fichier — c'est pourquoi les autres fiches les numérotent
   01-, 02-, 03-. L'affiche, si elle existe, n'entre pas dans la fresque :
   c'est un objet graphique, il a sa place ailleurs.

   La fresque est posée dans les cinq langues, avec l'intitulé que le site
   emploie déjà. Aucun traitement colorimétrique : le registre du point 05 ne
   porte que sur l'image principale, et les photos de plateau se lisent telles
   qu'elles ont été prises.

   Rien n'est écrit tant que les fichiers ne sont pas là : une fiche ne
   promet pas une image qu'elle n'a pas.

   Run: node outils/galerie.js [<slug>] [--verifier]                         */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var VERIF = process.argv.indexOf("--verifier") > 0;
var CIBLE = process.argv.slice(2).filter(function (a) { return a.indexOf("--") !== 0; })[0];

var INTITULE = {
  fr: "Documents de production", en: "Production documents",
  es: "Documentos de producción", it: "Documenti di produzione", zh: "制作资料"
};

function titreDe(h) {
  var m = h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
}
function esc(s) { return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

/* Écrire demande un nom d'œuvre. Sans lui, l'outil ne fait que constater :
   un balayage aveugle sur toutes les fiches restructurerait des pages qui
   n'ont rien demandé. */
if (!CIBLE && !VERIF) {
  console.log("Indiquez l'œuvre : node outils/galerie.js <slug>");
  console.log("Sans nom, seul --verifier est permis.");
  process.exit(1);
}

var dossiers = fs.readdirSync(path.join(DOCS, "assets", "projects"), { withFileTypes: true })
  .filter(function (e) { return e.isDirectory(); })
  .map(function (e) { return e.name; })
  .filter(function (s) { return !CIBLE || s === CIBLE; });

var posees = 0, images = 0;

dossiers.forEach(function (slug) {
  var dir = path.join(DOCS, "assets", "projects", slug);
  var fichiers = fs.readdirSync(dir)
    .filter(function (n) { return /\.(jpe?g|png|webp)$/i.test(n); })
    .filter(function (n) { return !/affiche|poster|keyart/i.test(n); })
    .sort();
  if (!fichiers.length) return;

  LANGS.forEach(function (lang) {
    var f = path.join(DOCS, lang === "fr" ? "" : lang, "productions", slug, "index.html");
    if (!fs.existsSync(f)) return;
    var h = fs.readFileSync(f, "utf8");
    var titre = titreDe(h) || slug;

    var fresque = '<div class="gal"><p class="gal-k">' + INTITULE[lang] + "</p>" +
      '<div class="gal-g">' + fichiers.map(function (n) {
        return '<figure class="gal-i"><img src="/assets/projects/' + slug + "/" + n +
          '" alt="' + esc(titre) + '" loading="lazy" /></figure>';
      }).join("") + "</div></div>";

    var avant = h;
    /* Les deux vocabulaires coexistent : les fiches françaises composées
       disent « gal », celles reprises du site disent « pd-gallery ». On
       remplace celle qui est là — en ajouter une seconde ferait dire deux
       fois la même chose à la page. */
    if (/<div class="gal">[\s\S]*?<\/div><\/div>/.test(h)) {
      h = h.replace(/<div class="gal">[\s\S]*?<\/div><\/div>/, fresque);
    } else if (/<div class="[^"]*\bpd-gallery\b[^"]*">[\s\S]*?<\/div>/.test(h)) {
      h = h.replace(/<div class="[^"]*\bpd-gallery\b[^"]*">[\s\S]*?<\/div>/, fresque);
    } else {
      var ancre = h.lastIndexOf('<a class="more"');
      if (ancre < 0) ancre = h.indexOf('<footer class="foot">');
      h = h.slice(0, ancre) + fresque + h.slice(ancre);
    }
    if (h === avant) return;
    posees++; images += fichiers.length;
    if (!VERIF) fs.writeFileSync(f, h);
  });

  console.log("  " + slug + " : " + fichiers.length + " image(s)");
});

console.log((VERIF ? "fresque à poser sur : " : "fresque posée sur : ") + posees +
  " page(s), " + images + " image(s) au total");
