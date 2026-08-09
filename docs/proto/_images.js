/* REGISTRE D'IMAGES — §05 de la DA.
   « Un registre de traitements apparentés, appliqués selon le rôle de
     l'image — jamais le même filtre partout. »
     magenta → œuvres · cyan → laboratoire · N&B → portraits · brut → archives

   Applique la règle sur toutes les pages du prototype d'un seul endroit.
   Run: node docs/proto/_images.js                                          */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.resolve(__dirname, "../..");
var DOCS = path.join(ROOT, "docs"), PROTO = path.join(DOCS, "proto");

var src = fs.readFileSync(path.join(DOCS, "script.js"), "utf8");
function g(re) { return src.match(re)[1]; }
var D = new Function("var ONGOING=" + g(/var ONGOING = (\{[^;]*\});/) +
  ";var YEARS=" + g(/var YEARS = (\{[\s\S]*?\});/) +
  ";var PERIOD=" + g(/var PERIOD = (\{[^;]*\});/) +
  ";var COLORS=" + g(/var COLORS = (\{[\s\S]*?\});/) +
  ";var DIM=" + g(/var DIM = (\{[\s\S]*?\n  \});/) +
  ";var PROJECTS=" + g(/var PROJECTS = (\[[\s\S]*?\n  \]);/) +
  ";return{PROJECTS:PROJECTS}")();
function fr(v) { return v == null ? "" : (typeof v === "string" ? v : (v.fr || "")); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

/* Le laboratoire n'est pas une œuvre : LIPS relève de la famille 03.
   C'était une erreur de famille, pas une nuance de goût. */
var LABO = { lips: true };

var changed = 0, gal = 0;
D.PROJECTS.forEach(function (p) {
  var f = path.join(PROTO, "oeuvres", p.slug, "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), before = h;

  if (LABO[p.slug]) {
    h = h.replace(/class="im-oeuvres"/g, 'class="im-labo"');
    h = h.replace(/--sec:var\(--mag\)/g, "--sec:var(--cy)");
    h = h.replace(/>02</g, ">03<").replace(/02 &middot; œuvres/g, "03 &middot; laboratoire");
  }

  /* Les images de galerie sont des documents de production : traitement brut,
     réservé par la DA aux archives et à la presse. Elles n'étaient pas
     affichées du tout — dix photographies réelles restaient invisibles. */
  if (p.gallery && p.gallery.length && h.indexOf('class="gal"') < 0) {
    var items = p.gallery.map(function (im) {
      var s = typeof im === "string" ? im : (im.src || im.photo || "");
      var c = typeof im === "string" ? "" : fr(im.caption || im.legend || "");
      if (!s) return "";
      return '<figure class="gal-i"><img class="im-brut" src="/' + s + '" alt="' +
        esc(c || fr(p.title)) + '" loading="lazy" />' +
        (c ? '<figcaption>' + esc(c) + '</figcaption>' : "") + '</figure>';
    }).join("");
    if (items) {
      var block = '<div class="gal"><p class="gal-k">Documents de production</p>' +
        '<div class="gal-g">' + items + '</div></div>';
      h = h.replace('<a class="more" href="/proto/oeuvres/">', block + '<a class="more" href="/proto/oeuvres/">');
      gal += p.gallery.length;
    }
  }
  if (h !== before) { fs.writeFileSync(f, h); changed++; }
});

/* Contrôle : aucune famille ne doit écraser les autres. */
var count = {};
function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(d, e.name);
    if (e.isDirectory()) return walk(f);
    if (e.name !== "index.html") return;
    (fs.readFileSync(f, "utf8").match(/class="im-[a-z]+"/g) || []).forEach(function (m) {
      count[m] = (count[m] || 0) + 1;
    });
  });
}
walk(PROTO);
console.log("pages modifiées : " + changed + " · images de galerie affichées : " + gal);
console.log("répartition du registre :", count);
