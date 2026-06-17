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
  + ";var PROJECTS=" + grab(/var PROJECTS = (\[[\s\S]*?\n  \]);/)
  + ";return {YEARS:YEARS,PERIOD:PERIOD,COLORS:COLORS,PROJECTS:PROJECTS};";
var DATA = new Function(sandbox)();
var PROJECTS = DATA.PROJECTS, YEARS = DATA.YEARS, COLORS = DATA.COLORS;
var bySlug = {}; PROJECTS.forEach(function (p) { bySlug[p.slug] = p; });

/* ---- Layer 2 : navigation éditoriale (parcours thématiques transversaux) ---- */
var THEMES = [
  { slug: "temps-reel",
    title: { fr: "Temps réel & technologie", es: "Tiempo real & tecnología", en: "Real time & technology", zh: "实时与技术" },
    blurb: { fr: "L'image, le geste et la voix transformés en direct : capteurs, vidéo, électronique et image générée deviennent matière de plateau.",
             es: "La imagen, el gesto y la voz transformados en directo: sensores, vídeo, electrónica e imagen generada se vuelven materia escénica.",
             en: "Image, gesture and voice transformed live: sensors, video, electronics and generated imagery become stage material.",
             zh: "影像、动作与人声的实时转化：传感器、影像、电子与生成图像成为舞台素材。" },
    items: ["rayon-n", "rut", "aliados", "snow-on-her-lips", "fame"] },
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
    blurb: { fr: "Seul·e en scène : la performance, le geste et la présence comme acte, où le corps devient instrument.",
             es: "Solo·a en escena: la performance, el gesto y la presencia como acto, donde el cuerpo se vuelve instrumento.",
             en: "Alone on stage: performance, gesture and presence as act, where the body becomes an instrument.",
             zh: "独自在台上：表演、动作与作为行动的在场，身体成为乐器。" },
    items: ["rut", "fame", "insistir", "snow-on-her-lips"] }
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
function hx(h){h=h.replace("#","");return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function darken(h,f){var c=hx(h);function x(n){n=Math.max(0,Math.min(255,Math.round(n)));return("0"+n.toString(16)).slice(-2);}return"#"+x(c[0]*f)+x(c[1]*f)+x(c[2]*f);}
function inkOn(h){var c=hx(h);return(0.299*c[0]+0.587*c[1]+0.114*c[2])/255>0.62?"#1a1410":"#ffffff";}
function tileBg(slug){var b=COLORS[slug]||"#4f5f60";return"linear-gradient(152deg,"+b+" 0%,"+darken(b,0.86)+" 100%)";}

function header(rel) {
  // target starting with "#" = anchor on home ; otherwise a standalone page path
  var nav = [["#apropos","À propos","Acerca de","About","关于"],["#productions","Productions","Producciones","Productions","作品"],
    ["news/","Actualités","Novedades","News","动态"],["#reseau","Réseau","Red","Network","网络"],
    ["#recherche","Recherche","Investigación","Research","研究"],["lips/","LIPS","LIPS","LIPS","LIPS"],
    ["#presse","Presse","Prensa","Press","媒体"],["#contact","Contact","Contacto","Contact","联系"]]
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
  var links = THEMES.map(function (th) {
    return '<a href="' + rel + 'parcours/' + th.slug + '/" ' + ml(th.title) + '></a>';
  }).join("");
  return '<nav class="editorial-nav" aria-label="Parcours éditoriaux">\n'
    + '    <a class="ed-label" href="' + rel + 'parcours/" data-fr="Parcours" data-es="Recorridos" data-en="Threads" data-zh="主题"></a>\n'
    + '    <div class="ed-links">' + links + '</div>\n  </nav>';
}
function footer(rel) {
  return '<footer class="site-footer">\n'
    + '    <span class="brand-logo-foot"><img src="' + rel + 'assets/logo-dark.png" alt="STOPERA!" /></span>\n'
    + '    <p class="foot-social"><a href="https://instagram.com/stopera_sonic_theatre" target="_blank" rel="noopener">Instagram</a> · <a href="https://www.youtube.com/@stopera-sonictheatre" target="_blank" rel="noopener">YouTube</a> · <a href="https://www.facebook.com/stopera.sonictheatre" target="_blank" rel="noopener">Facebook</a></p>\n'
    + '    <p>© <span id="year"></span> STOPERA! — Sonic Theatre Opera Performance · Gentilly (Paris)</p>\n  </footer>';
}

function page(opts) {
  var rel = opts.rel, V = "?v=20260617B";
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
    + '</head>\n<body data-lang="fr">\n  ' + header(rel) + '\n  ' + editorialNav(rel) + '\n  <main id="top" class="subpage">\n'
    + opts.body + '\n  </main>\n  ' + footer(rel) + '\n'
    + '  <div class="float-actions">\n'
    + '    <button class="float-share js-share" type="button" aria-label="Partager"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l4 4h-3v7h-2V7H8l4-4zM5 10h3v2H6.5v7h11v-7H16v-2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/></svg><span data-fr="Partager" data-es="Compartir" data-en="Share" data-zh="分享"></span></button>\n'
    + '    <a class="float-contact" href="' + rel + 'index.html#contact" aria-label="Contact"><span data-fr="Écrire" data-es="Escribir" data-en="Write" data-zh="联系"></span><span aria-hidden="true">↗</span></a>\n'
    + '  </div>\n'
    + '  <script src="' + rel + 'script.js' + V + '"></script>\n</body>\n</html>\n';
}

/* ---- production / programme page body ---- */
function prodBody(p, rel) {
  var photo = p.photo ? rel + p.photo : null;
  var media;
  if (p.video) media = '<div class="pd-media pd-media--video"><iframe src="https://www.youtube-nocookie.com/embed/' + p.video + '?rel=0&modestbranding=1&playsinline=1" title="' + esc(plain(p.title)) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
  else if (photo) media = '<figure class="pd-media"><img src="' + photo + '" alt="' + esc(plain(p.titleHtml || p.title)) + '" /></figure>';
  else media = '<div class="pd-media pd-media--color" style="background:' + tileBg(p.slug) + ';color:' + inkOn(COLORS[p.slug] || "#4f5f60") + '"><span class="pd-media-title" ' + ml(p.titleHtml || p.title) + '></span></div>';

  var facts = (p.facts || []).map(function (f) { return '<li><span class="k" ' + ml(f.k) + '></span><span class="v" ' + ml(f.v) + '></span></li>'; }).join("");
  var credits = (p.credits || []).map(function (c) { return '<li><span class="role" ' + ml(c.role) + '></span> <span class="who">' + esc(tFR(c.who)) + '</span></li>'; }).join("");
  var credits_ml = (p.credits || []).map(function (c) {
    var who = (typeof c.who === "object") ? '<span class="who" ' + ml(c.who) + '></span>' : '<span class="who">' + esc(c.who) + '</span>';
    return '<li><span class="role" ' + ml(c.role) + '></span> — ' + who + '</li>';
  }).join("");
  var partners = (p.partners && p.partners.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"Production & partenaires",es:"Producción & socios",en:"Production & partners",zh:"制作与合作"}) + '></h4><ul class="taglist">' + p.partners.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "";
  var press = (p.press && p.press.length) ? '<div class="pd-block pd-full pd-press"><h4 ' + ml({fr:"Revue de presse",es:"Reseña de prensa",en:"Press",zh:"媒体评论"}) + '></h4>'
    + p.press.map(function (q) { var src2 = q.url ? '<a href="' + q.url + '" target="_blank" rel="noopener">' + esc(q.source) + "</a>" : esc(q.source);
        return '<blockquote class="pdq"><span ' + ml(typeof q.quote === "object" ? wrapQuote(q.quote) : { fr: "« " + q.quote + " »", es: "« " + q.quote + " »", en: "« " + q.quote + " »", zh: "« " + q.quote + " »" }) + '></span><cite>' + src2 + "</cite></blockquote>"; }).join("")
    + (p.pressPdf ? '<a class="pd-dl" href="' + rel + p.pressPdf + '" target="_blank" rel="noopener" ' + ml({fr:"Télécharger la revue de presse (PDF) ↓",es:"Descargar la reseña de prensa (PDF) ↓",en:"Download the press review (PDF) ↓",zh:"下载媒体评论（PDF）↓"}) + '></a>' : "") + "</div>" : "";
  var links = (p.links && p.links.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"À voir & écouter",es:"Ver & escuchar",en:"Watch & listen",zh:"观看与聆听"}) + '></h4><ul class="taglist">' + p.links.map(function (l) { return '<li><a href="' + l.url + '" target="_blank" rel="noopener">' + esc(l.label) + "</a></li>"; }).join("") + "</ul></div>" : "";
  var note = p.note ? '<p class="pd-note" ' + ml(p.note) + "></p>" : "";

  return '    <article class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html#productions" data-fr="← Productions" data-es="← Producciones" data-en="← Productions" data-zh="← 作品"></a> · <span class="pd-tag" ' + ml(p.tag || "") + '></span></p>\n'
    + '      <h1 class="pd-title pd-title--page" ' + ml(p.titleHtml || p.title) + '></h1>\n'
    + "      " + media + "\n"
    + '      <p class="pd-pitch" ' + ml(p.pitch) + "></p>\n"
    + '      <div class="pd-grid">\n'
    + '        <div class="pd-block"><h4 ' + ml({fr:"Informations",es:"Información",en:"Details",zh:"信息"}) + '></h4><ul class="facts">' + facts + "</ul></div>\n"
    + '        <div class="pd-block"><h4 ' + ml({fr:"Générique",es:"Créditos",en:"Credits",zh:"创作团队"}) + '></h4><ul class="credits">' + credits_ml + "</ul></div>\n"
    + "        " + partners + press + links + note + "\n      </div>\n    </article>";
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

/* sitemap */
var sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map(function (u) { return "  <url><loc>" + u + "</loc></url>"; }).join("\n") + "\n</urlset>\n";
fs.writeFileSync(path.join(DOCS, "sitemap.xml"), sm);

console.log("generated", urls.length, "urls");
