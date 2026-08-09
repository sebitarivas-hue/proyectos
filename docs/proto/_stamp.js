/* Empreinte de la feuille de style.
   Le numéro de version était posé à la main : en modifiant proto.css sans le
   changer, 15 pages continuaient de demander ?v=3 et les navigateurs
   servaient l'ancienne feuille — d'où une navigation cassée en cache.
   L'empreinte est désormais calculée sur le CONTENU : elle change dès que la
   feuille change, jamais autrement.
   Run: node docs/proto/_stamp.js                                          */
"use strict";
var fs = require("fs"), path = require("path"), crypto = require("crypto");
var OUT = path.resolve(__dirname);
var css = fs.readFileSync(path.join(OUT, "proto.css"));
var hash = crypto.createHash("sha1").update(css).digest("hex").slice(0, 8);
var n = 0;
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(d, e.name);
    if (e.isDirectory()) return walk(f);
    if (e.name !== "index.html") return;
    var h = fs.readFileSync(f, "utf8");
    var v = h.replace(/proto\.css(\?v=[^"']*)?/g, "proto.css?v=" + hash);
    if (v !== h) { fs.writeFileSync(f, v); n++; }
  });
})(OUT);
console.log("empreinte " + hash + " posée sur " + n + " page(s)");
