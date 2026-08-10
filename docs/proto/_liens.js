/* TOUT LIEN INTERNE RESTE DANS LE PROTOTYPE ET DANS SA LANGUE.
   Le contenu est repris des pages publiées : il porte donc leurs adresses.
   Depuis /proto/it/artists/daniel-zea/, « LIPS » menait à /lips/ — c'est-à-dire
   hors du prototype ET hors de l'italien. 460 liens étaient dans ce cas.

   Une seule règle : une adresse interne d'une page en langue X devient
   /proto/X/<route>. Deux exceptions, et deux seulement :
     · le sélecteur de langue du pied, dont le travail est justement de changer
       de langue ;
     · les ressources (feuilles, scripts, images), qui n'ont pas de langue.

   Run: node docs/proto/_liens.js                                            */
"use strict";
var fs = require("fs"), path = require("path");
var OUT = path.resolve(__dirname);
var LANGS = ["en", "es", "it", "zh"];
var ASSET = /\.(css|js|png|jpe?g|webp|svg|ico|xml|txt|pdf|woff2?)(\?|$)/i;

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) pages(p, a);
    else if (e.name === "index.html") a.push(p);
  });
  return a;
}

var list = pages(OUT);
var fixed = 0, touched = 0;

list.forEach(function (f) {
  var rel = "/proto/" + path.relative(OUT, f).split(path.sep).slice(0, -1).join("/");
  var lang = (rel.match(/^\/proto\/(en|es|it|zh)(\/|$)/) || [])[1] || "fr";
  var pre = lang === "fr" ? "/proto/" : "/proto/" + lang + "/";
  var h = fs.readFileSync(f, "utf8"), n = 0;

  /* Le sélecteur de langue a le droit — et le devoir — de changer de langue.
     Il se reconnaît à sa cible : une racine de langue, rien d'autre. Il mène
     désormais à la MÊME page dans l'autre langue, non plus à son accueil. */
  var route = rel.replace(/^\/proto(?:\/(?:en|es|it|zh))?/, "").replace(/^\//, "");
  if (route) route += "/";

  function rewrite(seg, keepRoute) {
    return seg.replace(/href="(\/[^"#]*)((?:#[^"]*)?)"/g, function (m, u, frag) {
      if (ASSET.test(u)) return m;
      var to, sw = u.match(/^\/(?:proto\/)?(en|es|it|zh)?\/?$/);
      if (sw) {
        /* une racine de langue : dans le sélecteur elle garde la page courante,
           partout ailleurs (la marque du bandeau) elle mène à l'accueil */
        to = (sw[1] ? "/proto/" + sw[1] + "/" : "/proto/") + (keepRoute ? route : "");
      } else if (u.indexOf("/proto/") === 0) {
        to = pre + u.replace(/^\/proto\/(?:en\/|es\/|it\/|zh\/)?/, "");
      } else {
        to = pre + u.replace(/^\/(?:en|es|it|zh)\//, "/").replace(/^\//, "");
      }
      if (to !== u) n++;
      return 'href="' + to + frag + '"';
    });
  }

  /* Le sélecteur de langue du pied est le seul endroit qui change de langue. */
  var iL = h.indexOf('<p class="lab">Langues');
  if (iL < 0) h = rewrite(h, false);
  else {
    var jL = h.indexOf("</ul>", iL) + 5;
    h = rewrite(h.slice(0, iL), false) + rewrite(h.slice(iL, jL), true) + rewrite(h.slice(jL), false);
  }

  if (n) { fs.writeFileSync(f, h); fixed += n; touched++; }
});

console.log("liens ramenés dans le prototype et dans leur langue : " + fixed +
  " sur " + touched + " page(s), " + list.length + " examinées");
