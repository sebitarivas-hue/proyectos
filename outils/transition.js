/* POSE LA TRANSITION SUR TOUTES LES PAGES.
   Le script qui retient le point de clic doit être chargé partout, et une
   seule fois par page. Il est placé juste avant </body> pour ne rien retarder
   à l'affichage, et en `defer` pour ne jamais bloquer l'analyse du document :
   la navigation ne doit dépendre de lui en aucune façon.

   Run: node outils/transition.js                                            */
"use strict";
var fs = require("fs"), path = require("path"), crypto = require("crypto");
var DOCS = path.resolve(__dirname, "..", "docs");

var empreinte = crypto.createHash("sha1")
  .update(fs.readFileSync(path.join(DOCS, "transition.js")))
  .digest("hex").slice(0, 8);
var BALISE = '<script src="/transition.js?v=' + empreinte + '" defer></script>';

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var posees = 0;
pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;
  h = h.replace(/\s*<script src="\/transition\.js[^"]*"[^>]*><\/script>/g, "");
  var i = h.lastIndexOf("</body>");
  if (i < 0) return;
  h = h.slice(0, i) + BALISE + "\n" + h.slice(i);
  if (h !== avant) { fs.writeFileSync(f, h); posees++; }
});

console.log("transition posée sur " + posees + " page(s) — empreinte " + empreinte);
