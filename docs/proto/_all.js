/* PARITÉ — toute route du site, dans les CINQ langues, a sa contrepartie.
   Le contenu est repris TEL QUEL des pages publiées ; seule l'enveloppe change.
   Aucun texte réécrit, aucun libellé inventé : les intitulés de navigation sont
   ceux du site.
   Run: node docs/proto/_all.js                                             */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.resolve(__dirname, "../..");
var DOCS = path.join(ROOT, "docs"), OUT = path.join(DOCS, "proto");
var LANGS = ["fr", "en", "es", "it", "zh"];

/* Libellés relevés sur le site lui-même, pas traduits par nos soins. */
var L = {
  fr: ["pourquoi", "œuvres", "laboratoire", "réseau", "transmission", "soutenir"],
  en: ["why", "works", "laboratory", "network", "transmission", "support"],
  es: ["por qué", "obras", "laboratorio", "red", "transmisión", "apoyar"],
  it: ["perché", "opere", "laboratorio", "rete", "trasmissione", "sostenere"],
  zh: ["为何", "作品", "实验室", "网络", "传承", "支持"]
};
var SLUG = ["pourquoi", "oeuvres", "laboratoire", "reseau", "transmission", "soutenir"];
var COL = ["var(--red)", "var(--mag)", "var(--cy)", "var(--blu)", "var(--grn)", "var(--ink)"];
var NUM = ["01", "02", "03", "04", "05", "06"];

function pre(lang) { return lang === "fr" ? "/proto/" : "/proto/" + lang + "/"; }
function belongs(route) {
  var r = route.replace(/^\/|\/$/g, "").split("/")[0];
  if (r === "pourquoi") return 0;
  if (r === "oeuvres" || r === "productions" || r === "parcours") return 1;
  if (r === "laboratoire" || r === "lips" || r === "recherche") return 2;
  if (r === "reseau" || r === "artists" || r === "cooperation") return 3;
  if (r === "transmission") return 4;
  if (r === "soutenir") return 5;
  return -1;                       /* presse, news, mentions : transversales */
}
var POSES = ["", "sec--right", "sec--wide", "sec--right"];
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

/* gabarit repris d'une page déjà produite */
var ref = fs.readFileSync(path.join(OUT, "pourquoi", "index.html"), "utf8");
var HEAD_A = ref.slice(0, ref.indexOf("<title>"));
var FILTERS = ref.slice(ref.indexOf('<svg width="0"'), ref.indexOf("</svg>") + 6);
var iF = ref.indexOf('<div class="flag">');
var FLAG = ref.slice(iF, ref.indexOf("</div></div>", iF) + 12);
var iS = ref.lastIndexOf("<script>");
var RAILJS = iS < 0 ? "" : ref.slice(iS, ref.indexOf("</script>", iS) + 9);

function nav(lang, cur) {
  return '<nav class="nav"><div class="wrap">' +
    '<a class="brand" href="' + pre(lang) + '" aria-label="STOPERA!">' +
    '<img src="/assets/logo-dark.png" alt="STOPERA!" /></a><div class="nav-rail">' +
    SLUG.map(function (s, i) {
      return '<a class="n" href="' + pre(lang) + s + '/"' + (s === cur ? ' aria-current="page"' : "") +
        ' style="--sec:' + COL[i] + '"><i>' + NUM[i] + "</i>" + L[lang][i] + "</a>";
    }).join("") + "</div></div></nav>";
}
/* Le pied porte le sélecteur de langue : sans lui, les traductions sont
   injoignables depuis la page qu'on lit. */
function foot(lang, route) {
  var alt = LANGS.map(function (l) {
    var n = { fr: "Français", en: "English", es: "Español", it: "Italiano", zh: "中文" }[l];
    return l === lang ? '<span aria-current="true">' + n + "</span>"
      : '<a href="' + pre(l) + route + '">' + n + "</a>";
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
function page(o) {
  return HEAD_A.replace('<html lang="fr">', '<html lang="' + (o.lang === "zh" ? "zh-Hans" : o.lang) + '">') +
    "<title>" + esc(o.title) + " — STOPERA! (prototype V2)</title>\n" +
    '<link rel="icon" type="image/png" href="/assets/favicon.png" />\n' +
    '<link rel="stylesheet" href="/assets/fonts/fonts.css" />\n' +
    '<link rel="stylesheet" href="/proto/proto.css" />\n' +
    "<style>:root{--sec:" + o.sec + "}</style>\n</head>\n<body>\n" +
    FILTERS + "\n" + FLAG + "\n" + nav(o.lang, o.current) + "\n" + o.body + "\n" +
    foot(o.lang, o.route) + "\n" + RAILJS + "\n</body>\n</html>\n";
}
function mainOf(file) {
  var h = fs.readFileSync(file, "utf8");
  var i = h.indexOf("<main"), j = h.indexOf("</main>");
  if (i < 0 || j < 0) return null;
  var body = h.slice(h.indexOf(">", i) + 1, j).replace(/<section class="mesh"[\s\S]*?<\/section>/g, "");
  var t = h.match(/<title>([^<]*)</);
  return { body: body, title: t ? t[1].split("—")[0].trim() : "STOPERA!" };
}
function blocks(main) {
  var out = [], re = /<(section|article)[^>]*class="[^"]*\bsection\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g, m;
  while ((m = re.exec(main))) {
    var inner = m[2];
    var eb = inner.match(/<span class="eyebrow"[^>]*>([\s\S]*?)<\/span>/);
    var cb = inner.match(/<div class="col-body">([\s\S]*)<\/div>\s*<\/div>/);
    out.push({ eyebrow: eb ? eb[1].trim() : "", html: cb ? cb[1] : inner });
  }
  if (!out.length) out.push({ eyebrow: "", html: main.replace(/<h1[^>]*class="visually-hidden"[\s\S]*?<\/h1>/, "") });
  return out;
}

/* routes françaises de référence */
var SKIP = ["assets", "proto"].concat(LANGS.slice(1));
var routes = [];
(function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(dir, e.name);
    if (e.isDirectory()) { if (SKIP.indexOf(e.name) < 0) walk(f); return; }
    if (e.name === "index.html") routes.push(path.relative(DOCS, dir).split(path.sep).join("/"));
  });
})(DOCS);

/* pages composées à la main : jamais écrasées, et seulement en français */
var MAIN_FR = { "": 1, "oeuvres": 1, "artists": 1 };
var made = 0;
LANGS.forEach(function (lang) {
  routes.forEach(function (rel) {
    if (lang === "fr" && (MAIN_FR[rel] || rel.indexOf("productions/") === 0)) return;
    var srcFile = path.join(DOCS, lang === "fr" ? rel : path.join(lang, rel), "index.html");
    if (!fs.existsSync(srcFile)) return;
    var src = mainOf(srcFile);
    if (!src) return;
    var i = belongs("/" + rel + "/");
    var col = i >= 0 ? COL[i] : "var(--ink)";
    var num = i >= 0 ? NUM[i] : "";
    var body = blocks(src.body).map(function (b, k) {
      return '<section class="sec ' + POSES[k % POSES.length] + '" style="--sec:' + col + '">' +
        '<div class="wrap"><div class="num" aria-hidden="true">' + num + "</div>" +
        '<div class="body">' +
        (b.eyebrow ? '<p class="eyebrow">' + (num ? num + " &middot; " : "") + b.eyebrow + "</p>" : "") +
        b.html + "</div></div></section>";
    }).join("");
    var dir = path.join(OUT, lang === "fr" ? rel : path.join(lang, rel));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), page({
      title: src.title, current: i >= 0 ? SLUG[i] : "", body: body,
      sec: col, lang: lang, route: rel ? rel + "/" : ""
    }));
    made++;
  });
});
console.log("pages produites : " + made + " (5 langues)");
