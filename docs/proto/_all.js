/* PARITÉ DE CONTENU — toute route du site a sa contrepartie dans le prototype.
   Le contenu est repris TEL QUEL des pages publiées : seule l'enveloppe change
   (colonne de chiffre, filets, rail de navigation). Aucun texte réécrit.
   Run: node docs/proto/_all.js                                              */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.resolve(__dirname, "../..");
var DOCS = path.join(ROOT, "docs"), OUT = path.join(DOCS, "proto");

var SECTIONS = [
  { n: "01", slug: "pourquoi",     label: "pourquoi",     href: "/proto/pourquoi/",     c: "var(--red)" },
  { n: "02", slug: "oeuvres",      label: "œuvres",       href: "/proto/oeuvres/",      c: "var(--mag)" },
  { n: "03", slug: "laboratoire",  label: "laboratoire",  href: "/proto/laboratoire/",  c: "var(--cy)" },
  { n: "04", slug: "reseau",       label: "réseau",       href: "/proto/reseau/",       c: "var(--blu)" },
  { n: "05", slug: "transmission", label: "transmission", href: "/proto/transmission/", c: "var(--grn)" },
  { n: "06", slug: "soutenir",     label: "soutenir",     href: "/proto/soutenir/",     c: "var(--ink)" }
];
/* Rattachement d'une route à sa section. La presse, les actualités et les
   mentions restent des couches transversales : elles ne portent pas de rang,
   conformément à la DA. */
function belongs(route) {
  var r = route.replace(/^\/|\/$/g, "").split("/")[0];
  if (r === "pourquoi") return SECTIONS[0];
  if (r === "oeuvres" || r === "productions" || r === "parcours") return SECTIONS[1];
  if (r === "laboratoire" || r === "lips" || r === "recherche") return SECTIONS[2];
  if (r === "reseau" || r === "artists" || r === "cooperation") return SECTIONS[3];
  if (r === "transmission") return SECTIONS[4];
  if (r === "soutenir") return SECTIONS[5];
  return null;                     /* presse, news, mentions-legales */
}
var POSES = ["", "sec--right", "sec--wide", "sec--right"];
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

/* gabarit repris d'une page déjà produite : une seule source de vérité */
var ref = fs.readFileSync(path.join(OUT, "pourquoi", "index.html"), "utf8");
var HEAD_A = ref.slice(0, ref.indexOf("<title>"));
var FILTERS = ref.slice(ref.indexOf('<svg width="0"'), ref.indexOf("</svg>") + 6);
var iF = ref.indexOf('<div class="flag">');
var FLAG = ref.slice(iF, ref.indexOf("</div></div>", iF) + 12);
var FOOT = ref.slice(ref.indexOf('<footer class="foot">'), ref.indexOf("</footer>") + 9);
var iS = ref.lastIndexOf("<script>");
var RAILJS = iS < 0 ? "" : ref.slice(iS, ref.indexOf("</script>", iS) + 9);

function nav(cur) {
  return '<nav class="nav"><div class="wrap">' +
    '<a class="brand" href="/proto/" aria-label="STOPERA! — accueil du prototype">' +
    '<img src="/assets/logo-dark.png" alt="STOPERA!" /></a><div class="nav-rail">' +
    SECTIONS.map(function (s) {
      return '<a class="n" href="' + s.href + '"' + (s.slug === cur ? ' aria-current="page"' : "") +
        ' style="--sec:' + s.c + '"><i>' + s.n + "</i>" + s.label + "</a>";
    }).join("") + "</div></div></nav>";
}
function page(o) {
  return HEAD_A + "<title>" + esc(o.title) + " — STOPERA! (prototype V2)</title>\n" +
    '<link rel="icon" type="image/png" href="/assets/favicon.png" />\n' +
    '<link rel="stylesheet" href="/assets/fonts/fonts.css" />\n' +
    '<link rel="stylesheet" href="/proto/proto.css" />\n' +
    "<style>:root{--sec:" + o.sec + "}</style>\n</head>\n<body>\n" +
    FILTERS + "\n" + FLAG + "\n" + nav(o.current) + "\n" + o.body + "\n" + FOOT + "\n" +
    RAILJS + "\n</body>\n</html>\n";
}

/* ---- extraction du contenu, sans y toucher ---- */
function mainOf(file) {
  var h = fs.readFileSync(file, "utf8");
  var i = h.indexOf("<main"), j = h.indexOf("</main>");
  if (i < 0 || j < 0) return null;
  var body = h.slice(h.indexOf(">", i) + 1, j);
  /* on retire le maillage : le prototype le régénère à sa façon */
  body = body.replace(/<section class="mesh"[\s\S]*?<\/section>/g, "");
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

/* ---- toutes les routes françaises du site ---- */
var SKIP = ["assets", "en", "es", "it", "zh", "proto"];
var DEJA = { "": 1, "oeuvres": 1, "artistes": 1 };   /* pages composées à la main */
var routes = [];
(function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(dir, e.name);
    if (e.isDirectory()) { if (SKIP.indexOf(e.name) < 0) walk(f); return; }
    if (e.name !== "index.html") return;
    var rel = path.relative(DOCS, dir).split(path.sep).join("/");
    routes.push(rel);
  });
})(DOCS);

var made = 0, skipped = 0;
routes.forEach(function (rel) {
  if (DEJA[rel] || rel.indexOf("proto") === 0) { skipped++; return; }
  /* les fiches d'œuvre du prototype sont composées à la main : on ne les écrase pas */
  if (rel.indexOf("productions/") === 0 &&
      fs.existsSync(path.join(OUT, "oeuvres", rel.slice("productions/".length), "index.html"))) { skipped++; return; }
  var src = mainOf(path.join(DOCS, rel, "index.html"));
  if (!src) return;
  var sec = belongs("/" + rel + "/");
  var num = sec ? sec.n : "";
  var col = sec ? sec.c : "var(--ink)";
  var body = blocks(src.body).map(function (b, i) {
    return '<section class="sec ' + POSES[i % POSES.length] + '" style="--sec:' + col + '">' +
      '<div class="wrap">' + (num ? '<div class="num" aria-hidden="true">' + num + "</div>" : '<div class="num"></div>') +
      '<div class="body">' +
      (b.eyebrow ? '<p class="eyebrow">' + (num ? num + " &middot; " : "") + b.eyebrow + "</p>" : "") +
      b.html + "</div></div></section>";
  }).join("");
  var dir = path.join(OUT, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"),
    page({ title: src.title, current: sec ? sec.slug : "", body: body, sec: col }));
  made++;
});
console.log("parité : " + made + " page(s) produite(s), " + skipped + " conservée(s) telles quelles");
