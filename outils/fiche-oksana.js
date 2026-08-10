/* LA FICHE D'OKSANA TRYPOLSKA, PRÉSIDENTE DU CONSEIL D'ADMINISTRATION.
   Elle était nommée à deux endroits — le conseil sur /reseau/ et la direction
   de la publication dans les mentions légales — sans jamais avoir de page.
   Son nom n'était même pas cliquable.

   Sa fiche vit avec les autres fiches de personnes, /artists/<slug>/, parce
   que c'est là que le maillage éditorial les trouve. Mais elle n'entre PAS
   dans l'index des artistes : elle n'en est pas une, sa place éditoriale est
   la gouvernance, dans la section 04 — Réseau. C'est de là qu'on y accède.

   Le texte est celui fourni par la direction artistique, débarrassé des
   scories de copier-coller. Rien n'y est ajouté.

   Run: node outils/fiche-oksana.js                                          */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var SLUG = "oksana-trypolska";
var MODELE = path.join(DOCS, "artists", "anne-laure-chamboissier", "index.html");

var T = {
  role: {
    fr: "Présidente · conseil d'administration", en: "President · board",
    es: "Presidenta · consejo", it: "Presidente · consiglio direttivo", zh: "理事会主席"
  },
  pitch: {
    fr: "Experte de l'art ukrainien du XX<sup>e</sup> siècle, elle possède une double compétence technique et académique. Elle préside le conseil d'administration de STOPERA!.",
    en: "An expert in twentieth-century Ukrainian art, she brings a dual technical and academic background. She chairs the board of STOPERA!.",
    es: "Experta en arte ucraniano del siglo XX, reúne una doble competencia técnica y académica. Preside el consejo de administración de STOPERA!.",
    it: "Esperta di arte ucraina del Novecento, unisce una doppia competenza tecnica e accademica. Presiede il consiglio direttivo di STOPERA!.",
    zh: "二十世纪乌克兰艺术专家，兼具技术与学术的双重素养。她担任 STOPERA! 理事会主席。"
  },
  hFormation: { fr: "Formation", en: "Education", es: "Formación", it: "Formazione", zh: "学历" },
  hParcours: { fr: "Parcours", en: "Career", es: "Trayectoria", it: "Percorso", zh: "履历" },
  formation: [
    { k: { fr: "Master en Arts", en: "Master in Arts", es: "Máster en Artes", it: "Master in Arti", zh: "艺术硕士" },
      v: { fr: "Institut polytechnique de Kiev · 2007–2013", en: "Kyiv Polytechnic Institute · 2007–2013",
           es: "Instituto Politécnico de Kiev · 2007–2013", it: "Istituto Politecnico di Kiev · 2007–2013",
           zh: "基辅理工学院 · 2007–2013" } },
    { k: { fr: "Master en Archéologie et histoire de l'art", en: "Master in Archaeology and Art History",
           es: "Máster en Arqueología e historia del arte", it: "Master in Archeologia e storia dell'arte",
           zh: "考古与艺术史硕士" },
      v: { fr: "Université Paris-Sorbonne · 2015–2017", en: "Université Paris-Sorbonne · 2015–2017",
           es: "Université Paris-Sorbonne · 2015–2017", it: "Université Paris-Sorbonne · 2015–2017",
           zh: "巴黎索邦大学 · 2015–2017" } }
  ],
  parcours: [
    { k: { fr: "Consultante indépendante", en: "Independent consultant", es: "Consultora independiente",
           it: "Consulente indipendente", zh: "独立顾问" },
      v: { fr: "Depuis 2017 — conseil aux collectionneurs et aux institutions sur l'art ukrainien du XX<sup>e</sup> siècle et l'art contemporain français.",
           en: "Since 2017 — advising collectors and institutions on twentieth-century Ukrainian art and French contemporary art.",
           es: "Desde 2017 — asesoría a coleccionistas e instituciones sobre el arte ucraniano del siglo XX y el arte contemporáneo francés.",
           it: "Dal 2017 — consulenza a collezionisti e istituzioni sull'arte ucraina del Novecento e sull'arte contemporanea francese.",
           zh: "自2017年起 — 为藏家与机构提供二十世纪乌克兰艺术及法国当代艺术方面的咨询。" } },
    { k: { fr: "Galerie Trypolska", en: "Galerie Trypolska", es: "Galerie Trypolska", it: "Galerie Trypolska", zh: "Trypolska 画廊" },
      v: { fr: "Fondatrice, 2021 — une structure dédiée à la promotion de l'art ukrainien.",
           en: "Founder, 2021 — a gallery devoted to promoting Ukrainian art.",
           es: "Fundadora, 2021 — una estructura dedicada a la promoción del arte ucraniano.",
           it: "Fondatrice, 2021 — una struttura dedicata alla promozione dell'arte ucraina.",
           zh: "创始人，2021年 — 一个致力于推广乌克兰艺术的机构。" } },
    { k: { fr: "Institut ukrainien", en: "Ukrainian Institute", es: "Instituto Ucraniano",
           it: "Istituto ucraino", zh: "乌克兰学院" },
      v: { fr: "Responsable des programmes culturels, antenne française (Gaîté Lyrique) — conception et supervision de la programmation.",
           en: "Head of cultural programmes, French branch (Gaîté Lyrique) — designing and overseeing the programme.",
           es: "Responsable de programas culturales, sede francesa (Gaîté Lyrique) — concepción y supervisión de la programación.",
           it: "Responsabile dei programmi culturali, sede francese (Gaîté Lyrique) — ideazione e supervisione della programmazione.",
           zh: "法国分部（Gaîté Lyrique）文化项目负责人 — 策划与统筹节目安排。" } }
  ],
  retour: { fr: "← Réseau", en: "← Network", es: "← Red", it: "← Rete", zh: "← 网络" }
};

function attrs(champ, cle) {
  return LANGS.map(function (l) {
    return ' data-' + l + '="' + T[champ][l].replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
  }).join("");
}
function attrsDe(obj) {
  return LANGS.map(function (l) {
    return ' data-' + l + '="' + obj[l].replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
  }).join("");
}
function pre(lang) { return lang === "fr" ? "/" : "/" + lang + "/"; }

function liste(entrees, lang) {
  return '<ul class="facts">' + entrees.map(function (e) {
    return "<li>" + '<span class="k"' + attrsDe(e.k) + ">" + e.k[lang] + "</span>" +
      '<span class="v"' + attrsDe(e.v) + ">" + e.v[lang] + "</span></li>";
  }).join("") + "</ul>";
}

var modele = fs.readFileSync(MODELE, "utf8");
var head = modele.slice(0, modele.indexOf("<body"));
var svg = modele.slice(modele.indexOf("<svg"), modele.indexOf("</svg>") + 6);
var nav = modele.slice(modele.indexOf('<nav class="nav">'), modele.indexOf("</nav>") + 6);
var pied = modele.slice(modele.indexOf('<footer class="foot">'), modele.indexOf("</footer>") + 9);
var fin = modele.slice(modele.indexOf("</footer>") + 9);

var faits = 0;
LANGS.forEach(function (lang) {
  var dir = path.join(DOCS, lang === "fr" ? "" : lang, "artists", SLUG);
  fs.mkdirSync(dir, { recursive: true });

  var h = head
    .replace(/<html lang="[^"]*"/, '<html lang="' + (lang === "zh" ? "zh-Hans" : lang) + '"')
    .replace(/<title>[^<]*<\/title>/, "<title>Oksana Trypolska — STOPERA!</title>");

  /* la navigation et le pied de cette langue sont posés ensuite par les
     outils dédiés ; ici on écrit ceux du modèle, puis on les corrige */
  var corps =
    '<section class="sec " style="--sec:var(--blu)"><div class="wrap">' +
    '<div class="num" aria-hidden="true">04</div><div class="body">' +
    '<p class="pd-eyebrow"><a href="' + pre(lang) + 'reseau/"' + attrs("retour") + ">" + T.retour[lang] + "</a></p>" +
    '<div class="artist-head">' +
    '<div class="artist-portrait artist-mono" style="background:linear-gradient(152deg,#1F1BD8 0%,#00A9BC 100%);color:#ffffff" aria-hidden="true"><span>OT</span></div>' +
    '<div><h1 class="pd-title pd-title--page">Oksana Trypolska</h1>' +
    '<p class="artist-role-lg"' + attrs("role") + ">" + T.role[lang] + "</p></div></div>" +
    '<p class="pd-pitch"' + attrs("pitch") + ">" + T.pitch[lang] + "</p>" +
    '<div class="pd-block"><h4' + attrs("hFormation") + ">" + T.hFormation[lang] + "</h4>" +
    liste(T.formation, lang) + "</div>" +
    '<div class="pd-block"><h4' + attrs("hParcours") + ">" + T.hParcours[lang] + "</h4>" +
    liste(T.parcours, lang) + "</div>" +
    "</div></div></section>";

  fs.writeFileSync(path.join(dir, "index.html"),
    h + '<body data-section="artistes">\n' + svg + "\n" + nav + "\n" + corps + "\n" + pied + fin);
  faits++;
});

/* son nom devient cliquable là où il est déjà écrit : le conseil */
var liens = 0;
LANGS.forEach(function (lang) {
  var f = path.join(DOCS, lang === "fr" ? "" : lang, "reseau", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;
  h = h.replace(/<span class="who">Oksana Trypolska<\/span>/g,
    '<span class="who"><a href="' + pre(lang) + "artists/" + SLUG + '/">Oksana Trypolska</a></span>');
  if (h !== avant) { fs.writeFileSync(f, h); liens++; }
});

console.log("fiche créée dans " + faits + " langue(s) ; nom rendu cliquable sur " +
  liens + " page(s) du réseau");
