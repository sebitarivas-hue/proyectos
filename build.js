/* STOPERA! — static page generator.
   Single source of truth = the PROJECTS array in docs/script.js.
   Emits standalone, shareable pages with their own SEO / OG / canonical:
     docs/productions/<slug>/index.html
     docs/lips/index.html
     docs/news/<slug>/index.html  + docs/news/index.html
     docs/sitemap.xml
   Run: node build.js   (from repo root) */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.join(__dirname, "docs");
var SITE = "https://sebitarivas-hue.github.io/proyectos";
var LANGS = ["fr", "es", "en", "zh"];

/* ---- load data from script.js (no duplication) ---- */
var src = fs.readFileSync(path.join(DOCS, "script.js"), "utf8");
function grab(re) { var m = src.match(re); if (!m) throw new Error("not found: " + re); return m[1]; }
var sandbox = "var ONGOING=" + grab(/var ONGOING = (\{[^;]*\});/)
  + ";var YEARS=" + grab(/var YEARS = (\{[\s\S]*?\});/)
  + ";var PERIOD=" + grab(/var PERIOD = (\{[^;]*\});/)
  + ";var COLORS=" + grab(/var COLORS = (\{[\s\S]*?\});/)
  + ";var DIM=" + grab(/var DIM = (\{[\s\S]*?\n  \});/)
  + ";var PROJECTS=" + grab(/var PROJECTS = (\[[\s\S]*?\n  \]);/)
  + ";return {YEARS:YEARS,PERIOD:PERIOD,COLORS:COLORS,DIM:DIM,PROJECTS:PROJECTS};";
var DATA = new Function(sandbox)();
var PROJECTS = DATA.PROJECTS, YEARS = DATA.YEARS, COLORS = DATA.COLORS, DIM = DATA.DIM;
var bySlug = {}; PROJECTS.forEach(function (p) { bySlug[p.slug] = p; });
Object.keys(DIM).forEach(function (s) { if (bySlug[s]) { if (DIM[s].tx) bySlug[s].transmission = DIM[s].tx; if (DIM[s].terr) bySlug[s].territory = DIM[s].terr; } });

/* ---- Layer 2 : navigation éditoriale (parcours thématiques transversaux) ---- */
var THEMES = [
  { slug: "temps-reel",
    title: { fr: "Temps réel & technologie", es: "Tiempo real & tecnología", en: "Real time & technology", zh: "实时与技术" },
    blurb: { fr: "L'image, le geste et la voix transformés en direct : capteurs, vidéo, électronique et image générée deviennent matière de plateau.",
             es: "La imagen, el gesto y la voz transformados en directo: sensores, vídeo, electrónica e imagen generada se vuelven materia escénica.",
             en: "Image, gesture and voice transformed live: sensors, video, electronics and generated imagery become stage material.",
             zh: "影像、动作与人声的实时转化：传感器、影像、电子与生成图像成为舞台素材。" },
    items: ["ooo", "rayon-n", "rut", "aliados", "snow-on-her-lips", "fame"] },
  { slug: "posthumain-memoire",
    title: { fr: "Post-humain & mémoire", es: "Posthumano & memoria", en: "Post-human & memory", zh: "后人类与记忆" },
    blurb: { fr: "Des mondes où l'humain n'est plus au centre : objets, machines et images qui se souviennent à notre place. Ce qui reste, et ce qui se souvient, quand nous ne sommes plus là.",
             es: "Mundos donde lo humano ya no está en el centro: objetos, máquinas e imágenes que recuerdan en nuestro lugar. Lo que queda, y lo que recuerda, cuando ya no estamos.",
             en: "Worlds where the human is no longer the centre: objects, machines and images that remember in our place. What remains, and what remembers, when we are gone.",
             zh: "人类不再居于中心的世界：替我们记忆的物件、机器与影像。当我们不再在场，什么留存，什么记忆。" },
    items: ["ooo", "rayon-n", "war-madrigals"] },
  { slug: "memoire-politique",
    title: { fr: "Mémoire & politique", es: "Memoria & política", en: "Memory & politics", zh: "记忆与政治" },
    blurb: { fr: "Pouvoir, histoire et résistance : des figures réelles ou de fiction qui interrogent la responsabilité, la violence et la liberté.",
             es: "Poder, historia y resistencia: figuras reales o de ficción que interrogan la responsabilidad, la violencia y la libertad.",
             en: "Power, history and resistance: real or fictional figures questioning responsibility, violence and freedom.",
             zh: "权力、历史与抵抗：真实或虚构的人物，叩问责任、暴力与自由。" },
    items: ["aliados", "otages", "america", "mamma-roma", "insistir"] },
  { slug: "voix-texte",
    title: { fr: "Voix & texte", es: "Voz & texto", en: "Voice & text", zh: "人声与文本" },
    blurb: { fr: "L'écriture au cœur du plateau : livrets, auteurs et la parole comme matière musicale, de Christine Angot à Pasolini.",
             es: "La escritura en el centro de la escena: libretos, autores y la palabra como materia musical, de Christine Angot a Pasolini.",
             en: "Writing at the heart of the stage: librettos, authors and the spoken word as musical material, from Christine Angot to Pasolini.",
             zh: "写作居于舞台核心：剧本、作者与作为音乐素材的言语，从 Christine Angot 到帕索里尼。" },
    items: ["nous", "otages", "war-madrigals", "aliados", "america"] },
  { slug: "corps-presence",
    title: { fr: "Corps & présence", es: "Cuerpo & presencia", en: "Body & presence", zh: "身体与在场" },
    blurb: { fr: "La performance, le geste et la présence comme acte — du solo au corps parmi les objets et les machines.",
             es: "La performance, el gesto y la presencia como acto — del solo al cuerpo entre los objetos y las máquinas.",
             en: "Performance, gesture and presence as act — from the solo to the body among objects and machines.",
             zh: "表演、动作与作为行动的在场——从独角到置身于物件与机器之间的身体。" },
    items: ["ooo", "rut", "fame", "insistir", "snow-on-her-lips"] }
];

/* ---- helpers ---- */
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
function tFR(o) { return o == null ? "" : (typeof o === "object" ? (o.fr || "") : o); }
function plain(o) { return tFR(o).replace(/<[^>]+>/g, ""); } // strip HTML for meta
/* data-* attributes for client-side i18n (script.js fills innerHTML) */
function ml(o) {
  if (o == null) return "";
  if (typeof o !== "object") o = { fr: o, es: o, en: o, zh: o };
  return LANGS.map(function (l) { return 'data-' + l + '="' + esc(o[l] != null ? o[l] : o.fr) + '"'; }).join(" ");
}
/* name → fiche : rendre tout nom d'artiste cliquable sur les pages projet */
var NAME2SLUG = {
  "Sebastian Rivas": "sebastian-rivas", "Georges Aperghis": "georges-aperghis", "Olivia Martin": "olivia-martin",
  "Nicola Beller Carbone": "nicola-beller-carbone", "Martin Bauer": "martin-bauer", "Antoine Gindt": "antoine-gindt",
  "Rut Schreiner": "rut-schreiner", "Léo Warynski": "leo-warynski", "Christine Angot": "christine-angot",
  "Marcelo Lombardero": "marcelo-lombardero", "Emma Terno": "emma-terno", "Valentín Pelisch": "valentin-pelisch",
  "Daniel Zea": "daniel-zea", "Nina Bouraoui": "nina-bouraoui", "Esteban Buch": "esteban-buch",
  "Richard Brunel": "richard-brunel", "Philippe Béziat": "philippe-beziat", "Anne-Laure Chamboissier": "anne-laure-chamboissier",
  "Guillaume Kosmicki": "guillaume-kosmicki"
};
var NAME_LIST = Object.keys(NAME2SLUG).sort(function (a, b) { return b.length - a.length; });
function linkNames(s, rel) {
  var out = esc(String(s));
  NAME_LIST.forEach(function (n) { if (out.indexOf(n) >= 0) out = out.split(n).join('<a href="' + rel + 'artists/' + NAME2SLUG[n] + '/">' + n + "</a>"); });
  return out;
}
/* institutions → site officiel (lien sur les partenaires des pages projet) */
var INST = [["GRAME","https://www.grame.fr"],["Teatro Colón","https://teatrocolon.org.ar"],["Ensemble intercontemporain","https://www.ensembleinter.com"],["Métaboles","https://www.lesmetaboles.fr"],["Opéra de Lyon","https://www.opera-lyon.com"],["Croix-Rousse","https://croix-rousse.com"],["Gennevilliers","https://www.theatre2gennevilliers.com"],["Monte-Carlo","https://www.printempsdesarts.mc"],["Pôle Pixel","https://www.pole-pixel.com"],["UNSAM","https://www.unsam.edu.ar"],["Latinoamérica","https://operala.org"],["Ville de Gentilly","https://www.ville-gentilly.fr"],["Muse en Circuit","https://alamuse.com"],["Chartreuse","https://www.chartreuse.org"],["Générateur","https://legenerateur.com"],["ManiFeste","https://www.ircam.fr/agenda/festival"],["Ircam","https://www.ircam.fr"],["T&M","https://theatre-musique.com"],["Radio France","https://www.radiofrance.fr"]];
function linkInst(x) {
  for (var i = 0; i < INST.length; i++) { if (x.indexOf(INST[i][0]) >= 0) return '<a href="' + INST[i][1] + '" target="_blank" rel="noopener">' + esc(x) + "</a>"; }
  return esc(x);
}
function hx(h){h=h.replace("#","");return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function darken(h,f){var c=hx(h);function x(n){n=Math.max(0,Math.min(255,Math.round(n)));return("0"+n.toString(16)).slice(-2);}return"#"+x(c[0]*f)+x(c[1]*f)+x(c[2]*f);}
function inkOn(h){var c=hx(h);return(0.299*c[0]+0.587*c[1]+0.114*c[2])/255>0.62?"#1a1410":"#ffffff";}
function tileBg(slug){var b=COLORS[slug]||"#4f5f60";return"linear-gradient(152deg,"+b+" 0%,"+darken(b,0.86)+" 100%)";}

function header(rel) {
  // target starting with "#" = anchor on home ; otherwise a standalone page path
  var nav = [["#apropos","À propos","Acerca de","About","关于"],["#productions","Productions","Producciones","Productions","作品"],
    ["#recherche","Recherche & LIPS","Investigación & LIPS","Research & LIPS","研究 & LIPS"],
    ["#reseau","Réseau international","Red internacional","International network","国际网络"],
    ["#rejoindre","Rejoindre & contact","Unirse & contacto","Join & contact","加入与联系"]]
    .map(function (n) { var href = n[0].charAt(0) === "#" ? rel + "index.html" + n[0] : rel + n[0];
      return '<a href="' + href + '" data-fr="' + n[1] + '" data-es="' + n[2] + '" data-en="' + n[3] + '" data-zh="' + n[4] + '"></a>'; }).join("\n      ");
  return '<header class="site-header">\n'
    + '    <a class="brand" href="' + rel + 'index.html" aria-label="STOPERA!"><img class="brand-logo" src="' + rel + 'assets/logo-dark.png" alt="STOPERA!" /></a>\n'
    + '    <button class="nav-toggle" type="button" aria-label="Menu" aria-controls="nav-links" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="bar1" d="M3 6h18"/><path class="bar2" d="M3 12h18"/><path class="bar3" d="M3 18h18"/></svg></button>\n'
    + '    <nav class="site-nav" aria-label="Navigation"><div class="nav-links" id="nav-links">\n      ' + nav + '\n    </div>\n'
    + '      <div class="lang-switch" role="group" aria-label="Langue / Language"><button type="button" class="lang-opt" data-setlang="fr">FR</button><button type="button" class="lang-opt" data-setlang="es">ES</button><button type="button" class="lang-opt" data-setlang="en">EN</button><button type="button" class="lang-opt" data-setlang="zh">中文</button></div>\n'
    + '    </nav>\n  </header>';
}
function editorialNav(rel) {
  var miss = [["#productions","Créer","Crear","Create","创作"],
    ["#recherche","Chercher","Buscar","Explore","探索"],
    ["#lips","Partager","Compartir","Share","分享"],
    ["#rejoindre","Soutenir","Apoyar","Support","支持"],
    ["cooperation/","Relier","Conectar","Connect","连接"]]
    .map(function (n) { var href = n[0].charAt(0) === "#" ? rel + "index.html" + n[0] : rel + n[0];
      return '<a href="' + href + '" data-fr="' + n[1] + '" data-es="' + n[2] + '" data-en="' + n[3] + '" data-zh="' + n[4] + '"></a>'; }).join("");
  return '<nav class="editorial-nav" aria-label="Missions">\n'
    + '    <span class="ed-label" data-fr="Missions" data-es="Misiones" data-en="Missions" data-zh="使命"></span>\n'
    + '    <div class="ed-links">' + miss + '</div>\n  </nav>';
}
function footer(rel) {
  return '<footer class="site-footer">\n'
    + '    <span class="brand-logo-foot"><img src="' + rel + 'assets/logo-dark.png" alt="STOPERA!" /></span>\n'
    + '    <p class="foot-social"><a href="https://instagram.com/stopera_sonic_theatre" target="_blank" rel="noopener">Instagram</a> · <a href="https://www.youtube.com/@stopera-sonictheatre" target="_blank" rel="noopener">YouTube</a> · <a href="https://www.facebook.com/stopera.sonictheatre" target="_blank" rel="noopener">Facebook</a></p>\n'
    + '    <p>© <span id="year"></span> STOPERA! — Sonic Theatre Opera Performance · Gentilly (Paris) · <a href="' + rel + 'mentions-legales/" data-fr="Mentions légales" data-es="Aviso legal" data-en="Legal notice" data-zh="法律声明"></a></p>\n  </footer>';
}

function page(opts) {
  var rel = opts.rel, V = "?v=20260622J";
  return '<!DOCTYPE html>\n<html lang="fr">\n<head>\n'
    + '  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />\n'
    + '  <title>' + esc(opts.title) + ' — STOPERA!</title>\n'
    + '  <meta name="description" content="' + esc(opts.description) + '" />\n'
    + '  <link rel="canonical" href="' + opts.url + '" />\n'
    + '  <meta name="theme-color" content="#faf8f4" />\n'
    + '  <meta property="og:type" content="' + (opts.ogType || "article") + '" />\n'
    + '  <meta property="og:title" content="' + esc(opts.title) + ' — STOPERA!" />\n'
    + '  <meta property="og:description" content="' + esc(opts.description) + '" />\n'
    + '  <meta property="og:url" content="' + opts.url + '" />\n'
    + '  <meta property="og:image" content="' + opts.image + '" />\n'
    + '  <meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />\n'
    + '  <meta name="twitter:card" content="summary_large_image" />\n'
    + '  <meta name="twitter:title" content="' + esc(opts.title) + ' — STOPERA!" />\n'
    + '  <meta name="twitter:image" content="' + opts.image + '" />\n'
    + (opts.jsonld ? '  <script type="application/ld+json">' + opts.jsonld + '</script>\n' : "")
    + '  <link rel="icon" type="image/png" href="' + rel + 'assets/favicon.png" />\n'
    + '  <link rel="stylesheet" href="' + rel + 'assets/fonts/fonts.css' + V + '" />\n'
    + '  <link rel="stylesheet" href="' + rel + 'styles.css' + V + '" />\n'
    + '</head>\n<body data-lang="fr">\n  ' + header(rel) + '\n  <main id="top" class="subpage">\n'
    + opts.body + '\n  </main>\n  ' + footer(rel) + '\n'
    + '  <div class="float-actions">\n'
    + '    <a class="float-home" href="' + rel + 'index.html" aria-label="Accueil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h5v-5h4v5h5v-9"/></svg><span data-fr="Accueil" data-es="Inicio" data-en="Home" data-zh="首页"></span></a>\n'
    + '    <button class="float-share js-share" type="button" aria-label="Partager"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l4 4h-3v7h-2V7H8l4-4zM5 10h3v2H6.5v7h11v-7H16v-2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/></svg><span data-fr="Partager" data-es="Compartir" data-en="Share" data-zh="分享"></span></button>\n'
    + '    <a class="float-contact" href="' + rel + 'index.html#contact" aria-label="Contact"><span data-fr="Écrire" data-es="Escribir" data-en="Write" data-zh="联系"></span><span aria-hidden="true">↗</span></a>\n'
    + '  </div>\n'
    + '  <script src="' + rel + 'script.js' + V + '"></script>\n</body>\n</html>\n';
}

/* ---- production / programme page body ---- */
function prodBody(p, rel) {
  var photo = p.photo ? rel + p.photo : null;
  var hero, teaser = "";
  if (photo) hero = '<figure class="pd-media"><img src="' + photo + '" alt="' + esc(plain(p.titleHtml || p.title)) + '" /></figure>';
  else if (p.video) hero = '<div class="pd-media pd-media--video"><iframe src="https://www.youtube-nocookie.com/embed/' + p.video + '?rel=0&modestbranding=1&playsinline=1" title="' + esc(plain(p.title)) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
  else hero = '<div class="pd-media pd-media--color" style="background:' + tileBg(p.slug) + ';color:' + inkOn(COLORS[p.slug] || "#4f5f60") + '"><span class="pd-media-title" ' + ml(p.titleHtml || p.title) + '></span></div>';
  if (photo && p.video) teaser = '<div class="pd-teaser"><h4 ' + ml({fr:"Bande-annonce",es:"Tráiler",en:"Trailer",zh:"预告片"}) + '></h4><div class="pd-media pd-media--video"><iframe src="https://www.youtube-nocookie.com/embed/' + p.video + '?rel=0&modestbranding=1&playsinline=1" title="' + esc(plain(p.title)) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>';

  var facts = (p.facts || []).map(function (f) {
    var v = (typeof f.v === "object") ? '<span class="v" ' + ml(f.v) + '></span>' : '<span class="v">' + linkNames(f.v, rel) + '</span>';
    return '<li><span class="k" ' + ml(f.k) + '></span>' + v + '</li>';
  }).join("");
  var credits_ml = (p.credits || []).map(function (c) {
    var who = (typeof c.who === "object") ? '<span class="who" ' + ml(c.who) + '></span>' : '<span class="who">' + linkNames(c.who, rel) + '</span>';
    return '<li><span class="role" ' + ml(c.role) + '></span> — ' + who + '</li>';
  }).join("");
  var tech = (p.tech && p.tech.length) ? '<div class="pd-block"><h4 ' + ml({fr:"Fiche technique",es:"Ficha técnica",en:"Technical sheet",zh:"技术表"}) + '></h4><ul class="facts">' + p.tech.map(function (f) { return '<li><span class="k" ' + ml(f.k) + '></span><span class="v">' + linkNames(tFR(f.v), rel) + '</span></li>'; }).join("") + "</ul></div>" : "";
  var diffusion = p.diffusion ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"Production & diffusion",es:"Producción & difusión",en:"Production & diffusion",zh:"制作与巡演"}) + '></h4><p class="pd-prose" ' + ml(p.diffusion) + "></p></div>" : "";
  var partnersList = (p.partners && p.partners.length) ? '<ul class="taglist pd-dim-partners">' + p.partners.map(function (x) { return "<li>" + linkInst(x) + "</li>"; }).join("") + "</ul>" : "";
  var relations = (p.relations && p.relations.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"En lien",es:"Conexiones",en:"Connections",zh:"关联"}) + '></h4><ul class="rel-list">' + p.relations.map(function (r) {
      var href = r.url ? r.url : rel + r.href; var ext = r.url ? ' target="_blank" rel="noopener"' : "";
      return '<li><a href="' + href + '"' + ext + ' ' + ml(r.label) + '></a></li>';
    }).join("") + "</ul></div>" : "";
  var gallery = (p.gallery && p.gallery.length) ? '<div class="pd-gallery">' + p.gallery.map(function (g) { return '<figure><img src="' + rel + g.src + '" alt="' + esc(g.alt || plain(p.title)) + '" loading="lazy" /></figure>'; }).join("") + "</div>" : "";
  var press = (p.press && p.press.length) ? '<div class="pd-block pd-full pd-press"><h4 ' + ml({fr:"Revue de presse",es:"Reseña de prensa",en:"Press",zh:"媒体评论"}) + '></h4>'
    + p.press.map(pressQuote).join("")
    + (p.pressPdf ? '<a class="pd-dl" href="' + rel + p.pressPdf + '" target="_blank" rel="noopener" ' + ml({fr:"Télécharger la revue de presse (PDF) ↓",es:"Descargar la reseña de prensa (PDF) ↓",en:"Download the press review (PDF) ↓",zh:"下载媒体评论（PDF）↓"}) + '></a>' : "") + "</div>" : "";
  var links = (p.links && p.links.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"À voir & écouter",es:"Ver & escuchar",en:"Watch & listen",zh:"观看与聆听"}) + '></h4><ul class="taglist">' + p.links.map(function (l) { return '<li><a href="' + l.url + '" target="_blank" rel="noopener">' + esc(l.label) + "</a></li>"; }).join("") + "</ul></div>" : "";
  var note = p.note ? '<p class="pd-note" ' + ml(p.note) + "></p>" : "";
  var dims = (p.transmission || p.territory || partnersList) ? '<div class="pd-dimensions">\n'
    + '        <div class="pd-dim"><h4 ' + ml({fr:"Production",es:"Producción",en:"Production",zh:"制作"}) + '></h4><p class="pd-dim-text" ' + ml(p.short) + '></p></div>\n'
    + '        <div class="pd-dim"><h4 ' + ml({fr:"Transmission",es:"Transmisión",en:"Transmission",zh:"传承"}) + '></h4><p class="pd-dim-text" ' + ml(p.transmission || {fr:"Autour de l'œuvre : ateliers, rencontres et partage des savoir-faire avec artistes, étudiant·es et publics.",es:"En torno a la obra: talleres, encuentros y transmisión de saberes con artistas, estudiantes y públicos.",en:"Around the work: workshops, encounters and sharing of know-how with artists, students and audiences.",zh:"围绕作品：与艺术家、学生及公众展开工作坊、相遇与技艺分享。"}) + '></p></div>\n'
    + '        <div class="pd-dim"><h4 ' + ml({fr:"Partenariats & territoire",es:"Alianzas & territorio",en:"Partnerships & territory",zh:"合作与在地"}) + '></h4>' + (p.territory ? '<p class="pd-dim-text" ' + ml(p.territory) + "></p>" : "") + partnersList + "</div>\n"
    + "      </div>" : "";

  return '    <article class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html#productions" data-fr="← Productions" data-es="← Producciones" data-en="← Productions" data-zh="← 作品"></a> · <span class="pd-tag" ' + ml(p.tag || "") + '></span></p>\n'
    + '      <h1 class="pd-title pd-title--page" ' + ml(p.titleHtml || p.title) + '></h1>\n'
    + "      " + hero + "\n"
    + '      <p class="pd-pitch" ' + ml(p.pitch) + "></p>\n"
    + ((p.body && p.body.length) ? p.body.map(function (b) { return '      <p class="pd-prose pd-prose--lead" ' + ml(b) + "></p>\n"; }).join("") : "")
    + (teaser ? "      " + teaser + "\n" : "")
    + (dims ? "      " + dims + "\n" : "")
    + (gallery ? "      " + gallery + "\n" : "")
    + '      <div class="pd-grid">\n'
    + '        <div class="pd-block"><h4 ' + ml({fr:"Informations",es:"Información",en:"Details",zh:"信息"}) + '></h4><ul class="facts">' + facts + "</ul></div>\n"
    + '        <div class="pd-block"><h4 ' + ml({fr:"Générique",es:"Créditos",en:"Credits",zh:"创作团队"}) + '></h4><ul class="credits">' + credits_ml + "</ul></div>\n"
    + "        " + tech + diffusion + relations + press + links + note + "\n      </div>\n    </article>";
}
function wrapQuote(o) { var r = {}; LANGS.forEach(function (l) { r[l] = "« " + (o[l] != null ? o[l] : o.fr) + " »"; }); return r; }

/* ---- static production tile (server-side, for parcours grids) ---- */
function threadTile(slug, rel) {
  var p = bySlug[slug]; if (!p) return "";
  var href = rel + (slug === "lips" ? "lips/" : "productions/" + slug + "/");
  var year = tFR(YEARS[slug] || "");
  var yearSpan = year ? '<span class="ptile-year">' + esc(year) + "</span>" : "";
  var title = '<span class="ptile-title" ' + ml(p.titleHtml || p.title) + "></span>";
  if (p.photo) {
    return '<li class="project"><a class="ptile" href="' + href + '">'
      + '<span class="ptile-img" style="background-image:url(\'' + rel + p.photo + '\')"></span>'
      + '<span class="ptile-scrim"></span>'
      + '<span class="ptile-meta">' + title + yearSpan + "</span></a></li>";
  }
  return '<li class="project"><a class="ptile ptile--color" href="' + href + '" style="background:' + tileBg(slug) + ";color:" + inkOn(COLORS[slug] || "#4f5f60") + '">'
    + '<span class="ptile-tag" ' + ml(p.tag || "") + "></span>"
    + '<span class="ptile-meta">' + title + yearSpan + "</span></a></li>";
}

/* ---- NEWS (éditorial) ---- */
var NEWS = [
  { slug: "ooo-teatro-colon", date: "2025-09", img: "assets/projects/ooo.jpg", related: "ooo",
    title: { fr: "OOO créé au Teatro Colón", es: "OOO estrenado en el Teatro Colón", en: "OOO premieres at the Teatro Colón", zh: "OOO 在科隆剧院首演" },
    excerpt: { fr: "Environnement opératique post-humain d'Emma Terno et Valentín Pelisch, OOO a été créé au CETC du Teatro Colón (Buenos Aires) en septembre 2025.", es: "Entorno operístico posthumano de Emma Terno y Valentín Pelisch, OOO se estrenó en el CETC del Teatro Colón (Buenos Aires) en septiembre de 2025.", en: "A post-human operatic environment by Emma Terno and Valentín Pelisch, OOO premiered at the Teatro Colón's CETC (Buenos Aires) in September 2025.", zh: "Emma Terno 与 Valentín Pelisch 的后人类歌剧环境 OOO，于 2025 年 9 月在科隆剧院实验中心（CETC，布宜诺斯艾利斯）首演。" },
    body: { fr: "Né d'une coopération entre le GRAME — CNCM (Lyon) et le CETC du Teatro Colón, OOO imagine un monde d'après l'humanité, où une plante d'intérieur et un robot défaillant dialoguent parmi les objets et les fantômes. Salué par la presse argentine (Infobae, Clarín, Ópera Latinoamérica), le spectacle entre en diffusion internationale avec STOPERA!.", es: "Nacido de una cooperación entre el GRAME — CNCM (Lyon) y el CETC del Teatro Colón, OOO imagina un mundo después de la humanidad, donde una planta de interior y un bot defectuoso dialogan entre objetos y fantasmas. Elogiado por la prensa argentina (Infobae, Clarín, Ópera Latinoamérica), el espectáculo entra en difusión internacional con STOPERA!.", en: "Born from a cooperation between GRAME — CNCM (Lyon) and the Teatro Colón's CETC, OOO imagines a world after humanity, where a houseplant and a defective bot converse among objects and ghosts. Praised by the Argentine press (Infobae, Clarín, Ópera Latinoamérica), the work now enters international diffusion with STOPERA!.", zh: "OOO 诞生自里昂 GRAME 国家音乐创作中心与科隆剧院 CETC 的合作，想象一个人类之后的世界——一株室内植物与一个失灵机器人在物件与幽灵之间对话。该作受到阿根廷媒体（Infobae、Clarín、Ópera Latinoamérica）赞誉，如今随 STOPERA! 进入国际巡演。" } },
  { slug: "stopera-launch", date: "2026-06", img: "assets/og-cover.jpg",
    title: { fr: "STOPERA! ouvre sa plateforme", es: "STOPERA! abre su plataforma", en: "STOPERA! opens its platform", zh: "STOPERA! 启动其平台" },
    excerpt: { fr: "Une plateforme internationale de création, de production, de recherche et de transmission voit le jour à Gentilly.", es: "Una plataforma internacional de creación, producción, investigación y transmisión nace en Gentilly.", en: "An international platform for creation, production, research and transmission launches in Gentilly.", zh: "一个面向创作、制作、研究与传承的国际平台在让蒂伊诞生。" },
    body: { fr: "STOPERA! réunit artistes, interprètes, chercheurs et partenaires culturels autour d'une même question : comment la voix, le corps et le son deviennent présence sur le plateau. La plateforme rassemble créations, recherche et transmission, sous la direction de Sebastian Rivas et avec le soutien de Georges Aperghis comme président d'honneur.", es: "STOPERA! reúne a artistas, intérpretes, investigadores y socios culturales en torno a una misma pregunta: cómo la voz, el cuerpo y el sonido se vuelven presencia en escena. La plataforma reúne creaciones, investigación y transmisión, bajo la dirección de Sebastian Rivas y con el apoyo de Georges Aperghis como presidente de honor.", en: "STOPERA! brings together artists, performers, researchers and cultural partners around a single question: how voice, body and sound become presence on stage. The platform unites creation, research and transmission, directed by Sebastian Rivas and supported by Georges Aperghis as honorary president.", zh: "STOPERA! 汇集艺术家、表演者、研究者与文化伙伴，围绕同一问题：人声、身体与声音如何在舞台上成为在场。平台整合创作、研究与传承，由 Sebastian Rivas 担任艺术指导，并由 Georges Aperghis 担任名誉主席给予支持。" } },
  { slug: "rayon-n-development", date: "2026", img: "assets/projects/rayon-n.jpg", related: "rayon-n",
    title: { fr: "Rayon N : l'opéra-film en développement", es: "Rayon N: la ópera-film en desarrollo", en: "Rayon N: the film-opera in development", zh: "Rayon N：影像歌剧开发中" },
    excerpt: { fr: "Commande de l'Ensemble intercontemporain, Rayon N entre en production (2026) en vue d'une diffusion en 2027.", es: "Encargo del Ensemble intercontemporain, Rayon N entra en producción (2026) con vistas a una gira en 2027.", en: "Commissioned by the Ensemble intercontemporain, Rayon N enters production (2026) towards a 2027 tour.", zh: "受 Ensemble intercontemporain 委约，Rayon N 进入制作阶段（2026），目标 2027 年巡演。" },
    body: { fr: "Inspiré de la prétendue découverte du « rayon N » par René Blondlot en 1903, l'opéra de Sebastian Rivas (livret et mise en scène d'Antoine Gindt, avec Philippe Béziat) prolonge son questionnement sur la croyance et la construction du réel. L'image, aujourd'hui générée et animée, dialogue avec la musique jouée en direct.", es: "Inspirada en la supuesta invención del «rayo N» por René Blondlot en 1903, la ópera de Sebastian Rivas (libreto y dirección de Antoine Gindt, con Philippe Béziat) prolonga su reflexión sobre la creencia y la construcción de lo real. La imagen, hoy generada y animada, dialoga con la música en vivo.", en: "Inspired by René Blondlot's supposed 1903 discovery of the “N-ray,” Sebastian Rivas's opera (libretto and staging by Antoine Gindt, with Philippe Béziat) extends its inquiry into belief and the construction of reality. Imagery, today generated and animated, converses with live music.", zh: "灵感源自 1903 年 René Blondlot 声称发现的「N 射线」，Sebastian Rivas 的歌剧（Antoine Gindt 编剧与导演，Philippe Béziat 参与）延续其对信念与现实建构的追问。如今生成并动画化的影像与现场音乐对话。" } },
  { slug: "lips-2028", date: "2028", img: "assets/projects/lips.jpg", related: "lips",
    title: { fr: "LIPS Lab : prochaine édition 2028", es: "LIPS Lab: próxima edición 2028", en: "LIPS Lab: next edition 2028", zh: "LIPS Lab：下一届 2028" },
    excerpt: { fr: "Le laboratoire international de prototypes scéniques et sonores revient en 2028, tous les deux ans.", es: "El laboratorio internacional de prototipos escénicos y sonoros vuelve en 2028, cada dos años.", en: "The international laboratory of scenic and sound prototypes returns in 2028, every two years.", zh: "国际舞台与声音原型工作坊将于 2028 年回归，每两年一届。" },
    body: { fr: "LIPS réunit de jeunes artistes de toutes disciplines — composition, mise en scène, arts visuels, théâtre, danse — accompagnés par des artistes confirmés. Un temps d'expérimentation, de co-écriture et de rencontre, où la transmission se fait par la pratique. Appel à candidatures à venir.", es: "LIPS reúne a jóvenes artistas de todas las disciplinas —composición, dirección de escena, artes visuales, teatro, danza— acompañados por artistas consagrados. Un tiempo de experimentación, co-escritura y encuentro, donde la transmisión se hace por la práctica. Convocatoria próximamente.", en: "LIPS brings together young artists from all disciplines — composition, stage direction, visual arts, theatre, dance — mentored by established artists. A time for experimentation, co-writing and encounter, where transmission happens through practice. Call for applications to come.", zh: "LIPS 汇集来自各学科——作曲、导演、视觉艺术、戏剧、舞蹈——的青年艺术家，由资深艺术家陪伴。一段实验、共同书写与相遇的时光，让传承通过实践发生。招募即将公布。" } }
];
function newsBody(n, rel) {
  var img = n.img ? rel + n.img : null;
  var rl = n.related ? '<p class="pd-note"><a href="' + rel + (n.related === "lips" ? "lips/" : "productions/" + n.related + "/") + '" data-fr="→ Voir la production" data-es="→ Ver la producción" data-en="→ See the production" data-zh="→ 查看作品"></a></p>' : "";
  return '    <article class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'news/index.html" data-fr="← Actualités" data-es="← Novedades" data-en="← News" data-zh="← 动态"></a> · <span class="pd-tag">' + esc(n.date) + '</span></p>\n'
    + '      <h1 class="pd-title pd-title--page" ' + ml(n.title) + "></h1>\n"
    + (img ? '      <figure class="pd-media"><img src="' + img + '" alt="' + esc(plain(n.title)) + '" /></figure>\n' : "")
    + '      <p class="pd-pitch" ' + ml(n.excerpt) + "></p>\n"
    + '      <div class="prose"><p ' + ml(n.body) + "></p></div>\n" + rl + "\n    </article>";
}

/* ---- COOPÉRATION : carte filigrane + spots ---- */
var COOP_PATHS = [
  "M0,230 L10,320 L50,380 L80,390 L110,420 L130,460 L160,490 L190,510 L240,540 L290,560 L330,570 L380,590 L420,630 L370,560 L340,540 L350,510 L310,520 L280,500 L280,460 L310,430 L350,430 L370,420 L410,420 L430,440 L450,470 L440,410 L490,370 L500,340 L510,320 L550,300 L580,270 L650,250 L690,200 L610,120 L470,100 L300,120 L0,120 Z",
  "M790,120 L950,40 L1050,20 L1030,-40 L850,-80 L670,-40 L700,40 L750,110 Z",
  "M440,640 L480,640 L530,610 L630,620 L750,670 L750,720 L810,740 L900,770 L860,850 L860,920 L770,970 L670,1060 L630,1120 L600,1170 L560,1220 L500,1240 L510,1160 L520,1090 L540,1020 L550,900 L490,860 L440,770 L450,700 Z",
  "M1150,350 L1160,290 L1230,290 L1210,240 L1240,230 L1270,210 L1300,190 L1330,150 L1350,140 L1380,170 L1410,160 L1460,160 L1490,120 L1530,110 L1550,60 L1700,40 L1850,20 L2000,-10 L2250,-30 L2550,-10 L2750,20 L2750,120 L2650,170 L2600,240 L2550,290 L2520,320 L2470,320 L2460,340 L2450,380 L2470,420 L2430,480 L2330,510 L2310,560 L2300,620 L2250,650 L2230,600 L2190,540 L2150,500 L2130,510 L2070,550 L2030,630 L1990,570 L1950,510 L1910,470 L1850,470 L1820,470 L1750,420 L1730,420 L1730,480 L1810,540 L1700,600 L1680,590 L1650,500 L1600,440 L1610,360 L1550,360 L1530,320 L1510,310 L1480,320 L1440,300 L1380,270 L1330,280 L1280,290 L1250,320 L1240,350 L1190,360 Z",
  "M1080,570 L1090,510 L1150,420 L1190,360 L1270,350 L1360,350 L1450,390 L1500,400 L1570,410 L1600,480 L1650,570 L1680,610 L1760,610 L1660,740 L1650,870 L1600,940 L1570,980 L1530,1050 L1450,1070 L1400,1000 L1370,880 L1340,730 L1340,680 L1270,660 L1200,670 L1150,650 L1090,600 Z",
  "M2380,940 L2470,900 L2550,840 L2620,840 L2670,830 L2710,900 L2750,970 L2750,1090 L2710,1110 L2650,1100 L2600,1070 L2540,1040 L2470,1060 L2400,1060 L2380,980 Z",
  "M2450,470 L2470,470 L2465,500 L2455,490 Z",
  "M2550,410 L2600,380 L2650,340 L2660,310 L2650,370 L2620,370 L2570,390 Z",
  "M1190,220 L1220,180 L1200,140 L1170,170 L1150,200 Z",
  "M1680,840 L1750,870 L1750,970 L1700,970 L1680,880 Z",
  "M1150,200 L1190,170 L1150,180 Z",
  "M2450,540 L2490,600 L2510,650 L2470,620 L2450,580 Z",
  "M410,500 L510,520 L480,500 L430,490 Z"
];
/* échantillonnage : grille de points sur les terres (esthétique dot-map) */
function coopDots(){
  var polys = COOP_PATHS.map(function(d){
    return d.replace(/[MZ]/g, " ").trim().split(/\s*L\s*/).map(function(pt){ var a = pt.trim().split(","); return [parseFloat(a[0]), parseFloat(a[1])]; });
  });
  function inside(x, y, poly){ var n = poly.length, ins = false, j = n - 1; for (var i = 0; i < n; i++){ var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi)) ins = !ins; j = i; } return ins; }
  var step = 26, out = "";
  for (var y = 0; y <= 1220; y += step){ for (var x = 0; x <= 2750; x += step){
    for (var k = 0; k < polys.length; k++){ if (inside(x, y, polys[k])){ out += '<circle cx="' + x + '" cy="' + y + '"/>'; break; } }
  }}
  return out;
}
var COOP_CITIES = [
  { id:"paris", region:"eu", x:45.6, y:17.4, side:"l", name:"Paris · Gentilly",
    inst:[["Ircam","https://www.ircam.fr"],["Radio France","https://www.radiofrance.fr"],["T&M Paris","https://theatre-musique.com"],["T2G — Gennevilliers","https://www.theatre2gennevilliers.com"],["Le Générateur","https://legenerateur.com"],["La Muse en Circuit","https://alamuse.com"],["Ville de Gentilly","https://www.ville-gentilly.fr"]],
    proj:[["Siège STOPERA!",""],["Aliados","aliados"],["LIPS","lips"]] },
  { id:"lyon", region:"eu", x:47.5, y:21.0, side:"l", name:"Lyon",
    inst:[["GRAME — CNCM","https://www.grame.fr"],["Opéra de Lyon","https://www.opera-lyon.com"],["Théâtre de la Croix-Rousse","https://croix-rousse.com"],["Pôle Pixel","https://www.pole-pixel.com"]],
    proj:[["Otages","otages"],["Rayon N","rayon-n"],["OOO","ooo"],["LIPS","lips"]] },
  { id:"monaco", region:"eu", x:49.2, y:24.6, side:"l", name:"Monte-Carlo",
    inst:[["Printemps des Arts","https://www.printempsdesarts.mc"]],
    proj:[["Snow on Her Lips","snow-on-her-lips"]] },
  { id:"mexico", region:"la", x:9.41, y:43.09, side:"r", name:"Mexico",
    inst:[],
    proj:[["A World to Blast","america"],["Insistir","insistir"]] },
  { id:"buenosaires", region:"la", x:24.23, y:87.38, side:"up", name:"Buenos Aires",
    inst:[["CETC — Teatro Colón","https://teatrocolon.org.ar"],["UNSAM","https://www.unsam.edu.ar"],["Ópera Latinoamérica","https://operala.org"]],
    proj:[["OOO","ooo"],["Mamma Roma","mamma-roma"]] },
  { id:"santiago", region:"la", x:19.76, y:86.43, side:"up", name:"Santiago du Chili",
    inst:[["Ópera Latinoamérica (OLA)","https://operala.org"]],
    proj:[["Assemblée du réseau · 2024",""]] },
  { id:"taipei", region:"as", x:89.64, y:38.52, side:"l", name:"Taipei · Taïwan",
    inst:[],
    proj:[["Sur invitation · 2024",""]] }
];
function coopInst(arr){ return arr.map(function(i){ return i[1] ? '<a href="'+i[1]+'" target="_blank" rel="noopener">'+esc(i[0])+"</a>" : esc(i[0]); }).join(" · "); }
function coopProj(arr, rel){ return arr.map(function(p){ if(!p[1]) return esc(p[0]); var href = rel + (p[1]==="lips" ? "lips/" : "productions/"+p[1]+"/"); return '<a href="'+href+'">'+esc(p[0])+"</a>"; }).join(" · "); }
function coopCardInner(c, rel){
  var L_I={fr:"Institutions & lieux",es:"Instituciones & lugares",en:"Institutions & venues",zh:"机构与场馆"};
  var L_P={fr:"Projets",es:"Proyectos",en:"Projects",zh:"项目"};
  return '<p class="coop-city">'+esc(c.name)+"</p>"
    + (c.inst.length ? '<p class="coop-k" '+ml(L_I)+'></p><p class="coop-v">'+coopInst(c.inst)+"</p>" : "")
    + '<p class="coop-k" '+ml(L_P)+'></p><p class="coop-v">'+coopProj(c.proj, rel)+"</p>";
}
var COOP_SCRIPT = '<script>(function(){var ss=document.querySelectorAll(".coop-map .spot");ss.forEach(function(s){s.addEventListener("click",function(e){e.preventDefault();var o=s.classList.contains("is-open");ss.forEach(function(x){x.classList.remove("is-open");});if(!o)s.classList.add("is-open");});});document.addEventListener("click",function(e){if(!e.target.closest(".coop-map .spot"))ss.forEach(function(x){x.classList.remove("is-open");});});})();</script>';
function coopMap(rel){
  var svg = '<svg class="coop-svg" viewBox="0 0 2750 1220" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'
    + '<g class="coop-dots">' + coopDots() + "</g></svg>";
  var spots = COOP_CITIES.map(function(c){
    return '<button class="spot spot--'+c.side+'" type="button" style="left:'+c.x+'%;top:'+c.y+'%" data-city="'+c.id+'" aria-label="'+esc(c.name)+'">'
      + '<span class="spot-dot"></span><span class="spot-name">'+esc(c.name)+'</span>'
      + '<span class="coop-card">'+coopCardInner(c, rel)+"</span></button>";
  }).join("\n        ");
  return '<div class="coop-map">'+svg+"\n        "+spots+"\n      </div>";
}
function cooperationBody(rel){
  function regionBlock(reg, label){
    var items = COOP_CITIES.filter(function(c){return c.region===reg;}).map(function(c){
      return '<div class="coop-city-block">'+coopCardInner(c, rel)+"</div>";
    }).join("");
    return '<div class="coop-region"><h3 '+ml(label)+'></h3>'+items+"</div>";
  }
  return '    <section class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="'+rel+'index.html" data-fr="← Accueil" data-es="← Inicio" data-en="← Home" data-zh="← 首页"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Coopération internationale" data-es="Cooperación internacional" data-en="International cooperation" data-zh="国际合作"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Depuis Gentilly, STOPERA! développe des collaborations entre artistes, institutions, universités et réseaux culturels — en Europe, en Amérique latine et au-delà. Survolez une ville pour voir ses institutions et les projets associés." data-es="Desde Gentilly, STOPERA! desarrolla colaboraciones entre artistas, instituciones, universidades y redes culturales — en Europa, América Latina y más allá. Pase el cursor sobre una ciudad para ver sus instituciones y los proyectos asociados." data-en="From Gentilly, STOPERA! develops collaborations between artists, institutions, universities and cultural networks — in Europe, Latin America and beyond. Hover a city to see its institutions and related projects." data-zh="从让蒂伊出发，STOPERA! 在欧洲、拉丁美洲及更远之地发展艺术家、机构、高校与文化网络之间的合作。将鼠标移至城市可查看其机构与相关项目。"></p>\n'
    + '      '+coopMap(rel)+"\n"
    + '      <div class="coop-regions">\n        '+regionBlock("eu",{fr:"Europe",es:"Europa",en:"Europe",zh:"欧洲"})+"\n        "+regionBlock("la",{fr:"Amérique latine",es:"América Latina",en:"Latin America",zh:"拉丁美洲"})+"\n        "+regionBlock("as",{fr:"Asie",es:"Asia",en:"Asia",zh:"亚洲"})+"\n      </div>\n"
    + '      ' + COOP_SCRIPT + "\n    </section>";
}

/* ---- press (page dédiée, alimentée au fil des productions) ---- */
var PRESS_MEDIA = ["Le Monde","Diapason","ResMusica","Forum Opéra","Concertclassic","Classykéo","Hémisphères Son","La Terrasse","L'Humanité","AFP","La Stampa","The Times","El País","El Mundo","Scherzo","Clarín","La Nación","Página/12","Infobae"];
function pressQuote(q) {
  if (!q.quote) {
    var t = q.title ? (typeof q.title === "string" ? esc(q.title) : esc(tFR(q.title))) : esc(q.source);
    var lk = q.url ? '<a href="' + q.url + '" target="_blank" rel="noopener">' + t + "</a>" : t;
    return '<p class="press-ref">' + lk + ' <span class="press-ref-src">' + esc(q.source) + "</span></p>";
  }
  var src = q.url ? '<a href="' + q.url + '" target="_blank" rel="noopener">' + esc(q.source) + "</a>" : esc(q.source);
  var qq = (typeof q.quote === "object") ? wrapQuote(q.quote) : { fr: "« " + q.quote + " »", es: "« " + q.quote + " »", en: "« " + q.quote + " »", zh: "« " + q.quote + " »" };
  return '<blockquote class="pdq"><span ' + ml(qq) + "></span><cite>" + src + "</cite></blockquote>";
}
function pressBody(rel) {
  var groups = ["ooo", "otages", "aliados", "snow-on-her-lips", "rayon-n"].map(function (s) {
    var p = bySlug[s]; if (!p) return "";
    var head = '<h3 class="press-prod"><a href="' + rel + "productions/" + s + '/" ' + ml(p.titleHtml || p.title) + "></a></h3>";
    var inner;
    if (p.press && p.press.length) {
      inner = p.press.map(pressQuote).join("\n        ")
        + (p.pressPdf ? '\n        <a class="pd-dl" href="' + rel + p.pressPdf + '" target="_blank" rel="noopener" ' + ml({fr:"Télécharger la revue de presse (PDF) ↓",es:"Descargar la reseña de prensa (PDF) ↓",en:"Download the press review (PDF) ↓",zh:"下载媒体评论（PDF）↓"}) + "></a>" : "");
    } else {
      inner = '<p class="press-soon" ' + ml({fr:"Revue de presse à venir.",es:"Reseña de prensa próximamente.",en:"Press review coming soon.",zh:"媒体评论即将上线。"}) + "></p>";
    }
    return '<div class="press-group">\n        ' + head + "\n        " + inner + "\n      </div>";
  }).join("\n      ");
  var media = '<ul class="partners">' + PRESS_MEDIA.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>";
  return '    <section class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html" data-fr="← Accueil" data-es="← Inicio" data-en="← Home" data-zh="← 首页"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Revue de presse" data-es="Reseña de prensa" data-en="Press" data-zh="媒体评论"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Une sélection d\'articles et de critiques autour des créations de STOPERA!. Cette revue s\'enrichit au fil des productions." data-es="Una selección de artículos y críticas en torno a las creaciones de STOPERA!. Esta reseña se enriquece a medida que avanzan las producciones." data-en="A selection of articles and reviews around STOPERA!\'s works. This press review grows with each new production." data-zh="围绕 STOPERA! 创作的文章与评论选辑。本媒体评论将随作品不断充实。"></p>\n'
    + "      " + groups + "\n"
    + '      <div class="subblock press-media">\n'
    + '        <p class="subblock-label" data-fr="Ils en ont parlé" data-es="Han hablado de ello" data-en="As featured in" data-zh="媒体报道"></p>\n'
    + "        " + media + "\n"
    + '        <p class="section-note" data-fr="France · Italie · Royaume-Uni · Espagne · Argentine — autour des créations d\'<em>Otages</em>, <em>Aliados</em> et <em>OOO</em>." data-es="Francia · Italia · Reino Unido · España · Argentina — en torno a los estrenos de <em>Otages</em>, <em>Aliados</em> y <em>OOO</em>." data-en="France · Italy · UK · Spain · Argentina — around the premieres of <em>Otages</em>, <em>Aliados</em> and <em>OOO</em>." data-zh="法国 · 意大利 · 英国 · 西班牙 · 阿根廷 —— 围绕 <em>Otages</em>、<em>Aliados</em> 与 <em>OOO</em> 的首演。"></p>\n'
    + "      </div>\n    </section>";
}

/* ---- mentions légales & confidentialité (FR) ---- */
function legalBody(rel) {
  return '    <section class="section pd-page legal-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html" data-fr="← Accueil" data-es="← Inicio" data-en="← Home" data-zh="← 首页"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page">Mentions légales &amp; confidentialité</h1>\n'
    + '      <div class="legal-prose">\n'
    + '        <h2>Éditeur du site</h2>\n'
    + '        <p><strong>STOPERA!</strong> — Sonic Theatre Opera Performance, association loi 1901 à but non lucratif.<br/>Siège : 8 rue Victor Hugo, 94250 Gentilly (Val-de-Marne), France.<br/>Courriel : <a href="mailto:sonic.theatre.stopera@gmail.com">sonic.theatre.stopera@gmail.com</a>.<br/>Directeur de la publication : Sebastian Rivas, président.</p>\n'
    + '        <h2>Hébergement</h2>\n'
    + '        <p>Site hébergé par GitHub, Inc. — 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (GitHub Pages).</p>\n'
    + '        <h2>Propriété intellectuelle</h2>\n'
    + '        <p>L\'ensemble des contenus de ce site (textes, images, vidéos, identité visuelle « STOPERA! ») est protégé par le droit d\'auteur. Toute reproduction ou réutilisation, totale ou partielle, est soumise à autorisation préalable. Les crédits photographiques figurent sur les pages des productions concernées.</p>\n'
    + '        <h2>Données personnelles (RGPD)</h2>\n'
    + '        <p>Ce site est statique et ne comporte aucun formulaire&nbsp;; il ne collecte aucune donnée personnelle à votre insu. Les échanges se font par courriel, à votre seule initiative. Conformément au Règlement général sur la protection des données (RGPD) et à la loi « Informatique et Libertés », vous disposez d\'un droit d\'accès, de rectification et d\'effacement des données que vous nous transmettez par courriel&nbsp;: il vous suffit d\'écrire à l\'adresse ci-dessus.</p>\n'
    + '        <h2>Cookies &amp; mesure d\'audience</h2>\n'
    + '        <p>Le site ne dépose aucun cookie de mesure d\'audience ni traceur publicitaire. Les vidéos intégrées (YouTube, en mode « sans cookie ») peuvent déposer des cookies lorsque vous en lancez la lecture&nbsp;; ceux-ci relèvent de la politique de confidentialité de Google / YouTube.</p>\n'
    + '        <h2>Liens externes</h2>\n'
    + '        <p>Ce site comporte des liens vers des sites tiers (institutions, partenaires, presse). STOPERA! n\'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>\n'
    + '        <p class="legal-date">Dernière mise à jour : juin 2026.</p>\n'
    + '      </div>\n    </section>';
}

/* ---- write ---- */
function write(rel, html) { var dir = path.join(DOCS, rel); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "index.html"), html); }
var urls = [SITE + "/"];

PROJECTS.forEach(function (p) {
  var isLips = p.slug === "lips";
  var rel = isLips ? "../" : "../../";
  var slugPath = isLips ? "lips" : "productions/" + p.slug;
  var url = SITE + "/" + slugPath + "/";
  var img = SITE + "/" + (p.photo || "assets/og-cover.jpg");
  var jsonld = JSON.stringify({ "@context": "https://schema.org", "@type": isLips ? "CreativeWork" : "TheaterEvent", name: plain(p.titleHtml || p.title), description: plain(p.short || p.pitch), image: img, url: url, organizer: { "@type": "Organization", name: "STOPERA!", url: SITE + "/" } });
  write(slugPath, page({ rel: rel, title: plain(p.titleHtml || p.title), description: plain(p.short || p.pitch), image: img, url: url, jsonld: jsonld, body: prodBody(p, rel) }));
  urls.push(url);
});

/* news index */
var newsList = NEWS.map(function (n) {
  return '<li class="news-item"><a href="' + n.slug + '/"><span class="news-date">' + esc(n.date) + '</span><span class="news-h" ' + ml(n.title) + '></span><span class="news-x" ' + ml(n.excerpt) + '></span></a></li>';
}).join("\n        ");
write("news", page({ rel: "../", title: "Actualités", description: "Actualités de STOPERA! — créations, productions, laboratoire LIPS et collaborations internationales.", image: SITE + "/assets/og-cover.jpg", url: SITE + "/news/", ogType: "website",
  body: '    <section class="section pd-page">\n      <h1 class="pd-title pd-title--page" data-fr="Actualités" data-es="Novedades" data-en="News" data-zh="动态"></h1>\n      <ul class="news-list">\n        ' + newsList + "\n      </ul>\n    </section>" }));
urls.push(SITE + "/news/");
NEWS.forEach(function (n) {
  var url = SITE + "/news/" + n.slug + "/", img = SITE + "/" + (n.img || "assets/og-cover.jpg");
  write("news/" + n.slug, page({ rel: "../../", title: plain(n.title), description: plain(n.excerpt), image: img, url: url, body: newsBody(n, "../../") }));
  urls.push(url);
});

/* parcours (Layer 2 éditorial) — index + une page par thématique */
var threadCards = THEMES.map(function (th) {
  return '<li class="thread-card"><a href="' + th.slug + '/">'
    + '<span class="thread-h" ' + ml(th.title) + '></span>'
    + '<span class="thread-x" ' + ml(th.blurb) + '></span>'
    + '<span class="thread-n">' + th.items.length + '</span></a></li>';
}).join("\n        ");
write("parcours", page({ rel: "../", title: "Parcours", description: "Parcours éditoriaux de STOPERA! — explorer les créations par thématiques transversales : temps réel & technologie, mémoire & politique, voix & texte, corps & présence.", image: SITE + "/assets/og-cover.jpg", url: SITE + "/parcours/", ogType: "website",
  body: '    <section class="section pd-page">\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Parcours" data-es="Recorridos" data-en="Threads" data-zh="主题"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Une lecture transversale du répertoire — par idées et obsessions plutôt que par dates." data-es="Una lectura transversal del repertorio — por ideas y obsesiones más que por fechas." data-en="A cross-cutting reading of the repertoire — by ideas and obsessions rather than dates." data-zh="对作品的横向阅读——以理念与执念为线索，而非日期。"></p>\n'
    + '      <ul class="thread-list">\n        ' + threadCards + "\n      </ul>\n    </section>" }));
urls.push(SITE + "/parcours/");

THEMES.forEach(function (th) {
  var tiles = th.items.map(function (s) { return threadTile(s, "../../"); }).join("\n        ");
  var url = SITE + "/parcours/" + th.slug + "/";
  var jsonld = JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: plain(th.title) + " — STOPERA!", description: plain(th.blurb), url: url,
    hasPart: th.items.map(function (s) { return { "@type": "TheaterEvent", name: plain(bySlug[s] && (bySlug[s].titleHtml || bySlug[s].title)), url: SITE + "/" + (s === "lips" ? "lips/" : "productions/" + s + "/") }; }) });
  write("parcours/" + th.slug, page({ rel: "../../", title: plain(th.title), description: plain(th.blurb), image: SITE + "/assets/og-cover.jpg", url: url, ogType: "website", jsonld: jsonld,
    body: '    <section class="section pd-page">\n'
      + '      <p class="pd-eyebrow"><a href="../" data-fr="← Parcours" data-es="← Recorridos" data-en="← Threads" data-zh="← 主题"></a></p>\n'
      + '      <h1 class="pd-title pd-title--page" ' + ml(th.title) + "></h1>\n"
      + '      <p class="pd-pitch" ' + ml(th.blurb) + "></p>\n"
      + '      <ul class="projects thread-grid">\n        ' + tiles + "\n      </ul>\n    </section>" }));
  urls.push(url);
});

/* ---- ARTISTS (écosystème) ---- */
var ARTISTS = [
  { slug: "sebastian-rivas", name: "Sebastian Rivas",
    role: { fr: "Direction artistique & composition", es: "Dirección artística & composición", en: "Artistic direction & composition", zh: "艺术指导与作曲" },
    bio: { fr: "Compositeur, il est à l'origine de nombreuses œuvres de STOPERA! et en porte la direction artistique. Son travail explore l'opéra contemporain, le théâtre musical, l'électronique en temps réel et — avec Rayon N — l'image générée.",
           es: "Compositor, está en el origen de numerosas obras de STOPERA! y asume su dirección artística. Su trabajo explora la ópera contemporánea, el teatro musical, la electrónica en tiempo real y —con Rayon N— la imagen generada.",
           en: "A composer, he is behind many of STOPERA!'s works and carries its artistic direction. His work explores contemporary opera, music theatre, real-time electronics and — with Rayon N — generated imagery.",
           zh: "作曲家，是 STOPERA! 众多作品的源头并担任其艺术指导。其创作探索当代歌剧、音乐剧场、实时电子，并以 Rayon N 探索生成影像。" },
    bioLong: [
      { fr: "Compositeur franco-argentin, il développe une œuvre à la croisée de l'opéra contemporain, du théâtre musical et de l'électronique en temps réel. Lion d'Argent de la Biennale de Venise en 2018, il a notamment créé Aliados (Ircam · ManiFeste, 2013) et Otages (Opéra de Lyon, 2024).",
        es: "Compositor franco-argentino, desarrolla una obra en el cruce de la ópera contemporánea, el teatro musical y la electrónica en tiempo real. León de Plata de la Bienal de Venecia en 2018, ha creado entre otras Aliados (Ircam · ManiFeste, 2013) y Otages (Opéra de Lyon, 2024).",
        en: "A French-Argentine composer, he develops a body of work at the crossroads of contemporary opera, music theatre and real-time electronics. Silver Lion of the Venice Biennale in 2018, his works include Aliados (Ircam · ManiFeste, 2013) and Otages (Opéra de Lyon, 2024).",
        zh: "法国-阿根廷作曲家，其创作游走于当代歌剧、音乐剧场与实时电子之间。2018 年获威尼斯双年展银狮奖，作品包括 Aliados（Ircam · ManiFeste，2013）与 Otages（里昂歌剧院，2024）。" },
      { fr: "Avec STOPERA!, dont il porte la direction artistique, il explore la manière dont la voix, le corps et le son deviennent présence — jusqu'à l'image générée par intelligence artificielle dans Rayon N. Son travail dialogue avec des institutions en France et à l'international : Ircam, GRAME, Ensemble intercontemporain, Teatro Colón.",
        es: "Con STOPERA!, cuya dirección artística asume, explora cómo la voz, el cuerpo y el sonido se vuelven presencia —hasta la imagen generada por inteligencia artificial en Rayon N. Su trabajo dialoga con instituciones en Francia y en el extranjero: Ircam, GRAME, Ensemble intercontemporain, Teatro Colón.",
        en: "With STOPERA!, of which he is artistic director, he explores how voice, body and sound become presence — through to the AI-generated image of Rayon N. His work engages institutions in France and abroad: Ircam, GRAME, the Ensemble intercontemporain, the Teatro Colón.",
        zh: "在担任艺术指导的 STOPERA!，他探索人声、身体与声音如何成为在场——直至 Rayon N 中由人工智能生成的影像。其工作与法国及国际的机构对话：Ircam、GRAME、Ensemble intercontemporain、Teatro Colón。" }
    ],
    productions: ["rayon-n", "otages", "aliados", "snow-on-her-lips", "war-madrigals", "nous", "mamma-roma", "america"] },
  { slug: "georges-aperghis", name: "Georges Aperghis", photo: "assets/aperghis.jpg",
    role: { fr: "Président d'honneur", es: "Presidente de honor", en: "Honorary president", zh: "名誉主席" },
    bio: { fr: "Pionnier du théâtre musical, fondateur de l'ATEM (1976). Son compagnonnage et son influence artistique accompagnent STOPERA! ; ses pièces sont au cœur d'Insistir et résonnent dans [FAM]E (Récitation n°9).",
           es: "Pionero del teatro musical, fundador del ATEM (1976). Su compañía y su influencia artística acompañan a STOPERA!; sus piezas están en el corazón de Insistir y resuenan en [FAM]E (Récitation n°9).",
           en: "A pioneer of music theatre, founder of ATEM (1976). His companionship and artistic influence accompany STOPERA!; his pieces are at the heart of Insistir and resonate in [FAM]E (Récitation n°9).",
           zh: "音乐剧场的先驱，ATEM（1976）创始人。他的陪伴与艺术影响伴随着 STOPERA!；其作品是 Insistir 的核心，并在「[FAM]E」中回响（Récitation n°9）。" },
    productions: ["insistir", "fame"] },
  { slug: "olivia-martin", name: "Olivia Martin",
    role: { fr: "Percussionniste", es: "Percusionista", en: "Percussionist", zh: "打击乐演奏家" },
    bio: { fr: "Percussionniste, elle conçoit et interprète [FAM]E, récital du GRAME autour du féminin (Auditorium de Lyon), et joue au sein de l'ensemble Êkheía (Snow on Her Lips).",
           es: "Percusionista, concibe e interpreta [FAM]E, recital del GRAME en torno a lo femenino (Auditorium de Lyon), y toca en el ensemble Êkheía (Snow on Her Lips).",
           en: "A percussionist, she devises and performs [FAM]E, GRAME's recital around the feminine (Auditorium de Lyon), and plays within the Êkheía ensemble (Snow on Her Lips).",
           zh: "打击乐演奏家，构思并演出 GRAME 围绕「女性」的独奏会「[FAM]E」（里昂大礼堂），并在 Êkheía 乐团演奏（Snow on Her Lips）。" },
    productions: ["fame", "snow-on-her-lips"] },
  { slug: "guillaume-kosmicki", name: "Guillaume Kosmicki",
    role: { fr: "Musicologue & médiateur", es: "Musicólogo & mediador", en: "Musicologist & mediator", zh: "音乐学家与导赏人" },
    bio: { fr: "Musicologue, conférencier et auteur, spécialiste des musiques savantes contemporaines et des musiques électroniques. Il accompagne [FAM]E par sa médiation, rendant la création d'aujourd'hui accessible à tou·te·s.",
           es: "Musicólogo, conferenciante y autor, especialista en músicas cultas contemporáneas y en músicas electrónicas. Acompaña [FAM]E con su mediación, acercando la creación de hoy a todos.",
           en: "A musicologist, lecturer and author specialising in contemporary art music and electronic music. He accompanies [FAM]E through his mediation, making today's creation accessible to all.",
           zh: "音乐学家、讲师与作家，专研当代艺术音乐与电子音乐。他以导赏陪伴「[FAM]E」，让当下的创作为所有人所亲近。" },
    productions: ["fame"] },
  { slug: "nicola-beller-carbone", name: "Nicola Beller Carbone",
    role: { fr: "Soprano", es: "Soprano", en: "Soprano", zh: "女高音" },
    bio: { fr: "Interprète Sylvie Meyer dans Otages (Opéra de Lyon) et porte le projet Insistir, construit autour de pièces de Georges Aperghis.",
           es: "Interpreta a Sylvie Meyer en Otages (Opéra de Lyon) y lleva el proyecto Insistir, construido en torno a piezas de Georges Aperghis.",
           en: "Performs Sylvie Meyer in Otages (Opéra de Lyon) and drives the Insistir project, built around works by Georges Aperghis.",
           zh: "在 Otages（里昂歌剧院）中饰演 Sylvie Meyer，并推动围绕 Georges Aperghis 作品构建的 Insistir 项目。" },
    productions: ["otages", "insistir"] },
  { slug: "martin-bauer", name: "Martin Bauer",
    role: { fr: "Metteur en scène & scénographe", es: "Director & escenógrafo", en: "Director & set designer", zh: "导演与舞台设计" },
    bio: { fr: "Signe la mise en scène et la scénographie de Mamma Roma (CETC — Teatro Colón) et co-dirige artistiquement Insistir.",
           es: "Firma la dirección y la escenografía de Mamma Roma (CETC — Teatro Colón) y codirige artísticamente Insistir.",
           en: "Directs and designs Mamma Roma (CETC — Teatro Colón) and co-directs Insistir.",
           zh: "担任 Mamma Roma（CETC — 科隆剧院）的导演与舞台设计，并联合执导 Insistir。" },
    productions: ["mamma-roma", "insistir"] },
  { slug: "antoine-gindt", name: "Antoine Gindt", website: "https://theatre-musique.com",
    role: { fr: "Metteur en scène & librettiste", es: "Director & libretista", en: "Director & librettist", zh: "导演与编剧" },
    bio: { fr: "Livret et mise en scène de Rayon N ; mise en scène d'Aliados (Ircam · ManiFeste). Il dirige T&M Paris.",
           es: "Libreto y dirección de Rayon N; dirección de Aliados (Ircam · ManiFeste). Dirige T&M Paris.",
           en: "Libretto and staging of Rayon N; staging of Aliados (Ircam · ManiFeste). He directs T&M Paris.",
           zh: "Rayon N 的编剧与导演；Aliados（Ircam · ManiFeste）的导演。他执掌 T&M Paris。" },
    productions: ["rayon-n", "aliados"] },
  { slug: "rut-schreiner", name: "Rut Schreiner",
    role: { fr: "Cheffe d'orchestre & performeuse", es: "Directora & performer", en: "Conductor & performer", zh: "指挥与表演者" },
    bio: { fr: "Direction musicale d'Otages (Opéra de Lyon) ; elle conçoit et interprète input / body / output (« Conducting the Invisible »), où le geste de direction devient matière sonore.",
           es: "Dirección musical de Otages (Opéra de Lyon); concibe e interpreta input / body / output («Conducting the Invisible»), donde el gesto de dirección se vuelve materia sonora.",
           en: "Music direction of Otages (Opéra de Lyon); she conceives and performs input / body / output (“Conducting the Invisible”), where the conducting gesture becomes sonic material.",
           zh: "Otages（里昂歌剧院）的音乐指挥；她构思并演出 input / body / output（「Conducting the Invisible」），指挥手势在其中成为声音素材。" },
    productions: ["otages", "rut"] },
  { slug: "leo-warynski", name: "Léo Warynski", website: "https://www.lesmetaboles.fr",
    role: { fr: "Chef d'orchestre", es: "Director de orquesta", en: "Conductor", zh: "指挥" },
    bio: { fr: "Direction musicale de War Madrigals (Les Métaboles), Rayon N et Aliados. Il dirige Les Métaboles et l'ensemble Multilatérale.",
           es: "Dirección musical de War Madrigals (Les Métaboles), Rayon N y Aliados. Dirige Les Métaboles y el ensemble Multilatérale.",
           en: "Music direction of War Madrigals (Les Métaboles), Rayon N and Aliados. He leads Les Métaboles and the Multilatérale ensemble.",
           zh: "War Madrigals（Les Métaboles）、Rayon N 与 Aliados 的音乐指挥。他领导 Les Métaboles 与 Multilatérale 乐团。" },
    productions: ["war-madrigals", "rayon-n", "aliados"] },
  { slug: "christine-angot", name: "Christine Angot",
    role: { fr: "Autrice", es: "Autora", en: "Author", zh: "作者" },
    bio: { fr: "Écrivaine. Les textes de De l'Innocence, opéra de chambre, naissent d'une série de conversations avec le compositeur, autour de ce qui résiste au langage et au récit.",
           es: "Escritora. Los textos de De l'Innocence, ópera de cámara, nacen de una serie de conversaciones con el compositor, en torno a lo que resiste al lenguaje y al relato.",
           en: "A writer. The texts of De l'Innocence, a chamber opera, arise from a series of conversations with the composer, around what resists language and narrative.",
           zh: "作家。室内歌剧 De l'Innocence 的文本源自与作曲家的一系列对话，围绕那些抗拒语言与叙事之物。" },
    productions: ["nous"] },
  { slug: "marcelo-lombardero", name: "Marcelo Lombardero",
    role: { fr: "Metteur en scène & dramaturge", es: "Director & dramaturgo", en: "Director & dramaturg", zh: "导演与戏剧构作" },
    bio: { fr: "Dramaturgie et mise en scène d'A World to Blast, opéra autour d'América Scarfó et Soledad Rosas.",
           es: "Dramaturgia y dirección de A World to Blast, ópera en torno a América Scarfó y Soledad Rosas.",
           en: "Dramaturgy and staging of A World to Blast, an opera around América Scarfó and Soledad Rosas.",
           zh: "A World to Blast 的戏剧构作与导演——一部围绕 América Scarfó 与 Soledad Rosas 的歌剧。" },
    productions: ["america"] },
  { slug: "emma-terno", name: "Emma Terno",
    role: { fr: "Danseuse, performeuse & artiste visuelle", es: "Bailarina, performer & artista visual", en: "Dancer, performer & visual artist", zh: "舞者、表演者与视觉艺术家" },
    bio: { fr: "Co-conçoit et co-dirige OOO avec Valentín Pelisch. Danseuse, performeuse et artiste visuelle, elle fait du corps un laboratoire d'expérimentation entre vidéo, son et dessin.",
           es: "Co-concibe y co-dirige OOO con Valentín Pelisch. Bailarina, performer y artista visual, hace del cuerpo un laboratorio de experimentación entre vídeo, sonido y dibujo.",
           en: "Co-creates and co-directs OOO with Valentín Pelisch. A dancer, performer and visual artist, she turns the body into a laboratory of experimentation between video, sound and drawing.",
           zh: "与 Valentín Pelisch 共同构思并导演 OOO。身为舞者、表演者与视觉艺术家，她将身体化为游走于影像、声音与绘画之间的实验场。" },
    bioLong: [
      { fr: "Formée à la Villa Arson (Nice), diplômée en arts visuels de l'ECAL (Lausanne, 2012) puis en pratiques scéniques à la HKB (Berne, 2014), elle mêle vidéo, son, dessin et mouvement. Elle a performé dans des festivals en Suisse, en Italie et en France.",
        es: "Formada en la Villa Arson (Niza), licenciada en artes visuales por la ECAL (Lausana, 2012) y en prácticas escénicas en la HKB (Berna, 2014), mezcla vídeo, sonido, dibujo y movimiento. Ha actuado en festivales de Suiza, Italia y Francia.",
        en: "Trained at the Villa Arson (Nice), with a BA in Visual Arts from ECAL (Lausanne, 2012) and an MA in Scenic Art Practices from HKB (Bern, 2014), she weaves video, sound, drawing and movement. She has performed at festivals in Switzerland, Italy and France.",
        zh: "曾就读于尼斯 Villa Arson，获洛桑 ECAL 视觉艺术学士（2012）及伯尔尼 HKB 舞台艺术实践硕士（2014），融合影像、声音、绘画与动作。她曾在瑞士、意大利与法国的多个艺术节演出。" },
      { fr: "Elle collabore avec Natacha Paquignon, Marco Berrettini, Sebastian Rivas (Printemps des Arts de Monte-Carlo) et plusieurs maisons d'opéra en Europe (Monaco, Genève, Lyon, Marseille). Pour STOPERA!, elle est performeuse de Snow on Her Lips et co-autrice d'OOO.",
        es: "Colabora con Natacha Paquignon, Marco Berrettini, Sebastian Rivas (Printemps des Arts de Monte-Carlo) y varias casas de ópera en Europa (Mónaco, Ginebra, Lyon, Marsella). Para STOPERA!, es performer de Snow on Her Lips y coautora de OOO.",
        en: "She collaborates with Natacha Paquignon, Marco Berrettini, Sebastian Rivas (Printemps des Arts de Monte-Carlo) and several opera houses in Europe (Monaco, Geneva, Lyon, Marseille). For STOPERA!, she performs in Snow on Her Lips and co-authors OOO.",
        zh: "她与 Natacha Paquignon、Marco Berrettini、Sebastian Rivas（蒙特卡洛艺术之春）及欧洲多家歌剧院（摩纳哥、日内瓦、里昂、马赛）合作。在 STOPERA!，她是 Snow on Her Lips 的表演者，并共同创作 OOO。" }
    ],
    productions: ["ooo", "snow-on-her-lips"] },
  { slug: "valentin-pelisch", name: "Valentín Pelisch",
    role: { fr: "Compositeur & artiste sonore", es: "Compositor & artista sonoro", en: "Composer & sound artist", zh: "作曲家与声音艺术家" },
    bio: { fr: "Compositeur, performeur et bruiteur de Buenos Aires. Il co-conçoit et co-dirige OOO avec Emma Terno ; son travail réunit pièces pour ensembles, performances et installations sonores et vidéo.",
           es: "Compositor, performer y artista de foley de Buenos Aires. Co-concibe y co-dirige OOO con Emma Terno; su trabajo reúne obras para ensembles, performances e instalaciones sonoras y de vídeo.",
           en: "Composer, performer and foley artist from Buenos Aires. He co-creates and co-directs OOO with Emma Terno; his work spans pieces for ensembles, performances and sound and video installations.",
           zh: "来自布宜诺斯艾利斯的作曲家、表演者与拟音艺术家。他与 Emma Terno 共同构思并导演 OOO；其创作涵盖乐团作品、表演及声音与影像装置。" },
    bioLong: [
      { fr: "Ses œuvres ont été présentées en Amérique, en Europe et en Asie. Il est membre du duo audiovisuel BASURA (improvisation sonore à partir d'archives) et co-programme depuis 2017 le cycle de concerts Mínimo un Lunes à Buenos Aires.",
        es: "Sus obras se han presentado en América, Europa y Asia. Es miembro del dúo audiovisual BASURA (improvisación sonora a partir de archivos) y coprograma desde 2017 el ciclo de conciertos Mínimo un Lunes en Buenos Aires.",
        en: "His works have been presented in America, Europe and Asia. He is a member of the audiovisual duo BASURA (sound improvisation from archives) and has co-curated the Mínimo un Lunes concert series in Buenos Aires since 2017.",
        zh: "其作品曾在美洲、欧洲与亚洲呈现。他是视听二人组 BASURA（基于档案的声音即兴）成员，并自 2017 年起共同策划布宜诺斯艾利斯的 Mínimo un Lunes 音乐会系列。" },
      { fr: "Il a étudié la composition avec Gerardo Gandini et Marcelo Delgado, et obtenu une licence de composition avec médias électroacoustiques à l'Université nationale de Quilmes. Il s'est formé auprès de Mariano Etkin, Dmitri Kourliandski, Simon Steen-Andersen, du Quatuor Arditti, entre autres.",
        es: "Estudió composición con Gerardo Gandini y Marcelo Delgado, y obtuvo una licenciatura en composición con medios electroacústicos en la Universidad Nacional de Quilmes. Se formó con Mariano Etkin, Dmitri Kourliandski, Simon Steen-Andersen y el Cuarteto Arditti, entre otros.",
        en: "He studied composition with Gerardo Gandini and Marcelo Delgado and holds a degree in composition with electroacoustic media from the National University of Quilmes. He trained with Mariano Etkin, Dmitri Kourliandski, Simon Steen-Andersen and the Arditti Quartet, among others.",
        zh: "他师从 Gerardo Gandini 与 Marcelo Delgado 学习作曲，并获基尔梅斯国立大学电声媒介作曲学位。曾随 Mariano Etkin、Dmitri Kourliandski、Simon Steen-Andersen 及阿尔迪蒂四重奏等学习。" }
    ],
    productions: ["ooo"] },
  { slug: "daniel-zea", name: "Daniel Zea",
    role: { fr: "Vidéo & informatique musicale", es: "Vídeo & informática musical", en: "Video & music computing", zh: "影像与音乐信息" },
    bio: { fr: "Vidéo et informatique musicale de Snow on Her Lips ; il intervient également au sein du laboratoire LIPS.",
           es: "Vídeo e informática musical de Snow on Her Lips; también interviene en el laboratorio LIPS.",
           en: "Video and music computing for Snow on Her Lips; he also takes part in the LIPS laboratory.",
           zh: "Snow on Her Lips 的影像与音乐信息技术；他亦参与 LIPS 工作坊。" },
    productions: ["snow-on-her-lips", "lips"] },
  { slug: "nina-bouraoui", name: "Nina Bouraoui",
    role: { fr: "Autrice", es: "Autora", en: "Author", zh: "作者" },
    bio: { fr: "Écrivaine. Son texte est à l'origine d'Otages, portrait de Sylvie Meyer — femme « ordinaire et extraordinaire » qui bascule en un seul geste.",
           es: "Escritora. Su texto está en el origen de Otages, retrato de Sylvie Meyer — mujer «ordinaria y extraordinaria» que bascula en un solo gesto.",
           en: "A writer. Her text is the source of Otages, the portrait of Sylvie Meyer — an “ordinary and extraordinary” woman who tips over in a single act.",
           zh: "作家。她的文本是 Otages 的源头——对 Sylvie Meyer 的刻画，一位「平凡而非凡」、因一个举动而骤变的女性。" },
    productions: ["otages"] },
  { slug: "esteban-buch", name: "Esteban Buch",
    role: { fr: "Librettiste & chercheur", es: "Libretista & investigador", en: "Librettist & researcher", zh: "编剧与研究者" },
    bio: { fr: "Auteur du livret d'Aliados, opéra du temps réel sur la rencontre de Margaret Thatcher et du général Pinochet. Ses travaux croisent musique, politique et histoire.",
           es: "Autor del libreto de Aliados, ópera en tiempo real sobre el encuentro de Margaret Thatcher y el general Pinochet. Su trabajo cruza música, política e historia.",
           en: "Author of the libretto of Aliados, a real-time opera on the meeting of Margaret Thatcher and General Pinochet. His work crosses music, politics and history.",
           zh: "Aliados 的剧本作者——一部关于撒切尔夫人与皮诺切特将军会面的实时歌剧。其研究横跨音乐、政治与历史。" },
    productions: ["aliados"] },
  { slug: "richard-brunel", name: "Richard Brunel", website: "https://www.opera-lyon.com",
    role: { fr: "Metteur en scène", es: "Director de escena", en: "Stage director", zh: "导演" },
    bio: { fr: "Metteur en scène, il signe la création d'Otages au Théâtre de la Croix-Rousse, dans le cadre du Festival de l'Opéra de Lyon, dont il dirige la maison.",
           es: "Director de escena, firma el estreno de Otages en el Théâtre de la Croix-Rousse, en el marco del Festival de la Opéra de Lyon, casa que dirige.",
           en: "A stage director, he created Otages at the Théâtre de la Croix-Rousse for the Opéra de Lyon Festival, the house he directs.",
           zh: "导演，他在里昂歌剧院艺术节框架内于 Croix-Rousse 剧院执导 Otages 的首演，并执掌该院。" },
    productions: ["otages"] },
  { slug: "philippe-beziat", name: "Philippe Béziat",
    role: { fr: "Réalisateur", es: "Realizador", en: "Filmmaker", zh: "影像导演" },
    bio: { fr: "Réalisateur, il signe l'image et la vidéo de Rayon N et d'Aliados, où le cinéma et l'opéra se répondent en direct.",
           es: "Realizador, firma la imagen y el vídeo de Rayon N y de Aliados, donde el cine y la ópera se responden en vivo.",
           en: "A filmmaker, he creates the image and video of Rayon N and Aliados, where cinema and opera answer each other live.",
           zh: "影像导演，他为 Rayon N 与 Aliados 创作影像与视频，让电影与歌剧实时呼应。" },
    productions: ["rayon-n", "aliados"] },
  { slug: "anne-laure-chamboissier", name: "Anne-Laure Chamboissier",
    role: { fr: "Curatrice & production", es: "Curadora & producción", en: "Curator & production", zh: "策展与制作" },
    bio: { fr: "Curatrice indépendante, elle accompagne des projets à la croisée des arts visuels, de la musique et de la scène, et a pris part à l'émergence de STOPERA!.",
           es: "Curadora independiente, acompaña proyectos en el cruce de las artes visuales, la música y la escena, y participó en la emergencia de STOPERA!.",
           en: "An independent curator, she supports projects at the crossroads of visual arts, music and the stage, and took part in the emergence of STOPERA!.",
           zh: "独立策展人，她陪伴视觉艺术、音乐与舞台交汇处的项目，并参与了 STOPERA! 的萌生。" },
    productions: [] }
];

/* bios longues validées (faits sûrs uniquement) — fusionnées dans ARTISTS */
var BIOLONG = {
  "georges-aperghis": [
    { fr: "Né à Athènes en 1945, il vit et travaille en France. Figure majeure de la création contemporaine, il fonde en 1976 l'ATEM (Atelier Théâtre et Musique) et invente une œuvre où la voix, le geste et le langage deviennent matière scénique, des Récitations au théâtre musical.",
      es: "Nacido en Atenas en 1945, vive y trabaja en Francia. Figura mayor de la creación contemporánea, funda en 1976 el ATEM (Atelier Théâtre et Musique) e inventa una obra donde la voz, el gesto y el lenguaje se vuelven materia escénica, de las Récitations al teatro musical.",
      en: "Born in Athens in 1945, he lives and works in France. A major figure of contemporary creation, he founded ATEM (Atelier Théâtre et Musique) in 1976 and invented a body of work where voice, gesture and language become stage material, from the Récitations to music theatre.",
      zh: "1945 年生于雅典，现居法国并在此工作。作为当代创作的重要人物，他于 1976 年创立 ATEM（戏剧与音乐工坊），创造出让人声、动作与语言成为舞台素材的作品，从《Récitations》到音乐剧场。" },
    { fr: "Lion d'Or de la Biennale de Venise en 2015, son compagnonnage et son influence accompagnent STOPERA!. Ses pièces sont au cœur du projet Insistir, porté par Nicola Beller Carbone.",
      es: "León de Oro de la Bienal de Venecia en 2015, su compañía e influencia acompañan a STOPERA!. Sus piezas están en el corazón del proyecto Insistir, llevado por Nicola Beller Carbone.",
      en: "Golden Lion of the Venice Biennale in 2015, his companionship and influence accompany STOPERA!. His pieces are at the heart of the Insistir project, led by Nicola Beller Carbone.",
      zh: "2015 年获威尼斯双年展金狮奖。他的陪伴与影响伴随着 STOPERA!；其作品是由 Nicola Beller Carbone 推动的 Insistir 项目的核心。" }
  ],
  "christine-angot": [
    { fr: "Écrivaine née en 1959, elle est l'une des voix majeures de la littérature française contemporaine, notamment pour son écriture de l'intime (L'Inceste). Prix Médicis 2021 pour Le Voyage dans l'Est.",
      es: "Escritora nacida en 1959, es una de las voces mayores de la literatura francesa contemporánea, en particular por su escritura de lo íntimo (El incesto). Premio Médicis 2021 por Le Voyage dans l'Est.",
      en: "A writer born in 1959, she is one of the major voices of contemporary French literature, notably for her writing of the intimate (Incest). Winner of the 2021 Prix Médicis for Le Voyage dans l'Est.",
      zh: "1959 年出生的作家，是法国当代文学的重要声音之一，尤以其对私密经验的书写著称（《乱伦》）。凭《Le Voyage dans l'Est》获 2021 年美第奇奖。" },
    { fr: "Elle écrit les textes de De l'Innocence, opéra de chambre né d'une série de conversations avec le compositeur : non pas mettre un thème en musique, mais trouver une forme qui accueille ce qui résiste au langage et au récit.",
      es: "Escribe los textos de De l'Innocence, ópera de cámara nacida de una serie de conversaciones con el compositor: no poner un tema en música, sino encontrar una forma que acoja lo que resiste al lenguaje y al relato.",
      en: "She writes the texts of De l'Innocence, a chamber opera born from a series of conversations with the composer: not setting a theme to music, but finding a form that holds what resists language and narrative.",
      zh: "她为室内歌剧 De l'Innocence 撰写文本：并非为主题谱曲，而是寻找一种容纳那些抗拒语言与叙事之物的形式。" }
  ],
  "nina-bouraoui": [
    { fr: "Écrivaine née en 1967, son œuvre explore l'identité, le désir et la mémoire, entre la France et l'Algérie. Prix Renaudot 2005 pour Mes mauvaises pensées.",
      es: "Escritora nacida en 1967, su obra explora la identidad, el deseo y la memoria, entre Francia y Argelia. Premio Renaudot 2005 por Mes mauvaises pensées.",
      en: "A writer born in 1967, her work explores identity, desire and memory, between France and Algeria. Winner of the 2005 Prix Renaudot for Mes mauvaises pensées.",
      zh: "1967 年出生的作家，其作品在法国与阿尔及利亚之间探索身份、欲望与记忆。凭《Mes mauvaises pensées》获 2005 年勒诺多奖。" },
    { fr: "Son texte est à l'origine d'Otages : le portrait de Sylvie Meyer, femme « ordinaire et extraordinaire » qui bascule en un seul geste, à la fois répréhensible et libérateur.",
      es: "Su texto está en el origen de Otages: el retrato de Sylvie Meyer, mujer «ordinaria y extraordinaria» que bascula en un solo gesto, a la vez reprensible y liberador.",
      en: "Her text is the source of Otages: the portrait of Sylvie Meyer, an “ordinary and extraordinary” woman who tips over in a single act, at once reprehensible and liberating.",
      zh: "她的文本是 Otages 的源头：对 Sylvie Meyer 的刻画——一位「平凡而非凡」、因一个既应受谴责又带来解放的举动而骤变的女性。" }
  ],
  "esteban-buch": [
    { fr: "Musicologue et historien, directeur d'études à l'EHESS, ses travaux croisent musique, politique et histoire. Il signe le livret d'Aliados, opéra du temps réel sur la rencontre, à Londres en 1999, de Margaret Thatcher et du général Pinochet — un face-à-face entre fiction et réalité, mémoire et responsabilité.",
      es: "Musicólogo e historiador, director de estudios en la EHESS, su trabajo cruza música, política e historia. Firma el libreto de Aliados, ópera en tiempo real sobre el encuentro, en Londres en 1999, de Margaret Thatcher y el general Pinochet —un cara a cara entre ficción y realidad, memoria y responsabilidad.",
      en: "A musicologist and historian, directeur d'études at the EHESS, his work crosses music, politics and history. He wrote the libretto of Aliados, a real-time opera on the 1999 London meeting of Margaret Thatcher and General Pinochet — a face-off between fiction and reality, memory and responsibility.",
      zh: "音乐学者与历史学家，法国社会科学高等研究院（EHESS）研究主任，其研究横跨音乐、政治与历史。他撰写了 Aliados 的剧本——一部关于 1999 年伦敦撒切尔夫人与皮诺切特将军会面的实时歌剧：虚构与现实、记忆与责任之间的对峙。" }
  ],
  "richard-brunel": [
    { fr: "Metteur en scène, il dirige l'Opéra national de Lyon depuis 2021, après avoir été à la tête de la Comédie de Valence. Au théâtre comme à l'opéra, il met en scène un répertoire ancré dans les questions de notre temps.",
      es: "Director de escena, dirige la Opéra national de Lyon desde 2021, tras haber estado al frente de la Comédie de Valence. En el teatro y en la ópera, pone en escena un repertorio anclado en las cuestiones de nuestro tiempo.",
      en: "A stage director, he has led the Opéra national de Lyon since 2021, after heading the Comédie de Valence. In theatre and opera alike, he stages a repertoire rooted in the questions of our time.",
      zh: "导演，自 2021 年起执掌里昂国家歌剧院，此前曾领导瓦朗斯国家戏剧中心。无论戏剧还是歌剧，他执导的剧目都扎根于我们时代的议题。" },
    { fr: "Il signe la création d'Otages au Théâtre de la Croix-Rousse, dans le cadre du Festival de l'Opéra de Lyon (2024), d'après le texte de Nina Bouraoui.",
      es: "Firma el estreno de Otages en el Théâtre de la Croix-Rousse, en el marco del Festival de la Opéra de Lyon (2024), a partir del texto de Nina Bouraoui.",
      en: "He created Otages at the Théâtre de la Croix-Rousse for the Opéra de Lyon Festival (2024), after the text by Nina Bouraoui.",
      zh: "他在里昂歌剧院艺术节框架内于 Croix-Rousse 剧院执导 Otages 的首演（2024），改编自 Nina Bouraoui 的文本。" }
  ],
  "philippe-beziat": [
    { fr: "Réalisateur, son œuvre filmique explore le lien entre cinéma, musique et opéra, captant la création vivante au plus près des interprètes. Pour STOPERA!, il signe l'image et la vidéo de Rayon N et d'Aliados, où le cinéma et la scène se répondent en direct.",
      es: "Realizador, su obra fílmica explora el vínculo entre cine, música y ópera, captando la creación viva muy cerca de los intérpretes. Para STOPERA!, firma la imagen y el vídeo de Rayon N y de Aliados, donde el cine y la escena se responden en vivo.",
      en: "A filmmaker, his work explores the link between cinema, music and opera, capturing live creation up close to the performers. For STOPERA!, he creates the image and video of Rayon N and Aliados, where cinema and the stage answer each other live.",
      zh: "影像导演，其电影作品探索电影、音乐与歌剧之间的联系，贴近表演者捕捉鲜活的创作。他为 STOPERA! 的 Rayon N 与 Aliados 创作影像与视频，让电影与舞台实时呼应。" }
  ],
  "leo-warynski": [
    { fr: "Chef d'orchestre, il fonde et dirige l'ensemble vocal Les Métaboles et assure la direction musicale de l'ensemble instrumental Multilatérale. Son répertoire fait une large place à la musique de notre temps comme au grand répertoire a cappella.",
      es: "Director de orquesta, funda y dirige el ensemble vocal Les Métaboles y asume la dirección musical del ensemble instrumental Multilatérale. Su repertorio concede un amplio lugar a la música de nuestro tiempo y al gran repertorio a cappella.",
      en: "A conductor, he founded and directs the vocal ensemble Les Métaboles and is music director of the instrumental ensemble Multilatérale. His repertoire gives ample place to the music of our time as well as the great a cappella repertoire.",
      zh: "指挥家，他创立并领导人声乐团 Les Métaboles，并担任器乐团 Multilatérale 的音乐总监。其曲目既广纳当代音乐，也涵盖伟大的无伴奏合唱传统。" },
    { fr: "Avec STOPERA!, il assure la direction musicale de War Madrigals, Rayon N et Aliados.",
      es: "Con STOPERA!, asume la dirección musical de War Madrigals, Rayon N y Aliados.",
      en: "With STOPERA!, he conducts War Madrigals, Rayon N and Aliados.",
      zh: "在 STOPERA!，他担任 War Madrigals、Rayon N 与 Aliados 的音乐指挥。" }
  ],
  "antoine-gindt": [
    { fr: "Metteur en scène et producteur, il dirige T&M Paris et accompagne depuis de nombreuses années la création lyrique contemporaine, mettant en dialogue théâtre, musique et image.",
      es: "Director de escena y productor, dirige T&M Paris y acompaña desde hace muchos años la creación lírica contemporánea, poniendo en diálogo teatro, música e imagen.",
      en: "A stage director and producer, he directs T&M Paris and has long accompanied contemporary lyric creation, bringing theatre, music and image into dialogue.",
      zh: "导演与制作人，他执掌 T&M Paris，多年来陪伴当代歌剧创作，让戏剧、音乐与影像彼此对话。" },
    { fr: "Pour STOPERA!, il signe le livret et la mise en scène de Rayon N et la mise en scène d'Aliados (Ircam · ManiFeste).",
      es: "Para STOPERA!, firma el libreto y la dirección de Rayon N y la dirección de Aliados (Ircam · ManiFeste).",
      en: "For STOPERA!, he writes the libretto and stages Rayon N, and stages Aliados (Ircam · ManiFeste).",
      zh: "他为 STOPERA! 担任 Rayon N 的编剧与导演，并执导 Aliados（Ircam · ManiFeste）。" }
  ]
};
ARTISTS.forEach(function (a) { if (BIOLONG[a.slug]) a.bioLong = BIOLONG[a.slug]; });

function monogram(name) {
  var parts = String(name).split(/\s+/).filter(Boolean);
  return ((parts[0] || "").charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "")).toUpperCase();
}
/* palette BEHR complète, ordonnée en alternance chaud / froid / clair / foncé */
var MONO_COLORS = ["#2f3f49", "#a85c45", "#939a7e", "#5e3c41", "#6f8f8a", "#d6a65c", "#6d7f8d", "#4a3a2f", "#aebfbd", "#6b6470", "#4f5f60"];
/* index séquentiel par artiste → chaque fiche une teinte distincte */
ARTISTS.forEach(function (a, i) { a.color = MONO_COLORS[i % MONO_COLORS.length]; });
function artistAvatar(a, rel, cls) {
  if (a.photo) return '<' + cls + ' class="artist-portrait"><img src="' + rel + a.photo + '" alt="' + esc(a.name) + '" /></' + cls + '>';
  var c = a.color || MONO_COLORS[0];
  var bg = "linear-gradient(152deg," + c + " 0%," + darken(c, 0.86) + " 100%)";
  return '<' + cls + ' class="artist-portrait artist-mono" style="background:' + bg + ';color:' + inkOn(c) + '" aria-hidden="true"><span>' + esc(monogram(a.name)) + "</span></" + cls + ">";
}
function artistCard(a) {
  return '<li class="artist-card"><a href="' + a.slug + '/">'
    + artistAvatar(a, "../", "span")
    + '<span class="artist-meta"><span class="artist-name">' + esc(a.name) + '</span>'
    + '<span class="artist-role" ' + ml(a.role) + "></span></span></a></li>";
}
function artistBody(a, rel) {
  var prods = (a.productions || []).filter(function (s) { return bySlug[s]; }).map(function (s) {
    var pp = bySlug[s], href = rel + (s === "lips" ? "lips/" : "productions/" + s + "/");
    return '<li><a href="' + href + '" ' + ml(pp.titleHtml || pp.title) + "></a></li>";
  }).join("");
  var prodBlock = prods ? '<div class="pd-block pd-full"><h4 ' + ml({ fr: "Productions liées", es: "Producciones vinculadas", en: "Related productions", zh: "相关作品" }) + '></h4><ul class="taglist">' + prods + "</ul></div>" : "";
  var longBio = (a.bioLong && a.bioLong.length) ? '<div class="prose artist-bio-long">' + a.bioLong.map(function (par) { return "<p " + ml(par) + "></p>"; }).join("") + "</div>" : "";
  var linkItems = [];
  if (a.website) linkItems.push('<a href="' + a.website + '" target="_blank" rel="noopener">' + esc(a.website.replace(/^https?:\/\//, "").replace(/\/$/, "")) + " ↗</a>");
  (a.socials || []).forEach(function (s) { linkItems.push('<a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + " ↗</a>"); });
  var links = linkItems.length ? '<div class="pd-block pd-full"><h4 ' + ml({ fr: "Liens", es: "Enlaces", en: "Links", zh: "链接" }) + '></h4><p class="artist-links">' + linkItems.join(" · ") + "</p></div>" : "";
  return '    <article class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'artists/" data-fr="← Artistes" data-es="← Artistas" data-en="← Artists" data-zh="← 艺术家"></a></p>\n'
    + '      <div class="artist-head">' + artistAvatar(a, rel, "div")
    + '        <div><h1 class="pd-title pd-title--page">' + esc(a.name) + '</h1>'
    + '<p class="artist-role-lg" ' + ml(a.role) + "></p></div></div>\n"
    + '      <p class="pd-pitch" ' + ml(a.bio) + "></p>\n"
    + (longBio ? "      " + longBio + "\n" : "")
    + '      <div class="pd-grid">' + prodBlock + links + "</div>\n    </article>";
}

/* artists index */
var artistGrid = ARTISTS.map(artistCard).join("\n        ");
write("artists", page({ rel: "../", title: "Artistes", description: "Les artistes de STOPERA! — compositeurs, interprètes, metteurs en scène, auteurs et chercheurs qui font vivre la plateforme.", image: SITE + "/assets/og-cover.jpg", url: SITE + "/artists/", ogType: "website",
  body: '    <section class="section pd-page">\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Artistes" data-es="Artistas" data-en="Artists" data-zh="艺术家"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Un écosystème vivant : compositeurs, interprètes, metteur·ses en scène, auteur·rices et chercheur·ses qui se retrouvent d\'un projet à l\'autre." data-es="Un ecosistema vivo: compositores, intérpretes, directores, autores e investigadores que se reencuentran de un proyecto a otro." data-en="A living ecosystem: composers, performers, directors, authors and researchers who meet again from one project to the next." data-zh="一个活的生态：作曲家、表演者、导演、作者与研究者，在一个又一个项目中重逢。"></p>\n'
    + '      <ul class="artist-grid">\n        ' + artistGrid + "\n      </ul>\n    </section>" }));
urls.push(SITE + "/artists/");
ARTISTS.forEach(function (a) {
  var url = SITE + "/artists/" + a.slug + "/", img = SITE + "/" + (a.photo || "assets/og-cover.jpg");
  var jsonld = JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: a.name, jobTitle: plain(a.role), url: url, description: plain(a.bio), affiliation: { "@type": "Organization", name: "STOPERA!", url: SITE + "/" }, sameAs: a.website ? [a.website] : undefined });
  write("artists/" + a.slug, page({ rel: "../../", title: a.name, description: plain(a.bio), image: img, url: url, jsonld: jsonld, body: artistBody(a, "../../") }));
  urls.push(url);
});

/* cooperation */
write("cooperation", page({ rel: "../", title: "Coopération internationale", description: "La carte des coopérations de STOPERA! — institutions, lieux et projets en Europe et en Amérique latine, depuis Gentilly.", image: SITE + "/assets/og-cover.jpg", url: SITE + "/cooperation/", ogType: "website", body: cooperationBody("../") }));
urls.push(SITE + "/cooperation/");
/* press */
write("presse", page({ rel: "../", title: "Revue de presse", description: "La revue de presse de STOPERA! — articles et critiques autour d'Otages, Aliados, OOO et Snow on Her Lips, et la liste des médias.", image: SITE + "/assets/og-cover.jpg", url: SITE + "/presse/", ogType: "website", body: pressBody("../") }));
urls.push(SITE + "/presse/");
/* mentions légales */
write("mentions-legales", page({ rel: "../", title: "Mentions légales", description: "Mentions légales et politique de confidentialité de STOPERA! — éditeur, hébergement, propriété intellectuelle, RGPD et cookies.", image: SITE + "/assets/og-cover.jpg", url: SITE + "/mentions-legales/", ogType: "website", body: legalBody("../") }));
urls.push(SITE + "/mentions-legales/");
/* page 404 (auto-servie par GitHub Pages) */
fs.writeFileSync(path.join(DOCS, "404.html"),
  '<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<meta name="robots" content="noindex" />\n<title>Page introuvable — STOPERA!</title>\n'
  + '<style>html,body{margin:0;height:100%}body{background:#faf8f4;color:#14110f;font-family:Archivo,system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem}.x{max-width:30rem}.x img{height:30px;width:auto;margin-bottom:2rem}.x p.code{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#d81e05;margin:0 0 .8rem}.x h1{font-size:1.6rem;font-weight:700;margin:0 0 1rem}.x p{color:#6f685f;line-height:1.6}.x a.btn{display:inline-block;margin-top:1.4rem;background:#d81e05;color:#fff;text-decoration:none;padding:.7rem 1.3rem;border-radius:999px;font-weight:600;font-size:.9rem}</style>\n'
  + '</head>\n<body>\n<div class="x">\n<img src="' + SITE + '/assets/logo-dark.png" alt="STOPERA!" />\n<p class="code">Erreur 404</p>\n<h1>Cette page n\'existe pas (ou plus).</h1>\n<p>La page que vous cherchez est introuvable. Elle a peut-être été déplacée.</p>\n<a class="btn" href="' + SITE + '/">Retour à l\'accueil →</a>\n</div>\n</body>\n</html>\n');
/* snippet carte pour l'accueil (rel = "") */
fs.writeFileSync("/tmp/coop_home.html", coopMap("") + "\n      " + COOP_SCRIPT);

/* ---- AXES DE RECHERCHE (pages dédiées + prods dérivées) ---- */
var AXES = [
  { slug:"corps-voix",
    title:{fr:"Corps & voix",es:"Cuerpo & voz",en:"Body & voice",zh:"身体与人声"},
    intro:{fr:"L'incarnation au cœur du plateau : comment la voix, le geste et le corps deviennent présence. STOPERA! explore les dramaturgies vocales, l'écriture performative et la présence scénique — du solo à l'ensemble.",
           es:"La encarnación en el centro de la escena: cómo la voz, el gesto y el cuerpo se vuelven presencia. STOPERA! explora las dramaturgias vocales, la escritura performativa y la presencia escénica — del solo al ensemble.",
           en:"Embodiment at the heart of the stage: how voice, gesture and body become presence. STOPERA! explores vocal dramaturgies, performative writing and stage presence — from the solo to the ensemble.",
           zh:"身体化居于舞台核心：人声、动作与身体如何成为在场。STOPERA! 探索人声戏剧构作、表演性书写与舞台在场——从独角到群体。"},
    items:["rut","snow-on-her-lips","fame","insistir"] },
  { slug:"technologies-creation",
    title:{fr:"Technologies & création",es:"Tecnologías & creación",en:"Technologies & creation",zh:"技术与创作"},
    intro:{fr:"La technologie comme matière artistique, jamais comme fin : intelligence artificielle, image générée, électronique en temps réel et systèmes interactifs — des outils mis à l'épreuve du plateau, du geste et de l'écoute.",
           es:"La tecnología como materia artística, nunca como fin: inteligencia artificial, imagen generada, electrónica en tiempo real y sistemas interactivos — herramientas puestas a prueba en la escena, el gesto y la escucha.",
           en:"Technology as artistic material, never as an end: artificial intelligence, generated image, real-time electronics and interactive systems — tools tested on stage, in gesture and listening.",
           zh:"技术作为艺术素材，而非目的：人工智能、生成影像、实时电子与互动系统——在舞台、动作与聆听中接受检验的工具。"},
    items:["rayon-n","ooo","rut","aliados"] },
  { slug:"nouvelles-narrations",
    title:{fr:"Nouvelles narrations",es:"Nuevas narrativas",en:"New narratives",zh:"新叙事"},
    intro:{fr:"Raconter autrement : récits fragmentés, formes documentaires, dramaturgies spéculatives et écritures interdisciplinaires. La parole et le texte y deviennent matière musicale, de Christine Angot à Nina Bouraoui.",
           es:"Contar de otro modo: relatos fragmentados, formas documentales, dramaturgias especulativas y escrituras interdisciplinarias. La palabra y el texto se vuelven materia musical, de Christine Angot a Nina Bouraoui.",
           en:"Telling otherwise: fragmented narratives, documentary forms, speculative dramaturgies and interdisciplinary writing. Word and text become musical material, from Christine Angot to Nina Bouraoui.",
           zh:"以另一种方式叙述：碎片化叙事、纪实形式、思辨戏剧构作与跨学科书写。言语与文本成为音乐素材，从 Christine Angot 到 Nina Bouraoui。"},
    items:["america","otages","nous","war-madrigals"] },
  { slug:"nouveaux-formats",
    title:{fr:"Nouveaux formats",es:"Nuevos formatos",en:"New formats",zh:"新形式"},
    intro:{fr:"Inventer la forme : opéra-film, environnements immersifs, installations performatives, formes scéniques hybrides et projets in situ. L'œuvre déborde le cadre du spectacle pour devenir expérience.",
           es:"Inventar la forma: ópera-film, entornos inmersivos, instalaciones performativas, formas escénicas híbridas y proyectos in situ. La obra desborda el marco del espectáculo para volverse experiencia.",
           en:"Inventing form: film-opera, immersive environments, performative installations, hybrid stage forms and site-specific projects. The work overflows the frame of the show to become experience.",
           zh:"发明形式：影像歌剧、沉浸式环境、表演性装置、混合舞台形式与在地项目。作品溢出演出的框架，成为体验。"},
    items:["ooo","rayon-n","snow-on-her-lips","insistir"] }
];
function rechBody(a, rel){
  var tiles = a.items.filter(function(s){return bySlug[s];}).map(function(s){ return threadTile(s, rel); }).join("\n        ");
  return '    <section class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="'+rel+'index.html#recherche" data-fr="← Recherche" data-es="← Investigación" data-en="← Research" data-zh="← 研究"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" '+ml(a.title)+'></h1>\n'
    + '      <p class="pd-pitch" '+ml(a.intro)+'></p>\n'
    + '      <ul class="projects thread-grid">\n        '+tiles+'\n      </ul>\n'
    + '      <p class="more-link"><a href="'+rel+'lips/" data-fr="→ Le laboratoire de recherche LIPS" data-es="→ El laboratorio de investigación LIPS" data-en="→ The LIPS research laboratory" data-zh="→ LIPS 研究工作坊"></a></p>\n'
    + '    </section>';
}
AXES.forEach(function(a){
  var url = SITE + "/recherche/" + a.slug + "/";
  var jsonld = JSON.stringify({ "@context":"https://schema.org","@type":"CollectionPage", name: plain(a.title)+" — STOPERA!", description: plain(a.intro), url: url });
  write("recherche/"+a.slug, page({ rel:"../../", title: plain(a.title), description: plain(a.intro), image: SITE+"/assets/og-cover.jpg", url: url, ogType:"website", jsonld: jsonld, body: rechBody(a, "../../") }));
  urls.push(url);
});

/* sitemap */
var sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map(function (u) { return "  <url><loc>" + u + "</loc></url>"; }).join("\n") + "\n</urlset>\n";
fs.writeFileSync(path.join(DOCS, "sitemap.xml"), sm);

console.log("generated", urls.length, "urls");
