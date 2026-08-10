/* LES TROIS PAGES COMPOSÉES, DANS LES CINQ LANGUES.
   Accueil, index des œuvres et index des artistes étaient composés à la main —
   et donc seulement en français. Les quatre autres langues recevaient à leur
   place le gabarit générique : ni chapeau, ni hiérarchie, ni appels. Cliquer
   sur STOPERA! en italien menait bien à /proto/it/, mais /proto/it/ n'était
   pas une page d'accueil.

   Ici la composition française sert de gabarit unique ; les chaînes sont
   remplacées par les traductions que porte déjà le site publié (attributs
   data-<lang>). Aucun texte n'est traduit par nos soins.

   Run: node docs/proto/_home.js                                             */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.resolve(__dirname, "../..");
var DOCS = path.join(ROOT, "docs"), OUT = path.join(DOCS, "proto");
var LANGS = ["en", "es", "it", "zh"];

var L = {
  fr: ["pourquoi", "œuvres", "laboratoire", "réseau", "transmission", "soutenir"],
  en: ["why", "works", "laboratory", "network", "transmission", "support"],
  es: ["por qué", "obras", "laboratorio", "red", "transmisión", "apoyar"],
  it: ["perché", "opere", "laboratorio", "rete", "trasmissione", "sostenere"],
  zh: ["为何", "作品", "实验室", "网络", "传承", "支持"]
};
var SLUG = ["pourquoi", "oeuvres", "laboratoire", "reseau", "transmission", "soutenir"];
var NUM = ["01", "02", "03", "04", "05", "06"];
var COL = ["var(--red)", "var(--mag)", "var(--cy)", "var(--blu)", "var(--grn)", "var(--ink)"];
var ROUTES = ["", "oeuvres", "artists"];

/* ---- 1. Table des traductions, relevée sur le site publié ---- */
function decode(s) {
  return s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&middot;/g, "·").replace(/&amp;/g, "&");
}
var TR = {};                                   /* TR[fr][lang] = traduction */
(function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "assets" && e.name !== "proto") walk(f); return; }
    if (e.name !== "index.html") return;
    var h = fs.readFileSync(f, "utf8"), re = /<[a-z][^>]*\sdata-fr="([^"]*)"[^>]*>/gi, m;
    while ((m = re.exec(h))) {
      var tag = m[0], fr = decode(m[1]).trim();
      if (!fr) continue;
      TR[fr] = TR[fr] || {};
      LANGS.forEach(function (l) {
        var t = tag.match(new RegExp('data-' + l + '="([^"]*)"'));
        if (t) { var v = decode(t[1]).trim(); if (v) TR[fr][l] = v; }
      });
    }
  });
})(DOCS);

/* ---- 2. Réécriture d'une composition française vers une langue ---- */
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function attr(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

var frKeys = Object.keys(TR).sort(function (a, b) { return b.length - a.length; });

function navHtml(lang, cur) {
  return '<nav class="nav"><div class="wrap">' +
    '<a class="brand" href="/proto/' + lang + '/" aria-label="STOPERA!">' +
    '<img src="/assets/logo-dark.png" alt="STOPERA!" /></a><div class="nav-rail">' +
    SLUG.map(function (s, i) {
      return '<a class="n" href="/proto/' + lang + '/' + s + '/"' +
        (s === cur ? ' aria-current="page"' : "") +
        ' style="--sec:' + COL[i] + '"><i>' + NUM[i] + "</i>" + L[lang][i] + "</a>";
    }).join("") + "</div></div></nav>";
}

function footHtml(lang, route) {
  var name = { fr: "Français", en: "English", es: "Español", it: "Italiano", zh: "中文" };
  var alt = ["fr"].concat(LANGS).map(function (l) {
    var pre = l === "fr" ? "/proto/" : "/proto/" + l + "/";
    return l === lang ? '<span aria-current="true">' + name[l] + "</span>"
      : '<a href="' + pre + route + '">' + name[l] + "</a>";
  }).join(" · ");
  return '<footer class="foot"><div class="wrap">' +
    "<div><h2>stopera!</h2></div>" +
    '<div><p class="small">Sonic Theatre Opera Performance — Gentilly (Paris)</p>' +
    '<p style="margin-top:.7rem"><a href="mailto:info@stopera.art">info@stopera.art</a></p></div>' +
    '<div><p class="lab">Langues</p><ul><li>' + alt + "</li></ul>" +
    '<p class="lab" style="margin-top:1rem">Réseaux</p><ul>' +
    '<li><a href="https://www.instagram.com/stopera.art/">Instagram</a> · ' +
    '<a href="https://www.youtube.com/@stopera-art">YouTube</a></li></ul></div>' +
    "</div></footer>";
}

/* Toute adresse interne reste dans le prototype ET dans la langue courante.
   C'est ici que se corrigeaient les appels de l'accueil français, qui
   pointaient vers le site publié au lieu du prototype. */
var SITE_DIRS = ["pourquoi", "oeuvres", "laboratoire", "reseau", "transmission", "soutenir",
  "artists", "productions", "parcours", "recherche", "lips", "cooperation", "news",
  "presse", "mentions-legales"];

function relink(html, lang) {
  var pre = lang === "fr" ? "/proto/" : "/proto/" + lang + "/";
  /* /proto/... et /proto/<autre-langue>/... → la langue voulue.
     Les ressources (proto.css, scripts, images) ne sont pas des routes :
     elles vivent à la racine du prototype et n'ont pas de version par langue. */
  html = html.replace(/href="\/proto\/(?:en\/|es\/|it\/|zh\/)?([^"]*)"/g, function (m, rest) {
    if (/\.(css|js|png|jpg|jpeg|webp|svg|ico|woff2?)(\?|$)/i.test(rest)) return 'href="/proto/' + rest + '"';
    return 'href="' + pre + rest + '"';
  });
  /* adresses du site publié laissées dans une composition → le prototype */
  SITE_DIRS.forEach(function (d) {
    html = html.replace(new RegExp('href="/' + d + '/', "g"), 'href="' + pre + d + '/');
  });
  return html;
}

function translate(html, lang) {
  frKeys.forEach(function (fr) {
    var to = TR[fr][lang];
    if (!to || to === fr) return;
    /* uniquement un nœud de texte entier, jamais un fragment d'attribut */
    html = html.replace(new RegExp(">\\s*" + esc(fr) + "\\s*<", "g"), ">" + to + "<");
    /* et les textes alternatifs, qui sont du contenu eux aussi */
    html = html.replace(new RegExp('alt="' + esc(attr(fr)) + '"', "g"), 'alt="' + attr(to) + '"');
  });
  return html;
}

/* Le vocabulaire de la navigation est celui du site : les appels de l'accueil
   et les surtitres reprennent les mêmes six mots que le fil des rangs. Rien
   n'est traduit ici, tout est repris de L[] — et « voir les œuvres » emprunte
   la formule que le site emploie déjà (« Les œuvres »). */
var CTA = { en: "The works", es: "Las obras", it: "Le opere", zh: "作品" };

function vocab(html, lang) {
  L.fr.forEach(function (fr, i) {
    var to = L[lang][i], e = esc(fr);
    /* surtitre : « 01 · pourquoi » */
    html = html.replace(new RegExp("(\\d\\d)\\s*(?:&middot;|·)\\s*" + e + "(?=\\s*<)", "gi"),
      "$1 &middot; " + to);
    /* appels de l'accueil : <i>01</i>pourquoi */
    html = html.replace(new RegExp("(<i>" + NUM[i] + "</i>)" + e + "(?=<)", "gi"), "$1" + to);
  });
  if (CTA[lang]) html = html.replace(/>voir les œuvres /gi, ">" + CTA[lang] + " ");
  return html;
}

/* ---- 3. Production ---- */
var done = 0, missing = 0;
ROUTES.forEach(function (rel) {
  var srcFile = path.join(OUT, rel, "index.html");
  if (!fs.existsSync(srcFile)) { console.log("source absente : " + rel); return; }
  var src = fs.readFileSync(srcFile, "utf8");

  /* la composition française est corrigée elle aussi : ses appels sortaient du prototype */
  /* le pied de la composition française portait encore le sélecteur de langue
     du site publié : il envoyait hors du prototype */
  var fixedFr = relink(src, "fr")
    .replace(/<footer class="foot">[\s\S]*?<\/footer>/, footHtml("fr", rel ? rel + "/" : ""));
  if (fixedFr !== src) { fs.writeFileSync(srcFile, fixedFr); console.log("liens corrigés — /proto/" + rel); }
  src = fixedFr;

  var cur = rel === "" ? "" : (rel === "oeuvres" ? "oeuvres" : "reseau");

  LANGS.forEach(function (lang) {
    var h = src;
    h = h.replace(/<html lang="[^"]*"/, '<html lang="' + (lang === "zh" ? "zh-Hans" : lang) + '"');
    h = h.replace(/<nav class="nav">[\s\S]*?<\/nav>/, navHtml(lang, cur));
    h = h.replace(/<footer class="foot">[\s\S]*?<\/footer>/, footHtml(lang, rel ? rel + "/" : ""));
    h = relink(h, lang);
    h = translate(h, lang);
    h = vocab(h, lang);
    /* le titre de l'onglet est du contenu lui aussi */
    h = h.replace(/<title>([^<—]*)/, function (m, t) {
      var k = t.trim(), tr = TR[k] && TR[k][lang];
      return tr ? "<title>" + tr + " " : m;
    });

    var before = (h.match(/[À-ÿ]/g) || []).length;
    var dir = path.join(OUT, lang, rel);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), h);
    done++;
    void before;
  });
});
console.log("compositions produites : " + done + " (4 langues × " + ROUTES.length + " pages)");
console.log("chaînes traduisibles connues : " + frKeys.length);
void missing;
