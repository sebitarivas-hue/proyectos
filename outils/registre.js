/* LE REGISTRE DES IMAGES — point 05 de la DA.
   Le traitement porte l'information : magenta = œuvres, cyan = laboratoire,
   noir et blanc = portraits, brut = archives et presse. Ce n'est pas une
   décoration, c'est une signalétique : une photo dit à quelle section elle
   appartient avant qu'on ait lu la légende.

   Le registre avait été posé à la main sur l'arbre français seulement.
   112 images des quatre autres langues n'avaient aucun traitement — la même
   photo était magenta en français et brute en italien.

   La règle est le contexte de la page, jamais l'image : c'est la seule façon
   qu'elle tienne quand une image est réutilisée ailleurs.

   Run: node outils/registre.js [--verifier]                                 */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

/* le contexte de route décide, dans l'ordre */
var REGLES = [
  [/\/artists\//, "im-portrait"],
  [/\/news\/|\/presse(\/|$)/, "im-brut"],
  [/\/laboratoire(\/|$)|\/lips(\/|$)|\/recherche\//, "im-labo"],
  [/\/productions\/|\/oeuvres(\/|$)|\/parcours\//, "im-oeuvres"],
];
var DEFAUT = "im-oeuvres";

function routeOf(file) {
  return "/" + path.relative(DOCS, path.dirname(file)).split(path.sep).join("/") + "/";
}
function registre(route) {
  for (var i = 0; i < REGLES.length; i++) if (REGLES[i][0].test(route)) return REGLES[i][1];
  return DEFAUT;
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

/* Sur une fiche d'œuvre, le registre porte l'information sur L'IMAGE
   PRINCIPALE — celle qui annonce l'œuvre, la première de la page. Les
   vignettes qui suivent sont une fresque de photos de plateau : elles se
   lisent telles qu'elles ont été prises, sans traitement.
   La règle est l'ordre, pas le conteneur : un conteneur se renomme, l'ordre
   d'une page ne ment pas. */
function unique(route) { return /\/productions\//.test(route); }

var posees = 0, touchees = 0, sans = [], nettoyees = 0;

pages(DOCS).forEach(function (f) {
  var route = routeOf(f), veut = registre(route);
  var h = fs.readFileSync(f, "utf8");
  var i = h.indexOf("<body"), n = 0;
  var head = h.slice(0, i), body = h.slice(i);

  var rang = 0;
  body = body.replace(/<img\b[^>]*>/g, function (t) {
    if (/logo-dark|favicon/.test(t)) return t;          /* la marque n'est pas une image de contenu */
    /* L'image principale d'une œuvre vit directement dans /assets/projects/ ;
       ce qui est rangé dans un sous-dossier est une vignette ou une affiche —
       l'affiche est un objet graphique, elle ne se filtre pas non plus. */
    var src = (t.match(/src="([^"]*)"/) || [, ""])[1];
    var principale = /^\/assets\/projects\/[^/]+$/.test(src.split("?")[0]);
    rang += principale ? 1 : 0;
    if (unique(route) && (!principale || rang > 1)) {   /* vignette : aucun traitement */
      var nu = t.replace(/\s*\bim-[a-z]+/g, "").replace(/class="\s*"/, "");
      if (nu !== t) { nettoyees++; n++; }
      return nu;
    }
    if (/\bim-[a-z]+/.test(t)) return t;                /* déjà inscrite au registre */
    n++;
    if (VERIF) { sans.push(route + " — " + (t.match(/src="([^"]*)"/) || [, "?"])[1]); return t; }
    return /\bclass="/.test(t)
      ? t.replace(/\bclass="/, 'class="' + veut + " ")
      : t.replace(/^<img\b/, '<img class="' + veut + '"');
  });

  if (n && !VERIF) { fs.writeFileSync(f, head + body); posees += n; touchees++; }
  else if (n) posees += n;
});

if (VERIF) {
  console.log("images sans traitement : " + posees);
  sans.slice(0, 20).forEach(function (s) { console.log("  " + s); });
} else {
  console.log("registre posé sur " + posees + " image(s), " + touchees + " page(s) ; " +
    nettoyees + " vignette(s) rendue(s) au brut");
}
