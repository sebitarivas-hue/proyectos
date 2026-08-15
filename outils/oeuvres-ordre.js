"use strict";
/* L'ORDRE DES ŒUVRES sur la page 02 · œuvres.
 *
 * On déplace l'article entier, sa classe avec lui : oeu--a est un cadre
 * 21/9 pleine largeur, oeu--b une image de droite en 4/3, oeu--c un carré à
 * gauche, oeu--d un bandeau. Le gabarit appartient à l'œuvre — Einstein a une
 * photo de 1600 px qui tient la pleine largeur, Mamma Roma un fichier de
 * 588 px qui n'y survivrait pas.
 *
 * Les articles qui ne pointent pas vers une production — le Lips Lab, en fin
 * de liste — ne bougent pas.
 *
 * Idempotent : rejouable sans effet une fois l'ordre atteint.
 */
var fs = require("fs"), path = require("path");

var ORDRE = [
  "salamandres",
  "mamma-roma",
  "einstein-on-the-beach",
  "ooo",
  "rut",
  "fame",
  "snow-on-her-lips",
  "war-madrigals",
  "nous",
  "otages",
  "insistir",
  "america"
];

var LANGUES = ["", "en", "es", "it", "zh", "de"];
var OUVRE = /<article class="oeu[^"]*">/g;

function decouper(h) {
  var blocs = [], m, garde = 0;
  OUVRE.lastIndex = 0;
  while ((m = OUVRE.exec(h))) {
    var fin = h.indexOf("</article>", m.index);
    if (fin < 0) throw new Error("article non refermé");
    fin += "</article>".length;
    blocs.push({ i: m.index, fin: fin, tout: h.slice(m.index, fin) });
    OUVRE.lastIndex = fin;
    if (++garde > 400) throw new Error("boucle");
  }
  return blocs;
}

function slug(s) {
  /* les versions traduites préfixent le chemin : /de/productions/… */
  var m = s.match(/href="\/(?:[a-z]{2}\/)?productions\/([a-z0-9-]+)\//);
  return m ? m[1] : null;
}

var touches = 0, vus = 0;

LANGUES.forEach(function (lg) {
  var f = path.join("docs", lg, "oeuvres", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  var blocs = decouper(h);
  if (!blocs.length) return;
  vus++;

  /* seuls les articles qui mènent à une production entrent dans la danse */
  var places = [], slugs = [];
  blocs.forEach(function (b, i) {
    var s = slug(b.tout);
    if (s !== null) { places.push(i); slugs.push(s); }
  });

  var manquants = ORDRE.filter(function (s) { return slugs.indexOf(s) < 0; });
  var surplus = slugs.filter(function (s) { return ORDRE.indexOf(s) < 0; });
  if (manquants.length || surplus.length || slugs.length !== ORDRE.length) {
    console.log("  " + f + " : liste inattendue (manquants [" + manquants +
      "], surplus [" + surplus + "]), page laissée telle quelle");
    return;
  }
  if (slugs.join() === ORDRE.join()) return;

  var parSlug = {};
  blocs.forEach(function (b) {
    var s = slug(b.tout);
    if (s !== null) parSlug[s] = b.tout;
  });

  var rang = 0, sortie = "", curseur = 0;
  blocs.forEach(function (b, i) {
    sortie += h.slice(curseur, b.i);
    sortie += places.indexOf(i) < 0 ? b.tout : parSlug[ORDRE[rang++]];
    curseur = b.fin;
  });
  sortie += h.slice(curseur);

  fs.writeFileSync(f, sortie);
  touches++;
  console.log("  " + f);
});

console.log("ordre des œuvres : " + touches + " page(s) réordonnée(s) sur " + vus + " vue(s)");
