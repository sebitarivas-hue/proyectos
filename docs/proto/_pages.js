/* Pages « reprises » du prototype V2.
   Lit les pages publiées, en extrait le corps TEL QUEL et ne change que
   l'enveloppe : colonne de chiffre, filets, pastilles. Aucun texte réécrit.
   Vit dans le dépôt pour survivre aux redémarrages d'environnement.
   Run: node docs/proto/_pages.js                                          */
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
var POSES = ["", "sec--right", "sec--wide", "sec--right"];
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

/* Le gabarit est repris d'une page déjà produite : une seule source de vérité
   pour l'en-tête, les filtres, le pied et le rail de navigation. */
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
    '<link rel="stylesheet" href="/proto/proto.css?v=5" />\n' +
    "<style>:root{--sec:" + o.sec + "}</style>\n</head>\n<body>\n" +
    FILTERS + "\n" + FLAG + "\n" + nav(o.current) + "\n" + o.body + "\n" + FOOT + "\n" +
    RAILJS + "\n</body>\n</html>\n";
}
function readMain(rel) {
  var f = path.join(DOCS, rel, "index.html");
  if (!fs.existsSync(f)) return null;
  var h = fs.readFileSync(f, "utf8");
  var i = h.indexOf("<main"), j = h.indexOf("</main>");
  return i < 0 || j < 0 ? null : h.slice(h.indexOf(">", i) + 1, j);
}
function blocks(main) {
  if (!main) return [];
  var out = [], re = /<section[^>]*class="section"[^>]*>([\s\S]*?)<\/section>/g, m;
  while ((m = re.exec(main))) {
    var inner = m[1];
    var eb = inner.match(/<span class="eyebrow"[^>]*>([\s\S]*?)<\/span>/);
    var cb = inner.match(/<div class="col-body">([\s\S]*)<\/div>\s*<\/div>/);
    out.push({ eyebrow: eb ? eb[1].trim() : "", html: cb ? cb[1] : inner });
  }
  if (!out.length) out.push({ eyebrow: "", html: main.replace(/<h1[^>]*class="visually-hidden"[\s\S]*?<\/h1>/, "") });
  return out;
}

[
  { s: SECTIONS[0], from: "pourquoi",     out: "pourquoi",     title: "Pourquoi" },
  { s: SECTIONS[2], from: "laboratoire",  out: "laboratoire",  title: "Laboratoire" },
  { s: SECTIONS[3], from: "reseau",       out: "reseau",       title: "Réseau" },
  { s: SECTIONS[4], from: "transmission", out: "transmission", title: "Transmission" },
  { s: SECTIONS[5], from: "soutenir",     out: "soutenir",     title: "Soutenir" }
].forEach(function (pg) {
  var bl = blocks(readMain(pg.from));
  if (!bl.length) { console.log("  absente : " + pg.from); return; }
  var body = bl.map(function (b, i) {
    return '<section class="sec ' + POSES[i % POSES.length] + '" style="--sec:' + pg.s.c + '">' +
      '<div class="wrap"><div class="num" aria-hidden="true">' + pg.s.n + '</div><div class="body">' +
      (b.eyebrow ? '<p class="eyebrow">' + pg.s.n + " &middot; " + b.eyebrow + "</p>" : "") +
      b.html + "</div></div></section>";
  }).join("");
  fs.mkdirSync(path.join(OUT, pg.out), { recursive: true });
  fs.writeFileSync(path.join(OUT, pg.out, "index.html"),
    page({ title: pg.title, current: pg.s.slug, body: body, sec: pg.s.c }));
  console.log("  " + pg.out.padEnd(14) + bl.length + " bloc(s) repris tels quels");
});

/* Le rang 04 pointe vers la page réseau complète, sur toutes les pages. */
var n = 0;
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var f = path.join(d, e.name);
    if (e.isDirectory()) return walk(f);
    if (e.name !== "index.html") return;
    var h = fs.readFileSync(f, "utf8"), b = h;
    h = h.replace(/href="\/proto\/artistes\/"(\s*style="--sec:var\(--blu\)")?><i>04<\/i>réseau/g,
      'href="/proto/reseau/"$1><i>04</i>réseau');
    if (h !== b) { fs.writeFileSync(f, h); n++; }
  });
})(OUT);
console.log("navigation : 04 → /proto/reseau/ sur " + n + " page(s)");
