/* LA PAGE INTROUVABLE REJOINT LE SITE.
   Elle n'appelait ni la feuille de style ni les polices : elle portait son
   propre style en dur, écrit à l'époque du prototype — un autre papier
   (#faf8f4), une autre encre, un autre magenta (#ff2f8f au lieu de #FF0080),
   Archivo pour tout, y compris le titre. Aucune trace de Neutrix, aucune des
   six couleurs, aucun rang. Et l'ancien logotype en image, appelé en absolu
   sur https://stopera.art — donc cassé en local et sur toute prévisualisation.

   C'est pourtant une page que l'on voit : c'est celle qui accueille un lien
   mort venu de l'extérieur. Elle est refaite comme une page du site — même
   barre, même pied, même typographie — et dans les six langues, servie par la
   langue de l'adresse demandée quand elle est reconnaissable.

   Run: node outils/page-404.js [--verifier]                                 */
"use strict";
var fs = require("fs"), path = require("path"), crypto = require("crypto");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

function empreinte(f) {
  return crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex").slice(0, 8);
}
var VS = empreinte(path.join(DOCS, "styles.css"));
var VF = empreinte(path.join(DOCS, "assets", "fonts", "fonts.css"));

var T = {
  fr: ["Page introuvable", "Erreur 404", "Cette page n'existe pas (ou plus).",
       "La page que vous cherchez est introuvable. Elle a peut-être été déplacée.",
       "Retour à l'accueil"],
  en: ["Page not found", "Error 404", "This page does not exist (any more).",
       "The page you are looking for cannot be found. It may have been moved.",
       "Back to the home page"],
  es: ["Página no encontrada", "Error 404", "Esta página no existe (o ya no existe).",
       "No se encuentra la página que busca. Puede que se haya movido.",
       "Volver al inicio"],
  it: ["Pagina non trovata", "Errore 404", "Questa pagina non esiste (o non esiste più).",
       "La pagina che cercate non si trova. Potrebbe essere stata spostata.",
       "Torna alla home"],
  zh: ["页面未找到", "错误 404", "此页面不存在（或已不存在）。",
       "找不到您要访问的页面，它可能已被移动。", "返回首页"],
  de: ["Seite nicht gefunden", "Fehler 404", "Diese Seite gibt es nicht (mehr).",
       "Die gesuchte Seite ist nicht auffindbar. Möglicherweise wurde sie verschoben.",
       "Zurück zur Startseite"]
};
var LANGS = Object.keys(T);

/* la barre et le pied sont ceux du site : on les prend sur la page d'accueil
   de la langue plutôt que de les réécrire — ils resteront à jour tout seuls */
function morceau(h, ouvre, ferme) {
  var i = h.indexOf(ouvre);
  if (i < 0) return "";
  var j = h.indexOf(ferme, i);
  return j < 0 ? "" : h.slice(i, j + ferme.length);
}

function page(lang) {
  var acc = fs.readFileSync(path.join(DOCS, lang === "fr" ? "" : lang, "index.html"), "utf8");
  var barre = morceau(acc, '<nav class="nav">', "</nav>");
  var pied = morceau(acc, '<footer class="foot">', "</footer>");
  var t = T[lang], chez = lang === "fr" ? "/" : "/" + lang + "/";

  return '<!DOCTYPE html>\n<html lang="' + (lang === "zh" ? "zh-Hans" : lang) + '">\n<head>\n' +
    '<meta charset="utf-8" />\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
    '<meta name="robots" content="noindex" />\n' +
    "<title>" + t[0] + " — STOPERA!</title>\n" +
    '<link rel="icon" type="image/svg+xml" href="/assets/marque.svg" />\n' +
    '<link rel="icon" type="image/png" href="/assets/favicon.png" />\n' +
    '<link rel="preload" as="font" type="font/woff2" crossorigin ' +
      'href="/assets/fonts/Neutrix-Regular.woff2" />\n' +
    '<link rel="stylesheet" href="/assets/fonts/fonts.css?v=' + VF + '" />\n' +
    '<link rel="stylesheet" href="/styles.css?v=' + VS + '" />\n' +
    "<style>:root{--sec:var(--red)}</style>\n" +
    "</head>\n<body data-section=\"accueil\">\n" + barre +
    '<section class="sec" style="--sec:var(--red)"><div class="wrap">' +
    '<div class="num" aria-hidden="true">404</div><div class="body">' +
    '<p class="eyebrow">' + t[1] + "</p>" +
    "<h1>" + t[2] + "</h1>" +
    '<div class="prose"><p>' + t[3] + "</p></div>" +
    '<p style="margin-top:1.6rem"><a class="cta" href="' + chez + '">' + t[4] +
    ' <span aria-hidden="true">→</span></a></p>' +
    "</div></div></section>\n" + pied + "\n</body>\n</html>\n";
}

/* GitHub Pages ne sert qu'un seul 404.html, à la racine : c'est le français
   qui l'occupe, comme le reste du site. Les autres langues sont écrites à
   côté pour qui voudrait les servir un jour. */
var faites = 0;
LANGS.forEach(function (l) {
  var dest = l === "fr" ? path.join(DOCS, "404.html") : path.join(DOCS, l, "404.html");
  var neuf = page(l);
  if (!VERIF) fs.writeFileSync(dest, neuf);
  faites++;
});

console.log("page introuvable refaite : " + faites + " langue(s)");
