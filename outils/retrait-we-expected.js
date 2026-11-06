/* RETRAIT DE « WE EXPECTED THE DISASTER… » ET DE - PORTE RENAUD -.
   Demandé par - porte renaud - le 06/11/2026 : fin de la collaboration,
   et retrait de son affichage sur le site. Retire la fiche de l'œuvre, la
   fiche de l'artiste, la brève, et toutes les mentions dans les index,
   les parcours, la transmission, la carte des coopérations et le réseau,
   dans les six langues.

   Run: node outils/retrait-we-expected.js                                   */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["", "en/", "es/", "it/", "zh/", "de/"];
var n = 0;

/* Retire l'élément <tag ...> le plus proche qui englobe chaque occurrence
   de `marque`, à condition que sa balise ouvrante contienne `ouvre`. */
function retirer(s, marque, tag, ouvre) {
  for (;;) {
    var i = s.indexOf(marque);
    if (i < 0) return s;
    var a = i, ok = false;
    while ((a = s.lastIndexOf("<" + tag, a - 1)) >= 0) {
      var fin = s.indexOf(">", a), tete = s.slice(a, fin + 1);
      if (tete.indexOf(ouvre) < 0) continue;
      var re = new RegExp("<" + tag + "[\\s>]|</" + tag + ">", "g");
      re.lastIndex = a; var d = 0, m, b = -1;
      while ((m = re.exec(s))) {
        if (m[0].charAt(1) === "/") { if (--d === 0) { b = re.lastIndex; break; } }
        else d++;
      }
      if (b > i) { s = s.slice(0, a) + s.slice(b); ok = true; n++; }
      break;
    }
    if (!ok) throw new Error("élément introuvable pour " + marque);
  }
}

function page(rel, fn) {
  var f = path.join(DOCS, rel);
  if (!fs.existsSync(f)) return;
  var s = fs.readFileSync(f, "utf8"), t = fn(s);
  if (t !== s) fs.writeFileSync(f, t);
}

LANGS.forEach(function (L) {
  page(L + "oeuvres/index.html", function (s) {
    return retirer(s, 'productions/salamandres/"', "article", 'class="oeu');
  });
  page(L + "transmission/index.html", function (s) {
    return retirer(s, 'productions/salamandres/"', "div", 'class="tx-group"');
  });
  page(L + "news/index.html", function (s) {
    return retirer(s, 'stopera-accompagne-we-expected/"', "li", "");
  });
  ["parcours/memoire-politique/", "parcours/posthumain-memoire/"].forEach(function (p) {
    page(L + p + "index.html", function (s) {
      return retirer(s, 'productions/salamandres/"', "li", 'class="project"');
    });
  });
  page(L + "cooperation/index.html", function (s) {
    s = retirer(s, 'data-city="londres"', "button", 'data-city="londres"');
    s = retirer(s, 'data-city="mulhouse"', "button", 'data-city="mulhouse"');
    return retirer(s, 'productions/salamandres/"', "div", 'class="coop-city-block"');
  });
  page(L + "artists/index.html", function (s) {
    return retirer(s, 'artists/porte-renaud/"', "div", 'class="idx"');
  });
  page(L + "reseau/index.html", function (s) {
    /* les partenaires venus avec ce seul projet partent avec lui */
    ["https://cietrilobite.org", "https://www.tete-a-tete.org.uk", "https://lacroch.com", "https://artenreel.fr"].forEach(function (u) {
      s = retirer(s, 'href="' + u + '"', "li", "");
    });
    return s;
  });
  ["productions/salamandres", "artists/porte-renaud", "news/stopera-accompagne-we-expected"].forEach(function (d) {
    var f = path.join(DOCS, L + d);
    if (fs.existsSync(f)) { fs.rmSync(f, { recursive: true }); n++; }
  });
});

page("sitemap.xml", function (s) {
  return s.replace(/[ \t]*<url><loc>[^<]*\/(productions\/salamandres|artists\/porte-renaud|news\/stopera-accompagne-we-expected)\/<\/loc><\/url>\n/g, "");
});

console.log("retraits : " + n);
