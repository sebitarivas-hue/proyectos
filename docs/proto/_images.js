/* REGISTRE D'IMAGES — §05 de la DA.
   « Un registre de traitements apparentés, appliqués selon le rôle de l'image
     — jamais le même filtre partout. »
     magenta → œuvres · cyan → laboratoire · N&B → portraits · brut → archives

   La règle s'applique par CONTEXTE DE ROUTE, jamais par classe posée à la
   main : une page ajoutée demain reçoit le bon traitement sans intervention.
   Run: node docs/proto/_images.js                                          */
"use strict";
var fs = require("fs"), path = require("path");
var OUT = path.resolve(__dirname);

/* Le rôle de l'image se déduit de l'endroit où elle vit. */
function registre(route, src) {
  var r = route.split("/")[0];
  /* LIPS est le laboratoire, y compris quand sa vignette figure dans l'index
     des œuvres : la famille suit l'objet, pas la page qui l'affiche. */
  if (/\/lips\/|lips\.jpg/.test(src) || /lips/.test(route)) return "im-labo";
  if (/aperghis|portrait|porte-renaud/.test(src)) return "im-portrait";
  if (r === "artists") return "im-portrait";
  if (r === "lips" || r === "laboratoire" || r === "recherche") return "im-labo";
  if (r === "news" || r === "presse") return "im-brut";     /* documents */
  if (r === "productions" || r === "oeuvres") return "im-oeuvres";
  if (r === "reseau" || r === "cooperation") return "im-portrait";
  return null;                        /* accueil : posé à la main, on n'y touche pas */
}

var n = 0, poses = 0;
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(d, e.name);
    if (e.isDirectory()) return walk(f);
    if (e.name !== "index.html") return;
    var rel = path.relative(OUT, d).split(path.sep).join("/");
    if (rel === ".") rel = "";
    var h = fs.readFileSync(f, "utf8"), before = h;

    h = h.replace(/<img\b[^>]*>/g, function (tag) {
      var m = tag.match(/src="([^"]*)"/);
      if (!m || /logo/.test(m[1])) return tag;
      var want = registre(rel, m[1]);
      if (!want) return tag;
      /* une galerie reste en brut : ce sont des documents de production */
      if (/class="[^"]*\bim-brut\b/.test(tag)) return tag;
      var t = tag.replace(/\s*\bim-(oeuvres|labo|portrait|brut)\b/g, "");
      if (/class="/.test(t)) t = t.replace(/class="/, 'class="' + want + " ");
      else t = t.replace(/<img/, '<img class="' + want + '"');
      if (t !== tag) poses++;
      return t;
    });
    if (h !== before) { fs.writeFileSync(f, h); n++; }
  });
})(OUT);

/* contrôle : aucune famille ne doit écraser les autres */
var c = {};
(function walk2(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(d, e.name);
    if (e.isDirectory()) return walk2(f);
    if (e.name !== "index.html") return;
    (fs.readFileSync(f, "utf8").match(/<img[^>]*class="[^"]*im-[a-z]+/g) || []).forEach(function (m) {
      var k = m.match(/im-[a-z]+/)[0];
      c[k] = (c[k] || 0) + 1;
    });
  });
})(OUT);
console.log("registre appliqué : " + poses + " image(s) sur " + n + " page(s)");
console.log("répartition :", c);
