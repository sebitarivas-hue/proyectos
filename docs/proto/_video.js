/* Vidéos des œuvres.
   Trois pièces portent une captation dans les données — OOO, Otages, Snow on
   Her Lips — et le site l'intègre. Le prototype ne l'affichait pas.
   La vidéo précède la photographie : l'image animée mène.
   Elle ne reçoit pas de duotone — le registre §05 traite la photographie ;
   un lecteur filtré deviendrait illisible et l'interface avec.
   Run: node docs/proto/_video.js                                           */
"use strict";
var fs = require("fs"), path = require("path");
var OUT = path.resolve(__dirname), DOCS = path.resolve(OUT, "..");

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

var n = 0;
D.PROJECTS.forEach(function (p) {
  if (!p.video) return;
  var f = path.join(OUT, "productions", p.slug, "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), before = h;
  h = h.replace(/<figure class="vid"[\s\S]*?<\/figure>/, "");
  var titre = esc(fr(p.title));
  var bloc = '<figure class="vid">' +
    '<iframe src="https://www.youtube.com/embed/' + p.video +
    '?rel=0&amp;modestbranding=1&amp;playsinline=1&amp;controls=1&amp;fs=1" title="' + titre +
    '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
    ' referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
    '<figcaption><span class="vid-k">Captation</span> ' + titre +
    ' &middot; <a href="https://www.youtube.com/watch?v=' + p.video + '">voir sur YouTube</a></figcaption>' +
    '</figure>';
  /* la vidéo se place juste avant la photographie pleine largeur */
  if (h.indexOf('<figure class="fig-full">') >= 0) {
    h = h.replace('<figure class="fig-full">', bloc + '<figure class="fig-full">');
  } else {
    h = h.replace("</section>", "</section>" + bloc);
  }
  if (h !== before) { fs.writeFileSync(f, h); n++; console.log("  " + p.slug + " → " + p.video); }
});
console.log("vidéos intégrées : " + n);
