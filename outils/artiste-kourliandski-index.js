"use strict";
/* Ajoute Dmitri Kourliandski à l'index des artistes (/artists/), dans les
 * six langues, juste après Valentín Pelisch : deux compositeurs voisins.
 *
 * Les cartes de cet index portent des liens absolus préfixés par la langue
 * (/en/artists/…), d'où le préfixe calculé plutôt que codé en dur.
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];
var CODE = { "": "fr", en: "en", es: "es", it: "it", zh: "zh", de: "de" };
var SLUG = "dmitri-kourliandski";

var ROLE = {
  fr: "Compositeur", en: "Composer", es: "Compositor",
  it: "Compositore", zh: "作曲家", de: "Komponist"
};
var ORDRE = ["fr", "es", "it", "zh", "en", "de"];

var n = 0;

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "artists", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf("artists/" + SLUG + "/") >= 0) return;

  var prefixe = lg ? "/" + lg + "/artists/" : "/artists/";
  var ancre = h.indexOf('<a href="' + prefixe + 'valentin-pelisch/"');
  if (ancre < 0) { console.log("  " + f + " : ancre introuvable"); return; }
  var fin = h.indexOf("</div>", ancre);
  if (fin < 0) { console.log("  " + f + " : fin de carte introuvable"); return; }
  fin += 6;

  var attrs = ORDRE.map(function (c) { return 'data-' + c + '="' + ROLE[c] + '"'; }).join(" ");
  var carte = '<div class="idx" style="--sec:var(--blu)"><a href="' + prefixe + SLUG + '/">' +
    '<span class="t">dmitri kourliandski</span>' +
    '<span class="m" ' + attrs + '>' + ROLE[CODE[lg]] + '</span>' +
    '<span class="y"></span></a></div>';

  fs.writeFileSync(f, h.slice(0, fin) + carte + h.slice(fin));
  n++;
});

console.log("index des artistes complété sur " + n + " page(s)");
