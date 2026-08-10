/* CONTRÔLE DES LIENS — aucune adresse ne casse, aucune ne change de langue.
   Une page en langue X ne mène qu'à des pages en langue X. Seul le sélecteur
   de langue du pied a le droit de traverser, et il mène à la même page.
   Run: node outils/liens.js                                                 */
"use strict";
var fs = require("fs"), path = require("path");
function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
var list = pages("docs");
var have = new Set(list.map(f => "/" + f.replace(/^docs\//, "").replace(/index\.html$/, "")));
var ASSET = /\.(css|js|png|jpe?g|webp|svg|ico|xml|txt|pdf|html|woff2?)(\?|$)/i;
var casses = [], fuites = [];

list.forEach(function (f) {
  var h = fs.readFileSync(f, "utf8");
  var from = "/" + f.replace(/^docs\//, "").replace(/index\.html$/, "");
  var lang = (from.match(/^\/(en|es|it|zh)\//) || [])[1] || "fr";
  /* Un lien vers une autre langue n'est légitime que s'il mène à LA MÊME
     page : c'est le sélecteur. Vers une autre route, c'est une fuite. */
  var route = from.replace(/^\/(en|es|it|zh)\//, '/');
  for (var m of h.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    var u = m[1];
    if (ASSET.test(u)) { if (!fs.existsSync("docs" + u.split("?")[0])) casses.push(from + " → " + u + " (fichier absent)"); continue; }
    if (!have.has(u)) { casses.push(from + " → " + u + " (404)"); continue; }
    var l2 = (u.match(/^\/(en|es|it|zh)\//) || [])[1] || "fr";
    var dansSelecteur = u.replace(/^\/(en|es|it|zh)\//, '/') === route;
    if (l2 !== lang && !dansSelecteur) fuites.push(from + " → " + u);
  }
});
console.log("pages : " + list.length);
console.log("liens cassés : " + casses.length); casses.slice(0, 12).forEach(x => console.log("  " + x));
console.log("fuites de langue : " + fuites.length); fuites.slice(0, 12).forEach(x => console.log("  " + x));
