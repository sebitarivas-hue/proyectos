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
var SITE = "https://stopera.art";
var LANGS = ["fr", "es", "en", "it", "zh"];

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
    title: { fr: "Temps réel & technologie", es: "Tiempo real & tecnología", en: "Real time & technology", zh: "实时与技术", it: "Tempo reale & tecnologia" },
    blurb: { fr: "L'image, le geste et la voix transformés en direct : capteurs, vidéo, électronique et image générée deviennent matière de plateau.",
             es: "La imagen, el gesto y la voz transformados en directo: sensores, vídeo, electrónica e imagen generada se vuelven materia escénica.",
             en: "Image, gesture and voice transformed live: sensors, video, electronics and generated imagery become stage material.",
             zh: "影像、动作与人声的实时转化：传感器、影像、电子与生成图像成为舞台素材。", it: "L'immagine, il gesto e la voce trasformati dal vivo: sensori, video, elettronica e immagine generata diventano materia scenica." },
    items: ["ooo", "rut", "snow-on-her-lips", "fame"] },
  { slug: "posthumain-memoire",
    title: { fr: "Post-humain & mémoire", es: "Posthumano & memoria", en: "Post-human & memory", zh: "后人类与记忆", it: "Post-umano & memoria" },
    blurb: { fr: "Des mondes où l'humain n'est plus au centre : objets, machines et images qui se souviennent à notre place. Ce qui reste, et ce qui se souvient, quand nous ne sommes plus là.",
             es: "Mundos donde lo humano ya no está en el centro: objetos, máquinas e imágenes que recuerdan en nuestro lugar. Lo que queda, y lo que recuerda, cuando ya no estamos.",
             en: "Worlds where the human is no longer the centre: objects, machines and images that remember in our place. What remains, and what remembers, when we are gone.",
             zh: "人类不再居于中心的世界：替我们记忆的物件、机器与影像。当我们不再在场，什么留存，什么记忆。", it: "Mondi in cui l'umano non è più al centro: oggetti, macchine e immagini che ricordano al posto nostro. Ciò che resta, e ciò che ricorda, quando non ci siamo più." },
    items: ["ooo", "war-madrigals", "salamandres"] },
  { slug: "memoire-politique",
    title: { fr: "Mémoire & politique", es: "Memoria & política", en: "Memory & politics", zh: "记忆与政治", it: "Memoria & politica" },
    blurb: { fr: "Pouvoir, histoire et résistance : des figures réelles ou de fiction qui interrogent la responsabilité, la violence et la liberté.",
             es: "Poder, historia y resistencia: figuras reales o de ficción que interrogan la responsabilidad, la violencia y la libertad.",
             en: "Power, history and resistance: real or fictional figures questioning responsibility, violence and freedom.",
             zh: "权力、历史与抵抗：真实或虚构的人物，叩问责任、暴力与自由。", it: "Potere, storia e resistenza: figure reali o di finzione che interrogano la responsabilità, la violenza e la libertà." },
    items: ["otages", "america", "mamma-roma", "insistir", "salamandres"] },
  { slug: "voix-texte",
    title: { fr: "Voix & texte", es: "Voz & texto", en: "Voice & text", zh: "人声与文本", it: "Voce & testo" },
    blurb: { fr: "L'écriture au cœur du plateau : livrets, auteurs et la parole comme matière musicale, de Christine Angot à Pasolini.",
             es: "La escritura en el centro de la escena: libretos, autores y la palabra como materia musical, de Christine Angot a Pasolini.",
             en: "Writing at the heart of the stage: librettos, authors and the spoken word as musical material, from Christine Angot to Pasolini.",
             zh: "写作居于舞台核心：剧本、作者与作为音乐素材的言语，从 Christine Angot 到帕索里尼。", it: "La scrittura al centro della scena: libretti, autori e la parola come materia musicale, da Christine Angot a Pasolini." },
    items: ["nous", "otages", "war-madrigals", "america"] },
  { slug: "corps-presence",
    title: { fr: "Corps & présence", es: "Cuerpo & presencia", en: "Body & presence", zh: "身体与在场", it: "Corpo & presenza" },
    blurb: { fr: "La performance, le geste et la présence comme acte — du solo au corps parmi les objets et les machines.",
             es: "La performance, el gesto y la presencia como acto — del solo al cuerpo entre los objetos y las máquinas.",
             en: "Performance, gesture and presence as act — from the solo to the body among objects and machines.",
             zh: "表演、动作与作为行动的在场——从独角到置身于物件与机器之间的身体。", it: "La performance, il gesto e la presenza come atto — dall'assolo al corpo tra gli oggetti e le macchine." },
    items: ["ooo", "rut", "fame", "insistir", "snow-on-her-lips"] }
];

/* ---- helpers ---- */
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function tL(o, lang) {
  if (o == null) return "";
  if (typeof o !== "object") return o;
  return o[lang] != null ? o[lang] : (o.fr || "");
}
function tFR(o) { return tL(o, "fr"); }
function plain(o, lang) { return tL(o, lang || "fr").replace(/<[^>]+>/g, ""); } // strip HTML for meta
/* Chemin d'une page dans une langue donnée. Le français reste à la racine :
   c'est l'URL historique, déjà indexée et déjà partagée. */
function langPath(p, lang) { return "/" + (lang === "fr" ? "" : lang + "/") + p; }
function langUrl(p, lang) { return SITE + langPath(p, lang); }
/* Balises hreflang : elles disent au moteur que ces quatre pages sont la
   même page en quatre langues, et laquelle servir à qui. Sans elles, les
   versions se concurrencent au lieu de se compléter. */
function alternates(p) {
  return LANGS.map(function (l) {
    return '  <link rel="alternate" hreflang="' + (l === "zh" ? "zh-Hans" : l) + '" href="' + langUrl(p, l) + '" />\n';
  }).join("") + '  <link rel="alternate" hreflang="x-default" href="' + langUrl(p, "fr") + '" />\n';
}
var OG_LOCALE = { fr: "fr_FR", es: "es_ES", en: "en_GB", zh: "zh_CN", it: "it_IT" };
/* data-* attributes for client-side i18n (script.js fills innerHTML) */
function ml(o) {
  if (o == null) return "";
  if (typeof o !== "object") o = { fr: o, es: o, en: o, zh: o };
  return LANGS.map(function (l) { return 'data-' + l + '="' + esc(o[l] != null ? o[l] : o.fr) + '"'; }).join(" ");
}
/* lien de repli sous un lecteur intégré : si YouTube refuse l'embed,
   le public garde un accès direct à la vidéo */
function ytFallback(id) {
  return '<p class="pd-media-fallback"><a href="https://www.youtube.com/watch?v=' + id +
    '" target="_blank" rel="noopener" ' +
    ml({ fr: "Voir sur YouTube \u2197", es: "Ver en YouTube \u2197", en: "Watch on YouTube \u2197", zh: "\u5728 YouTube \u89c2\u770b \u2197", it: "Guarda su YouTube ↗" }) + '></a></p>';
}
/* name → fiche : rendre tout nom d'artiste cliquable sur les pages projet */
var NAME2SLUG = {
  "Sebastian Rivas": "sebastian-rivas", "Georges Aperghis": "georges-aperghis", "Olivia Martin": "olivia-martin",
  "Nicola Beller Carbone": "nicola-beller-carbone", "Martin Bauer": "martin-bauer",
  "Rut Schreiner": "rut-schreiner", "Léo Warynski": "leo-warynski", "Christine Angot": "christine-angot",
  "Marcelo Lombardero": "marcelo-lombardero", "Emma Terno": "emma-terno", "Valentín Pelisch": "valentin-pelisch",
  "Daniel Zea": "daniel-zea", "Nina Bouraoui": "nina-bouraoui",
  "Richard Brunel": "richard-brunel", "Anne-Laure Chamboissier": "anne-laure-chamboissier",
  "Guillaume Kosmicki": "guillaume-kosmicki", "- porte renaud -": "porte-renaud"
};
var NAME_LIST = Object.keys(NAME2SLUG).sort(function (a, b) { return b.length - a.length; });
function linkNames(s, rel) {
  var out = esc(String(s));
  NAME_LIST.forEach(function (n) { if (out.indexOf(n) >= 0) out = out.split(n).join('<a href="' + rel + 'artists/' + NAME2SLUG[n] + '/">' + n + "</a>"); });
  return out;
}
/* institutions → site officiel (lien sur les partenaires des pages projet) */
var INST = [["GRAME","https://www.grame.fr"],["Teatro Colón","https://teatrocolon.org.ar"],["Ensemble intercontemporain","https://www.ensembleinter.com"],["Métaboles","https://www.lesmetaboles.fr"],["Opéra de Lyon","https://www.opera-lyon.com"],["Croix-Rousse","https://croix-rousse.com"],["Gennevilliers","https://www.theatre2gennevilliers.com"],["Monte-Carlo","https://www.printempsdesarts.mc"],["Pôle Pixel","https://www.pole-pixel.com"],["UNSAM","https://www.unsam.edu.ar"],["Latinoamérica","https://operala.org"],["Ville de Gentilly","https://www.ville-gentilly.fr"],["Muse en Circuit","https://alamuse.com"],["Chartreuse","https://www.chartreuse.org"],["Générateur","https://legenerateur.com"],["ManiFeste","https://www.ircam.fr/agenda/festival"],["Ircam","https://www.ircam.fr"],["Radio France","https://www.radiofrance.fr"],["Trilobite","https://cietrilobite.org"],["Tête à Tête","https://www.tete-a-tete.org.uk"],["Lacroch'","https://lacroch.com"],["Futurs Composés","https://www.futurscomposes.com"],["Artenréel","https://artenreel.fr"],["Fondation de France","https://www.fondationdefrance.org"],["Fondation Salabert","https://fondation-salabert.org"],["CNM","https://cnm.fr"],["DRAC Grand Est","https://www.culture.gouv.fr/regions/drac-grand-est"],["Fondation Jerez","https://www.fondationdefrance.org"]];
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
  var nav = [["pourquoi/","Pourquoi","Por qué","Why","为何","Perché"],
    ["oeuvres/","Œuvres","Obras","Works","作品","Opere"],
    ["laboratoire/","Laboratoire","Laboratorio","Laboratory","实验室","Laboratorio"],
    ["reseau/","Réseau","Red","Network","网络","Rete"],
    ["soutenir/","Soutenir","Apoyar","Support","支持","Sostenere"],
    ["news/","Actualités","Novedades","News","动态","Notizie"]]
    .map(function (n) { var href = n[0].charAt(0) === "#" ? rel + "index.html" + n[0] : rel + n[0];
      return '<a href="' + href + '" data-fr="' + n[1] + '" data-es="' + n[2] + '" data-en="' + n[3] + '" data-it="' + n[5] + '" data-zh="' + n[4] + '"></a>'; }).join("\n      ");
  return '<header class="site-header">\n'
    + '    <a class="brand" href="' + rel + 'index.html" aria-label="STOPERA!"><img class="brand-logo" src="' + '/assets/logo-dark.png" alt="STOPERA!" /></a>\n'
    + '    <button class="nav-toggle" type="button" aria-label="Menu" aria-controls="nav-links" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="bar1" d="M3 6h18"/><path class="bar2" d="M3 12h18"/><path class="bar3" d="M3 18h18"/></svg></button>\n'
    + '    <nav class="site-nav" aria-label="Navigation"><div class="nav-links" id="nav-links">\n      ' + nav + '\n    </div>\n'
    + '      <div class="lang-switch" role="group" aria-label="Langue / Language"><button type="button" class="lang-opt" data-setlang="fr">FR</button><button type="button" class="lang-opt" data-setlang="es">ES</button><button type="button" class="lang-opt" data-setlang="en">EN</button><button type="button" class="lang-opt" data-setlang="it">IT</button><button type="button" class="lang-opt" data-setlang="zh">中文</button></div>\n'
    + '    </nav>\n  </header>';
}
function editorialNav(rel) {
  var miss = [["#productions","Créer","Crear","Create","创作","Creare"],
    ["#recherche","Chercher","Buscar","Explore","探索","Cercare"],
    ["#lips","Partager","Compartir","Share","分享","Condividere"],
    ["#rejoindre","Soutenir","Apoyar","Support","支持","Sostenere"],
    ["cooperation/","Relier","Conectar","Connect","连接","Collegare"]]
    .map(function (n) { var href = n[0].charAt(0) === "#" ? rel + "index.html" + n[0] : rel + n[0];
      return '<a href="' + href + '" data-fr="' + n[1] + '" data-es="' + n[2] + '" data-en="' + n[3] + '" data-it="' + n[5] + '" data-zh="' + n[4] + '"></a>'; }).join("");
  return '<nav class="editorial-nav" aria-label="Missions">\n'
    + '    <span class="ed-label" data-fr="Missions" data-es="Misiones" data-en="Missions" data-zh="使命" data-it="Missioni"></span>\n'
    + '    <div class="ed-links">' + miss + '</div>\n  </nav>';
}
function footer(rel) {
  return '<footer class="site-footer">\n'
    + '    <span class="brand-logo-foot"><img src="' + '/assets/logo-dark.png" alt="STOPERA!" /></span>\n'
    + '    <form class="newsletter" data-newsletter><p class="newsletter-k" data-fr="Newsletter" data-es="Newsletter" data-en="Newsletter" data-zh="\u901a\u8baf" data-it="Newsletter"></p><div class="newsletter-row"><input type="email" name="email" class="newsletter-input" required placeholder="email@exemple.com" aria-label="Email" /><button type="submit" class="newsletter-btn" data-fr="S\'inscrire" data-es="Suscribirse" data-en="Subscribe" data-zh="\u8ba2\u9605" data-it="Iscriviti"></button></div></form>\n'
    + '    <p class="foot-social"><a href="https://instagram.com/stopera_sonic_theatre" target="_blank" rel="noopener">Instagram</a> · <a href="https://www.youtube.com/@stopera-sonictheatre" target="_blank" rel="noopener">YouTube</a> · <a href="https://www.facebook.com/stopera.sonictheatre" target="_blank" rel="noopener">Facebook</a></p>\n'
    + '    <p>© <span id="year"></span> STOPERA! — Sonic Theatre Opera Performance · Gentilly (Paris) · <a href="' + rel + 'mentions-legales/" data-fr="Mentions légales" data-es="Aviso legal" data-en="Legal notice" data-zh="法律声明" data-it="Note legali"></a></p>\n  </footer>';
}

/* `page` ne rend plus rien : il décrit la page. Le rendu se fait dans
   `render`, une fois par langue. C'est ce qui permet à un même appel de
   produire /productions/ooo/, /es/…, /en/… et /zh/… sans dupliquer le code
   des pages. */
function page(opts) { return opts; }


/* Cinq pages — oeuvres, soutenir, laboratoire, reseau, pourquoi — ouvrent
   sur un <h2 class="lead"> et n'ont donc aucun titre de niveau 1. Plutot
   que de promouvoir ce h2, ce qui changerait leur mise en page, on insere
   un h1 pour lecteurs d'ecran et moteurs, dans la langue de la page, a
   partir du titre deja traduit du descripteur. */
function h1Fallback(opts, lang) {
  var body = typeof opts.body === "function" ? opts.body(opts.rel, lang) : opts.body;
  if (body.indexOf("<h1") >= 0) return "";
  return '    <h1 class="visually-hidden">' + esc(plain(opts.title, lang)) + " — STOPERA!</h1>\n";
}

function render(opts, lang) {
  var rel = opts.rel, V = "?v=20260805A";
  var title = plain(opts.title, lang), desc = plain(opts.description, lang);
  var jsonld = typeof opts.jsonld === "function" ? opts.jsonld(lang) : opts.jsonld;
  var url = langUrl(opts.path, lang);
  return '<!DOCTYPE html>\n<html lang="' + lang + '">\n<head>\n'
    + '  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />\n'
    + '  <title>' + esc(title) + ' — STOPERA!</title>\n'
    + '  <meta name="description" content="' + esc(desc) + '" />\n'
    + '  <link rel="canonical" href="' + url + '" />\n'
    + alternates(opts.path)
    + '  <meta name="theme-color" content="#faf8f4" />\n'
    + '  <meta property="og:type" content="' + (opts.ogType || "article") + '" />\n'
    + '  <meta property="og:site_name" content="STOPERA!" />\n'
    + '  <meta property="og:locale" content="' + OG_LOCALE[lang] + '" />\n'
    + LANGS.filter(function (l) { return l !== lang; }).map(function (l) {
        return '  <meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '" />\n'; }).join("")
    + '  <meta property="og:title" content="' + esc(title) + ' — STOPERA!" />\n'
    + '  <meta property="og:description" content="' + esc(desc) + '" />\n'
    + '  <meta property="og:url" content="' + url + '" />\n'
    + '  <meta property="og:image" content="' + opts.image + '" />\n'
    + '  <meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />\n'
    + '  <meta name="twitter:card" content="summary_large_image" />\n'
    + '  <meta name="twitter:title" content="' + esc(title) + ' — STOPERA!" />\n'
    + '  <meta name="twitter:description" content="' + esc(desc) + '" />\n'
    + '  <meta name="twitter:image" content="' + opts.image + '" />\n'
    + (jsonld ? '  <script type="application/ld+json">' + jsonld + '</script>\n' : "")
    + '  <link rel="icon" type="image/png" href="/assets/favicon.png" />\n'
    + '  <link rel="stylesheet" href="/assets/fonts/fonts.css' + V + '" />\n'
    + '  <link rel="stylesheet" href="/styles.css' + V + '" />\n'
    + '</head>\n<body class="home-jv" data-lang="' + lang + '" data-rel="' + rel + '">\n  ' + header(rel) + '\n  <main id="top" class="subpage">\n'
    + h1Fallback(opts, lang) + (typeof opts.body === "function" ? opts.body(rel, lang) : opts.body) + '\n  </main>\n  ' + footer(rel) + '\n'
    + '  <div class="float-actions">\n'
    + '    <a class="float-home" href="' + rel + 'index.html" aria-label="Accueil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h5v-5h4v5h5v-9"/></svg><span data-fr="Accueil" data-es="Inicio" data-en="Home" data-zh="首页" data-it="Home"></span></a>\n'
    + '    <button class="float-share js-share" type="button" aria-label="Partager"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l4 4h-3v7h-2V7H8l4-4zM5 10h3v2H6.5v7h11v-7H16v-2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/></svg><span data-fr="Partager" data-es="Compartir" data-en="Share" data-zh="分享" data-it="Condividi"></span></button>\n'
    + '    <a class="float-contact" href="' + rel + 'index.html#contact" aria-label="Contact"><span data-fr="Écrire" data-es="Escribir" data-en="Write" data-zh="联系" data-it="Scrivi"></span><span aria-hidden="true">↗</span></a>\n'
    + '  </div>\n'
    + '  <script src="/script.js' + V + '"></script>\n'
    + '  <!-- Cloudflare Web Analytics --><script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "f3dca4355e1c4362b402b3fa96218469"}\'></script><!-- End Cloudflare Web Analytics -->\n'
    + '</body>\n</html>\n';
}

/* ---- production / programme page body ---- */
function prodBody(p, rel) {
  var photo = p.photo ? "/" + p.photo : null;
  var hero, teaser = "";
  var banner = p.banner ? '<figure class="pd-banner"><img src="' + "/" + p.banner + '" alt="' + esc(plain(p.title)) + ' — affiche" loading="lazy" /></figure>' : "";
  if (photo) hero = '<figure class="pd-media"><img src="' + photo + '" alt="' + esc(plain(p.titleHtml || p.title)) + '" /></figure>';
  else if (p.video) hero = '<div class="pd-media pd-media--video"><iframe src="https://www.youtube.com/embed/' + p.video + '?rel=0&modestbranding=1&playsinline=1&controls=1&fs=1" title="' + esc(plain(p.title)) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe></div>' + ytFallback(p.video);
  else hero = '<div class="pd-media pd-media--color" style="background:' + tileBg(p.slug) + ';color:' + inkOn(COLORS[p.slug] || "#4f5f60") + '"><span class="pd-media-title" ' + ml(p.titleHtml || p.title) + '></span></div>';
  if (photo && p.video) teaser = '<div class="pd-teaser"><h4 ' + ml({fr:"Bande-annonce",es:"Tráiler",en:"Trailer",zh:"预告片", it: "Trailer"}) + '></h4><div class="pd-media pd-media--video"><iframe src="https://www.youtube.com/embed/' + p.video + '?rel=0&modestbranding=1&playsinline=1&controls=1&fs=1" title="' + esc(plain(p.title)) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe></div>' + ytFallback(p.video) + '</div>';

  var facts = (p.facts || []).map(function (f) {
    var v = (typeof f.v === "object") ? '<span class="v" ' + ml(f.v) + '></span>' : '<span class="v">' + linkNames(f.v, rel) + '</span>';
    return '<li><span class="k" ' + ml(f.k) + '></span>' + v + '</li>';
  }).join("");
  var credits_ml = (p.credits || []).map(function (c) {
    var who = (typeof c.who === "object") ? '<span class="who" ' + ml(c.who) + '></span>' : '<span class="who">' + linkNames(c.who, rel) + '</span>';
    return '<li><span class="role" ' + ml(c.role) + '></span> — ' + who + '</li>';
  }).join("");
  var guests = (p.guests && p.guests.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"Intervenant\u00b7es & artistes invit\u00e9\u00b7es",es:"Invitados/as & artistas",en:"Mentors & guest artists",zh:"\u5bfc\u5e08\u4e0e\u5ba2\u5ea7\u827a\u672f\u5bb6", it: "Docenti & artisti ospiti"}) + '></h4><ul class="taglist">' + p.guests.map(function (g) { return "<li>" + linkNames(g, rel) + "</li>"; }).join("") + "</ul></div>" : "";
  var financeurs = (p.financeurs && p.financeurs.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"Financeurs & m\u00e9c\u00e9nat",es:"Financiadores & mecenazgo",en:"Funders & patronage",zh:"\u8d44\u52a9\u4e0e\u8d5e\u52a9", it: "Finanziatori & mecenatismo"}) + '></h4><ul class="taglist">' + p.financeurs.map(function (x) { return "<li>" + linkInst(x) + "</li>"; }).join("") + "</ul></div>" : "";
  var tech = (p.tech && p.tech.length) ? '<div class="pd-block"><h4 ' + ml({fr:"Fiche technique",es:"Ficha técnica",en:"Technical sheet",zh:"技术表", it: "Scheda tecnica"}) + '></h4><ul class="facts">' + p.tech.map(function (f) { return '<li><span class="k" ' + ml(f.k) + '></span><span class="v">' + linkNames(tFR(f.v), rel) + '</span></li>'; }).join("") + "</ul></div>" : "";
  var diffusion = p.diffusion ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"Production & diffusion",es:"Producción & difusión",en:"Production & diffusion",zh:"制作与巡演", it: "Produzione & distribuzione"}) + '></h4><p class="pd-prose" ' + ml(p.diffusion) + "></p></div>" : "";
  var partnersList = (p.partners && p.partners.length) ? '<ul class="taglist pd-dim-partners">' + p.partners.map(function (x) { return "<li>" + linkInst(x) + "</li>"; }).join("") + "</ul>" : "";
  var relations = (p.relations && p.relations.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"En lien",es:"Conexiones",en:"Connections",zh:"关联", it: "Collegamenti"}) + '></h4><ul class="rel-list">' + p.relations.map(function (r) {
      var href = r.url ? r.url : rel + r.href; var ext = r.url ? ' target="_blank" rel="noopener"' : "";
      return '<li><a href="' + href + '"' + ext + ' ' + ml(r.label) + '></a></li>';
    }).join("") + "</ul></div>" : "";
  var gallery = (p.gallery && p.gallery.length) ? '<div class="pd-gallery">' + p.gallery.map(function (g) { return '<figure><img src="' + "/" + g.src + '" alt="' + esc(g.alt || plain(p.title)) + '" loading="lazy" /></figure>'; }).join("") + "</div>" : "";
  var press = (p.press && p.press.length) ? '<div class="pd-block pd-full pd-press"><h4 ' + ml({fr:"Revue de presse",es:"Reseña de prensa",en:"Press",zh:"媒体评论", it: "Rassegna stampa"}) + '></h4>'
    + p.press.map(pressQuote).join("")
    + (p.pressPdf ? '<a class="pd-dl" href="' + "/" + p.pressPdf + '" target="_blank" rel="noopener" ' + ml({fr:"Télécharger la revue de presse (PDF) ↓",es:"Descargar la reseña de prensa (PDF) ↓",en:"Download the press review (PDF) ↓",zh:"下载媒体评论（PDF）↓", it: "Scarica la rassegna stampa (PDF) ↓"}) + '></a>' : "") + "</div>" : "";
  var links = (p.links && p.links.length) ? '<div class="pd-block pd-full"><h4 ' + ml({fr:"À voir & écouter",es:"Ver & escuchar",en:"Watch & listen",zh:"观看与聆听", it: "Da vedere & ascoltare"}) + '></h4><ul class="taglist">' + p.links.map(function (l) { return '<li><a href="' + l.url + '" target="_blank" rel="noopener">' + esc(l.label) + "</a></li>"; }).join("") + "</ul></div>" : "";
  var note = p.note ? '<p class="pd-note" ' + ml(p.note) + "></p>" : "";
  var dims = (p.transmission || p.territory || partnersList) ? '<div class="pd-dimensions">\n'
    + '        <div class="pd-dim"><h4 ' + ml({fr:"Production",es:"Producción",en:"Production",zh:"制作", it: "Produzione"}) + '></h4><p class="pd-dim-text" ' + ml(p.short) + '></p></div>\n'
    + '        <div class="pd-dim"><h4><a class="dim-link" href="' + rel + 'transmission/" ' + ml({fr:"Transmission ↗",es:"Transmisión ↗",en:"Transmission ↗",zh:"传承 ↗", it: "Trasmissione ↗"}) + '></a></h4><p class="pd-dim-text" ' + ml(p.transmission || {fr:"Autour de l'œuvre : ateliers, rencontres et partage des savoir-faire avec artistes, étudiant·es et publics.",es:"En torno a la obra: talleres, encuentros y transmisión de saberes con artistas, estudiantes y públicos.",en:"Around the work: workshops, encounters and sharing of know-how with artists, students and audiences.",zh:"围绕作品：与艺术家、学生及公众展开工作坊、相遇与技艺分享。", it: "Intorno all'opera: laboratori, incontri e condivisione dei saperi con artisti, studenti e pubblico."}) + '></p></div>\n'
    + '        <div class="pd-dim"><h4 ' + ml({fr:"Partenariats & territoire",es:"Alianzas & territorio",en:"Partnerships & territory",zh:"合作与在地", it: "Partenariati & territorio"}) + '></h4>' + (p.territory ? '<p class="pd-dim-text" ' + ml(p.territory) + "></p>" : "") + partnersList + "</div>\n"
    + "      </div>" : "";

  return '    <article class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html#productions" data-fr="← Productions" data-es="← Producciones" data-en="← Productions" data-zh="← 作品" data-it="← Produzioni"></a> · <span class="pd-tag" ' + ml(p.tag || "") + '></span></p>\n'
    + '      <h1 class="pd-title pd-title--page" ' + ml(p.titleHtml || p.title) + '></h1>\n'
    + (banner ? '      ' + banner + '\n' : '')
    + "      " + hero + "\n"
    + '      <p class="pd-pitch" ' + ml(p.pitch) + "></p>\n"
    + ((p.body && p.body.length) ? p.body.map(function (b) { return '      <p class="pd-prose pd-prose--lead" ' + ml(b) + "></p>\n"; }).join("") : "")
    + (teaser ? "      " + teaser + "\n" : "")
    + (dims ? "      " + dims + "\n" : "")
    + (gallery ? "      " + gallery + "\n" : "")
    + '      <div class="pd-grid">\n'
    + '        <div class="pd-block"><h4 ' + ml({fr:"Informations",es:"Información",en:"Details",zh:"信息", it: "Informazioni"}) + '></h4><ul class="facts">' + facts + "</ul></div>\n"
    + '        <div class="pd-block"><h4 ' + ml({fr:"Générique",es:"Créditos",en:"Credits",zh:"创作团队", it: "Crediti"}) + '></h4><ul class="credits">' + credits_ml + "</ul></div>\n"
    + "        " + guests + financeurs + tech + diffusion + relations + press + links + note + "\n      </div>\n    </article>";
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
      + '<span class="ptile-img" style="background-image:url(\'' + "/" + p.photo + '\')"></span>'
      + '<span class="ptile-scrim"></span>'
      + '<span class="ptile-meta">' + title + yearSpan + "</span></a></li>";
  }
  return '<li class="project"><a class="ptile ptile--color" href="' + href + '" style="background:' + tileBg(slug) + ";color:" + inkOn(COLORS[slug] || "#4f5f60") + '">'
    + '<span class="ptile-tag" ' + ml(p.tag || "") + "></span>"
    + '<span class="ptile-meta">' + title + yearSpan + "</span></a></li>";
}

/* ---- NEWS (éditorial) ---- */
var NEWS = [
  { slug: "ola-panel-ecosistema", date: "2024-12", img: "assets/og-cover.jpg",
    title: { fr: "Sebastián Rivas au panel « Ecosistema de circulación » — 17e Conférence OLA", es: "Sebastián Rivas en el panel « Ecosistema de circulación » — 17a Conferencia OLA", en: "Sebastián Rivas on the « Circulation Ecosystem » panel — 17th OLA Conference", zh: "Sebastián Rivas 在「流通生态」小组讨论 — 第 17 届 OLA 大会", it: "Sebastián Rivas al panel «Ecosistema de circulación» — 17ª Conferenza OLA" },
    excerpt: { fr: "Participation au panel « Ecosistema de circulación : Festivales, teatros, compañías, ideas y territorios » de la 17e Conférence annuelle d'Ópera Latinoamérica (Santiago, décembre 2024).", es: "Participación en el panel « Ecosistema de circulación: Festivales, teatros, compañías, ideas y territorios » de la 17a Conferencia anual de Ópera Latinoamérica (Santiago, diciembre 2024).", en: "Participation in the « Circulation Ecosystem: Festivals, theatres, companies, ideas and territories » panel at the 17th annual Ópera Latinoamérica Conference (Santiago, December 2024).", zh: "参与第 17 届 Ópera Latinoamérica 年会「流通生态：节日、剧院、公司、观念与领地」小组讨论（圣地亚哥，2024 年 12 月）。", it: "Partecipazione al panel «Ecosistema de circulación: Festivales, teatros, compañías, ideas y territorios» della 17ª Conferenza annuale di Ópera Latinoamérica (Santiago, dicembre 2024)." },
    body: { fr: "Aux côtés de Ramiro Osorio (Teatro Mayor Julio Mario Santo Domingo, Colombie), Carmen Romero (Fundación Teatro a Mil, Chili), Chantal Signorio (Festival Puerto de Ideas, Chili) et modéré par José Luis Rivero (Auditorio de Tenerife, Espagne), Sebastian Rivas explore les écosystèmes de circulation des œuvres — festivals, théâtres, compagnies, idées et territoires — dans le contexte de la scène musicale latino-américaine contemporaine.", es: "Junto a Ramiro Osorio (Teatro Mayor Julio Mario Santo Domingo, Colombia), Carmen Romero (Fundación Teatro a Mil, Chile), Chantal Signorio (Festival Puerto de Ideas, Chile) y moderado por José Luis Rivero (Auditorio de Tenerife, España), Sebastián Rivas explora los ecosistemas de circulación de las obras — festivales, teatros, compañías, ideas y territorios — en el contexto de la escena musical latinoamericana contemporánea.", en: "Alongside Ramiro Osorio (Teatro Mayor Julio Mario Santo Domingo, Colombia), Carmen Romero (Fundación Teatro a Mil, Chile), Chantal Signorio (Festival Puerto de Ideas, Chile) and moderated by José Luis Rivero (Auditorio de Tenerife, Spain), Sebastián Rivas explores circulation ecosystems for artworks — festivals, theatres, companies, ideas and territories — within the contemporary Latin American musical scene.", zh: "与 Ramiro Osorio（科隆剧院 Julio Mario Santo Domingo，哥伦比亚）、Carmen Romero（Teatro a Mil 基金会，智利）、Chantal Signorio（Puerto de Ideas 音乐节，智利）同台，由 José Luis Rivero（特内里费岛音乐厅，西班牙）主持，Sebastián Rivas 探讨当代拉美音乐场景中作品的流通生态——节日、剧院、公司、观念与领地。", it: "Accanto a Ramiro Osorio (Teatro Mayor Julio Mario Santo Domingo, Colombia), Carmen Romero (Fundación Teatro a Mil, Cile), Chantal Signorio (Festival Puerto de Ideas, Cile) e con la moderazione di José Luis Rivero (Auditorio de Tenerife, Spagna), Sebastian Rivas esplora gli ecosistemi di circolazione delle opere — festival, teatri, compagnie, idee e territori — nel contesto della scena musicale latinoamericana contemporanea." } },
  { slug: "otages-creation-lyon", date: "2024-03", img: "assets/projects/otages.jpg", related: "otages",
    title: { fr: "Otages créé à l'Opéra de Lyon", es: "Otages estrenado en la Opéra de Lyon", en: "Otages premieres at the Opéra de Lyon", zh: "Otages 于里昂歌剧院首演", it: "Otages debutta all'Opéra de Lyon" },
    excerpt: { fr: "Création mondiale d'Otages, opéra de Sebastian Rivas d'après Nina Bouraoui, au Théâtre de la Croix-Rousse (Festival de l'Opéra de Lyon), en mars 2024.", es: "Estreno mundial de Otages, ópera de Sebastian Rivas a partir de Nina Bouraoui, en el Théâtre de la Croix-Rousse (Festival de la Opéra de Lyon), en marzo de 2024.", en: "World premiere of Otages, an opera by Sebastian Rivas after Nina Bouraoui, at the Théâtre de la Croix-Rousse (Opéra de Lyon Festival), in March 2024.", zh: "Sebastian Rivas 取材自 Nina Bouraoui 的歌剧 Otages，于 2024 年 3 月在 Croix-Rousse 剧院（里昂歌剧院艺术节）世界首演。", it: "Prima mondiale di Otages, opera di Sebastian Rivas da Nina Bouraoui, al Théâtre de la Croix-Rousse (Festival de l'Opéra de Lyon), nel marzo 2024." },
    body: { fr: "Créé le 17 mars 2024 dans le cadre du Festival de l'Opéra de Lyon, Otages réunit la soprano Nicola Beller Carbone et la direction musicale de Rut Schreiner. Le projet a bénéficié du soutien de la Fondation Jerez, sous l'égide de la Fondation de France.", es: "Estrenado el 17 de marzo de 2024 en el Festival de la Opéra de Lyon, Otages reúne a la soprano Nicola Beller Carbone y la dirección musical de Rut Schreiner. El proyecto contó con el apoyo de la Fondation Jerez, bajo la égida de la Fondation de France.", en: "Premiered on 17 March 2024 as part of the Opéra de Lyon Festival, Otages brings together soprano Nicola Beller Carbone and the musical direction of Rut Schreiner. The project was supported by the Fondation Jerez, under the aegis of the Fondation de France.", zh: "Otages 于 2024 年 3 月 17 日在里昂歌剧院艺术节框架内首演，汇集女高音 Nicola Beller Carbone 与指挥 Rut Schreiner。项目获 Fondation Jerez（隶属法国基金会）支持。", it: "Presentato in prima il 17 marzo 2024 nell'ambito del Festival de l'Opéra de Lyon, Otages riunisce il soprano Nicola Beller Carbone e la direzione musicale di Rut Schreiner. Il progetto ha beneficiato del sostegno della Fondation Jerez, sotto l'egida della Fondation de France." } },
  { slug: "ooo-teatro-colon", date: "2025-09", img: "assets/projects/ooo.jpg", related: "ooo",
    title: { fr: "OOO créé au Teatro Colón", es: "OOO estrenado en el Teatro Colón", en: "OOO premieres at the Teatro Colón", zh: "OOO 在科隆剧院首演", it: "OOO debutta al Teatro Colón" },
    excerpt: { fr: "Environnement opératique post-humain d'Emma Terno et Valentín Pelisch, OOO a été créé au CETC du Teatro Colón (Buenos Aires) en septembre 2025.", es: "Entorno operístico posthumano de Emma Terno y Valentín Pelisch, OOO se estrenó en el CETC del Teatro Colón (Buenos Aires) en septiembre de 2025.", en: "A post-human operatic environment by Emma Terno and Valentín Pelisch, OOO premiered at the Teatro Colón's CETC (Buenos Aires) in September 2025.", zh: "Emma Terno 与 Valentín Pelisch 的后人类歌剧环境 OOO，于 2025 年 9 月在科隆剧院实验中心（CETC，布宜诺斯艾利斯）首演。", it: "Ambiente operistico post-umano di Emma Terno e Valentín Pelisch, OOO ha debuttato al CETC del Teatro Colón (Buenos Aires) nel settembre 2025." },
    body: { fr: "Né d'une coopération entre le GRAME — CNCM (Lyon) et le CETC du Teatro Colón, OOO imagine un monde d'après l'humanité, où une plante d'intérieur et un robot défaillant dialoguent parmi les objets et les fantômes. Salué par la presse argentine (Infobae, Clarín, Ópera Latinoamérica), le spectacle entre en diffusion internationale avec STOPERA!.", es: "Nacido de una cooperación entre el GRAME — CNCM (Lyon) y el CETC del Teatro Colón, OOO imagina un mundo después de la humanidad, donde una planta de interior y un bot defectuoso dialogan entre objetos y fantasmas. Elogiado por la prensa argentina (Infobae, Clarín, Ópera Latinoamérica), el espectáculo entra en difusión internacional con STOPERA!.", en: "Born from a cooperation between GRAME — CNCM (Lyon) and the Teatro Colón's CETC, OOO imagines a world after humanity, where a houseplant and a defective bot converse among objects and ghosts. Praised by the Argentine press (Infobae, Clarín, Ópera Latinoamérica), the work now enters international diffusion with STOPERA!.", zh: "OOO 诞生自里昂 GRAME 国家音乐创作中心与科隆剧院 CETC 的合作，想象一个人类之后的世界——一株室内植物与一个失灵机器人在物件与幽灵之间对话。该作受到阿根廷媒体（Infobae、Clarín、Ópera Latinoamérica）赞誉，如今随 STOPERA! 进入国际巡演。", it: "Nato da una cooperazione tra il GRAME — CNCM (Lione) e il CETC del Teatro Colón, OOO immagina un mondo dopo l'umanità, dove una pianta d'appartamento e un robot difettoso dialogano tra gli oggetti e i fantasmi. Accolto con favore dalla stampa argentina (Infobae, Clarín, Ópera Latinoamérica), lo spettacolo entra in distribuzione internazionale con STOPERA!." } },
  { slug: "war-madrigals-france-musique", date: "2026", img: "assets/projects/war-madrigals.jpg", related: "war-madrigals",
    title: { fr: "War Madrigals : première étape sur France Musique", es: "War Madrigals: primera etapa en France Musique", en: "War Madrigals: first step on France Musique", zh: "War Madrigals：France Musique 首个阶段", it: "War Madrigals: prima tappa su France Musique" },
    excerpt: { fr: "Cycle de dix madrigaux pour six voix, War Madrigals entre en création avec Les Métaboles (direction Léo Warynski) dans « Création Mondiale » sur France Musique.", es: "Ciclo de diez madrigales para seis voces, War Madrigals entra en creación con Les Métaboles (dirección Léo Warynski) en «Création Mondiale» de France Musique.", en: "A cycle of ten madrigals for six voices, War Madrigals enters creation with Les Métaboles (conducted by Léo Warynski) in France Musique's “Création Mondiale.”", zh: "为六声部创作的十首牧歌套曲 War Madrigals，与 Les Métaboles（Léo Warynski 指挥）在 France Musique「Création Mondiale」中进入创作。", it: "Ciclo di dieci madrigali per sei voci, War Madrigals entra in creazione con Les Métaboles (direzione Léo Warynski) in «Création Mondiale» su France Musique." },
    body: { fr: "Première étape de création dans l'émission « Création Mondiale » d'Anne Montaron (France Musique), War Madrigals explore la guerre, la mémoire et l'effritement du langage à travers un cycle polyphonique multilingue. Distribution et dates en cours de finalisation.", es: "Primera etapa de creación en el programa «Création Mondiale» de Anne Montaron (France Musique), War Madrigals explora la guerra, la memoria y la erosión del lenguaje mediante un ciclo polifónico multilingüe. Reparto y fechas en proceso de confirmación.", en: "A first creation step in Anne Montaron's “Création Mondiale” programme (France Musique), War Madrigals explores war, memory and the erosion of language through a multilingual polyphonic cycle. Cast and dates being finalised.", zh: "作为 Anne Montaron 主持的「Création Mondiale」节目（France Musique）的首个创作阶段，War Madrigals 透过多语复调套曲探索战争、记忆与语言的崩解。演员与日期确认中。", it: "Prima tappa di creazione nella trasmissione «Création Mondiale» di Anne Montaron (France Musique), War Madrigals esplora la guerra, la memoria e lo sgretolarsi del linguaggio attraverso un ciclo polifonico multilingue. Cast e date in via di definizione." } },
  { slug: "stopera-launch", date: "2026-06", img: "assets/og-cover.jpg",
    title: { fr: "STOPERA! ouvre sa plateforme", es: "STOPERA! abre su plataforma", en: "STOPERA! opens its platform", zh: "STOPERA! 启动其平台", it: "STOPERA! apre la sua piattaforma" },
    excerpt: { fr: "Une plateforme internationale de création, de production, de recherche et de transmission voit le jour à Gentilly.", es: "Una plataforma internacional de creación, producción, investigación y transmisión nace en Gentilly.", en: "An international platform for creation, production, research and transmission launches in Gentilly.", zh: "一个面向创作、制作、研究与传承的国际平台在让蒂伊诞生。", it: "Una piattaforma internazionale di creazione, produzione, ricerca e trasmissione nasce a Gentilly." },
    body: { fr: "STOPERA! réunit artistes, interprètes, chercheurs et partenaires culturels autour d'une même question : comment la voix, le corps et le son deviennent présence sur le plateau. La plateforme rassemble créations, recherche et transmission, sous la direction de Sebastian Rivas et avec le soutien de Georges Aperghis comme président d'honneur.", es: "STOPERA! reúne a artistas, intérpretes, investigadores y socios culturales en torno a una misma pregunta: cómo la voz, el cuerpo y el sonido se vuelven presencia en escena. La plataforma reúne creaciones, investigación y transmisión, bajo la dirección de Sebastian Rivas y con el apoyo de Georges Aperghis como presidente de honor.", en: "STOPERA! brings together artists, performers, researchers and cultural partners around a single question: how voice, body and sound become presence on stage. The platform unites creation, research and transmission, directed by Sebastian Rivas and supported by Georges Aperghis as honorary president.", zh: "STOPERA! 汇集艺术家、表演者、研究者与文化伙伴，围绕同一问题：人声、身体与声音如何在舞台上成为在场。平台整合创作、研究与传承，由 Sebastian Rivas 担任艺术指导，并由 Georges Aperghis 担任名誉主席给予支持。", it: "STOPERA! riunisce artisti, interpreti, ricercatori e partner culturali intorno a una stessa domanda: come la voce, il corpo e il suono diventano presenza in scena. La piattaforma raccoglie creazioni, ricerca e trasmissione, sotto la direzione di Sebastian Rivas e con il sostegno di Georges Aperghis come presidente onorario." } },
  { slug: "stopera-accompagne-we-expected", date: "2026-07", img: "assets/projects/salamandres.jpg", related: "salamandres",
    title: { fr: "STOPERA! accompagne « We Expected the Disaster… »", es: "STOPERA! acompaña « We Expected the Disaster… »", en: "STOPERA! supports \u201cWe Expected the Disaster\u2026\u201d", zh: "STOPERA! 陪伴《We Expected the Disaster…》", it: "STOPERA! accompagna «We Expected the Disaster…»" },
    excerpt: { fr: "STOPERA! entre en accompagnement de l'opéra politique et écologique de - porte renaud - (Cie Trilobite), en amont de sa création au festival Tête à Tête (Londres) en 2027.", es: "STOPERA! acompaña la ópera política y ecológica de - porte renaud - (Cie Trilobite), antes de su estreno en el festival Tête à Tête (Londres) en 2027.", en: "STOPERA! begins supporting - porte renaud -'s political, ecological opera (Cie Trilobite), ahead of its premiere at the Tête à Tête festival (London) in 2027.", zh: "STOPERA! 开始陪伴 - porte renaud -（Cie Trilobite）的政治与生态歌剧，先于其 2027 年在伦敦 Tête à Tête 音乐节首演。", it: "STOPERA! comincia ad accompagnare l'opera politica ed ecologica di - porte renaud - (Cie Trilobite), in vista della sua prima al festival Tête à Tête (Londra) nel 2027." },
    body: { fr: "D'après La Guerre des salamandres de Karel Čapek, We Expected the Disaster… but not the salamanders! mêle extractivisme, crise écologique et un fort travail avec les populations (recherche-action, éducation populaire). STOPERA! en accompagne une première phase de développement — structuration, communication et mise en réseau — vers une diffusion en France, en Europe et en Amérique latine.", es: "A partir de La guerra de las salamandras de Karel Čapek, We Expected the Disaster… but not the salamanders! entrelaza extractivismo, crisis ecológica y un fuerte trabajo con las poblaciones (investigación-acción, educación popular). STOPERA! acompaña una primera fase de desarrollo — estructuración, comunicación y puesta en red — hacia una difusión en Francia, Europa y América Latina.", en: "After Karel Čapek's War with the Newts, We Expected the Disaster… but not the salamanders! weaves together extractivism, ecological crisis and a strong practice of work with communities (action-research, popular education). STOPERA! supports a first development phase — structuring, communication and networking — towards diffusion in France, Europe and Latin America.", zh: "取材自卡雷尔·恰佩克《鲵鱼之乱》，《We Expected the Disaster… but not the salamanders!》交织攫取主义、生态危机与深入的民众工作（行动研究、平民教育）。STOPERA! 陪伴其首个发展阶段——结构搭建、传播与人脉——推动其在法国、欧洲与拉丁美洲的巡演。", it: "Da La guerra delle salamandre di Karel Čapek, We Expected the Disaster… but not the salamanders! intreccia estrattivismo, crisi ecologica e un forte lavoro con gli abitanti (ricerca-azione, educazione popolare). STOPERA! ne accompagna una prima fase di sviluppo — strutturazione, comunicazione e messa in rete — verso una distribuzione in Francia, in Europa e in America latina." } },
  { slug: "mamma-roma-cetc", date: "2027", img: "assets/projects/mamma-roma.jpg", related: "mamma-roma",
    title: { fr: "Mamma Roma en création au Teatro Colón", es: "Mamma Roma en creación en el Teatro Colón", en: "Mamma Roma premieres at the Teatro Colón", zh: "Mamma Roma 于科隆剧院首演", it: "Mamma Roma in creazione al Teatro Colón" },
    excerpt: { fr: "Mamma Roma, opéra d'après Pasolini mis en scène par Martin Bauer, est créé au CETC — Teatro Colón (Buenos Aires) en 2027.", es: "Mamma Roma, ópera a partir de Pasolini dirigida por Martin Bauer, se estrena en el CETC — Teatro Colón (Buenos Aires) en 2027.", en: "Mamma Roma, an opera after Pasolini staged by Martin Bauer, premieres at the CETC — Teatro Colón (Buenos Aires) in 2027.", zh: "取材自帕索里尼、Martin Bauer 执导的歌剧 Mamma Roma，于 2027 年在 CETC — 科隆剧院（布宜诺斯艾利斯）首演。", it: "Mamma Roma, opera da Pasolini con la regia di Martin Bauer, debutta al CETC — Teatro Colón (Buenos Aires) nel 2027." },
    body: { fr: "Autour d'une table qui devient tombeau, Mamma Roma poursuit le dialogue de STOPERA! avec la scène lyrique argentine. Création au Centro de Experimentación del Teatro Colón (CETC), qui en assure la production.", es: "En torno a una mesa que se vuelve tumba, Mamma Roma prolonga el diálogo de STOPERA! con la escena lírica argentina. Estreno en el Centro de Experimentación del Teatro Colón (CETC), que asegura su producción.", en: "Around a table that becomes a tomb, Mamma Roma continues STOPERA!'s dialogue with the Argentine opera scene. Premiered at the Centro de Experimentación del Teatro Colón (CETC), which produces it.", zh: "围绕一张化为坟墓的餐桌，Mamma Roma 延续 STOPERA! 与阿根廷歌剧场景的对话。于科隆剧院实验中心（CETC）首演并由其制作。", it: "Intorno a un tavolo che diventa tomba, Mamma Roma prosegue il dialogo di STOPERA! con la scena lirica argentina. Prima al Centro de Experimentación del Teatro Colón (CETC), che ne assicura la produzione." } },
  { slug: "lips-2028", date: "2028", img: "assets/projects/lips.jpg", related: "lips",
    title: { fr: "LIPS Lab : prochaine édition 2028", es: "LIPS Lab: próxima edición 2028", en: "LIPS Lab: next edition 2028", zh: "LIPS Lab：下一届 2028", it: "LIPS Lab: prossima edizione 2028" },
    excerpt: { fr: "Le laboratoire international de prototypes scéniques et sonores revient en 2028, tous les deux ans.", es: "El laboratorio internacional de prototipos escénicos y sonoros vuelve en 2028, cada dos años.", en: "The international laboratory of scenic and sound prototypes returns in 2028, every two years.", zh: "国际舞台与声音原型工作坊将于 2028 年回归，每两年一届。", it: "Il laboratorio internazionale di prototipi scenici e sonori torna nel 2028, ogni due anni." },
    body: { fr: "LIPS réunit de jeunes artistes de toutes disciplines — composition, mise en scène, arts visuels, théâtre, danse — accompagnés par des artistes confirmés. Un temps d'expérimentation, de co-écriture et de rencontre, où la transmission se fait par la pratique. Appel à candidatures à venir.", es: "LIPS reúne a jóvenes artistas de todas las disciplinas —composición, dirección de escena, artes visuales, teatro, danza— acompañados por artistas consagrados. Un tiempo de experimentación, co-escritura y encuentro, donde la transmisión se hace por la práctica. Convocatoria próximamente.", en: "LIPS brings together young artists from all disciplines — composition, stage direction, visual arts, theatre, dance — mentored by established artists. A time for experimentation, co-writing and encounter, where transmission happens through practice. Call for applications to come.", zh: "LIPS 汇集来自各学科——作曲、导演、视觉艺术、戏剧、舞蹈——的青年艺术家，由资深艺术家陪伴。一段实验、共同书写与相遇的时光，让传承通过实践发生。招募即将公布。", it: "LIPS riunisce giovani artisti di tutte le discipline — composizione, regia, arti visive, teatro, danza — accompagnati da artisti affermati. Un tempo di sperimentazione, co-scrittura e incontro, dove la trasmissione avviene attraverso la pratica. Bando di candidatura in arrivo." } }
];
function newsBody(n, rel) {
  var img = n.img ? "/" + n.img : null;
  var rl = n.related ? '<p class="pd-note"><a href="' + rel + (n.related === "lips" ? "lips/" : "productions/" + n.related + "/") + '" data-fr="→ Voir la production" data-es="→ Ver la producción" data-en="→ See the production" data-zh="→ 查看作品" data-it="→ Vedi la produzione"></a></p>' : "";
  return '    <article class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'news/index.html" data-fr="← Actualités" data-es="← Novedades" data-en="← News" data-zh="← 动态" data-it="← Notizie"></a> · <span class="pd-tag">' + esc(n.date) + '</span></p>\n'
    + '      <h1 class="pd-title pd-title--page" ' + ml(n.title) + "></h1>\n"
    + (n.video
        ? '      <div class="pd-media pd-media--video"><iframe src="https://www.youtube.com/embed/' + n.video + '?rel=0&modestbranding=1&playsinline=1&controls=1&fs=1" title="' + esc(plain(n.title)) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe></div>\n'
          + '      ' + ytFallback(n.video) + '\n'
        : img ? '      <figure class="pd-media"><img src="' + img + '" alt="' + esc(plain(n.title)) + '" /></figure>\n' : "")
    + '      <p class="pd-pitch" ' + ml(n.excerpt) + "></p>\n"
    + '      <div class="prose"><p ' + ml(n.body) + "></p></div>\n" + rl + "\n    </article>";
}

/* ---- COOPÉRATION : carte filigrane + spots ---- */
var COOP_DOTS_PTS = "1034,0 1056,0 1078,0 1100,0 1342,0 1364,0 1386,0 1408,0 1430,0 1452,0 1474,0 1496,0 1518,0 1540,0 858,22 880,22 924,22 946,22 968,22 990,22 1034,22 1056,22 1078,22 1100,22 1166,22 1188,22 1210,22 1232,22 1254,22 1276,22 1298,22 1320,22 1342,22 1364,22 1386,22 1408,22 1430,22 1452,22 1474,22 1496,22 1518,22 1540,22 1562,22 1584,22 1606,22 1628,22 1650,22 2310,22 2354,22 2376,22 2398,22 2420,22 2442,22 2728,22 2750,22 2772,22 770,44 792,44 836,44 880,44 902,44 946,44 968,44 990,44 1012,44 1034,44 1100,44 1122,44 1144,44 1166,44 1188,44 1210,44 1232,44 1254,44 1276,44 1298,44 1320,44 1342,44 1364,44 1386,44 1408,44 1430,44 1452,44 1474,44 1496,44 1518,44 1540,44 1562,44 1584,44 1936,44 1958,44 1980,44 2816,44 2838,44 594,66 704,66 814,66 858,66 880,66 924,66 946,66 1122,66 1144,66 1166,66 1188,66 1210,66 1232,66 1254,66 1276,66 1298,66 1320,66 1342,66 1364,66 1386,66 1408,66 1430,66 1452,66 1474,66 1496,66 1518,66 1540,66 1562,66 2464,66 2794,66 2816,66 2838,66 2860,66 2882,66 2904,66 572,88 594,88 616,88 1232,88 1254,88 1276,88 1298,88 1320,88 1342,88 1364,88 1386,88 1408,88 1430,88 1452,88 1474,88 1496,88 1518,88 1540,88 1562,88 1584,88 2354,88 2376,88 2684,88 2706,88 2728,88 2750,88 2772,88 2794,88 2816,88 2838,88 2860,88 2882,88 2926,88 550,110 572,110 594,110 616,110 638,110 660,110 682,110 704,110 726,110 748,110 814,110 902,110 924,110 946,110 968,110 990,110 1034,110 1056,110 1254,110 1276,110 1298,110 1320,110 1342,110 1364,110 1386,110 1408,110 1430,110 1452,110 1474,110 1496,110 1518,110 1540,110 1562,110 2332,110 2486,110 2508,110 2552,110 2596,110 2640,110 2662,110 2684,110 2706,110 2728,110 2750,110 2772,110 2794,110 2816,110 2838,110 2860,110 2882,110 2904,110 2926,110 2948,110 2970,110 2992,110 3014,110 3036,110 3058,110 3080,110 3212,110 3234,110 3256,110 3278,110 176,132 198,132 220,132 242,132 264,132 286,132 308,132 330,132 352,132 374,132 484,132 506,132 528,132 550,132 572,132 638,132 660,132 682,132 704,132 726,132 748,132 770,132 858,132 946,132 990,132 1034,132 1056,132 1078,132 1100,132 1122,132 1254,132 1276,132 1298,132 1320,132 1342,132 1364,132 1386,132 1408,132 1430,132 1452,132 1474,132 1496,132 1518,132 1540,132 1562,132 2002,132 2024,132 2046,132 2068,132 2090,132 2398,132 2486,132 2508,132 2552,132 2574,132 2596,132 2618,132 2640,132 2662,132 2684,132 2706,132 2728,132 2750,132 2772,132 2794,132 2816,132 2838,132 2860,132 2882,132 2904,132 2926,132 2948,132 2970,132 2992,132 3014,132 3036,132 3058,132 3080,132 3102,132 3124,132 3146,132 3168,132 3190,132 3212,132 3234,132 3256,132 3278,132 3300,132 3322,132 3344,132 3366,132 3388,132 3520,132 3542,132 0,154 22,154 44,154 176,154 198,154 220,154 242,154 264,154 286,154 308,154 330,154 352,154 374,154 396,154 418,154 440,154 462,154 484,154 506,154 528,154 550,154 572,154 594,154 616,154 638,154 660,154 682,154 704,154 726,154 748,154 770,154 792,154 814,154 836,154 858,154 880,154 902,154 946,154 968,154 1034,154 1078,154 1100,154 1122,154 1144,154 1276,154 1298,154 1320,154 1342,154 1364,154 1386,154 1408,154 1430,154 1452,154 1958,154 1980,154 2002,154 2024,154 2046,154 2068,154 2090,154 2112,154 2134,154 2156,154 2178,154 2200,154 2244,154 2288,154 2310,154 2332,154 2354,154 2376,154 2398,154 2420,154 2442,154 2464,154 2486,154 2508,154 2552,154 2574,154 2596,154 2618,154 2640,154 2662,154 2684,154 2706,154 2728,154 2750,154 2772,154 2794,154 2816,154 2838,154 2860,154 2882,154 2904,154 2926,154 2948,154 2970,154 2992,154 3014,154 3036,154 3058,154 3080,154 3102,154 3124,154 3146,154 3168,154 3190,154 3212,154 3234,154 3256,154 3278,154 3300,154 3322,154 3344,154 3366,154 3388,154 3410,154 3432,154 3454,154 3476,154 3498,154 3520,154 3542,154 3564,154 3586,154 0,176 44,176 66,176 132,176 154,176 176,176 198,176 220,176 242,176 264,176 286,176 308,176 330,176 352,176 374,176 396,176 418,176 440,176 462,176 484,176 506,176 528,176 550,176 572,176 594,176 616,176 638,176 660,176 682,176 704,176 726,176 748,176 770,176 792,176 814,176 836,176 858,176 880,176 902,176 924,176 946,176 1078,176 1100,176 1122,176 1166,176 1298,176 1320,176 1342,176 1364,176 1386,176 1584,176 1606,176 1628,176 1650,176 1936,176 1958,176 1980,176 2002,176 2068,176 2090,176 2112,176 2134,176 2200,176 2222,176 2244,176 2266,176 2288,176 2310,176 2332,176 2354,176 2376,176 2398,176 2420,176 2442,176 2464,176 2486,176 2508,176 2530,176 2552,176 2574,176 2596,176 2618,176 2640,176 2662,176 2684,176 2706,176 2728,176 2750,176 2772,176 2794,176 2816,176 2838,176 2860,176 2882,176 2904,176 2926,176 2948,176 2970,176 2992,176 3014,176 3036,176 3058,176 3080,176 3102,176 3124,176 3146,176 3168,176 3190,176 3212,176 3234,176 3256,176 3278,176 3300,176 3322,176 3344,176 3366,176 3388,176 3410,176 3432,176 3454,176 3476,176 3498,176 3520,176 3542,176 3564,176 3586,176 110,198 176,198 198,198 220,198 242,198 264,198 286,198 308,198 330,198 352,198 374,198 396,198 418,198 440,198 462,198 484,198 506,198 528,198 550,198 572,198 594,198 616,198 638,198 660,198 682,198 704,198 726,198 748,198 770,198 792,198 814,198 836,198 858,198 880,198 946,198 1100,198 1144,198 1298,198 1320,198 1342,198 1364,198 1386,198 1892,198 1914,198 1936,198 1958,198 1980,198 2024,198 2046,198 2068,198 2090,198 2112,198 2134,198 2156,198 2178,198 2200,198 2222,198 2244,198 2266,198 2288,198 2310,198 2332,198 2354,198 2376,198 2398,198 2420,198 2442,198 2464,198 2486,198 2508,198 2530,198 2552,198 2574,198 2596,198 2618,198 2640,198 2662,198 2684,198 2706,198 2728,198 2750,198 2772,198 2794,198 2816,198 2838,198 2860,198 2882,198 2904,198 2926,198 2948,198 2970,198 2992,198 3014,198 3036,198 3058,198 3080,198 3102,198 3124,198 3146,198 3168,198 3190,198 3212,198 3234,198 3256,198 3278,198 3300,198 3322,198 3344,198 3366,198 3388,198 3410,198 3432,198 3454,198 3476,198 3498,198 3520,198 3542,198 3564,198 3586,198 154,220 176,220 198,220 220,220 242,220 264,220 308,220 330,220 352,220 374,220 396,220 418,220 440,220 462,220 484,220 506,220 528,220 550,220 572,220 594,220 616,220 638,220 660,220 682,220 704,220 726,220 748,220 770,220 792,220 814,220 836,220 858,220 1034,220 1056,220 1078,220 1342,220 1364,220 1892,220 1914,220 1936,220 1958,220 2024,220 2046,220 2068,220 2090,220 2112,220 2134,220 2156,220 2178,220 2200,220 2222,220 2244,220 2266,220 2288,220 2310,220 2332,220 2354,220 2376,220 2398,220 2420,220 2442,220 2464,220 2486,220 2508,220 2530,220 2552,220 2574,220 2596,220 2618,220 2640,220 2662,220 2684,220 2706,220 2728,220 2750,220 2772,220 2794,220 2816,220 2838,220 2860,220 2882,220 2904,220 2926,220 2948,220 2970,220 2992,220 3014,220 3036,220 3058,220 3080,220 3102,220 3124,220 3146,220 3168,220 3190,220 3212,220 3234,220 3256,220 3278,220 3300,220 3322,220 3344,220 3410,220 3454,220 3476,220 3498,220 3520,220 220,242 242,242 264,242 440,242 462,242 484,242 506,242 528,242 550,242 572,242 594,242 616,242 638,242 660,242 682,242 704,242 726,242 748,242 770,242 792,242 814,242 836,242 1034,242 1056,242 1078,242 1144,242 1166,242 1870,242 1892,242 1914,242 1936,242 1958,242 2046,242 2068,242 2090,242 2112,242 2134,242 2156,242 2178,242 2200,242 2222,242 2244,242 2266,242 2288,242 2310,242 2332,242 2354,242 2376,242 2398,242 2420,242 2442,242 2464,242 2486,242 2508,242 2530,242 2552,242 2574,242 2596,242 2618,242 2640,242 2662,242 2684,242 2706,242 2728,242 2750,242 2772,242 2794,242 2816,242 2838,242 2860,242 2882,242 2904,242 2926,242 2948,242 2970,242 2992,242 3014,242 3036,242 3058,242 3080,242 3102,242 3124,242 3146,242 3168,242 3190,242 3212,242 3410,242 484,264 506,264 528,264 550,264 572,264 594,264 616,264 638,264 660,264 682,264 704,264 726,264 748,264 770,264 792,264 814,264 836,264 858,264 880,264 902,264 1056,264 1078,264 1100,264 1122,264 1144,264 1166,264 1738,264 1760,264 1892,264 1936,264 1958,264 2024,264 2046,264 2068,264 2090,264 2112,264 2134,264 2156,264 2178,264 2200,264 2222,264 2244,264 2266,264 2288,264 2310,264 2332,264 2354,264 2376,264 2398,264 2420,264 2442,264 2464,264 2486,264 2508,264 2530,264 2552,264 2574,264 2596,264 2618,264 2640,264 2662,264 2684,264 2706,264 2728,264 2750,264 2772,264 2794,264 2816,264 2838,264 2860,264 2882,264 2904,264 2926,264 2948,264 2970,264 2992,264 3014,264 3036,264 3058,264 3080,264 3102,264 3124,264 3146,264 3168,264 3366,264 3388,264 3410,264 3432,264 506,286 528,286 550,286 572,286 594,286 616,286 638,286 660,286 682,286 704,286 726,286 748,286 770,286 792,286 814,286 836,286 858,286 880,286 902,286 924,286 946,286 968,286 1012,286 1034,286 1056,286 1078,286 1100,286 1122,286 1144,286 1166,286 1188,286 1210,286 1716,286 1738,286 1782,286 1892,286 1936,286 1980,286 2002,286 2024,286 2046,286 2068,286 2090,286 2112,286 2134,286 2156,286 2178,286 2200,286 2222,286 2244,286 2266,286 2288,286 2310,286 2332,286 2354,286 2376,286 2398,286 2420,286 2442,286 2464,286 2486,286 2508,286 2530,286 2552,286 2574,286 2596,286 2618,286 2640,286 2662,286 2684,286 2706,286 2728,286 2750,286 2772,286 2794,286 2816,286 2838,286 2860,286 2882,286 2904,286 2926,286 2948,286 2970,286 2992,286 3014,286 3036,286 3058,286 3080,286 3102,286 3124,286 3146,286 3366,286 3388,286 528,308 550,308 572,308 594,308 616,308 638,308 660,308 682,308 704,308 726,308 748,308 770,308 792,308 814,308 836,308 858,308 880,308 902,308 924,308 946,308 968,308 1034,308 1056,308 1078,308 1100,308 1122,308 1144,308 1166,308 1188,308 1210,308 1232,308 1716,308 1760,308 1782,308 1804,308 1848,308 1870,308 1892,308 1914,308 1936,308 1958,308 1980,308 2002,308 2024,308 2046,308 2068,308 2090,308 2112,308 2134,308 2156,308 2178,308 2200,308 2222,308 2244,308 2266,308 2288,308 2310,308 2332,308 2354,308 2376,308 2398,308 2420,308 2442,308 2464,308 2486,308 2508,308 2530,308 2552,308 2574,308 2596,308 2618,308 2640,308 2662,308 2684,308 2706,308 2728,308 2750,308 2772,308 2794,308 2816,308 2838,308 2860,308 2882,308 2904,308 2926,308 2948,308 2970,308 2992,308 3014,308 3036,308 3058,308 3080,308 3102,308 3124,308 3146,308 3168,308 3190,308 3212,308 3366,308 528,330 572,330 594,330 616,330 638,330 660,330 682,330 704,330 726,330 748,330 770,330 792,330 814,330 836,330 858,330 880,330 902,330 924,330 946,330 968,330 990,330 1012,330 1034,330 1056,330 1078,330 1100,330 1122,330 1232,330 1826,330 1848,330 1870,330 1892,330 1914,330 1936,330 1958,330 1980,330 2002,330 2024,330 2046,330 2068,330 2090,330 2112,330 2134,330 2156,330 2178,330 2200,330 2222,330 2244,330 2266,330 2288,330 2310,330 2332,330 2354,330 2376,330 2398,330 2420,330 2442,330 2464,330 2486,330 2508,330 2530,330 2552,330 2574,330 2596,330 2618,330 2640,330 2662,330 2684,330 2706,330 2728,330 2750,330 2772,330 2794,330 2816,330 2838,330 2860,330 2882,330 2904,330 2926,330 2948,330 2970,330 2992,330 3014,330 3036,330 3058,330 3080,330 3102,330 3124,330 3146,330 3168,330 3190,330 3234,330 572,352 594,352 616,352 638,352 660,352 682,352 704,352 726,352 748,352 770,352 792,352 814,352 836,352 858,352 880,352 902,352 924,352 946,352 968,352 990,352 1012,352 1034,352 1056,352 1078,352 1100,352 1122,352 1210,352 1232,352 1254,352 1782,352 1804,352 1826,352 1848,352 1870,352 1892,352 1914,352 1936,352 1958,352 1980,352 2002,352 2024,352 2046,352 2068,352 2090,352 2112,352 2134,352 2156,352 2178,352 2200,352 2222,352 2244,352 2266,352 2288,352 2310,352 2332,352 2354,352 2376,352 2398,352 2420,352 2442,352 2464,352 2486,352 2508,352 2530,352 2552,352 2574,352 2596,352 2618,352 2640,352 2662,352 2684,352 2706,352 2728,352 2750,352 2772,352 2794,352 2816,352 2838,352 2860,352 2882,352 2904,352 2926,352 2948,352 2970,352 2992,352 3014,352 3036,352 3058,352 3080,352 3102,352 3124,352 3146,352 3168,352 3190,352 572,374 594,374 616,374 638,374 660,374 682,374 704,374 726,374 748,374 770,374 792,374 814,374 836,374 858,374 880,374 902,374 924,374 946,374 968,374 990,374 1012,374 1034,374 1056,374 1078,374 1100,374 1122,374 1144,374 1166,374 1188,374 1804,374 1826,374 1848,374 1870,374 1892,374 1914,374 1958,374 1980,374 2002,374 2024,374 2046,374 2068,374 2090,374 2134,374 2178,374 2200,374 2222,374 2244,374 2266,374 2332,374 2354,374 2376,374 2398,374 2420,374 2442,374 2464,374 2486,374 2508,374 2530,374 2552,374 2574,374 2596,374 2618,374 2640,374 2662,374 2684,374 2706,374 2728,374 2750,374 2772,374 2794,374 2816,374 2838,374 2860,374 2882,374 2904,374 2926,374 2948,374 2970,374 2992,374 3014,374 3036,374 3058,374 3080,374 3102,374 3124,374 3146,374 3168,374 572,396 594,396 616,396 638,396 660,396 682,396 704,396 726,396 748,396 770,396 792,396 814,396 836,396 858,396 880,396 902,396 924,396 946,396 968,396 990,396 1012,396 1034,396 1056,396 1078,396 1738,396 1760,396 1782,396 1804,396 1826,396 1914,396 1936,396 1980,396 2002,396 2024,396 2046,396 2068,396 2222,396 2244,396 2266,396 2332,396 2354,396 2376,396 2398,396 2420,396 2442,396 2464,396 2486,396 2508,396 2530,396 2552,396 2574,396 2596,396 2618,396 2640,396 2662,396 2684,396 2706,396 2728,396 2750,396 2772,396 2794,396 2816,396 2838,396 2860,396 2882,396 2904,396 2926,396 2948,396 2970,396 2992,396 3014,396 3036,396 3058,396 3080,396 3102,396 3124,396 3146,396 3234,396 572,418 594,418 616,418 638,418 660,418 682,418 704,418 726,418 748,418 770,418 792,418 814,418 836,418 858,418 880,418 902,418 924,418 946,418 968,418 990,418 1012,418 1034,418 1056,418 1716,418 1738,418 1760,418 1782,418 1804,418 1892,418 1958,418 2002,418 2024,418 2046,418 2068,418 2090,418 2134,418 2156,418 2222,418 2244,418 2266,418 2288,418 2354,418 2376,418 2398,418 2420,418 2442,418 2464,418 2486,418 2508,418 2530,418 2552,418 2574,418 2596,418 2618,418 2640,418 2662,418 2684,418 2706,418 2728,418 2750,418 2772,418 2794,418 2816,418 2838,418 2860,418 2882,418 2904,418 2926,418 2948,418 2970,418 2992,418 3014,418 3036,418 3058,418 3080,418 572,440 594,440 616,440 638,440 660,440 682,440 704,440 726,440 748,440 770,440 792,440 814,440 836,440 858,440 880,440 902,440 924,440 946,440 968,440 990,440 1012,440 1034,440 1716,440 1738,440 1760,440 1782,440 2024,440 2090,440 2112,440 2134,440 2156,440 2178,440 2200,440 2222,440 2244,440 2266,440 2288,440 2354,440 2376,440 2398,440 2420,440 2442,440 2464,440 2486,440 2508,440 2530,440 2552,440 2574,440 2596,440 2618,440 2640,440 2662,440 2684,440 2706,440 2728,440 2750,440 2772,440 2794,440 2816,440 2838,440 2860,440 2882,440 2904,440 2926,440 2948,440 2970,440 3014,440 3058,440 3212,440 594,462 616,462 638,462 660,462 682,462 704,462 726,462 748,462 770,462 792,462 814,462 836,462 858,462 880,462 902,462 924,462 946,462 968,462 990,462 1012,462 1034,462 1738,462 1760,462 1848,462 1870,462 1892,462 2024,462 2090,462 2134,462 2156,462 2178,462 2200,462 2222,462 2244,462 2266,462 2288,462 2332,462 2354,462 2376,462 2398,462 2420,462 2442,462 2464,462 2486,462 2508,462 2530,462 2552,462 2574,462 2596,462 2618,462 2640,462 2662,462 2684,462 2706,462 2728,462 2750,462 2772,462 2794,462 2816,462 2838,462 2860,462 2882,462 2904,462 2926,462 2948,462 2970,462 2992,462 3014,462 3080,462 3168,462 3190,462 594,484 616,484 638,484 660,484 682,484 704,484 726,484 748,484 770,484 792,484 814,484 836,484 858,484 880,484 902,484 924,484 946,484 968,484 990,484 1012,484 1738,484 1760,484 1782,484 1804,484 1826,484 1848,484 1870,484 1892,484 2178,484 2200,484 2222,484 2244,484 2266,484 2288,484 2310,484 2332,484 2354,484 2376,484 2398,484 2420,484 2442,484 2464,484 2486,484 2508,484 2530,484 2552,484 2574,484 2596,484 2618,484 2640,484 2662,484 2684,484 2706,484 2728,484 2750,484 2772,484 2794,484 2816,484 2838,484 2860,484 2882,484 2904,484 2926,484 2948,484 2970,484 2992,484 3124,484 638,506 660,506 682,506 704,506 726,506 748,506 770,506 792,506 814,506 836,506 858,506 880,506 902,506 924,506 946,506 968,506 990,506 1716,506 1738,506 1760,506 1782,506 1804,506 1826,506 1848,506 1870,506 1892,506 1914,506 1936,506 2024,506 2156,506 2178,506 2200,506 2222,506 2244,506 2266,506 2288,506 2310,506 2332,506 2354,506 2376,506 2398,506 2420,506 2442,506 2464,506 2486,506 2508,506 2530,506 2552,506 2574,506 2596,506 2618,506 2640,506 2662,506 2684,506 2706,506 2728,506 2750,506 2772,506 2794,506 2816,506 2838,506 2860,506 2882,506 2904,506 2926,506 2948,506 2970,506 2992,506 682,528 704,528 726,528 748,528 770,528 792,528 814,528 836,528 858,528 880,528 946,528 968,528 1716,528 1738,528 1760,528 1782,528 1804,528 1826,528 1848,528 1870,528 1892,528 1914,528 1936,528 1958,528 1980,528 2002,528 2024,528 2046,528 2068,528 2090,528 2112,528 2134,528 2156,528 2178,528 2200,528 2222,528 2244,528 2266,528 2288,528 2310,528 2332,528 2354,528 2376,528 2398,528 2420,528 2442,528 2464,528 2486,528 2508,528 2530,528 2552,528 2574,528 2596,528 2618,528 2640,528 2662,528 2684,528 2706,528 2728,528 2750,528 2772,528 2794,528 2816,528 2838,528 2860,528 2882,528 2904,528 2926,528 2948,528 2970,528 2992,528 3014,528 660,550 704,550 726,550 748,550 770,550 792,550 814,550 990,550 1694,550 1716,550 1738,550 1760,550 1782,550 1804,550 1826,550 1848,550 1870,550 1892,550 1914,550 1936,550 1958,550 1980,550 2002,550 2024,550 2046,550 2068,550 2090,550 2112,550 2134,550 2156,550 2178,550 2200,550 2222,550 2244,550 2266,550 2332,550 2354,550 2376,550 2398,550 2420,550 2442,550 2464,550 2486,550 2508,550 2530,550 2552,550 2574,550 2596,550 2618,550 2640,550 2662,550 2684,550 2706,550 2728,550 2750,550 2772,550 2794,550 2816,550 2838,550 2860,550 2882,550 2904,550 2926,550 2948,550 2970,550 2992,550 682,572 726,572 748,572 770,572 792,572 814,572 990,572 1672,572 1694,572 1716,572 1738,572 1760,572 1782,572 1804,572 1826,572 1848,572 1870,572 1892,572 1914,572 1936,572 1958,572 1980,572 2002,572 2024,572 2046,572 2068,572 2090,572 2112,572 2134,572 2178,572 2200,572 2222,572 2244,572 2266,572 2288,572 2310,572 2376,572 2398,572 2420,572 2442,572 2464,572 2486,572 2508,572 2530,572 2552,572 2574,572 2596,572 2618,572 2640,572 2662,572 2684,572 2706,572 2728,572 2750,572 2772,572 2794,572 2816,572 2838,572 2860,572 2882,572 2904,572 2926,572 2948,572 2970,572 2992,572 704,594 748,594 770,594 792,594 814,594 1650,594 1672,594 1694,594 1716,594 1738,594 1760,594 1782,594 1804,594 1826,594 1848,594 1870,594 1892,594 1914,594 1936,594 1958,594 1980,594 2002,594 2024,594 2046,594 2068,594 2090,594 2112,594 2134,594 2200,594 2222,594 2244,594 2266,594 2288,594 2310,594 2332,594 2354,594 2376,594 2486,594 2508,594 2530,594 2552,594 2574,594 2596,594 2618,594 2640,594 2662,594 2684,594 2706,594 2728,594 2750,594 2772,594 2794,594 2816,594 2838,594 2860,594 2882,594 2904,594 2926,594 2948,594 3014,594 220,616 748,616 770,616 792,616 814,616 924,616 1650,616 1672,616 1694,616 1716,616 1738,616 1760,616 1782,616 1804,616 1826,616 1848,616 1870,616 1892,616 1914,616 1936,616 1958,616 1980,616 2002,616 2024,616 2046,616 2068,616 2090,616 2112,616 2134,616 2156,616 2200,616 2222,616 2244,616 2266,616 2288,616 2310,616 2332,616 2354,616 2376,616 2508,616 2530,616 2552,616 2574,616 2596,616 2618,616 2640,616 2662,616 2728,616 2750,616 2772,616 2794,616 2816,616 2838,616 2860,616 2904,616 242,638 770,638 792,638 814,638 836,638 902,638 924,638 1078,638 1100,638 1650,638 1672,638 1694,638 1716,638 1738,638 1760,638 1782,638 1804,638 1826,638 1848,638 1870,638 1892,638 1914,638 1936,638 1958,638 1980,638 2002,638 2024,638 2046,638 2068,638 2090,638 2112,638 2134,638 2156,638 2222,638 2244,638 2266,638 2288,638 2310,638 2332,638 2354,638 2376,638 2530,638 2552,638 2574,638 2596,638 2618,638 2640,638 2750,638 2772,638 2794,638 2816,638 2838,638 2904,638 814,660 836,660 858,660 880,660 902,660 1650,660 1672,660 1694,660 1716,660 1738,660 1760,660 1782,660 1804,660 1826,660 1848,660 1870,660 1892,660 1914,660 1936,660 1958,660 1980,660 2002,660 2024,660 2046,660 2068,660 2090,660 2112,660 2134,660 2156,660 2178,660 2244,660 2266,660 2288,660 2310,660 2332,660 2552,660 2574,660 2596,660 2618,660 2750,660 2772,660 2794,660 2816,660 2838,660 2860,660 3014,660 880,682 902,682 924,682 946,682 1188,682 1628,682 1650,682 1672,682 1694,682 1716,682 1738,682 1760,682 1782,682 1804,682 1826,682 1848,682 1870,682 1892,682 1914,682 1936,682 1958,682 1980,682 2002,682 2024,682 2046,682 2068,682 2090,682 2112,682 2134,682 2156,682 2178,682 2200,682 2244,682 2266,682 2288,682 2552,682 2574,682 2596,682 2794,682 2816,682 2838,682 2860,682 2882,682 3014,682 946,704 1650,704 1672,704 1694,704 1716,704 1738,704 1760,704 1782,704 1804,704 1826,704 1848,704 1870,704 1892,704 1914,704 1936,704 1958,704 1980,704 2002,704 2024,704 2046,704 2068,704 2090,704 2112,704 2134,704 2156,704 2178,704 2200,704 2222,704 2552,704 2574,704 2596,704 2728,704 2794,704 2838,704 2860,704 2882,704 3014,704 946,726 1056,726 1078,726 1100,726 1122,726 1166,726 1188,726 1672,726 1694,726 1716,726 1738,726 1760,726 1782,726 1804,726 1826,726 1848,726 1870,726 1892,726 1914,726 1936,726 1958,726 1980,726 2002,726 2024,726 2046,726 2068,726 2090,726 2112,726 2134,726 2156,726 2178,726 2200,726 2222,726 2244,726 2266,726 2288,726 2310,726 2574,726 2596,726 2860,726 2992,726 990,748 1034,748 1056,748 1078,748 1100,748 1122,748 1144,748 1166,748 1188,748 1672,748 1694,748 1716,748 1738,748 1760,748 1782,748 1804,748 1826,748 1848,748 1870,748 1892,748 1914,748 1936,748 1958,748 1980,748 2002,748 2024,748 2046,748 2068,748 2090,748 2112,748 2134,748 2156,748 2178,748 2200,748 2222,748 2244,748 2266,748 2288,748 2574,748 2794,748 3036,748 3058,748 1034,770 1056,770 1078,770 1100,770 1122,770 1144,770 1166,770 1188,770 1210,770 1716,770 1738,770 1760,770 1782,770 1804,770 1870,770 1892,770 1914,770 1936,770 1958,770 1980,770 2002,770 2024,770 2046,770 2068,770 2090,770 2112,770 2134,770 2156,770 2178,770 2200,770 2222,770 2244,770 2266,770 2288,770 2816,770 2970,770 1034,792 1056,792 1078,792 1100,792 1122,792 1144,792 1166,792 1188,792 1210,792 1232,792 1254,792 1276,792 1914,792 1936,792 1958,792 1980,792 2002,792 2024,792 2046,792 2068,792 2090,792 2112,792 2134,792 2156,792 2178,792 2200,792 2222,792 2244,792 2266,792 2772,792 2816,792 2948,792 2970,792 1012,814 1034,814 1056,814 1078,814 1100,814 1122,814 1144,814 1166,814 1188,814 1210,814 1232,814 1254,814 1276,814 1298,814 1914,814 1936,814 1958,814 1980,814 2002,814 2024,814 2046,814 2068,814 2090,814 2112,814 2134,814 2156,814 2178,814 2200,814 2222,814 2244,814 2794,814 2816,814 2838,814 2904,814 2926,814 2948,814 2970,814 3080,814 1012,836 1034,836 1056,836 1078,836 1100,836 1122,836 1144,836 1166,836 1188,836 1210,836 1232,836 1254,836 1276,836 1298,836 1892,836 1914,836 1936,836 1958,836 1980,836 2002,836 2024,836 2046,836 2068,836 2090,836 2112,836 2134,836 2156,836 2178,836 2200,836 2222,836 2816,836 2904,836 2926,836 2948,836 2970,836 3080,836 3124,836 1012,858 1034,858 1056,858 1078,858 1100,858 1122,858 1144,858 1166,858 1188,858 1210,858 1232,858 1254,858 1276,858 1298,858 1320,858 1342,858 1364,858 1914,858 1936,858 1958,858 1980,858 2002,858 2024,858 2046,858 2068,858 2090,858 2112,858 2134,858 2156,858 2178,858 2200,858 2816,858 2838,858 2860,858 2882,858 2904,858 2926,858 2948,858 2992,858 3014,858 3124,858 3146,858 3168,858 3190,858 3212,858 990,880 1012,880 1034,880 1056,880 1078,880 1100,880 1122,880 1144,880 1166,880 1188,880 1210,880 1232,880 1254,880 1276,880 1298,880 1320,880 1342,880 1364,880 1386,880 1408,880 1430,880 1936,880 1958,880 1980,880 2002,880 2024,880 2046,880 2068,880 2090,880 2112,880 2134,880 2156,880 2178,880 2838,880 3190,880 3212,880 3234,880 3256,880 1012,902 1034,902 1056,902 1078,902 1100,902 1122,902 1144,902 1166,902 1188,902 1210,902 1232,902 1254,902 1276,902 1298,902 1320,902 1342,902 1364,902 1386,902 1408,902 1430,902 1936,902 1958,902 1980,902 2002,902 2024,902 2046,902 2068,902 2090,902 2112,902 2134,902 2156,902 2178,902 2882,902 2904,902 2926,902 3212,902 3234,902 3256,902 1034,924 1056,924 1078,924 1100,924 1122,924 1144,924 1166,924 1188,924 1210,924 1232,924 1254,924 1276,924 1298,924 1320,924 1342,924 1364,924 1386,924 1408,924 1430,924 1936,924 1958,924 1980,924 2002,924 2024,924 2046,924 2068,924 2090,924 2112,924 2134,924 2156,924 2178,924 2992,924 3278,924 1034,946 1056,946 1078,946 1100,946 1122,946 1144,946 1166,946 1188,946 1210,946 1232,946 1254,946 1276,946 1298,946 1320,946 1342,946 1364,946 1386,946 1408,946 1958,946 1980,946 2002,946 2024,946 2046,946 2068,946 2090,946 2112,946 2134,946 2156,946 2178,946 2200,946 3102,946 1056,968 1078,968 1100,968 1122,968 1144,968 1166,968 1188,968 1210,968 1232,968 1254,968 1276,968 1298,968 1320,968 1342,968 1364,968 1386,968 1408,968 1936,968 1958,968 1980,968 2002,968 2024,968 2046,968 2068,968 2090,968 2112,968 2134,968 2156,968 2178,968 2200,968 2288,968 3102,968 3124,968 3146,968 3234,968 1078,990 1100,990 1122,990 1144,990 1166,990 1188,990 1210,990 1232,990 1254,990 1276,990 1298,990 1320,990 1342,990 1364,990 1386,990 1408,990 1936,990 1958,990 1980,990 2002,990 2024,990 2046,990 2068,990 2090,990 2112,990 2134,990 2156,990 2178,990 2200,990 2266,990 2288,990 3058,990 3080,990 3102,990 3124,990 3146,990 3168,990 3234,990 1100,1012 1122,1012 1144,1012 1166,1012 1188,1012 1210,1012 1232,1012 1254,1012 1276,1012 1298,1012 1320,1012 1342,1012 1364,1012 1386,1012 1936,1012 1958,1012 1980,1012 2002,1012 2024,1012 2046,1012 2068,1012 2090,1012 2112,1012 2134,1012 2156,1012 2244,1012 2266,1012 2288,1012 3036,1012 3058,1012 3080,1012 3102,1012 3124,1012 3146,1012 3168,1012 3190,1012 3212,1012 3234,1012 3256,1012 1100,1034 1122,1034 1144,1034 1166,1034 1188,1034 1210,1034 1232,1034 1254,1034 1276,1034 1298,1034 1320,1034 1342,1034 1364,1034 1386,1034 1936,1034 1958,1034 1980,1034 2002,1034 2024,1034 2046,1034 2068,1034 2090,1034 2112,1034 2134,1034 2244,1034 2266,1034 2376,1034 2992,1034 3014,1034 3036,1034 3058,1034 3080,1034 3102,1034 3124,1034 3146,1034 3168,1034 3190,1034 3212,1034 3234,1034 3256,1034 3278,1034 1100,1056 1122,1056 1144,1056 1166,1056 1188,1056 1210,1056 1232,1056 1254,1056 1276,1056 1298,1056 1320,1056 1342,1056 1364,1056 1958,1056 1980,1056 2002,1056 2024,1056 2046,1056 2068,1056 2090,1056 2112,1056 2134,1056 2244,1056 2266,1056 2948,1056 2970,1056 2992,1056 3014,1056 3036,1056 3058,1056 3080,1056 3102,1056 3124,1056 3146,1056 3168,1056 3190,1056 3212,1056 3234,1056 3256,1056 3278,1056 3300,1056 1100,1078 1122,1078 1144,1078 1166,1078 1188,1078 1210,1078 1232,1078 1254,1078 1276,1078 1298,1078 1320,1078 1958,1078 1980,1078 2002,1078 2024,1078 2046,1078 2068,1078 2090,1078 2112,1078 2134,1078 2244,1078 2266,1078 2948,1078 2970,1078 2992,1078 3014,1078 3036,1078 3058,1078 3080,1078 3102,1078 3124,1078 3146,1078 3168,1078 3190,1078 3212,1078 3234,1078 3256,1078 3278,1078 3300,1078 3322,1078 1100,1100 1122,1100 1144,1100 1166,1100 1188,1100 1210,1100 1232,1100 1254,1100 1276,1100 1298,1100 1958,1100 1980,1100 2002,1100 2024,1100 2046,1100 2068,1100 2090,1100 2112,1100 2948,1100 2970,1100 2992,1100 3014,1100 3036,1100 3058,1100 3080,1100 3102,1100 3124,1100 3146,1100 3168,1100 3190,1100 3212,1100 3234,1100 3256,1100 3278,1100 3300,1100 3322,1100 1100,1122 1122,1122 1144,1122 1166,1122 1188,1122 1210,1122 1232,1122 1254,1122 1276,1122 1298,1122 1980,1122 2002,1122 2024,1122 2046,1122 2068,1122 2090,1122 2112,1122 2970,1122 2992,1122 3014,1122 3036,1122 3058,1122 3080,1122 3102,1122 3124,1122 3146,1122 3168,1122 3190,1122 3212,1122 3234,1122 3256,1122 3278,1122 3300,1122 3322,1122 1100,1144 1122,1144 1144,1144 1166,1144 1188,1144 1210,1144 1232,1144 1254,1144 1276,1144 1980,1144 2002,1144 2024,1144 2046,1144 2068,1144 2090,1144 2970,1144 2992,1144 3014,1144 3036,1144 3058,1144 3080,1144 3102,1144 3124,1144 3146,1144 3168,1144 3190,1144 3212,1144 3234,1144 3256,1144 3278,1144 3300,1144 3322,1144 1100,1166 1122,1166 1144,1166 1166,1166 1188,1166 1210,1166 1232,1166 1254,1166 2002,1166 2024,1166 2046,1166 2068,1166 2970,1166 2992,1166 3014,1166 3036,1166 3168,1166 3190,1166 3212,1166 3234,1166 3256,1166 3278,1166 3300,1166 1078,1188 1100,1188 1122,1188 1144,1188 1166,1188 1188,1188 1210,1188 3168,1188 3212,1188 3234,1188 3256,1188 3278,1188 3300,1188 3542,1188 1078,1210 1100,1210 1122,1210 1144,1210 1166,1210 1188,1210 1210,1210 3212,1210 3234,1210 3256,1210 3564,1210 1078,1232 1100,1232 1122,1232 1144,1232 1166,1232 3564,1232 1078,1254 1100,1254 1122,1254 1144,1254 3256,1254 3278,1254 3520,1254 1056,1276 1078,1276 1100,1276 1122,1276 1144,1276 3498,1276 1078,1298 1100,1298 1122,1298 1078,1320 1100,1320 1122,1320 1078,1342 1100,1342 1078,1364";
/* carte mondiale en pointillés — échantillonnage de la géométrie réelle des terres (Natural Earth 50m), projection équirectangulaire plein globe */
function coopDots(){
  return COOP_DOTS_PTS.split(" ").map(function(p){ var a=p.split(","); return '<circle cx="'+a[0]+'" cy="'+a[1]+'"/>'; }).join("");
}
var COOP_CITIES = [
  { id:"paris", region:"eu", x:50.65, y:24.57, side:"l", name:"Paris · Gentilly",
    inst:[["Radio France","https://www.radiofrance.fr"],["Le Générateur","https://legenerateur.com"],["La Muse en Circuit","https://alamuse.com"],["Ville de Gentilly","https://www.ville-gentilly.fr"]],
    proj:[["Siège STOPERA!",""],["War Madrigals","war-madrigals"],["LIPS","lips"]] },
  { id:"lyon", region:"eu", x:51.34, y:26.79, side:"l", name:"Lyon",
    inst:[["GRAME — CNCM","https://www.grame.fr"],["Opéra de Lyon","https://www.opera-lyon.com"],["Théâtre de la Croix-Rousse","https://croix-rousse.com"],["Pôle Pixel","https://www.pole-pixel.com"]],
    proj:[["Otages","otages"],["OOO","ooo"],["LIPS","lips"]] },
  { id:"monaco", region:"eu", x:52.06, y:28.25, side:"l", name:"Monte-Carlo",
    inst:[["Printemps des Arts","https://www.printempsdesarts.mc"]],
    proj:[["Snow on Her Lips","snow-on-her-lips"]] },
  { id:"londres", region:"eu", x:49.5, y:22.6, side:"l", name:"Londres",
    inst:[["Festival Tête à Tête","https://www.tete-a-tete.org.uk"]],
    proj:[["We Expected the Disaster…","salamandres"]] },
  { id:"mulhouse", region:"eu", x:51.5, y:24.9, side:"l", name:"Mulhouse · Grand Est",
    inst:[["Cie Trilobite","https://cietrilobite.org"],["Éditions Lacroch'","https://lacroch.com"],["Artenréel","https://artenreel.fr"]],
    proj:[["We Expected the Disaster…","salamandres"]] },
  { id:"mexico", region:"la", x:22.46, y:45.73, side:"r", name:"Mexico",
    inst:[],
    proj:[["A World to Blast","america"],["Insistir","insistir"]] },
  { id:"buenosaires", region:"la", x:33.78, y:84.6, side:"up", name:"Buenos Aires",
    inst:[["CETC — Teatro Colón","https://teatrocolon.org.ar"],["UNSAM","https://www.unsam.edu.ar"],["Ópera Latinoamérica","https://operala.org"]],
    proj:[["OOO","ooo"],["Mamma Roma","mamma-roma"]] },
  { id:"santiago", region:"la", x:30.38, y:83.78, side:"up", name:"Santiago du Chili",
    inst:[["Ópera Latinoamérica (OLA)","https://operala.org"]],
    proj:[["Assemblée du réseau · 2024",""]] },
  { id:"taipei", region:"as", x:83.77, y:41.71, side:"l", name:"Taipei · Taïwan",
    inst:[],
    proj:[["Sur invitation · 2024",""]] }
];
function coopInst(arr){ return arr.map(function(i){ return i[1] ? '<a href="'+i[1]+'" target="_blank" rel="noopener">'+esc(i[0])+"</a>" : esc(i[0]); }).join(" · "); }
function coopProj(arr, rel){ return arr.map(function(p){ if(!p[1]) return esc(p[0]); var href = rel + (p[1]==="lips" ? "lips/" : "productions/"+p[1]+"/"); return '<a href="'+href+'">'+esc(p[0])+"</a>"; }).join(" · "); }
function coopCardInner(c, rel){
  var L_I={fr:"Institutions & lieux",es:"Instituciones & lugares",en:"Institutions & venues",zh:"机构与场馆", it: "Istituzioni & spazi"};
  var L_P={fr:"Projets",es:"Proyectos",en:"Projects",zh:"项目", it: "Progetti"};
  return '<p class="coop-city">'+esc(c.name)+"</p>"
    + (c.inst.length ? '<p class="coop-k" '+ml(L_I)+'></p><p class="coop-v">'+coopInst(c.inst)+"</p>" : "")
    + '<p class="coop-k" '+ml(L_P)+'></p><p class="coop-v">'+coopProj(c.proj, rel)+"</p>";
}
var COOP_SCRIPT = '<script>(function(){var ss=document.querySelectorAll(".coop-map .spot");ss.forEach(function(s){s.addEventListener("click",function(e){e.preventDefault();var o=s.classList.contains("is-open");ss.forEach(function(x){x.classList.remove("is-open");});if(!o)s.classList.add("is-open");});});document.addEventListener("click",function(e){if(!e.target.closest(".coop-map .spot"))ss.forEach(function(x){x.classList.remove("is-open");});});})();</script>';
function coopMap(rel){
  var svg = '<svg class="coop-svg" viewBox="0 0 3600 1390" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'
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
    + '      <p class="pd-eyebrow"><a href="'+rel+'index.html" data-fr="← Accueil" data-es="← Inicio" data-en="← Home" data-zh="← 首页" data-it="← Home"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Coopération internationale" data-es="Cooperación internacional" data-en="International cooperation" data-zh="国际合作" data-it="Cooperazione internazionale"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Depuis Gentilly, STOPERA! développe des collaborations entre artistes, institutions, universités et réseaux culturels — en Europe, en Amérique latine et au-delà. Survolez une ville pour voir ses institutions et les projets associés." data-es="Desde Gentilly, STOPERA! desarrolla colaboraciones entre artistas, instituciones, universidades y redes culturales — en Europa, América Latina y más allá. Pase el cursor sobre una ciudad para ver sus instituciones y los proyectos asociados." data-en="From Gentilly, STOPERA! develops collaborations between artists, institutions, universities and cultural networks — in Europe, Latin America and beyond. Hover a city to see its institutions and related projects." data-zh="从让蒂伊出发，STOPERA! 在欧洲、拉丁美洲及更远之地发展艺术家、机构、高校与文化网络之间的合作。将鼠标移至城市可查看其机构与相关项目。" data-it="Da Gentilly, STOPERA! sviluppa collaborazioni tra artisti, istituzioni, università e reti culturali — in Europa, in America latina e oltre. Passate su una città per vederne le istituzioni e i progetti associati."></p>\n'
    + '      '+coopMap(rel)+"\n"
    + '      <div class="coop-regions">\n        '+regionBlock("eu",{fr:"Europe",es:"Europa",en:"Europe",zh:"欧洲", it: "Europa"})+"\n        "+regionBlock("la",{fr:"Amérique latine",es:"América Latina",en:"Latin America",zh:"拉丁美洲", it: "America latina"})+"\n        "+regionBlock("as",{fr:"Asie",es:"Asia",en:"Asia",zh:"亚洲", it: "Asia"})+"\n      </div>\n"
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
  var groups = ["ooo", "otages", "snow-on-her-lips"].map(function (s) {
    var p = bySlug[s]; if (!p) return "";
    var head = '<h3 class="press-prod"><a href="' + rel + "productions/" + s + '/" ' + ml(p.titleHtml || p.title) + "></a></h3>";
    var inner;
    if (p.press && p.press.length) {
      inner = p.press.map(pressQuote).join("\n        ")
        + (p.pressPdf ? '\n        <a class="pd-dl" href="' + "/" + p.pressPdf + '" target="_blank" rel="noopener" ' + ml({fr:"Télécharger la revue de presse (PDF) ↓",es:"Descargar la reseña de prensa (PDF) ↓",en:"Download the press review (PDF) ↓",zh:"下载媒体评论（PDF）↓", it: "Scarica la rassegna stampa (PDF) ↓"}) + "></a>" : "");
    } else {
      inner = '<p class="press-soon" ' + ml({fr:"Revue de presse à venir.",es:"Reseña de prensa próximamente.",en:"Press review coming soon.",zh:"媒体评论即将上线。", it: "Rassegna stampa in arrivo."}) + "></p>";
    }
    return '<div class="press-group">\n        ' + head + "\n        " + inner + "\n      </div>";
  }).join("\n      ");
  var media = '<ul class="partners">' + PRESS_MEDIA.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>";
  return '    <section class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html" data-fr="← Accueil" data-es="← Inicio" data-en="← Home" data-zh="← 首页" data-it="← Home"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Revue de presse" data-es="Reseña de prensa" data-en="Press" data-zh="媒体评论" data-it="Rassegna stampa"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Une sélection d\'articles et de critiques autour des créations de STOPERA!. Cette revue s\'enrichit au fil des productions." data-es="Una selección de artículos y críticas en torno a las creaciones de STOPERA!. Esta reseña se enriquece a medida que avanzan las producciones." data-en="A selection of articles and reviews around STOPERA!\'s works. This press review grows with each new production." data-zh="围绕 STOPERA! 创作的文章与评论选辑。本媒体评论将随作品不断充实。" data-it="Una selezione di articoli e recensioni sulle creazioni di STOPERA!. Questa rassegna si arricchisce con le produzioni."></p>\n'
    + "      " + groups + "\n"
    + '      <div class="subblock press-media">\n'
    + '        <p class="subblock-label" data-fr="Ils en ont parlé" data-es="Han hablado de ello" data-en="As featured in" data-zh="媒体报道" data-it="Ne hanno parlato"></p>\n'
    + "        " + media + "\n"
    + '        <p class="section-note" data-fr="France · Italie · Royaume-Uni · Espagne · Argentine — autour des créations d\'<em>Otages</em> et <em>OOO</em>." data-es="Francia · Italia · Reino Unido · España · Argentina — en torno a los estrenos de <em>Otages</em> y <em>OOO</em>." data-en="France · Italy · UK · Spain · Argentina — around the premieres of <em>Otages</em> and <em>OOO</em>." data-zh="法国 · 意大利 · 英国 · 西班牙 · 阿根廷 —— 围绕 <em>Otages</em> 与 <em>OOO</em> 的首演。" data-it="Francia · Italia · Regno Unito · Spagna · Argentina — intorno alle creazioni di <em>Otages</em> e <em>OOO</em>."></p>\n'
    + "      </div>\n    </section>";
}

/* ---- mentions légales & confidentialité — quadrilingue ---- */
function legalBody(rel) {
  function h2(o) { return '        <h2 ' + ml(o) + "></h2>\n"; }
  function para(o) { return '        <p ' + ml(o) + "></p>\n"; }
  return '    <section class="section pd-page legal-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html" data-fr="← Accueil" data-es="← Inicio" data-en="← Home" data-zh="← 首页" data-it="← Home"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" ' + ml({
        fr: "Mentions légales & confidentialité",
        es: "Aviso legal & privacidad",
        en: "Legal notice & privacy",
        zh: "法律声明与隐私政策", it: "Note legali & privacy" }) + "></h1>\n"
    + '      <div class="legal-prose">\n'

    + h2({ fr: "Éditeur du site", es: "Editor del sitio", en: "Publisher", zh: "网站出版方", it: "Editore del sito" })
    + para({
        fr: "<strong>STOPERA!</strong> — Sonic Theatre Opera Performance, association loi 1901 à but non lucratif.<br/>Siège : 8 rue Victor Hugo, 94250 Gentilly (Val-de-Marne), France.<br/>Courriel : <a href=\"mailto:info@stopera.art\">info@stopera.art</a>.<br/>Directrice de la publication : Oksana Trypolska, présidente de l'association. Direction artistique : Sebastian Rivas.",
        es: "<strong>STOPERA!</strong> — Sonic Theatre Opera Performance, asociación sin ánimo de lucro de derecho francés (ley de 1901).<br/>Sede: 8 rue Victor Hugo, 94250 Gentilly (Valle del Marne), Francia.<br/>Correo: <a href=\"mailto:info@stopera.art\">info@stopera.art</a>.<br/>Directora de la publicación: Oksana Trypolska, presidenta de la asociación. Dirección artística: Sebastian Rivas.",
        en: "<strong>STOPERA!</strong> — Sonic Theatre Opera Performance, a non-profit association under the French law of 1901.<br/>Registered office: 8 rue Victor Hugo, 94250 Gentilly (Val-de-Marne), France.<br/>Email: <a href=\"mailto:info@stopera.art\">info@stopera.art</a>.<br/>Publication director: Oksana Trypolska, President of the association. Artistic direction: Sebastian Rivas.",
        zh: "<strong>STOPERA!</strong> —— Sonic Theatre Opera Performance，依据法国 1901 年法律成立的非营利协会。<br/>注册地址：8 rue Victor Hugo, 94250 Gentilly（马恩河谷省），法国。<br/>电子邮件：<a href=\"mailto:info@stopera.art\">info@stopera.art</a>。<br/>出版负责人：Oksana Trypolska，协会主席。艺术指导：Sebastian Rivas。", it: "<strong>STOPERA!</strong> — Sonic Theatre Opera Performance, associazione senza scopo di lucro di diritto francese (legge 1901).<br/>Sede: 8 rue Victor Hugo, 94250 Gentilly (Val-de-Marne), Francia.<br/>Email: <a href=\"mailto:info@stopera.art\">info@stopera.art</a>.<br/>Direttrice della pubblicazione: Oksana Trypolska, presidente dell'associazione. Direzione artistica: Sebastian Rivas." })

    + h2({ fr: "Hébergement", es: "Alojamiento", en: "Hosting", zh: "网站托管", it: "Hosting" })
    + para({
        fr: "Site hébergé par GitHub, Inc. — 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (GitHub Pages).",
        es: "Sitio alojado por GitHub, Inc. — 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, Estados Unidos (GitHub Pages).",
        en: "This site is hosted by GitHub, Inc. — 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States (GitHub Pages).",
        zh: "本网站由 GitHub, Inc. 托管 —— 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, 美国（GitHub Pages）。", it: "Sito ospitato da GitHub, Inc. — 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, Stati Uniti (GitHub Pages)." })

    + h2({ fr: "Propriété intellectuelle", es: "Propiedad intelectual", en: "Intellectual property", zh: "知识产权", it: "Proprietà intellettuale" })
    + para({
        fr: "L'ensemble des contenus de ce site (textes, images, vidéos, identité visuelle « STOPERA! ») est protégé par le droit d'auteur. Toute reproduction ou réutilisation, totale ou partielle, est soumise à autorisation préalable. Les crédits photographiques figurent sur les pages des productions concernées.",
        es: "Todos los contenidos de este sitio (textos, imágenes, vídeos, identidad visual «STOPERA!») están protegidos por el derecho de autor. Toda reproducción o reutilización, total o parcial, requiere autorización previa. Los créditos fotográficos figuran en las páginas de las producciones correspondientes.",
        en: "All content on this site (texts, images, videos, the “STOPERA!” visual identity) is protected by copyright. Any reproduction or reuse, in whole or in part, requires prior authorisation. Photographic credits appear on the pages of the productions concerned.",
        zh: "本网站的全部内容（文字、图像、影像、「STOPERA!」视觉识别）均受著作权保护。任何全部或部分的复制与再利用，均须事先获得授权。摄影版权信息载于相关作品页面。", it: "Tutti i contenuti di questo sito (testi, immagini, video, identità visiva «STOPERA!») sono protetti dal diritto d'autore. Ogni riproduzione o riutilizzo, totale o parziale, è soggetto ad autorizzazione preventiva. I crediti fotografici figurano nelle pagine delle produzioni interessate." })

    + h2({ fr: "Données personnelles (RGPD)", es: "Datos personales (RGPD)", en: "Personal data (GDPR)", zh: "个人数据（GDPR）", it: "Dati personali (GDPR)" })
    + para({
        fr: "Ce site est statique. Il ne collecte aucune donnée personnelle à votre insu. Les échanges se font par courriel, à votre seule initiative. Conformément au Règlement général sur la protection des données (RGPD) et à la loi « Informatique et Libertés », vous disposez d'un droit d'accès, de rectification et d'effacement des données que vous nous transmettez par courriel : il vous suffit d'écrire à l'adresse ci-dessus.",
        es: "Este sitio es estático. No recoge ningún dato personal sin su conocimiento. Los intercambios se realizan por correo electrónico, únicamente por iniciativa suya. Conforme al Reglamento General de Protección de Datos (RGPD), usted dispone de un derecho de acceso, rectificación y supresión de los datos que nos transmita por correo : basta con escribir a la dirección indicada arriba.",
        en: "This is a static site. It collects no personal data without your knowledge. Exchanges take place by email, at your initiative alone. Under the General Data Protection Regulation (GDPR), you have a right of access to, rectification and erasure of the data you send us by email : simply write to the address above.",
        zh: "本网站为静态网站，不会在您不知情的情况下收集任何个人数据。所有往来均通过电子邮件进行，且完全出于您的主动。根据《通用数据保护条例》（GDPR），您对通过邮件提供给我们的数据享有访问、更正与删除的权利&nbsp;：来信至上述地址即可。", it: "Questo sito è statico. Non raccoglie alcun dato personale a vostra insaputa. Gli scambi avvengono via email, unicamente su vostra iniziativa. In conformità al Regolamento generale sulla protezione dei dati (GDPR), disponete di un diritto di accesso, rettifica e cancellazione dei dati che ci trasmettete via email: è sufficiente scrivere all'indirizzo qui sopra." })

    + h2({ fr: "Cookies & mesure d'audience", es: "Cookies & medición de audiencia", en: "Cookies & audience measurement", zh: "Cookie 与访问统计", it: "Cookie & misurazione del pubblico" })
    + para({
        fr: "Le site utilise <strong>Cloudflare Web Analytics</strong> pour mesurer sa fréquentation. Cet outil <strong>ne dépose aucun cookie</strong> et n'utilise aucun identifiant persistant : il ne permet pas de vous reconnaître d'une visite à l'autre, et aucune donnée n'est revendue. Aucun traceur publicitaire n'est utilisé. Les vidéos intégrées (YouTube) peuvent déposer des cookies lorsque vous en lancez la lecture&nbsp;; ceux-ci relèvent de la politique de confidentialité de Google / YouTube.",
        es: "El sitio utiliza <strong>Cloudflare Web Analytics</strong> para medir su tráfico. Esta herramienta <strong>no instala ninguna cookie</strong> ni emplea identificadores persistentes : no permite reconocerle de una visita a otra, y ningún dato se revende. No se utiliza ningún rastreador publicitario. Los vídeos integrados (YouTube) pueden instalar cookies cuando usted inicia su reproducción&nbsp;; estas se rigen por la política de privacidad de Google / YouTube.",
        en: "The site uses <strong>Cloudflare Web Analytics</strong> to measure traffic. This tool <strong>sets no cookies</strong> and uses no persistent identifier : it cannot recognise you from one visit to the next, and no data is sold on. No advertising trackers are used. Embedded videos (YouTube) may set cookies once you start playback&nbsp;; these are governed by the Google / YouTube privacy policy.",
        zh: "本网站使用 <strong>Cloudflare Web Analytics</strong> 统计访问量。该工具<strong>不放置任何 Cookie</strong>，也不使用任何持久标识符&nbsp;：它无法在不同访问之间识别您，且不会转售任何数据。本站不使用任何广告追踪器。嵌入的影片（YouTube）在您开始播放时可能放置 Cookie&nbsp;；此类 Cookie 适用 Google / YouTube 的隐私政策。", it: "Il sito utilizza <strong>Cloudflare Web Analytics</strong> per misurare gli accessi. Questo strumento <strong>non installa alcun cookie</strong> e non usa alcun identificatore persistente: non permette di riconoscervi da una visita all'altra, e nessun dato viene rivenduto. Non viene utilizzato alcun tracciante pubblicitario. I video integrati (YouTube) possono installare cookie quando ne avviate la riproduzione&nbsp;; questi rientrano nella politica sulla privacy di Google / YouTube." })

    + h2({ fr: "Liens externes", es: "Enlaces externos", en: "External links", zh: "外部链接", it: "Link esterni" })
    + para({
        fr: "Ce site comporte des liens vers des sites tiers (institutions, partenaires, presse). STOPERA! n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.",
        es: "Este sitio contiene enlaces a sitios de terceros (instituciones, socios, prensa). STOPERA! no ejerce control alguno sobre ellos y declina toda responsabilidad respecto de su contenido.",
        en: "This site contains links to third-party sites (institutions, partners, press). STOPERA! exercises no control over them and accepts no responsibility for their content.",
        zh: "本网站包含指向第三方网站的链接（机构、合作伙伴、媒体）。STOPERA! 对这些网站不行使任何控制，亦不对其内容承担任何责任。", it: "Questo sito contiene link a siti terzi (istituzioni, partner, stampa). STOPERA! non esercita alcun controllo su di essi e declina ogni responsabilità sui loro contenuti." })

    + '        <p class="legal-date" ' + ml({
        fr: "Dernière mise à jour : juillet 2026.",
        es: "Última actualización: julio de 2026.",
        en: "Last updated: July 2026.",
        zh: "最后更新：2026 年 7 月。", it: "Ultimo aggiornamento: luglio 2026." }) + "></p>\n"
    + "      </div>\n    </section>";
}

/* ---- transmission (chaque projet sous l'angle de la transmission) ---- */
function transmissionBody(rel) {
  var groups = PROJECTS.filter(function (p) { return p.transmission; }).map(function (p) {
    var href = rel + (p.slug === "lips" ? "lips/" : "productions/" + p.slug + "/");
    return '<div class="tx-group">\n'
      + '        <h3 class="tx-prod"><a href="' + href + '" ' + ml(p.titleHtml || p.title) + "></a></h3>\n"
      + '        <p class="tx-text" ' + ml(p.transmission) + "></p>\n"
      + (p.territory ? '        <p class="tx-terr"><span class="tx-terr-k" ' + ml({fr:"Territoire",es:"Territorio",en:"Territory",zh:"在地", it: "Territorio"}) + '></span> <span ' + ml(p.territory) + "></span></p>\n" : "")
      + "      </div>";
  }).join("\n      ");
  return '    <section class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'index.html" data-fr="← Accueil" data-es="← Inicio" data-en="← Home" data-zh="← 首页" data-it="← Home"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Transmission" data-es="Transmisión" data-en="Transmission" data-zh="传承" data-it="Trasmissione"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Chez STOPERA!, chaque œuvre est aussi un espace de transmission : ce qui peut se partager, s\'apprendre, s\'explorer ou se transmettre autour d\'elle — ateliers, rencontres, mentorat, médiation. Voici les productions présentées sous cet angle." data-es="En STOPERA!, cada obra es también un espacio de transmisión: lo que puede compartirse, aprenderse, explorarse o transmitirse en torno a ella — talleres, encuentros, mentoría, mediación. Aquí están las producciones presentadas desde esta perspectiva." data-en="At STOPERA!, every work is also a space of transmission: what can be shared, learned, explored or passed on around it — workshops, encounters, mentoring, mediation. Here are the productions seen through that lens." data-zh="在 STOPERA!，每一部作品也是一个传承的空间：围绕它可以分享、学习、探索或传递之物——工作坊、相遇、师徒指导、导赏。以下是从这一角度呈现的作品。" data-it="In STOPERA!, ogni opera è anche uno spazio di trasmissione: ciò che si può condividere, imparare, esplorare o trasmettere intorno a essa — laboratori, incontri, mentorato, mediazione. Ecco le produzioni presentate sotto questa luce."></p>\n'
    + "      " + groups + "\n    </section>";
}

/* ---- write ---- */
function retext(html, lang) {
  /* Le motif EXIGE data-fr dans les attributs. Sans cette exigence, un
     conteneur non traduit — <div>, <section> — matche en premier, avale ses
     enfants dans son contenu non gourmand, et le remplaceur les rend
     inchanges : les elements traduisibles a l'interieur ne sont jamais
     atteints. C'est la difference avec `bake`, dont le contenu doit etre
     vide et qu'aucun conteneur ne peut donc absorber. */
  var re = new RegExp(
    '<(\\w+)((?:"[^"]*"|[^>"])*\\sdata-fr="[^"]*"(?:"[^"]*"|[^>"])*)>([\\s\\S]*?)<\\/\\1>', 'g');
  var pick = new RegExp('\\sdata-' + lang + '="([^"]*)"');
  return html.replace(re, function (m, tag, attrs, inner) {
    var mm = attrs.match(pick) || attrs.match(/\sdata-fr="([^"]*)"/);
    if (!mm) return m;
    if (inner.indexOf("<" + tag) >= 0) return m;  /* imbrication : on s'abstient */
    var txt = mm[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return "<" + tag + attrs + ">" + txt + "</" + tag + ">";
  });
}

function bake(html, lang) {
  /* Les attributs data-* peuvent contenir des balises inline (<strong>, <a>),
     donc des « > ». Une expression naive s'arrete au premier « > » rencontre
     et laisse ces elements vides dans le HTML : le texte n'existe alors que
     si le JavaScript s'execute — invisible pour les moteurs et pour les
     robots de previsualisation. On saute donc les valeurs entre guillemets
     au lieu de buter dessus.
     Le texte injecte est celui de la langue de la page : c'est ce qui rend
     /en/ reellement anglais aux yeux d'un robot, et non un document francais
     traduit apres coup par le navigateur. */
  var re = new RegExp('\\sdata-' + lang + '="([^"]*)"');
  return html.replace(/<(\w+)((?:"[^"]*"|'[^']*'|[^>"'])*)>(<\/\1>)/g, function (m, tag, attrs, close) {
    var mm = attrs.match(re) || attrs.match(/\sdata-fr="([^"]*)"/);
    if (!mm) return m;
    var inner = mm[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return "<" + tag + attrs + ">" + inner + close;
  });
}
/* Une seule declaration de page produit les quatre langues. Le francais
   reste a la racine — ses URL sont deja indexees et deja partagees ; les
   autres langues vivent sous /es/, /en/ et /zh/.
   Le meme corps de page sert aux quatre : les liens de contenu sont
   relatifs, donc ils suivent le prefixe de langue tout seuls, et les
   ressources sont en chemin absolu, donc elles ne le suivent pas. */
function write(relPath, opts) {
  if (!opts || typeof opts !== "object" || !opts.body) {
    throw new Error("write(" + relPath + ") : descripteur de page attendu");
  }
  opts.path = relPath === "" ? "" : relPath + "/";
  LANGS.forEach(function (lang) {
    var dir = path.join(DOCS, lang === "fr" ? relPath : path.join(lang, relPath));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), retext(render(opts, lang), lang));
  });
  pages.push(relPath === "" ? "" : relPath + "/");
}
var pages = [];
var urls = [SITE + "/"];

PROJECTS.forEach(function (p) {
  var isLips = p.slug === "lips";
  var rel = isLips ? "../" : "../../";
  var slugPath = isLips ? "lips" : "productions/" + p.slug;
  var url = SITE + "/" + slugPath + "/";
  var img = SITE + "/" + (p.photo || "assets/og-cover.jpg");
  /* Ces pages décrivent des ŒUVRES, pas des représentations datées et
     billetées. Les déclarer en TheaterEvent obligeait à fournir startDate et
     location — introuvables pour une création annoncée « 2027 » ou « date à
     venir », et qu'il aurait fallu inventer. CreativeWork dit le vrai et
     supprime les six anomalies signalées par la Search Console. */
  var yr = YEARS[p.slug];
  var jsonld = function (lang) {
    return JSON.stringify(Object.assign({
      "@context": "https://schema.org", "@type": "CreativeWork",
      name: plain(p.titleHtml || p.title, lang), description: plain(p.short || p.pitch, lang),
      image: img, url: langUrl(slugPath + "/", lang), inLanguage: lang,
      creator: { "@type": "Organization", name: "STOPERA!", url: SITE + "/" }
    }, (typeof yr === "string" && /^\d{4}$/.test(yr)) ? { dateCreated: yr } : {}));
  };
  write(slugPath, page({ rel: rel, title: p.titleHtml || p.title, description: p.short || p.pitch, image: img, jsonld: jsonld, body: prodBody(p, rel) }));
  urls.push(url);
});

/* news index */
var newsList = NEWS.map(function (n) {
  return '<li class="news-item"><a href="' + n.slug + '/"><span class="news-date">' + esc(n.date) + '</span><span class="news-h" ' + ml(n.title) + '></span><span class="news-x" ' + ml(n.excerpt) + '></span></a></li>';
}).join("\n        ");
write("news", page({ rel: "../", title: {"fr": "Actualités", "es": "Novedades", "en": "News", "zh": "动态", "it": "Notizie"}, description: {"fr": "Actualités de STOPERA! — créations, productions, laboratoire LIPS et collaborations internationales.", "es": "Novedades de STOPERA! — estrenos, producciones, laboratorio LIPS y colaboraciones internacionales.", "en": "News from STOPERA! — premieres, productions, the LIPS laboratory and international collaborations.", "zh": "STOPERA! 动态——首演、制作、LIPS 实验室与国际合作。", "it": "Notizie di STOPERA! — creazioni, produzioni, laboratorio LIPS e collaborazioni internazionali."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/news/", ogType: "website",
  body: '    <section class="section pd-page">\n      <h1 class="pd-title pd-title--page" data-fr="Actualités" data-es="Novedades" data-en="News" data-zh="动态" data-it="Notizie"></h1>\n      <ul class="news-list">\n        ' + newsList + "\n      </ul>\n    </section>" }));
urls.push(SITE + "/news/");
NEWS.forEach(function (n) {
  var url = SITE + "/news/" + n.slug + "/", img = SITE + "/" + (n.img || "assets/og-cover.jpg");
  write("news/" + n.slug, page({ rel: "../../", title: n.title, description: n.excerpt, image: img, body: newsBody(n, "../../") }));
  urls.push(url);
});

/* parcours (Layer 2 éditorial) — index + une page par thématique */
var threadCards = THEMES.map(function (th) {
  return '<li class="thread-card"><a href="' + th.slug + '/">'
    + '<span class="thread-h" ' + ml(th.title) + '></span>'
    + '<span class="thread-x" ' + ml(th.blurb) + '></span>'
    + '<span class="thread-n">' + th.items.length + '</span></a></li>';
}).join("\n        ");
write("parcours", page({ rel: "../", title: {"fr": "Parcours", "es": "Recorridos", "en": "Threads", "zh": "主题", "it": "Percorsi"}, description: {"fr": "Parcours éditoriaux de STOPERA! — explorer les créations par thématiques transversales : temps réel & technologie, mémoire & politique, voix & texte, corps & présence.", "es": "Recorridos editoriales de STOPERA! — explorar las obras por temáticas transversales: tiempo real y tecnología, memoria y política, voz y texto, cuerpo y presencia.", "en": "Editorial threads through STOPERA! — exploring the works by cross-cutting themes: real time and technology, memory and politics, voice and text, body and presence.", "zh": "STOPERA! 的编辑性主题——以横向线索探索作品：实时与技术、记忆与政治、人声与文本、身体与在场。", "it": "Percorsi editoriali di STOPERA! — esplorare le opere per temi trasversali: tempo reale & tecnologia, memoria & politica, voce & testo, corpo & presenza."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/parcours/", ogType: "website",
  body: '    <section class="section pd-page">\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Parcours" data-es="Recorridos" data-en="Threads" data-zh="主题" data-it="Percorsi"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Une lecture transversale du répertoire — par idées et obsessions plutôt que par dates." data-es="Una lectura transversal del repertorio — por ideas y obsesiones más que por fechas." data-en="A cross-cutting reading of the repertoire — by ideas and obsessions rather than dates." data-zh="对作品的横向阅读——以理念与执念为线索，而非日期。" data-it="Una lettura trasversale del repertorio — per idee e ossessioni più che per date."></p>\n'
    + '      <ul class="thread-list">\n        ' + threadCards + "\n      </ul>\n    </section>" }));
urls.push(SITE + "/parcours/");

THEMES.forEach(function (th) {
  var tiles = th.items.map(function (s) { return threadTile(s, "../../"); }).join("\n        ");
  var url = SITE + "/parcours/" + th.slug + "/";
  var jsonld = function (lang) {
    return JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage",
      name: plain(th.title, lang) + " — STOPERA!", description: plain(th.blurb, lang),
      url: langUrl("parcours/" + th.slug + "/", lang), inLanguage: lang,
      hasPart: th.items.map(function (s) { return { "@type": "CreativeWork", name: plain(bySlug[s] && (bySlug[s].titleHtml || bySlug[s].title), lang), url: langUrl((s === "lips" ? "lips/" : "productions/" + s + "/"), lang) }; }) });
  };
  write("parcours/" + th.slug, page({ rel: "../../", title: th.title, description: th.blurb, image: SITE + "/assets/og-share.jpg?v=1", ogType: "website", jsonld: jsonld,
    body: '    <section class="section pd-page">\n'
      + '      <p class="pd-eyebrow"><a href="../" data-fr="← Parcours" data-es="← Recorridos" data-en="← Threads" data-zh="← 主题" data-it="← Percorsi"></a></p>\n'
      + '      <h1 class="pd-title pd-title--page" ' + ml(th.title) + "></h1>\n"
      + '      <p class="pd-pitch" ' + ml(th.blurb) + "></p>\n"
      + '      <ul class="projects thread-grid">\n        ' + tiles + "\n      </ul>\n    </section>" }));
  urls.push(url);
});

/* ---- ARTISTS (écosystème) ---- */
var ARTISTS = [
  { slug: "sebastian-rivas", name: "Sebastian Rivas",
    role: { fr: "Direction artistique & composition", es: "Dirección artística & composición", en: "Artistic direction & composition", zh: "艺术指导与作曲", it: "Direzione artistica & composizione" },
    bio: { fr: "Compositeur, il est à l'origine de nombreuses œuvres de STOPERA! et en porte la direction artistique. Son travail explore l'opéra contemporain, le théâtre musical et l'électronique en temps réel.",
           es: "Compositor, está en el origen de numerosas obras de STOPERA! y asume su dirección artística. Su trabajo explora la ópera contemporánea, el teatro musical y la electrónica en tiempo real.",
           en: "A composer, he is behind many of STOPERA!'s works and carries its artistic direction. His work explores contemporary opera, music theatre and real-time electronics.",
           zh: "作曲家，是 STOPERA! 众多作品的源头并担任其艺术指导。其创作探索当代歌剧、音乐剧场与实时电子。", it: "Compositore, è all'origine di numerose opere di STOPERA! e ne porta la direzione artistica. Il suo lavoro esplora l'opera contemporanea, il teatro musicale e l'elettronica in tempo reale." },
    bioLong: [
      { fr: "Compositeur franco-argentin, il développe une œuvre à la croisée de l'opéra contemporain, du théâtre musical et de l'électronique en temps réel. Lion d'Argent de la Biennale de Venise en 2018, il a notamment créé Otages (Opéra de Lyon, 2024).",
        es: "Compositor franco-argentino, desarrolla una obra en el cruce de la ópera contemporánea, el teatro musical y la electrónica en tiempo real. León de Plata de la Bienal de Venecia en 2018, ha creado entre otras Otages (Opéra de Lyon, 2024).",
        en: "A French-Argentine composer, he develops a body of work at the crossroads of contemporary opera, music theatre and real-time electronics. Silver Lion of the Venice Biennale in 2018, his works include Otages (Opéra de Lyon, 2024).",
        zh: "法国-阿根廷作曲家，其创作游走于当代歌剧、音乐剧场与实时电子之间。2018 年获威尼斯双年展银狮奖，作品包括 Otages（里昂歌剧院，2024）。", it: "Compositore franco-argentino, sviluppa un'opera all'incrocio tra opera contemporanea, teatro musicale ed elettronica in tempo reale. Leone d'Argento della Biennale di Venezia nel 2018, ha creato in particolare Otages (Opéra de Lyon, 2024)." },
      { fr: "Avec STOPERA!, dont il porte la direction artistique, il explore la manière dont la voix, le corps et le son deviennent présence. Son travail dialogue avec des institutions en France et à l'international : Ircam, GRAME, Ensemble intercontemporain, Teatro Colón.",
        es: "Con STOPERA!, cuya dirección artística asume, explora cómo la voz, el cuerpo y el sonido se vuelven presencia. Su trabajo dialoga con instituciones en Francia y en el extranjero: Ircam, GRAME, Ensemble intercontemporain, Teatro Colón.",
        en: "With STOPERA!, of which he is artistic director, he explores how voice, body and sound become presence. His work engages institutions in France and abroad: Ircam, GRAME, the Ensemble intercontemporain, the Teatro Colón.",
        zh: "在担任艺术指导的 STOPERA!，他探索人声、身体与声音如何成为在场。其工作与法国及国际的机构对话：Ircam、GRAME、Ensemble intercontemporain、Teatro Colón。", it: "Con STOPERA!, di cui porta la direzione artistica, esplora il modo in cui la voce, il corpo e il suono diventano presenza. Il suo lavoro dialoga con istituzioni in Francia e all'estero: Ircam, GRAME, Ensemble intercontemporain, Teatro Colón." }
    ],
    productions: ["otages", "snow-on-her-lips", "war-madrigals", "nous", "mamma-roma", "america"] },
  { slug: "georges-aperghis", name: "Georges Aperghis", photo: "assets/aperghis.jpg",
    role: { fr: "Président d'honneur", es: "Presidente de honor", en: "Honorary president", zh: "名誉主席", it: "Presidente onorario" },
    bio: { fr: "Pionnier du théâtre musical, fondateur de l'ATEM (1976). Son compagnonnage et son influence artistique accompagnent STOPERA! ; ses pièces sont au cœur d'Insistir et résonnent dans [FAM]E (Récitation n°9).",
           es: "Pionero del teatro musical, fundador del ATEM (1976). Su compañía y su influencia artística acompañan a STOPERA!; sus piezas están en el corazón de Insistir y resuenan en [FAM]E (Récitation n°9).",
           en: "A pioneer of music theatre, founder of ATEM (1976). His companionship and artistic influence accompany STOPERA!; his pieces are at the heart of Insistir and resonate in [FAM]E (Récitation n°9).",
           zh: "音乐剧场的先驱，ATEM（1976）创始人。他的陪伴与艺术影响伴随着 STOPERA!；其作品是 Insistir 的核心，并在「[FAM]E」中回响（Récitation n°9）。", it: "Pioniere del teatro musicale, fondatore dell'ATEM (1976). Il suo sodalizio e la sua influenza artistica accompagnano STOPERA!; i suoi pezzi sono al cuore di Insistir e risuonano in [FAM]E (Récitation n°9)." },
    productions: ["insistir", "fame"] },
  { slug: "olivia-martin", name: "Olivia Martin",
    role: { fr: "Percussionniste", es: "Percusionista", en: "Percussionist", zh: "打击乐演奏家", it: "Percussionista" },
    bio: { fr: "Percussionniste, elle conçoit et interprète [FAM]E, récital du GRAME autour du féminin (Auditorium de Lyon), et joue au sein de l'ensemble Êkheía (Snow on Her Lips).",
           es: "Percusionista, concibe e interpreta [FAM]E, recital del GRAME en torno a lo femenino (Auditorium de Lyon), y toca en el ensemble Êkheía (Snow on Her Lips).",
           en: "A percussionist, she devises and performs [FAM]E, GRAME's recital around the feminine (Auditorium de Lyon), and plays within the Êkheía ensemble (Snow on Her Lips).",
           zh: "打击乐演奏家，构思并演出 GRAME 围绕「女性」的独奏会「[FAM]E」（里昂大礼堂），并在 Êkheía 乐团演奏（Snow on Her Lips）。", it: "Percussionista, idea e interpreta [FAM]E, recital del GRAME intorno al femminile (Auditorium de Lyon), e suona nell'ensemble Êkheía (Snow on Her Lips)." },
    productions: ["fame", "snow-on-her-lips"] },
  { slug: "guillaume-kosmicki", name: "Guillaume Kosmicki",
    role: { fr: "Musicologue & médiateur", es: "Musicólogo & mediador", en: "Musicologist & mediator", zh: "音乐学家与导赏人", it: "Musicologo & mediatore" },
    bio: { fr: "Musicologue, conférencier et auteur, spécialiste des musiques savantes contemporaines et des musiques électroniques. Il accompagne [FAM]E par sa médiation, rendant la création d'aujourd'hui accessible à tou·te·s.",
           es: "Musicólogo, conferenciante y autor, especialista en músicas cultas contemporáneas y en músicas electrónicas. Acompaña [FAM]E con su mediación, acercando la creación de hoy a todos.",
           en: "A musicologist, lecturer and author specialising in contemporary art music and electronic music. He accompanies [FAM]E through his mediation, making today's creation accessible to all.",
           zh: "音乐学家、讲师与作家，专研当代艺术音乐与电子音乐。他以导赏陪伴「[FAM]E」，让当下的创作为所有人所亲近。", it: "Musicologo, conferenziere e autore, specialista delle musiche colte contemporanee e delle musiche elettroniche. Accompagna [FAM]E con la sua mediazione, rendendo la creazione di oggi accessibile a tutti." },
    productions: ["fame"] },
  { slug: "nicola-beller-carbone", name: "Nicola Beller Carbone",
    role: { fr: "Soprano", es: "Soprano", en: "Soprano", zh: "女高音", it: "Soprano" },
    bio: { fr: "Interprète Sylvie Meyer dans Otages (Opéra de Lyon) et porte le projet Insistir, construit autour de pièces de Georges Aperghis.",
           es: "Interpreta a Sylvie Meyer en Otages (Opéra de Lyon) y lleva el proyecto Insistir, construido en torno a piezas de Georges Aperghis.",
           en: "Performs Sylvie Meyer in Otages (Opéra de Lyon) and drives the Insistir project, built around works by Georges Aperghis.",
           zh: "在 Otages（里昂歌剧院）中饰演 Sylvie Meyer，并推动围绕 Georges Aperghis 作品构建的 Insistir 项目。", it: "Interpreta Sylvie Meyer in Otages (Opéra de Lyon) e porta il progetto Insistir, costruito intorno a pezzi di Georges Aperghis." },
    productions: ["otages", "insistir"] },
  { slug: "martin-bauer", name: "Martin Bauer",
    role: { fr: "Metteur en scène & scénographe", es: "Director & escenógrafo", en: "Director & set designer", zh: "导演与舞台设计", it: "Regista & scenografo" },
    bio: { fr: "Signe la mise en scène et la scénographie de Mamma Roma (CETC — Teatro Colón) et co-dirige artistiquement Insistir.",
           es: "Firma la dirección y la escenografía de Mamma Roma (CETC — Teatro Colón) y codirige artísticamente Insistir.",
           en: "Directs and designs Mamma Roma (CETC — Teatro Colón) and co-directs Insistir.",
           zh: "担任 Mamma Roma（CETC — 科隆剧院）的导演与舞台设计，并联合执导 Insistir。", it: "Firma la regia e la scenografia di Mamma Roma (CETC — Teatro Colón) e co-dirige artisticamente Insistir." },
    productions: ["mamma-roma", "insistir"] },
  { slug: "rut-schreiner", name: "Rut Schreiner",
    role: { fr: "Cheffe d'orchestre & performeuse", es: "Directora & performer", en: "Conductor & performer", zh: "指挥与表演者", it: "Direttrice d'orchestra & performer" },
    bio: { fr: "Direction musicale d'Otages (Opéra de Lyon) ; elle conçoit et interprète input / body / output (« Conducting the Invisible »), où le geste de direction devient matière sonore.",
           es: "Dirección musical de Otages (Opéra de Lyon); concibe e interpreta input / body / output («Conducting the Invisible»), donde el gesto de dirección se vuelve materia sonora.",
           en: "Music direction of Otages (Opéra de Lyon); she conceives and performs input / body / output (“Conducting the Invisible”), where the conducting gesture becomes sonic material.",
           zh: "Otages（里昂歌剧院）的音乐指挥；她构思并演出 input / body / output（「Conducting the Invisible」），指挥手势在其中成为声音素材。", it: "Direzione musicale di Otages (Opéra de Lyon); idea e interpreta input / body / output («Conducting the Invisible»), dove il gesto della direzione diventa materia sonora." },
    productions: ["otages", "rut"] },
  { slug: "leo-warynski", name: "Léo Warynski", website: "https://www.lesmetaboles.fr",
    role: { fr: "Chef d'orchestre", es: "Director de orquesta", en: "Conductor", zh: "指挥", it: "Direttore d'orchestra" },
    bio: { fr: "Direction musicale de War Madrigals (Les Métaboles). Il dirige Les Métaboles et l'ensemble Multilatérale.",
           es: "Dirección musical de War Madrigals (Les Métaboles). Dirige Les Métaboles y el ensemble Multilatérale.",
           en: "Music direction of War Madrigals (Les Métaboles). He leads Les Métaboles and the Multilatérale ensemble.",
           zh: "War Madrigals（Les Métaboles）的音乐指挥。他领导 Les Métaboles 与 Multilatérale 乐团。", it: "Direzione musicale di War Madrigals (Les Métaboles). Dirige Les Métaboles e l'ensemble Multilatérale." },
    productions: ["war-madrigals"] },
  { slug: "christine-angot", name: "Christine Angot",
    role: { fr: "Autrice", es: "Autora", en: "Author", zh: "作者", it: "Autrice" },
    bio: { fr: "Écrivaine. Les textes de De l'Innocence, opéra de chambre, naissent d'une série de conversations avec le compositeur, autour de ce qui résiste au langage et au récit.",
           es: "Escritora. Los textos de De l'Innocence, ópera de cámara, nacen de una serie de conversaciones con el compositor, en torno a lo que resiste al lenguaje y al relato.",
           en: "A writer. The texts of De l'Innocence, a chamber opera, arise from a series of conversations with the composer, around what resists language and narrative.",
           zh: "作家。室内歌剧 De l'Innocence 的文本源自与作曲家的一系列对话，围绕那些抗拒语言与叙事之物。", it: "Scrittrice. I testi di De l'Innocence, opera da camera, nascono da una serie di conversazioni con il compositore, intorno a ciò che resiste al linguaggio e al racconto." },
    productions: ["nous"] },
  { slug: "marcelo-lombardero", name: "Marcelo Lombardero",
    role: { fr: "Metteur en scène & dramaturge", es: "Director & dramaturgo", en: "Director & dramaturg", zh: "导演与戏剧构作", it: "Regista & drammaturgo" },
    bio: { fr: "Dramaturgie et mise en scène d'A World to Blast, opéra autour d'América Scarfó et Soledad Rosas.",
           es: "Dramaturgia y dirección de A World to Blast, ópera en torno a América Scarfó y Soledad Rosas.",
           en: "Dramaturgy and staging of A World to Blast, an opera around América Scarfó and Soledad Rosas.",
           zh: "A World to Blast 的戏剧构作与导演——一部围绕 América Scarfó 与 Soledad Rosas 的歌剧。", it: "Drammaturgia e regia di A World to Blast, opera intorno ad América Scarfó e Soledad Rosas." },
    productions: ["america"] },
  { slug: "emma-terno", name: "Emma Terno",
    role: { fr: "Danseuse, performeuse & artiste visuelle", es: "Bailarina, performer & artista visual", en: "Dancer, performer & visual artist", zh: "舞者、表演者与视觉艺术家", it: "Danzatrice, performer & artista visiva" },
    bio: { fr: "Co-conçoit et co-dirige OOO avec Valentín Pelisch. Danseuse, performeuse et artiste visuelle, elle fait du corps un laboratoire d'expérimentation entre vidéo, son et dessin.",
           es: "Co-concibe y co-dirige OOO con Valentín Pelisch. Bailarina, performer y artista visual, hace del cuerpo un laboratorio de experimentación entre vídeo, sonido y dibujo.",
           en: "Co-creates and co-directs OOO with Valentín Pelisch. A dancer, performer and visual artist, she turns the body into a laboratory of experimentation between video, sound and drawing.",
           zh: "与 Valentín Pelisch 共同构思并导演 OOO。身为舞者、表演者与视觉艺术家，她将身体化为游走于影像、声音与绘画之间的实验场。", it: "Co-idea e co-dirige OOO con Valentín Pelisch. Danzatrice, performer e artista visiva, fa del corpo un laboratorio di sperimentazione tra video, suono e disegno." },
    bioLong: [
      { fr: "Formée à la Villa Arson (Nice), diplômée en arts visuels de l'ECAL (Lausanne, 2012) puis en pratiques scéniques à la HKB (Berne, 2014), elle mêle vidéo, son, dessin et mouvement. Elle a performé dans des festivals en Suisse, en Italie et en France.",
        es: "Formada en la Villa Arson (Niza), licenciada en artes visuales por la ECAL (Lausana, 2012) y en prácticas escénicas en la HKB (Berna, 2014), mezcla vídeo, sonido, dibujo y movimiento. Ha actuado en festivales de Suiza, Italia y Francia.",
        en: "Trained at the Villa Arson (Nice), with a BA in Visual Arts from ECAL (Lausanne, 2012) and an MA in Scenic Art Practices from HKB (Bern, 2014), she weaves video, sound, drawing and movement. She has performed at festivals in Switzerland, Italy and France.",
        zh: "曾就读于尼斯 Villa Arson，获洛桑 ECAL 视觉艺术学士（2012）及伯尔尼 HKB 舞台艺术实践硕士（2014），融合影像、声音、绘画与动作。她曾在瑞士、意大利与法国的多个艺术节演出。", it: "Formata alla Villa Arson (Nizza), diplomata in arti visive all'ECAL (Losanna, 2012) e poi in pratiche sceniche alla HKB (Berna, 2014), unisce video, suono, disegno e movimento. Si è esibita in festival in Svizzera, in Italia e in Francia." },
      { fr: "Elle collabore avec Natacha Paquignon, Marco Berrettini, Sebastian Rivas (Printemps des Arts de Monte-Carlo) et plusieurs maisons d'opéra en Europe (Monaco, Genève, Lyon, Marseille). Pour STOPERA!, elle est performeuse de Snow on Her Lips et co-autrice d'OOO.",
        es: "Colabora con Natacha Paquignon, Marco Berrettini, Sebastian Rivas (Printemps des Arts de Monte-Carlo) y varias casas de ópera en Europa (Mónaco, Ginebra, Lyon, Marsella). Para STOPERA!, es performer de Snow on Her Lips y coautora de OOO.",
        en: "She collaborates with Natacha Paquignon, Marco Berrettini, Sebastian Rivas (Printemps des Arts de Monte-Carlo) and several opera houses in Europe (Monaco, Geneva, Lyon, Marseille). For STOPERA!, she performs in Snow on Her Lips and co-authors OOO.",
        zh: "她与 Natacha Paquignon、Marco Berrettini、Sebastian Rivas（蒙特卡洛艺术之春）及欧洲多家歌剧院（摩纳哥、日内瓦、里昂、马赛）合作。在 STOPERA!，她是 Snow on Her Lips 的表演者，并共同创作 OOO。", it: "Collabora con Natacha Paquignon, Marco Berrettini, Sebastian Rivas (Printemps des Arts de Monte-Carlo) e diversi teatri d'opera in Europa (Monaco, Ginevra, Lione, Marsiglia). Per STOPERA!, è performer di Snow on Her Lips e co-autrice di OOO." }
    ],
    productions: ["ooo", "snow-on-her-lips"] },
  { slug: "valentin-pelisch", name: "Valentín Pelisch",
    role: { fr: "Compositeur & artiste sonore", es: "Compositor & artista sonoro", en: "Composer & sound artist", zh: "作曲家与声音艺术家", it: "Compositore & artista sonoro" },
    bio: { fr: "Compositeur, performeur et bruiteur de Buenos Aires. Il co-conçoit et co-dirige OOO avec Emma Terno ; son travail réunit pièces pour ensembles, performances et installations sonores et vidéo.",
           es: "Compositor, performer y artista de foley de Buenos Aires. Co-concibe y co-dirige OOO con Emma Terno; su trabajo reúne obras para ensembles, performances e instalaciones sonoras y de vídeo.",
           en: "Composer, performer and foley artist from Buenos Aires. He co-creates and co-directs OOO with Emma Terno; his work spans pieces for ensembles, performances and sound and video installations.",
           zh: "来自布宜诺斯艾利斯的作曲家、表演者与拟音艺术家。他与 Emma Terno 共同构思并导演 OOO；其创作涵盖乐团作品、表演及声音与影像装置。", it: "Compositore, performer e rumorista di Buenos Aires. Co-idea e co-dirige OOO con Emma Terno; il suo lavoro riunisce pezzi per ensemble, performance e installazioni sonore e video." },
    bioLong: [
      { fr: "Ses œuvres ont été présentées en Amérique, en Europe et en Asie. Il est membre du duo audiovisuel BASURA (improvisation sonore à partir d'archives) et co-programme depuis 2017 le cycle de concerts Mínimo un Lunes à Buenos Aires.",
        es: "Sus obras se han presentado en América, Europa y Asia. Es miembro del dúo audiovisual BASURA (improvisación sonora a partir de archivos) y coprograma desde 2017 el ciclo de conciertos Mínimo un Lunes en Buenos Aires.",
        en: "His works have been presented in America, Europe and Asia. He is a member of the audiovisual duo BASURA (sound improvisation from archives) and has co-curated the Mínimo un Lunes concert series in Buenos Aires since 2017.",
        zh: "其作品曾在美洲、欧洲与亚洲呈现。他是视听二人组 BASURA（基于档案的声音即兴）成员，并自 2017 年起共同策划布宜诺斯艾利斯的 Mínimo un Lunes 音乐会系列。", it: "Le sue opere sono state presentate in America, in Europa e in Asia. È membro del duo audiovisivo BASURA (improvvisazione sonora a partire da archivi) e dal 2017 co-programma il ciclo di concerti Mínimo un Lunes a Buenos Aires." },
      { fr: "Il a étudié la composition avec Gerardo Gandini et Marcelo Delgado, et obtenu une licence de composition avec médias électroacoustiques à l'Université nationale de Quilmes. Il s'est formé auprès de Mariano Etkin, Dmitri Kourliandski, Simon Steen-Andersen, du Quatuor Arditti, entre autres.",
        es: "Estudió composición con Gerardo Gandini y Marcelo Delgado, y obtuvo una licenciatura en composición con medios electroacústicos en la Universidad Nacional de Quilmes. Se formó con Mariano Etkin, Dmitri Kourliandski, Simon Steen-Andersen y el Cuarteto Arditti, entre otros.",
        en: "He studied composition with Gerardo Gandini and Marcelo Delgado and holds a degree in composition with electroacoustic media from the National University of Quilmes. He trained with Mariano Etkin, Dmitri Kourliandski, Simon Steen-Andersen and the Arditti Quartet, among others.",
        zh: "他师从 Gerardo Gandini 与 Marcelo Delgado 学习作曲，并获基尔梅斯国立大学电声媒介作曲学位。曾随 Mariano Etkin、Dmitri Kourliandski、Simon Steen-Andersen 及阿尔迪蒂四重奏等学习。", it: "Ha studiato composizione con Gerardo Gandini e Marcelo Delgado, e conseguito una laurea in composizione con media elettroacustici all'Università nazionale di Quilmes. Si è formato con Mariano Etkin, Dmitri Kourliandski, Simon Steen-Andersen, il Quartetto Arditti, tra gli altri." }
    ],
    productions: ["ooo"] },
  { slug: "daniel-zea", name: "Daniel Zea",
    role: { fr: "Vidéo & informatique musicale", es: "Vídeo & informática musical", en: "Video & music computing", zh: "影像与音乐信息", it: "Video & informatica musicale" },
    bio: { fr: "Vidéo et informatique musicale de Snow on Her Lips ; il intervient également au sein du laboratoire LIPS.",
           es: "Vídeo e informática musical de Snow on Her Lips; también interviene en el laboratorio LIPS.",
           en: "Video and music computing for Snow on Her Lips; he also takes part in the LIPS laboratory.",
           zh: "Snow on Her Lips 的影像与音乐信息技术；他亦参与 LIPS 工作坊。", it: "Video e informatica musicale di Snow on Her Lips; interviene anche all'interno del laboratorio LIPS." },
    productions: ["snow-on-her-lips", "lips"] },
  { slug: "nina-bouraoui", name: "Nina Bouraoui",
    role: { fr: "Autrice", es: "Autora", en: "Author", zh: "作者", it: "Autrice" },
    bio: { fr: "Écrivaine. Son texte est à l'origine d'Otages, portrait de Sylvie Meyer — femme « ordinaire et extraordinaire » qui bascule en un seul geste.",
           es: "Escritora. Su texto está en el origen de Otages, retrato de Sylvie Meyer — mujer «ordinaria y extraordinaria» que bascula en un solo gesto.",
           en: "A writer. Her text is the source of Otages, the portrait of Sylvie Meyer — an “ordinary and extraordinary” woman who tips over in a single act.",
           zh: "作家。她的文本是 Otages 的源头——对 Sylvie Meyer 的刻画，一位「平凡而非凡」、因一个举动而骤变的女性。", it: "Scrittrice. Il suo testo è all'origine di Otages, ritratto di Sylvie Meyer — donna «ordinaria e straordinaria» che vacilla in un solo gesto." },
    productions: ["otages"] },
  { slug: "richard-brunel", name: "Richard Brunel", website: "https://www.opera-lyon.com",
    role: { fr: "Metteur en scène", es: "Director de escena", en: "Stage director", zh: "导演", it: "Regista" },
    bio: { fr: "Metteur en scène, il signe la création d'Otages au Théâtre de la Croix-Rousse, dans le cadre du Festival de l'Opéra de Lyon, dont il dirige la maison.",
           es: "Director de escena, firma el estreno de Otages en el Théâtre de la Croix-Rousse, en el marco del Festival de la Opéra de Lyon, casa que dirige.",
           en: "A stage director, he created Otages at the Théâtre de la Croix-Rousse for the Opéra de Lyon Festival, the house he directs.",
           zh: "导演，他在里昂歌剧院艺术节框架内于 Croix-Rousse 剧院执导 Otages 的首演，并执掌该院。", it: "Regista, firma la prima di Otages al Théâtre de la Croix-Rousse, nell'ambito del Festival de l'Opéra de Lyon, di cui dirige la casa." },
    productions: ["otages"] },
  { slug: "anne-laure-chamboissier", name: "Anne-Laure Chamboissier",
    role: { fr: "Curatrice", es: "Curadora", en: "Curator", zh: "策展人", it: "Curatrice" },
    bio: { fr: "Curatrice indépendante, elle accompagne des projets à la croisée des arts visuels, de la musique et de la scène, et a pris part à l'émergence de STOPERA!.",
           es: "Curadora independiente, acompaña proyectos en el cruce de las artes visuales, la música y la escena, y participó en la emergencia de STOPERA!.",
           en: "An independent curator, she supports projects at the crossroads of visual arts, music and the stage, and took part in the emergence of STOPERA!.",
           zh: "独立策展人，她陪伴视觉艺术、音乐与舞台交汇处的项目，并参与了 STOPERA! 的萌生。", it: "Curatrice indipendente, accompagna progetti all'incrocio tra arti visive, musica e scena, e ha preso parte alla nascita di STOPERA!." },
    productions: [] },
  { slug: "porte-renaud", name: "- porte renaud -", website: "https://porterenaud.com", photo: "assets/projects/porte-renaud.jpg",
    role: { fr: "Compositeur & metteur en scène", es: "Compositor & director", en: "Composer & director", zh: "作曲家与导演", it: "Compositore & regista" },
    bio: { fr: "Compositeur, plasticien et docteur en philosophie, il fonde la Cie Trilobite à Mulhouse. Son opéra politique et écologique We Expected the Disaster… but not the salamanders!, d'après La Guerre des salamandres de Karel Čapek, est accompagné par STOPERA! et créé au festival Tête à Tête (Londres) en 2027.",
           es: "Compositor, artista plástico y doctor en filosofía, funda la Cie Trilobite en Mulhouse. Su ópera política y ecológica We Expected the Disaster… but not the salamanders!, a partir de La guerra de las salamandras de Karel Čapek, es acompañada por STOPERA! y se estrena en el festival Tête à Tête (Londres) en 2027.",
           en: "A composer, visual artist and doctor of philosophy, he founded Cie Trilobite in Mulhouse. His political, ecological opera We Expected the Disaster… but not the salamanders!, after Karel Čapek's War with the Newts, is accompanied by STOPERA! and premieres at the Tête à Tête festival (London) in 2027.",
           zh: "作曲家、造型艺术家、哲学博士，在米卢斯创立 Cie Trilobite 剧团。他的政治与生态歌剧 We Expected the Disaster… but not the salamanders!（取材自卡雷尔·恰佩克的《鲵鱼之乱》）由 STOPERA! 陪伴发展，并于 2027 年在伦敦 Tête à Tête 音乐节首演。", it: "Compositore, artista visivo e dottore in filosofia, fonda la Cie Trilobite a Mulhouse. La sua opera politica ed ecologica We Expected the Disaster… but not the salamanders!, da La guerra delle salamandre di Karel Čapek, è accompagnata da STOPERA! e debutta al festival Tête à Tête (Londra) nel 2027." },
    productions: ["salamandres"] }
];

/* bios longues validées (faits sûrs uniquement) — fusionnées dans ARTISTS */
var BIOLONG = {
  "georges-aperghis": [
    { fr: "Né à Athènes en 1945, il vit et travaille en France. Figure majeure de la création contemporaine, il fonde en 1976 l'ATEM (Atelier Théâtre et Musique) et invente une œuvre où la voix, le geste et le langage deviennent matière scénique, des Récitations au théâtre musical.",
      es: "Nacido en Atenas en 1945, vive y trabaja en Francia. Figura mayor de la creación contemporánea, funda en 1976 el ATEM (Atelier Théâtre et Musique) e inventa una obra donde la voz, el gesto y el lenguaje se vuelven materia escénica, de las Récitations al teatro musical.",
      en: "Born in Athens in 1945, he lives and works in France. A major figure of contemporary creation, he founded ATEM (Atelier Théâtre et Musique) in 1976 and invented a body of work where voice, gesture and language become stage material, from the Récitations to music theatre.",
      zh: "1945 年生于雅典，现居法国并在此工作。作为当代创作的重要人物，他于 1976 年创立 ATEM（戏剧与音乐工坊），创造出让人声、动作与语言成为舞台素材的作品，从《Récitations》到音乐剧场。", it: "Nato ad Atene nel 1945, vive e lavora in Francia. Figura maggiore della creazione contemporanea, fonda nel 1976 l'ATEM (Atelier Théâtre et Musique) e inventa un'opera in cui la voce, il gesto e il linguaggio diventano materia scenica, dalle Récitations al teatro musicale." },
    { fr: "Lion d'Or de la Biennale de Venise en 2015, son compagnonnage et son influence accompagnent STOPERA!. Ses pièces sont au cœur du projet Insistir, porté par Nicola Beller Carbone.",
      es: "León de Oro de la Bienal de Venecia en 2015, su compañía e influencia acompañan a STOPERA!. Sus piezas están en el corazón del proyecto Insistir, llevado por Nicola Beller Carbone.",
      en: "Golden Lion of the Venice Biennale in 2015, his companionship and influence accompany STOPERA!. His pieces are at the heart of the Insistir project, led by Nicola Beller Carbone.",
      zh: "2015 年获威尼斯双年展金狮奖。他的陪伴与影响伴随着 STOPERA!；其作品是由 Nicola Beller Carbone 推动的 Insistir 项目的核心。", it: "Leone d'Oro alla Biennale di Venezia nel 2015, il suo sodalizio e la sua influenza accompagnano STOPERA!. I suoi pezzi sono al cuore del progetto Insistir, portato da Nicola Beller Carbone." }
  ],
  "christine-angot": [
    { fr: "Écrivaine née en 1959, elle est l'une des voix majeures de la littérature française contemporaine, notamment pour son écriture de l'intime (L'Inceste). Prix Médicis 2021 pour Le Voyage dans l'Est.",
      es: "Escritora nacida en 1959, es una de las voces mayores de la literatura francesa contemporánea, en particular por su escritura de lo íntimo (El incesto). Premio Médicis 2021 por Le Voyage dans l'Est.",
      en: "A writer born in 1959, she is one of the major voices of contemporary French literature, notably for her writing of the intimate (Incest). Winner of the 2021 Prix Médicis for Le Voyage dans l'Est.",
      zh: "1959 年出生的作家，是法国当代文学的重要声音之一，尤以其对私密经验的书写著称（《乱伦》）。凭《Le Voyage dans l'Est》获 2021 年美第奇奖。", it: "Scrittrice nata nel 1959, è una delle voci maggiori della letteratura francese contemporanea, in particolare per la sua scrittura dell'intimo (L'Inceste). Prix Médicis 2021 per Le Voyage dans l'Est." },
    { fr: "Elle écrit les textes de De l'Innocence, opéra de chambre né d'une série de conversations avec le compositeur : non pas mettre un thème en musique, mais trouver une forme qui accueille ce qui résiste au langage et au récit.",
      es: "Escribe los textos de De l'Innocence, ópera de cámara nacida de una serie de conversaciones con el compositor: no poner un tema en música, sino encontrar una forma que acoja lo que resiste al lenguaje y al relato.",
      en: "She writes the texts of De l'Innocence, a chamber opera born from a series of conversations with the composer: not setting a theme to music, but finding a form that holds what resists language and narrative.",
      zh: "她为室内歌剧 De l'Innocence 撰写文本：并非为主题谱曲，而是寻找一种容纳那些抗拒语言与叙事之物的形式。", it: "Scrive i testi di De l'Innocence, opera da camera nata da una serie di conversazioni con il compositore: non mettere in musica un tema, ma trovare una forma che accolga ciò che resiste al linguaggio e al racconto." }
  ],
  "nina-bouraoui": [
    { fr: "Écrivaine née en 1967, son œuvre explore l'identité, le désir et la mémoire, entre la France et l'Algérie. Prix Renaudot 2005 pour Mes mauvaises pensées.",
      es: "Escritora nacida en 1967, su obra explora la identidad, el deseo y la memoria, entre Francia y Argelia. Premio Renaudot 2005 por Mes mauvaises pensées.",
      en: "A writer born in 1967, her work explores identity, desire and memory, between France and Algeria. Winner of the 2005 Prix Renaudot for Mes mauvaises pensées.",
      zh: "1967 年出生的作家，其作品在法国与阿尔及利亚之间探索身份、欲望与记忆。凭《Mes mauvaises pensées》获 2005 年勒诺多奖。", it: "Scrittrice nata nel 1967, la sua opera esplora l'identità, il desiderio e la memoria, tra la Francia e l'Algeria. Prix Renaudot 2005 per Mes mauvaises pensées." },
    { fr: "Son texte est à l'origine d'Otages : le portrait de Sylvie Meyer, femme « ordinaire et extraordinaire » qui bascule en un seul geste, à la fois répréhensible et libérateur.",
      es: "Su texto está en el origen de Otages: el retrato de Sylvie Meyer, mujer «ordinaria y extraordinaria» que bascula en un solo gesto, a la vez reprensible y liberador.",
      en: "Her text is the source of Otages: the portrait of Sylvie Meyer, an “ordinary and extraordinary” woman who tips over in a single act, at once reprehensible and liberating.",
      zh: "她的文本是 Otages 的源头：对 Sylvie Meyer 的刻画——一位「平凡而非凡」、因一个既应受谴责又带来解放的举动而骤变的女性。", it: "Il suo testo è all'origine di Otages: il ritratto di Sylvie Meyer, donna «ordinaria e straordinaria» che vacilla in un solo gesto, insieme riprovevole e liberatorio." }
  ],
  "richard-brunel": [
    { fr: "Metteur en scène, il dirige l'Opéra national de Lyon de 2021 à 2026, après avoir été à la tête de la Comédie de Valence. Au théâtre comme à l'opéra, il met en scène un répertoire ancré dans les questions de notre temps.",
      es: "Director de escena, dirige la Opéra national de Lyon de 2021 a 2026, tras haber estado al frente de la Comédie de Valence. En el teatro y en la ópera, pone en escena un repertorio anclado en las cuestiones de nuestro tiempo.",
      en: "A stage director, he has led the Opéra national de Lyon from 2021 to 2026, after heading the Comédie de Valence. In theatre and opera alike, he stages a repertoire rooted in the questions of our time.",
      zh: "导演，从 2021 至 2026 年执掌里昂国家歌剧院，此前曾领导瓦朗斯国家戏剧中心。无论戏剧还是歌剧，他执导的剧目都扎根于我们时代的议题。", it: "Regista, dirige l'Opéra national de Lyon dal 2021 al 2026, dopo essere stato alla guida della Comédie de Valence. A teatro come all'opera, mette in scena un repertorio radicato nelle questioni del nostro tempo." },
    { fr: "Il signe la création d'Otages au Théâtre de la Croix-Rousse, dans le cadre du Festival de l'Opéra de Lyon (2024), d'après le texte de Nina Bouraoui.",
      es: "Firma el estreno de Otages en el Théâtre de la Croix-Rousse, en el marco del Festival de la Opéra de Lyon (2024), a partir del texto de Nina Bouraoui.",
      en: "He created Otages at the Théâtre de la Croix-Rousse for the Opéra de Lyon Festival (2024), after the text by Nina Bouraoui.",
      zh: "他在里昂歌剧院艺术节框架内于 Croix-Rousse 剧院执导 Otages 的首演（2024），改编自 Nina Bouraoui 的文本。", it: "Firma la prima di Otages al Théâtre de la Croix-Rousse, nell'ambito del Festival de l'Opéra de Lyon (2024), dal testo di Nina Bouraoui." }
  ],
  "leo-warynski": [
    { fr: "Chef d'orchestre, il fonde et dirige l'ensemble vocal Les Métaboles et assure la direction musicale de l'ensemble instrumental Multilatérale. Son répertoire fait une large place à la musique de notre temps comme au grand répertoire a cappella.",
      es: "Director de orquesta, funda y dirige el ensemble vocal Les Métaboles y asume la dirección musical del ensemble instrumental Multilatérale. Su repertorio concede un amplio lugar a la música de nuestro tiempo y al gran repertorio a cappella.",
      en: "A conductor, he founded and directs the vocal ensemble Les Métaboles and is music director of the instrumental ensemble Multilatérale. His repertoire gives ample place to the music of our time as well as the great a cappella repertoire.",
      zh: "指挥家，他创立并领导人声乐团 Les Métaboles，并担任器乐团 Multilatérale 的音乐总监。其曲目既广纳当代音乐，也涵盖伟大的无伴奏合唱传统。", it: "Direttore d'orchestra, fonda e dirige l'ensemble vocale Les Métaboles e assicura la direzione musicale dell'ensemble strumentale Multilatérale. Il suo repertorio dà ampio spazio alla musica del nostro tempo come al grande repertorio a cappella." },
    { fr: "Avec STOPERA!, il assure la direction musicale de War Madrigals.",
      es: "Con STOPERA!, asume la dirección musical de War Madrigals.",
      en: "With STOPERA!, he conducts War Madrigals.",
      zh: "在 STOPERA!，他担任 War Madrigals 的音乐指挥。", it: "Con STOPERA!, assicura la direzione musicale di War Madrigals." }
  ],
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
  if (a.photo) {
    /* Crédit photo : obligatoire pour une image sous licence libre (CC BY / BY-SA)
       comme pour un portrait de presse fourni par l'artiste. Affiché seulement
       sur la fiche (cls "div"), pas sur les vignettes de la liste. */
    var cr = (a.photoCredit && cls === "div")
      ? '<span class="artist-credit">' + esc(a.photoCredit) + '</span>' : '';
    return '<' + cls + ' class="artist-portrait"><img src="' + "/" + a.photo + '" alt="' + esc(a.name) + '" />' + cr + '</' + cls + '>';
  }
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
  var prodBlock = prods ? '<div class="pd-block pd-full"><h4 ' + ml({ fr: "Productions liées", es: "Producciones vinculadas", en: "Related productions", zh: "相关作品", it: "Produzioni collegate" }) + '></h4><ul class="taglist">' + prods + "</ul></div>" : "";
  var longBio = (a.bioLong && a.bioLong.length) ? '<div class="prose artist-bio-long">' + a.bioLong.map(function (par) { return "<p " + ml(par) + "></p>"; }).join("") + "</div>" : "";
  var linkItems = [];
  if (a.website) linkItems.push('<a href="' + a.website + '" target="_blank" rel="noopener">' + esc(a.website.replace(/^https?:\/\//, "").replace(/\/$/, "")) + " ↗</a>");
  (a.socials || []).forEach(function (s) { linkItems.push('<a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + " ↗</a>"); });
  var links = linkItems.length ? '<div class="pd-block pd-full"><h4 ' + ml({ fr: "Liens", es: "Enlaces", en: "Links", zh: "链接", it: "Link" }) + '></h4><p class="artist-links">' + linkItems.join(" · ") + "</p></div>" : "";
  return '    <article class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="' + rel + 'artists/" data-fr="← Artistes" data-es="← Artistas" data-en="← Artists" data-zh="← 艺术家" data-it="← Artisti"></a></p>\n'
    + '      <div class="artist-head">' + artistAvatar(a, rel, "div")
    + '        <div><h1 class="pd-title pd-title--page">' + esc(a.name) + '</h1>'
    + '<p class="artist-role-lg" ' + ml(a.role) + "></p></div></div>\n"
    + '      <p class="pd-pitch" ' + ml(a.bio) + "></p>\n"
    + (longBio ? "      " + longBio + "\n" : "")
    + '      <div class="pd-grid">' + prodBlock + links + "</div>\n    </article>";
}

/* artists index */
var artistGrid = ARTISTS.map(artistCard).join("\n        ");
write("artists", page({ rel: "../", title: {"fr": "Artistes", "es": "Artistas", "en": "Artists", "zh": "艺术家", "it": "Artisti"}, description: {"fr": "Les artistes de STOPERA! — compositeurs, interprètes, metteurs en scène, auteurs et chercheurs qui font vivre la plateforme.", "es": "Los artistas de STOPERA! — compositores, intérpretes, directores de escena, autores e investigadores que dan vida a la plataforma.", "en": "The artists of STOPERA! — composers, performers, directors, writers and researchers who bring the platform to life.", "zh": "STOPERA! 的艺术家——让这一平台得以存在的作曲家、表演者、导演、作者与研究者。", "it": "Gli artisti di STOPERA! — compositori, interpreti, registi, autori e ricercatori che fanno vivere la piattaforma."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/artists/", ogType: "website",
  body: '    <section class="section pd-page">\n'
    + '      <h1 class="pd-title pd-title--page" data-fr="Artistes" data-es="Artistas" data-en="Artists" data-zh="艺术家" data-it="Artisti"></h1>\n'
    + '      <p class="pd-pitch" data-fr="Un écosystème vivant : compositeurs, interprètes, metteur·ses en scène, auteur·rices et chercheur·ses qui se retrouvent d\'un projet à l\'autre." data-es="Un ecosistema vivo: compositores, intérpretes, directores, autores e investigadores que se reencuentran de un proyecto a otro." data-en="A living ecosystem: composers, performers, directors, authors and researchers who meet again from one project to the next." data-zh="一个活的生态：作曲家、表演者、导演、作者与研究者，在一个又一个项目中重逢。" data-it="Un ecosistema vivo: compositori, interpreti, registi, autori e ricercatori che si ritrovano da un progetto all\'altro."></p>\n'
    + '      <ul class="artist-grid">\n        ' + artistGrid + "\n      </ul>\n    </section>" }));
urls.push(SITE + "/artists/");
ARTISTS.forEach(function (a) {
  var url = SITE + "/artists/" + a.slug + "/", img = SITE + "/" + (a.photo || "assets/og-cover.jpg");
  var jsonld = JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: a.name, jobTitle: plain(a.role), url: url, description: plain(a.bio), affiliation: { "@type": "Organization", name: "STOPERA!", url: SITE + "/" }, sameAs: a.website ? [a.website] : undefined });
  write("artists/" + a.slug, page({ rel: "../../", title: a.name, description: a.bio, image: img, jsonld: jsonld, body: artistBody(a, "../../") }));
  urls.push(url);
});

/* cooperation */
write("cooperation", page({ rel: "../", title: {"fr": "Coopération internationale", "es": "Cooperación internacional", "en": "International cooperation", "zh": "国际合作", "it": "Cooperazione internazionale"}, description: {"fr": "La carte des coopérations de STOPERA! — institutions, lieux et projets en Europe et en Amérique latine, depuis Gentilly.", "es": "El mapa de cooperaciones de STOPERA! — instituciones, espacios y proyectos en Europa y América Latina, desde Gentilly.", "en": "STOPERA!'s map of cooperations — institutions, venues and projects across Europe and Latin America, from Gentilly.", "zh": "STOPERA! 的合作地图——从让蒂伊出发，遍及欧洲与拉丁美洲的机构、场馆与项目。", "it": "La mappa delle cooperazioni di STOPERA! — istituzioni, spazi e progetti in Europa e in America latina, da Gentilly."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/cooperation/", ogType: "website", body: cooperationBody("../") }));

var OEUVRES_BODY = `    <section class="section">
      <div class="section-head-row"><div class="col-label"><span class="index"></span><span class="eyebrow" data-fr="Œuvres" data-es="Obras" data-en="Works" data-zh="作品" data-it="Opere"></span></div><h2 class="lead" style="margin:0" data-fr="Le catalogue" data-es="El catálogo" data-en="The catalogue" data-zh="作品目录" data-it="Il catalogo"></h2></div>
      <p class="section-note" data-fr="Les créations de STOPERA!, lues par le rôle qu'elle y tient : production, tournée & diffusion, accompagnement, pédagogie." data-es="Las creaciones de STOPERA!, según el papel que desempeña: producción, gira, acompañamiento, pedagogía." data-en="STOPERA!'s works, read by the role it plays: production, touring, support, education." data-zh="STOPERA! 的作品，按其所担角色阅读：制作、巡演、陪伴、教育。" data-it="Le creazioni di STOPERA!, lette secondo il ruolo che vi ricopre: produzione, tournée & distribuzione, accompagnamento, pedagogia."></p>
      <div class="mode-legend">
        <span class="mode-legend-item"><span class="mode-dot" style="background:#1e2126"></span><span data-fr="Production" data-es="Producción" data-en="Production" data-zh="制作" data-it="Produzione"></span></span>
        <span class="mode-legend-item"><span class="mode-dot" style="background:#184c63"></span><span data-fr="Tournée & diffusion" data-es="Gira & difusión" data-en="Touring & diffusion" data-zh="巡演与推广" data-it="Tournée & distribuzione"></span></span>
        <span class="mode-legend-item"><span class="mode-dot" style="background:#7c826b"></span><span data-fr="Accompagnement" data-es="Acompañamiento" data-en="Support" data-zh="陪伴" data-it="Accompagnamento"></span></span>
        <span class="mode-legend-item"><span class="mode-dot" style="background:#b46a39"></span><span data-fr="Pédagogie & transmission" data-es="Pedagogía & transmisión" data-en="Education & transmission" data-zh="教育与传承" data-it="Pedagogia & trasmissione"></span></span>
      </div>
      <div id="grid-season" class="season-grid"></div>
      <p class="more-link"><a href="../parcours/" data-fr="Explorer par parcours →" data-es="Explorar por recorridos →" data-en="Explore by thread →" data-zh="按主题浏览 →" data-it="Esplora per percorsi →"></a></p>
    </section>`;
var SOUTENIR_BODY = `    <section class="section">
      <div class="section-head-row"><div class="col-label"><span class="index"></span><span class="eyebrow" data-fr="Soutenir" data-es="Apoyar" data-en="Support" data-zh="支持" data-it="Sostenere"></span></div><h2 class="lead" style="margin:0" data-fr="Soutenir & coopérer" data-es="Apoyar & cooperar" data-en="Support & cooperate" data-zh="支持与合作" data-it="Sostenere & cooperare"></h2></div>
      <p class="section-note" data-fr="STOPERA! est une compagnie et un collectif de recherche : chaque soutien rend possible la création et la transmission." data-es="STOPERA! es una compañía y un colectivo de investigación: cada apoyo hace posible la creación y la transmisión." data-en="STOPERA! is a company and a research collective: every form of support makes creation and transmission possible." data-zh="STOPERA! 是一家剧团，也是一个研究团体：每一份支持都让创作与传承成为可能。" data-it="STOPERA! è una compagnia e un collettivo di ricerca: ogni sostegno rende possibile la creazione e la trasmissione."></p>
      <ul class="join-grid">
        <li class="join-card"><h4 data-fr="Coproduire une création" data-es="Coproducir una creación" data-en="Co-produce a work" data-zh="联合制作" data-it="Coprodurre una creazione"></h4><p data-fr="Scènes, opéras, festivals : coproduisez et diffusez une œuvre, en France et à l'international." data-es="Escenas, óperas, festivales: coproduzcan y difundan una obra." data-en="Stages, opera houses, festivals: co-produce and tour a work." data-zh="舞台、歌剧院、艺术节：联合制作并巡演作品。" data-it="Teatri, opere, festival: coproducete e distribuite un'opera, in Francia e all'estero."></p><a class="join-cta" href="mailto:info@stopera.art?subject=Coproduction"><span data-fr="Coproduire" data-es="Coproducir" data-en="Co-produce" data-zh="联合制作" data-it="Coprodurre"></span> →</a></li>
        <li class="join-card"><h4 data-fr="Accueillir une résidence" data-es="Acoger una residencia" data-en="Host a residency" data-zh="接待驻地" data-it="Ospitare una residenza"></h4><p data-fr="Lieux, CNCM, théâtres : accueillez une résidence de recherche ou de création." data-es="Lugares, CNCM, teatros: acojan una residencia de investigación o creación." data-en="Venues, CNCM, theatres: host a research or creation residency." data-zh="场馆、CNCM、剧院：接待研究或创作驻地。" data-it="Spazi, CNCM, teatri: ospitate una residenza di ricerca o di creazione."></p><a class="join-cta" href="mailto:info@stopera.art?subject=R%C3%A9sidence"><span data-fr="Proposer un lieu" data-es="Proponer un lugar" data-en="Offer a venue" data-zh="提供场地" data-it="Proporre uno spazio"></span> →</a></li>
        <li class="join-card"><h4 data-fr="Devenir partenaire structurel" data-es="Ser socio estructural" data-en="Become a structural partner" data-zh="成为结构性伙伴" data-it="Diventare partner strutturale"></h4><p data-fr="Institutions publiques, collectivités : conventionnez et soutenez la plateforme dans la durée." data-es="Instituciones públicas: convenien y apoyen la plataforma a largo plazo." data-en="Public institutions: partner and support the platform over time." data-zh="公共机构：签订协议，长期支持平台。" data-it="Istituzioni pubbliche, enti locali: convenzionate e sostenete la piattaforma nel tempo."></p><a class="join-cta" href="mailto:info@stopera.art?subject=Partenariat%20structurel"><span data-fr="Nous rencontrer" data-es="Reunirse" data-en="Meet us" data-zh="洽谈" data-it="Incontrarci"></span> →</a></li>
        <li class="join-card"><h4 data-fr="Collaboration de recherche" data-es="Colaboración de investigación" data-en="Research collaboration" data-zh="研究合作" data-it="Collaborazione di ricerca"></h4><p data-fr="Universités, centres de recherche : engagez une collaboration avec le laboratoire." data-es="Universidades, centros de investigación: colaboren con el laboratorio." data-en="Universities, research centres: collaborate with the laboratory." data-zh="高校、研究中心：与实验室开展合作。" data-it="Università, centri di ricerca: avviate una collaborazione con il laboratorio."></p><a class="join-cta" href="mailto:info@stopera.art?subject=Recherche"><span data-fr="Collaborer" data-es="Colaborar" data-en="Collaborate" data-zh="合作" data-it="Collaborare"></span> →</a></li>
        <li class="join-card"><h4 data-fr="Mécénat & commande" data-es="Mecenazgo & encargo" data-en="Patronage & commission" data-zh="赞助与委约" data-it="Mecenatismo & commissione"></h4><p data-fr="Mécènes, fondations : soutenez le laboratoire ou financez une commande d'œuvre." data-es="Mecenas, fundaciones: apoyen el laboratorio o financien un encargo." data-en="Patrons, foundations: support the lab or fund a commission." data-zh="赞助者、基金会：支持实验室或资助委约。" data-it="Mecenati, fondazioni: sostenete il laboratorio o finanziate la commissione di un'opera."></p><a class="join-cta" href="mailto:info@stopera.art?subject=M%C3%A9c%C3%A9nat"><span data-fr="Soutenir" data-es="Apoyar" data-en="Support" data-zh="支持" data-it="Sostenere"></span> →</a></li>
        <li class="join-card"><h4 data-fr="Candidater au laboratoire" data-es="Postular al laboratorio" data-en="Apply to the lab" data-zh="申请实验室" data-it="Candidarsi al laboratorio"></h4><p data-fr="Artistes émergent·es de toutes disciplines : rejoignez une édition de LIPS." data-es="Artistas emergentes de todas las disciplinas: únanse a una edición de LIPS." data-en="Emerging artists of all disciplines: join a LIPS edition." data-zh="各学科的新锐艺术家：加入 LIPS 的一届。" data-it="Artisti emergenti di tutte le discipline: unitevi a un'edizione di LIPS."></p><a class="join-cta" href="mailto:info@stopera.art?subject=Candidature%20LIPS"><span data-fr="Candidater" data-es="Postular" data-en="Apply" data-zh="申请" data-it="Candidarsi"></span> →</a></li>
      </ul>
      <div id="contact" class="join-contact">
        <h3 class="join-contact-title" data-fr="Nous écrire" data-es="Escríbanos" data-en="Get in touch" data-zh="联系我们" data-it="Scriverci"></h3>
        <p class="section-note" data-fr="Coproduction, diffusion, partenariat, résidence, recherche — un seul contact :" data-es="Coproducción, difusión, colaboración, residencia, investigación — un solo contacto:" data-en="Coproduction, touring, partnership, residency, research — a single contact:" data-zh="联合制作、巡演、合作、驻地、研究——统一联系：" data-it="Coproduzione, distribuzione, partenariato, residenza, ricerca — un solo contatto:"></p>
        <p class="contact-big"><a href="mailto:info@stopera.art">info@stopera.art</a></p>
        <p class="contact-line"><span data-fr="Siège : " data-es="Sede: " data-en="Office: " data-zh="地址：" data-it="Sede: "></span>8 rue Victor Hugo, 94250 Gentilly (Val-de-Marne), France</p>
      </div>
    </section>`;
urls.push(SITE + "/oeuvres/");
write("oeuvres", page({ rel: "../", title: {"fr": "Œuvres", "es": "Obras", "en": "Works", "zh": "作品", "it": "Opere"}, description: {"fr": "Le catalogue des créations de STOPERA! — opéra, théâtre musical, performance — par rôle : production, tournée, accompagnement, pédagogie.", "es": "El catálogo de creaciones de STOPERA! — ópera, teatro musical, performance — por rol: producción, gira, acompañamiento, pedagogía.", "en": "The catalogue of STOPERA! works — opera, music theatre, performance — by role: production, touring, support, teaching.", "zh": "STOPERA! 作品目录——歌剧、音乐剧场、表演——按角色划分：制作、巡演、陪伴、教学。", "it": "Il catalogo delle creazioni di STOPERA! — opera, teatro musicale, performance — per ruolo: produzione, tournée, accompagnamento, pedagogia."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/oeuvres/", ogType: "website", body: OEUVRES_BODY }));
urls.push(SITE + "/soutenir/");
write("soutenir", page({ rel: "../", title: {"fr": "Soutenir", "es": "Apoyar", "en": "Support", "zh": "支持", "it": "Sostenere"}, description: {"fr": "Soutenir STOPERA! — coproduction, résidence, partenariat structurel, recherche, mécénat, laboratoire. Contact et modalités.", "es": "Apoyar a STOPERA! — coproducción, residencia, colaboración estructural, investigación, mecenazgo, laboratorio. Contacto y modalidades.", "en": "Support STOPERA! — co-production, residency, structural partnership, research, patronage, laboratory. Contact and terms.", "zh": "支持 STOPERA!——联合制作、驻地、结构性伙伴关系、研究、赞助、实验室。联络方式与条件。", "it": "Sostenere STOPERA! — coproduzione, residenza, partenariato strutturale, ricerca, mecenatismo, laboratorio. Contatti e modalità."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/soutenir/", ogType: "website", body: SOUTENIR_BODY }));
var LABO_BODY = fs.readFileSync(path.join(__dirname, "partials/laboratoire.html"), "utf8");
var RESEAU_BODY = fs.readFileSync(path.join(__dirname, "partials/reseau.html"), "utf8");
write("laboratoire", page({ rel: "../", title: {"fr": "Laboratoire", "es": "Laboratorio", "en": "Laboratory", "zh": "实验室", "it": "Laboratorio"}, description: {"fr": "Le laboratoire de STOPERA! — recherche artistique et LIPS : nouvelles écritures, voix, image, technologies, temps réel et transmission.", "es": "El laboratorio de STOPERA! — investigación artística y LIPS: nuevas escrituras, voz, imagen, tecnologías, tiempo real y transmisión.", "en": "The STOPERA! laboratory — artistic research and LIPS: new forms of writing, voice, image, technology, real time and transmission.", "zh": "STOPERA! 实验室——艺术研究与 LIPS：新的书写、人声、影像、技术、实时与传承。", "it": "Il laboratorio di STOPERA! — ricerca artistica e LIPS: nuove scritture, voce, immagine, tecnologie, tempo reale e trasmissione."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/laboratoire/", ogType: "website", body: LABO_BODY }));
write("reseau", page({ rel: "../", title: {"fr": "Réseau", "es": "Red", "en": "Network", "zh": "网络", "it": "Rete"}, description: {"fr": "Le réseau de STOPERA! — artistes associé·e·s, gouvernance, institutions partenaires, réseaux et mécénat, en France et à l'international.", "es": "La red de STOPERA! — artistas asociados, gobernanza, instituciones socias, redes y mecenazgo, en Francia y en el extranjero.", "en": "The STOPERA! network — associate artists, governance, partner institutions, networks and patronage, in France and abroad.", "zh": "STOPERA! 的网络——合作艺术家、治理架构、伙伴机构、网络与赞助，遍及法国与国际。", "it": "La rete di STOPERA! — artisti associati, governance, istituzioni partner, reti e mecenatismo, in Francia e all'estero."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/reseau/", ogType: "website", body: RESEAU_BODY }));
var POURQUOI_BODY = fs.readFileSync(path.join(__dirname, "partials/pourquoi.html"), "utf8");
write("pourquoi", page({ rel: "../", title: {"fr": "Pourquoi", "es": "Por qué", "en": "Why", "zh": "为何", "it": "Perché"}, description: {"fr": "Pourquoi STOPERA! — le monde des formes scéniques se transforme ; STOPERA! rassemble artistes, chercheurs, institutions et publics autour d'une question commune, et fait de l'arrêt un espace de recherche et de création.", "es": "Por qué STOPERA! — el mundo de las formas escénicas se transforma; STOPERA! reúne a artistas, investigadores, instituciones y públicos en torno a una pregunta común, y hace de la detención un espacio de investigación y creación.", "en": "Why STOPERA! — the world of stage forms is changing; STOPERA! gathers artists, researchers, institutions and audiences around a shared question, and turns the stop into a space for research and creation.", "zh": "为何是 STOPERA!——舞台形式的世界正在变化；STOPERA! 让艺术家、研究者、机构与观众围绕一个共同的问题相聚，并将「停顿」化为研究与创作的空间。", "it": "Perché STOPERA! — il mondo delle forme sceniche si trasforma; STOPERA! riunisce artisti, ricercatori, istituzioni e pubblico intorno a una domanda comune, e fa della sosta uno spazio di ricerca e di creazione."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/pourquoi/", ogType: "website", body: POURQUOI_BODY }));

urls.push(SITE + "/cooperation/");
/* press */
write("presse", page({ rel: "../", title: {"fr": "Revue de presse", "es": "Prensa", "en": "Press", "zh": "媒体报道", "it": "Rassegna stampa"}, description: {"fr": "La revue de presse de STOPERA! — articles et critiques autour d'Otages, OOO et Snow on Her Lips, et la liste des médias.", "es": "La prensa de STOPERA! — artículos y críticas sobre Otages, OOO y Snow on Her Lips, y la lista de medios.", "en": "STOPERA! in the press — articles and reviews of Otages, OOO and Snow on Her Lips, with the list of outlets.", "zh": "STOPERA! 媒体报道——关于 Otages、OOO 与 Snow on Her Lips 的文章与评论，以及媒体名录。", "it": "La rassegna stampa di STOPERA! — articoli e recensioni su Otages, OOO e Snow on Her Lips, e l'elenco delle testate."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/presse/", ogType: "website", body: pressBody("../") }));
urls.push(SITE + "/presse/");
/* transmission */
write("transmission", page({ rel: "../", title: {"fr": "Transmission", "es": "Transmisión", "en": "Transmission", "zh": "传承", "it": "Trasmissione"}, description: {"fr": "La transmission chez STOPERA! — chaque production présentée sous l'angle de ce qui peut se partager, s'apprendre et se transmettre : ateliers, rencontres, mentorat, médiation.", "es": "La transmisión en STOPERA! — cada producción presentada desde lo que puede compartirse, aprenderse y transmitirse: talleres, encuentros, mentoría, mediación.", "en": "Transmission at STOPERA! — every production seen through what can be shared, learned and passed on: workshops, encounters, mentoring, mediation.", "zh": "STOPERA! 的传承——从可分享、可学习、可传递之物出发呈现每一部作品：工作坊、相遇、师徒指导、导赏。", "it": "La trasmissione in STOPERA! — ogni produzione presentata sotto il profilo di ciò che si può condividere, imparare e trasmettere: laboratori, incontri, mentorato, mediazione."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/transmission/", ogType: "website", body: transmissionBody("../") }));
urls.push(SITE + "/transmission/");
/* mentions légales */
write("mentions-legales", page({ rel: "../", title: {"fr": "Mentions légales", "es": "Aviso legal", "en": "Legal notice", "zh": "法律声明", "it": "Note legali"}, description: {"fr": "Mentions légales et politique de confidentialité de STOPERA! — éditeur, hébergement, propriété intellectuelle, RGPD et cookies.", "es": "Aviso legal y política de privacidad de STOPERA! — editor, alojamiento, propiedad intelectual, RGPD y cookies.", "en": "Legal notice and privacy policy of STOPERA! — publisher, hosting, intellectual property, GDPR and cookies.", "zh": "STOPERA! 法律声明与隐私政策——出版方、托管、知识产权、GDPR 与 Cookie。", "it": "Note legali e politica sulla privacy di STOPERA! — editore, hosting, proprietà intellettuale, GDPR e cookie."}, image: SITE + "/assets/og-share.jpg?v=1", url: SITE + "/mentions-legales/", ogType: "website", body: legalBody("../") }));
urls.push(SITE + "/mentions-legales/");
/* page 404 (auto-servie par GitHub Pages) */
fs.writeFileSync(path.join(DOCS, "404.html"),
  '<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<meta name="robots" content="noindex" />\n<title>Page introuvable — STOPERA!</title>\n'
  + '<style>html,body{margin:0;height:100%}body{background:#faf8f4;color:#14110f;font-family:Archivo,system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem}.x{max-width:30rem}.x img{height:30px;width:auto;margin-bottom:2rem}.x p.code{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#ff2f8f;margin:0 0 .8rem}.x h1{font-size:1.6rem;font-weight:700;margin:0 0 1rem}.x p{color:#6f685f;line-height:1.6}.x a.btn{display:inline-block;margin-top:1.4rem;background:#0d0d0f;color:#fff;text-decoration:none;padding:.7rem 1.3rem;border-radius:2px;font-weight:600;font-size:.9rem}</style>\n'
  + '</head>\n<body>\n<div class="x">\n<img src="' + SITE + '/assets/logo-dark.png" alt="STOPERA!" />\n<p class="code">Erreur 404</p>\n<h1>Cette page n\'existe pas (ou plus).</h1>\n<p>La page que vous cherchez est introuvable. Elle a peut-être été déplacée.</p>\n<a class="btn" href="' + SITE + '/">Retour à l\'accueil →</a>\n</div>\n  <!-- Cloudflare Web Analytics --><script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "f3dca4355e1c4362b402b3fa96218469"}\'></script><!-- End Cloudflare Web Analytics -->\n</body>\n</html>\n');
/* snippet carte pour l'accueil (rel = "") */
fs.writeFileSync("/tmp/coop_home.html", coopMap("") + "\n      " + COOP_SCRIPT);

/* ---- AXES DE RECHERCHE (pages dédiées + prods dérivées) ---- */
var AXES = [
  { slug:"corps-voix",
    title:{fr:"Corps & voix",es:"Cuerpo & voz",en:"Body & voice",zh:"身体与人声", it: "Corpo & voce"},
    intro:{fr:"L'incarnation au cœur du plateau : comment la voix, le geste et le corps deviennent présence. STOPERA! explore les dramaturgies vocales, l'écriture performative et la présence scénique — du solo à l'ensemble.",
           es:"La encarnación en el centro de la escena: cómo la voz, el gesto y el cuerpo se vuelven presencia. STOPERA! explora las dramaturgias vocales, la escritura performativa y la presencia escénica — del solo al ensemble.",
           en:"Embodiment at the heart of the stage: how voice, gesture and body become presence. STOPERA! explores vocal dramaturgies, performative writing and stage presence — from the solo to the ensemble.",
           zh:"身体化居于舞台核心：人声、动作与身体如何成为在场。STOPERA! 探索人声戏剧构作、表演性书写与舞台在场——从独角到群体。", it: "L'incarnazione al centro della scena: come la voce, il gesto e il corpo diventano presenza. STOPERA! esplora le drammaturgie vocali, la scrittura performativa e la presenza scenica — dall'assolo all'ensemble."},
    items:["rut","snow-on-her-lips","fame","insistir"] },
  { slug:"technologies-creation",
    title:{fr:"Technologies & création",es:"Tecnologías & creación",en:"Technologies & creation",zh:"技术与创作", it: "Tecnologie & creazione"},
    intro:{fr:"La technologie comme matière artistique, jamais comme fin : intelligence artificielle, image générée, électronique en temps réel et systèmes interactifs — des outils mis à l'épreuve du plateau, du geste et de l'écoute.",
           es:"La tecnología como materia artística, nunca como fin: inteligencia artificial, imagen generada, electrónica en tiempo real y sistemas interactivos — herramientas puestas a prueba en la escena, el gesto y la escucha.",
           en:"Technology as artistic material, never as an end: artificial intelligence, generated image, real-time electronics and interactive systems — tools tested on stage, in gesture and listening.",
           zh:"技术作为艺术素材，而非目的：人工智能、生成影像、实时电子与互动系统——在舞台、动作与聆听中接受检验的工具。", it: "La tecnologia come materia artistica, mai come fine: intelligenza artificiale, immagine generata, elettronica in tempo reale e sistemi interattivi — strumenti messi alla prova della scena, del gesto e dell'ascolto."},
    items:["ooo","rut"] },
  { slug:"nouvelles-narrations",
    title:{fr:"Nouvelles narrations",es:"Nuevas narrativas",en:"New narratives",zh:"新叙事", it: "Nuove narrazioni"},
    intro:{fr:"Raconter autrement : récits fragmentés, formes documentaires, dramaturgies spéculatives et écritures interdisciplinaires. La parole et le texte y deviennent matière musicale, de Christine Angot à Nina Bouraoui.",
           es:"Contar de otro modo: relatos fragmentados, formas documentales, dramaturgias especulativas y escrituras interdisciplinarias. La palabra y el texto se vuelven materia musical, de Christine Angot a Nina Bouraoui.",
           en:"Telling otherwise: fragmented narratives, documentary forms, speculative dramaturgies and interdisciplinary writing. Word and text become musical material, from Christine Angot to Nina Bouraoui.",
           zh:"以另一种方式叙述：碎片化叙事、纪实形式、思辨戏剧构作与跨学科书写。言语与文本成为音乐素材，从 Christine Angot 到 Nina Bouraoui。", it: "Raccontare altrimenti: racconti frammentati, forme documentarie, drammaturgie speculative e scritture interdisciplinari. La parola e il testo vi diventano materia musicale, da Christine Angot a Nina Bouraoui."},
    items:["america","otages","nous","war-madrigals"] },
  { slug:"nouveaux-formats",
    title:{fr:"Nouveaux formats",es:"Nuevos formatos",en:"New formats",zh:"新形式", it: "Nuovi formati"},
    intro:{fr:"Inventer la forme : opéra-film, environnements immersifs, installations performatives, formes scéniques hybrides et projets in situ. L'œuvre déborde le cadre du spectacle pour devenir expérience.",
           es:"Inventar la forma: ópera-film, entornos inmersivos, instalaciones performativas, formas escénicas híbridas y proyectos in situ. La obra desborda el marco del espectáculo para volverse experiencia.",
           en:"Inventing form: film-opera, immersive environments, performative installations, hybrid stage forms and site-specific projects. The work overflows the frame of the show to become experience.",
           zh:"发明形式：影像歌剧、沉浸式环境、表演性装置、混合舞台形式与在地项目。作品溢出演出的框架，成为体验。", it: "Inventare la forma: opera-film, ambienti immersivi, installazioni performative, forme sceniche ibride e progetti in situ. L'opera eccede la cornice dello spettacolo per diventare esperienza."},
    items:["ooo","snow-on-her-lips","insistir"] }
];
function rechBody(a, rel){
  var tiles = a.items.filter(function(s){return bySlug[s];}).map(function(s){ return threadTile(s, rel); }).join("\n        ");
  return '    <section class="section pd-page">\n'
    + '      <p class="pd-eyebrow"><a href="'+rel+'index.html#recherche" data-fr="← Recherche" data-es="← Investigación" data-en="← Research" data-zh="← 研究" data-it="← Ricerca"></a></p>\n'
    + '      <h1 class="pd-title pd-title--page" '+ml(a.title)+'></h1>\n'
    + '      <p class="pd-pitch" '+ml(a.intro)+'></p>\n'
    + '      <ul class="projects thread-grid">\n        '+tiles+'\n      </ul>\n'
    + '      <p class="more-link"><a href="'+rel+'lips/" data-fr="→ Le laboratoire de recherche LIPS" data-es="→ El laboratorio de investigación LIPS" data-en="→ The LIPS research laboratory" data-zh="→ LIPS 研究工作坊" data-it="→ Il laboratorio di ricerca LIPS"></a></p>\n'
    + '    </section>';
}
AXES.forEach(function(a){
  var url = SITE + "/recherche/" + a.slug + "/";
  var jsonld = JSON.stringify({ "@context":"https://schema.org","@type":"CollectionPage", name: plain(a.title)+" — STOPERA!", description: plain(a.intro), url: url });
  write("recherche/"+a.slug, page({ rel:"../../", title: a.title, description: a.intro, image: SITE+"/assets/og-cover.jpg", ogType:"website", jsonld: jsonld, body: rechBody(a, "../../") }));
  urls.push(url);
});



/* `bake` ne sait que REMPLIR un element vide : c'est ce dont ont besoin les
   pages generees. L'accueil, lui, est ecrit a la main avec son texte
   francais deja en place — il faut donc REMPLACER ce texte, pas l'ajouter.
   On ne touche qu'aux elements feuilles : si le contenu renferme une balise
   de meme nom, on passe, plutot que de risquer une imbrication mal fermee. */

/* ---- page d'accueil : miroirs de langue ------------------------------
   docs/index.html est ecrite a la main — build.js ne la genere pas. Mais
   elle est la page la plus partagee du site : sans miroir, un lien vers
   l'accueil s'affiche toujours en francais, quelle que soit la langue
   choisie par le visiteur. On la recopie donc sous /es/, /en/ et /zh/ en
   n'y changeant que ce qui doit l'etre : la langue declaree, les
   metadonnees de partage, les alternates, et la profondeur des liens
   relatifs — d'un cran, puisque la copie descend d'un dossier. */
var HOME_META = {
  title: { fr: "STOPERA! — Sonic Theatre Opera Performance",
           es: "STOPERA! — Sonic Theatre Opera Performance",
           en: "STOPERA! — Sonic Theatre Opera Performance",
           zh: "STOPERA! — Sonic Theatre Opera Performance", it: "STOPERA! — Sonic Theatre Opera Performance" },
  ogTitle: {
    fr: "STOPERA! — une plateforme pour les formes scéniques de notre temps",
    es: "STOPERA! — una plataforma para las formas escénicas de nuestro tiempo",
    en: "STOPERA! — a platform for the stage forms of our time",
    zh: "STOPERA! —— 一个面向当代舞台形式的平台", it: "STOPERA! — una piattaforma per le forme sceniche del nostro tempo" },
  ogDesc: {
    fr: "Un espace international de création, de production, de recherche artistique et de transmission — où la voix, le corps et le son deviennent présence. Direction : Sebastian Rivas. Président d'honneur : Georges Aperghis.",
    es: "Un espacio internacional de creación, producción, investigación artística y transmisión — donde la voz, el cuerpo y el sonido se vuelven presencia. Dirección: Sebastian Rivas. Presidente de honor: Georges Aperghis.",
    en: "An international space for creation, production, artistic research and transmission — where voice, body and sound become presence. Director: Sebastian Rivas. Honorary President: Georges Aperghis.",
    zh: "一个用于创作、制作、艺术研究与传承的国际空间——让人声、身体与声音成为在场。艺术指导：Sebastian Rivas。名誉主席：Georges Aperghis。", it: "Uno spazio internazionale di creazione, produzione, ricerca artistica e trasmissione — dove la voce, il corpo e il suono diventano presenza. Direzione: Sebastian Rivas. Presidente onorario: Georges Aperghis." }
};

(function homeMirrors() {
  var home = fs.readFileSync(path.join(DOCS, "index.html"), "utf8");
  var desc = home.match(/<meta name="description"[\s\S]*?\/>/);
  if (!desc) throw new Error("index.html : meta description introuvable");
  var descML = {};
  LANGS.forEach(function (l) {
    var m = desc[0].match(new RegExp('data-' + l + '="([^"]*)"'));
    if (!m) throw new Error("index.html : data-" + l + " manquant sur la description");
    descML[l] = m[1];
  });

  LANGS.forEach(function (lang) {
    var h = home;

    /* Aucun chemin a reecrire : les ressources de l'accueil sont en absolu,
       donc elles ne suivent pas le prefixe de langue, et les liens de
       contenu sont relatifs, donc ils le suivent. Prefixer ces derniers
       de "../" les renvoyait vers les pages francaises depuis /en/. */

    h = h.replace(/\?v=\d{8}[A-Z]/g, "?v=20260805A");
    h = h.replace('<html lang="fr">', '<html lang="' + lang + '">');
    h = h.replace(/<body([^>]*)data-lang="fr"/, '<body$1data-lang="' + lang + '"');
    if (h.indexOf('data-lang="' + lang + '"') < 0) {
      h = h.replace(/<body([^>]*)>/, '<body$1 data-lang="' + lang + '">');
    }
    h = h.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(tL(HOME_META.title, lang)) + "</title>");
    h = h.replace(/(<meta name="description" content=")[^"]*/, "$1" + esc(descML[lang]));
    h = h.replace(/(<link rel="canonical" href=")[^"]*"/, "$1" + langUrl("", lang) + '"');
    h = h.replace(/(<meta property="og:url" content=")[^"]*"/, "$1" + langUrl("", lang) + '"');
    h = h.replace(/(<meta property="og:title" content=")[^"]*"/, "$1" + esc(tL(HOME_META.ogTitle, lang)) + '"');
    h = h.replace(/(<meta name="twitter:title" content=")[^"]*"/, "$1" + esc(tL(HOME_META.ogTitle, lang)) + '"');
    h = h.replace(/(<meta property="og:description" content=")[^"]*"/, "$1" + esc(tL(HOME_META.ogDesc, lang)) + '"');
    if (h.indexOf('name="twitter:description"') < 0) {
      h = h.replace('<meta name="twitter:card"',
        '<meta name="twitter:description" content="' + esc(tL(HOME_META.ogDesc, lang)) + '" />\n  <meta name="twitter:card"');
    } else {
      h = h.replace(/(<meta name="twitter:description" content=")[^"]*"/, "$1" + esc(tL(HOME_META.ogDesc, lang)) + '"');
    }
    h = h.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, "");
    h = h.replace('<meta name="theme-color"', alternates("").trim() + '\n  <meta name="theme-color"');
    /* h vient de docs/index.html, que cette meme fonction reecrit pour le
       francais (dir === DOCS plus bas) : sans ce nettoyage, chaque execution
       relit le bloc og:locale deja insere par la precedente et en rajoute un
       de plus a la suite — duplication qui s'accumule d'un build a l'autre. */
    h = h.replace(/(<meta property="og:type"[^>]*\/>)(?:\s*<meta property="og:locale(?::alternate)?" content="[^"]*" \/>)*/,
      "$1");
    h = h.replace(/(<meta property="og:type"[^>]*\/>)/,
      '$1\n  <meta property="og:locale" content="' + OG_LOCALE[lang] + '" />'
      + LANGS.filter(function (l) { return l !== lang; }).map(function (l) {
          return '\n  <meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '" />'; }).join(""));

    h = retext(h, lang);
    var dir = lang === "fr" ? DOCS : path.join(DOCS, lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), h);
  });
  console.log("accueil : " + LANGS.length + " langues");
})();

/* sitemap */
/* Le sitemap declare les quatre langues de chaque page, et les relie entre
   elles par xhtml:link. Sans ces liens, Google traite /en/ comme un contenu
   distinct — voire duplique — au lieu d'une traduction de la page francaise,
   et continue de servir le francais a un lecteur anglophone. */
var smPages = [""].concat(pages).filter(function (v, i, a) { return a.indexOf(v) === i; });
var sm = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
  + smPages.map(function (pg) {
      var links = LANGS.map(function (l) {
        return '    <xhtml:link rel="alternate" hreflang="' + (l === "zh" ? "zh-Hans" : l) + '" href="' + langUrl(pg, l) + '"/>\n';
      }).join("") + '    <xhtml:link rel="alternate" hreflang="x-default" href="' + langUrl(pg, "fr") + '"/>\n';
      return LANGS.map(function (l) {
        return "  <url>\n    <loc>" + langUrl(pg, l) + "</loc>\n" + links + "  </url>";
      }).join("\n");
    }).join("\n") + "\n</urlset>\n";
fs.writeFileSync(path.join(DOCS, "sitemap.xml"), sm);

console.log("generated " + smPages.length + " pages × " + LANGS.length + " langues = "
  + smPages.length * LANGS.length + " urls");
