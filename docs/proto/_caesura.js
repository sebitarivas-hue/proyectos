/* Pose la césure en tête de chaque section — voir « LA SUSPENSION » dans
   proto.css. Dispositif systématique : toutes les pages, tous les rangs.
   Run: node docs/proto/_caesura.js                                        */
"use strict";
var fs = require("fs"), path = require("path");
var OUT = path.resolve(__dirname);
var LABEL = { "01": "pourquoi", "02": "œuvres", "03": "laboratoire",
              "04": "réseau", "05": "transmission", "06": "soutenir" };
/* cyan et vert sont clairs : le texte de la césure y passe en encre */
var LIGHT = { "03": 1, "05": 1 };
var n = 0, posees = 0;
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(d, e.name);
    if (e.isDirectory()) return walk(f);
    if (e.name !== "index.html") return;
    var h = fs.readFileSync(f, "utf8"), b = h;
    h = h.replace(/<div class="caesura[\s\S]*?<\/div>\s*(?=<section class="sec)/g, "");
    h = h.replace(/<section class="sec ([^"]*)" style="--sec:([^"]*)"><div class="wrap"><div class="num"[^>]*>([^<]*)<\/div>/g,
      function (m, cls, col, num) {
        var r = (num || "").trim();
        if (!r || !LABEL[r]) return m;
        posees++;
        return '<div class="caesura' + (LIGHT[r] ? " is-light" : "") + '" style="--sec:' + col + '" aria-hidden="true">' +
          '<span class="r">' + r + '</span><span class="s">' + LABEL[r] + '</span></div>' + m;
      });
    if (h !== b) { fs.writeFileSync(f, h); n++; }
  });
})(OUT);
console.log("césure posée : " + posees + " sur " + n + " page(s)");
