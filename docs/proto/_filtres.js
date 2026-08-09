/* FILTRES PHOTO — valeurs exactes du §05 de la DA.
   Le site appliquait un tritone à 32 points allant du magenta au cyan ; la DA
   spécifie un DUOTONE à deux tons — du sombre vers le magenta, du sombre vers
   le cyan. Ce sont ces valeurs-là qui font foi.
   Run: node docs/proto/_filtres.js                                         */
"use strict";
var fs = require("fs"), path = require("path");
var OUT = path.resolve(__dirname);

var LUM = '<feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0"/>';
var DEFS =
  '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
  '<filter id="im-oeuvres" color-interpolation-filters="sRGB">' + LUM +
  '<feComponentTransfer>' +
  '<feFuncR type="table" tableValues="0.10 1.00"/>' +
  '<feFuncG type="table" tableValues="0.02 0.36"/>' +
  '<feFuncB type="table" tableValues="0.24 0.74"/>' +
  '</feComponentTransfer></filter>' +
  '<filter id="im-labo" color-interpolation-filters="sRGB">' + LUM +
  '<feComponentTransfer>' +
  '<feFuncR type="table" tableValues="0.04 0.72"/>' +
  '<feFuncG type="table" tableValues="0.10 0.98"/>' +
  '<feFuncB type="table" tableValues="0.18 1.00"/>' +
  '</feComponentTransfer></filter></svg>';

var n = 0;
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(d, e.name);
    if (e.isDirectory()) return walk(f);
    if (e.name !== "index.html") return;
    var h = fs.readFileSync(f, "utf8"), b = h;
    h = h.replace(/<svg width="0"[\s\S]*?<\/svg>/, DEFS);
    if (h !== b) { fs.writeFileSync(f, h); n++; }
  });
})(OUT);
console.log("filtres de la DA posés sur " + n + " page(s)");
