"use strict";
/* CINQ RETOUCHES ÉDITORIALES, BRIEF DU 21/08.
 *
 * Le français change ; les cinq autres langues ne sont pas retraduites ici
 * — seule leur mémoire data-fr (utilisée par les autres pages, jamais
 * affichée chez elles) est mise à jour, pour que le français y reste
 * cohérent. Le texte qu'elles affichent, dans leur propre langue, ne bouge
 * pas : ce n'était pas la demande.
 *
 * Chaque remplacement est une chaîne exacte, trouvée une fois sur la page
 * française (attribut ET contenu visible, identiques) et une fois par
 * attribut data-fr sur les cinq autres. Idempotent par construction : si
 * l'ancien texte n'est plus là, rien ne se passe une seconde fois.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];

var REMPLACEMENTS = [
  {
    nom: "titre",
    avant: "Les formes scéniques traversent aujourd'hui une profonde transformation.",
    apres: "Les formes scéniques changent."
  },
  {
    nom: "positionnement",
    avant: "STOPERA! est une compagnie et un collectif : une infrastructure légère de recherche et de création dédiée aux nouvelles écritures de la scène musicale contemporaine.",
    apres: "STOPERA! est une plateforme indépendante de recherche et de création, dédiée aux nouvelles écritures de la scène musicale contemporaine."
  },
  {
    nom: "redondance « plus qu'une compagnie »",
    avant: "Plus qu'une compagnie, STOPERA! est un espace où les œuvres se développent",
    apres: "STOPERA! est un espace où les œuvres se développent"
  },
  {
    nom: "paragraphe final",
    avant: "STOPERA! contribue au renouvellement des écritures scéniques contemporaines et à l'émergence d'un espace de recherche partagé entre création artistique, innovation et société.",
    apres: "STOPERA! contribue au renouvellement des écritures scéniques contemporaines et crée des espaces de recherche et de partage entre artistes, chercheurs, institutions et publics."
  }
];

var touches = { titre: 0, positionnement: 0, "redondance « plus qu'une compagnie »": 0, "paragraphe final": 0 };

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "pourquoi", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;
  REMPLACEMENTS.forEach(function (r) {
    if (h.indexOf(r.avant) < 0) return;
    h = h.split(r.avant).join(r.apres);
    touches[r.nom]++;
  });
  if (h !== avant) fs.writeFileSync(f, h);
});

Object.keys(touches).forEach(function (nom) {
  console.log("  " + nom + " : " + touches[nom] + " occurrence(s) changée(s)");
});
