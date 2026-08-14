/* EINSTEIN À BOGOTÁ — L'ACTUALITÉ, LA CARTE, LES DATES.
   Sources : bogota.gov.co et Idartes (ville de Bogotá), relayés par Pulzo,
   consultés le 14/08/2026. Le billetterie tuboleta.com et les deux sites
   officiels sont bloqués par le proxy de cet environnement ; les faits
   proviennent donc des extraits de recherche, et deux sources indépendantes
   concordent. À corriger si la production dit autrement.

   Ce que ces sources changent au récit : ce n'est pas une tournée. La version
   de Bogotá est refaite avec un ensemble instrumental colombien et un chœur
   de seize voix, par une équipe argentine ET colombienne. L'œuvre ne voyage
   pas, elle se refabrique — ce qui est très exactement la thèse du site sur
   la coopération vers le sud.

   La Colombie n'existait pas sur la carte des coopérations. Elle y entre.
   Position calculée sur la projection de la carte, vérifiée équirectangulaire
   sur les neuf villes déjà placées : left = 0,27779 × longitude + 50 ;
   top = −0,71926 × latitude + 59,71. Bogotá (4,71 N / 74,07 O) tombe donc à
   29,43 % / 56,32 %.

   Run: node outils/bogota.js [--verifier]                                   */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

var T = {
  titre: {
    fr: "Einstein on the Beach à Bogotá",
    en: "Einstein on the Beach in Bogotá",
    es: "Einstein on the Beach en Bogotá",
    it: "Einstein on the Beach a Bogotá",
    zh: "《Einstein on the Beach》登陆波哥大",
    de: "Einstein on the Beach in Bogotá"
  },
  retour: { fr: "← Actualités", en: "← News", es: "← Actualidades", it: "← Attualità", zh: "← 动态", de: "← Aktuelles" },
  pitch: {
    fr: "La version de <strong>Martín Bauer</strong> et <strong>Léo Warynski</strong> est présentée pour la première fois à Bogotá, au Teatro Jorge Eliécer Gaitán, les 26 et 27 septembre 2026.",
    en: "The version by <strong>Martín Bauer</strong> and <strong>Léo Warynski</strong> is presented for the first time in Bogotá, at the Teatro Jorge Eliécer Gaitán, on 26 and 27 September 2026.",
    es: "La versión de <strong>Martín Bauer</strong> y <strong>Léo Warynski</strong> se presenta por primera vez en Bogotá, en el Teatro Jorge Eliécer Gaitán, el 26 y el 27 de septiembre de 2026.",
    it: "La versione di <strong>Martín Bauer</strong> e <strong>Léo Warynski</strong> è presentata per la prima volta a Bogotá, al Teatro Jorge Eliécer Gaitán, il 26 e il 27 settembre 2026.",
    zh: "由<strong>马丁·鲍尔</strong>与<strong>莱奥·瓦林斯基</strong>打造的版本将于2026年9月26日与27日首次登陆波哥大，演出于豪尔赫·埃列塞尔·盖坦剧院。",
    de: "Die Fassung von <strong>Martín Bauer</strong> und <strong>Léo Warynski</strong> wird am 26. und 27. September 2026 erstmals in Bogotá gezeigt, im Teatro Jorge Eliécer Gaitán."
  },
  corps: {
    fr: "L'œuvre ne voyage pas : elle se refait. La version présentée à Bogotá réunit une équipe créative argentine et colombienne, un ensemble instrumental colombien et un chœur de seize voix — là où la première latino-américaine, au Teatro Colón, en comptait quinze. La mise en scène est signée Martín Bauer et Rodrigo de Caso, la direction musicale Léo Warynski. Les représentations ouvrent la troisième édition du Festival No Convencional de Bogotá, organisé par Nova et Vetera en alliance avec Congo Films. STOPERA! accompagne la diffusion de la production en Europe.",
    en: "The work does not travel: it is remade. The Bogotá version brings together an Argentine and Colombian creative team, a Colombian instrumental ensemble and a choir of sixteen voices — where the Latin American premiere at the Teatro Colón had fifteen. Staging by Martín Bauer and Rodrigo de Caso, musical direction by Léo Warynski. The performances open the third edition of the Festival No Convencional de Bogotá, organised by Nova et Vetera in partnership with Congo Films. STOPERA! supports the production's touring in Europe.",
    es: "La obra no viaja: se rehace. La versión presentada en Bogotá reúne un equipo creativo argentino y colombiano, un ensamble instrumental colombiano y un coro de dieciséis voces — allí donde el estreno latinoamericano, en el Teatro Colón, contaba con quince. Dirección escénica de Martín Bauer y Rodrigo de Caso, dirección musical de Léo Warynski. Las funciones abren la tercera edición del Festival No Convencional de Bogotá, organizado por Nova et Vetera en alianza con Congo Films. STOPERA! acompaña la difusión de la producción en Europa.",
    it: "L'opera non viaggia: si rifà. La versione presentata a Bogotá riunisce un'équipe creativa argentina e colombiana, un ensemble strumentale colombiano e un coro di sedici voci — laddove la prima latinoamericana, al Teatro Colón, ne contava quindici. Regia di Martín Bauer e Rodrigo de Caso, direzione musicale di Léo Warynski. Le recite aprono la terza edizione del Festival No Convencional de Bogotá, organizzato da Nova et Vetera in alleanza con Congo Films. STOPERA! accompagna la diffusione della produzione in Europa.",
    zh: "作品不是被搬运，而是被重做。波哥大版本汇集了阿根廷与哥伦比亚的创作团队、一支哥伦比亚器乐组合以及十六人合唱团——而科隆剧院的拉丁美洲首演为十五人。导演为马丁·鲍尔与罗德里戈·德卡索，音乐总监为莱奥·瓦林斯基。演出将拉开第三届波哥大非常规艺术节的帷幕，该节由 Nova et Vetera 与 Congo Films 联合主办。STOPERA! 支持该制作在欧洲的巡演。",
    de: "Das Werk reist nicht: es wird neu gemacht. Die Bogotáer Fassung vereint ein argentinisch-kolumbianisches Kreativteam, ein kolumbianisches Instrumentalensemble und einen Chor aus sechzehn Stimmen — die lateinamerikanische Erstaufführung am Teatro Colón hatte fünfzehn. Regie: Martín Bauer und Rodrigo de Caso, musikalische Leitung: Léo Warynski. Die Aufführungen eröffnen die dritte Ausgabe des Festival No Convencional de Bogotá, veranstaltet von Nova et Vetera in Allianz mit Congo Films. STOPERA! begleitet die europäische Verbreitung der Produktion."
  },
  voir: {
    fr: "→ Voir la production", en: "→ See the production", es: "→ Ver la producción",
    it: "→ Vedi la produzione", zh: "→ 查看该制作", de: "→ Zur Produktion"
  },
  /* la ligne qui entre dans la fiche */
  k_tournee: { fr: "Prochaines dates", en: "Next dates", es: "Próximas funciones", it: "Prossime date", zh: "近期场次", de: "Nächste Termine" },
  v_tournee: {
    fr: "Teatro Jorge Eliécer Gaitán (Bogotá), 26 et 27 septembre 2026",
    en: "Teatro Jorge Eliécer Gaitán (Bogotá), 26 and 27 September 2026",
    es: "Teatro Jorge Eliécer Gaitán (Bogotá), 26 y 27 de septiembre de 2026",
    it: "Teatro Jorge Eliécer Gaitán (Bogotá), 26 e 27 settembre 2026",
    zh: "豪尔赫·埃列塞尔·盖坦剧院（波哥大），2026年9月26日与27日",
    de: "Teatro Jorge Eliécer Gaitán (Bogotá), 26. und 27. September 2026"
  },
  /* la carte */
  c_lieux: { fr: "Institutions &amp; lieux", en: "Institutions &amp; venues", es: "Instituciones &amp; espacios", it: "Istituzioni &amp; luoghi", zh: "机构与场馆", de: "Institutionen &amp; Spielstätten" },
  c_proj: { fr: "Projets", en: "Projects", es: "Proyectos", it: "Progetti", zh: "项目", de: "Projekte" }
};

function mem(t) {
  return LANGS.map(function (l) {
    return ' data-' + l + '="' + t[l].replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"';
  }).join("");
}
function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

/* ---- 1. la brève ---- */
var breves = 0;
LANGS.forEach(function (lang) {
  var modele = path.join(DOCS, lang === "fr" ? "" : lang, "news", "ooo-teatro-colon", "index.html");
  if (!fs.existsSync(modele)) return;
  var h = fs.readFileSync(modele, "utf8");
  var pre = lang === "fr" ? "/" : "/" + lang + "/";
  var corps =
    '<section class="sec " style="--sec:var(--ink)"><div class="wrap">' +
    '<div class="num" aria-hidden="true"></div><div class="body">' +
    '<p class="pd-eyebrow"><a href="' + pre + 'news/"' + mem(T.retour) + ">" + T.retour[lang] +
    '</a> · <span class="pd-tag">2026-09</span></p>' +
    '<h1 class="pd-title pd-title--page"' + mem(T.titre) + ">" + T.titre[lang] + "</h1>" +
    '<p class="pd-pitch"' + mem(T.pitch) + ">" + T.pitch[lang] + "</p>" +
    '<div class="prose"><p' + mem(T.corps) + ">" + T.corps[lang] + "</p></div>" +
    '<p style="margin-top:1.6rem"><a class="more" href="' + pre +
    'productions/einstein-on-the-beach/"' + mem(T.voir) + ">" + T.voir[lang] + "</a></p>" +
    "</div></div></section>";
  var i = h.indexOf("</nav>") + 6, j = h.indexOf("<footer");
  h = h.slice(0, i) + corps + "\n" + h.slice(j);
  h = h.replace(/<title>[^<]*<\/title>/, "<title>" + T.titre[lang].replace(/<[^>]*>/g, "") + " — STOPERA!</title>");
  h = h.replace(/<link rel="canonical"[^>]*>/, "").replace(/<link rel="alternate"[^>]*>\n?/g, "");
  var dst = path.join(DOCS, lang === "fr" ? "" : lang, "news", "einstein-bogota", "index.html");
  if (!VERIF) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, h); }
  breves++;
});

/* ---- 2. la fiche gagne ses prochaines dates, et 3. la carte gagne Bogotá ---- */
var dates = 0, spots = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  if (rel === ".") rel = "";
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var route = lang === "fr" ? rel : rel.split("/").slice(1).join("/");
  var h = fs.readFileSync(f, "utf8"), avant = h;

  if (route === "productions/einstein-on-the-beach" && h.indexOf("Jorge Eliécer") < 0) {
    var i = h.indexOf('<dt data-fr="Durée"');
    if (i > 0) {
      h = h.slice(0, i) + "<dt" + mem(T.k_tournee) + ">" + T.k_tournee[lang] + "</dt><dd" +
        mem(T.v_tournee) + ">" + T.v_tournee[lang] + "</dd>" + h.slice(i);
      dates++;
    }
  }

  if (route === "cooperation" && h.indexOf('data-city="bogota"') < 0) {
    var b = h.indexOf('<button class="spot');
    if (b > 0) {
      h = h.slice(0, b) +
        '<button class="spot spot--l" type="button" style="left:29.43%;top:56.32%" ' +
        'data-city="bogota" aria-label="Bogotá · Colombie">' +
        '<span class="spot-dot"></span><span class="spot-name">Bogotá</span>' +
        '<span class="coop-card"><p class="coop-city">Bogotá</p>' +
        '<p class="coop-k"' + mem(T.c_lieux) + ">" + T.c_lieux[lang] + "</p>" +
        '<p class="coop-v"><a href="https://www.idartes.gov.co/es/agenda/teatro-jeg" target="_blank" rel="noopener">Teatro Jorge Eliécer Gaitán</a> · Festival No Convencional</p>' +
        '<p class="coop-k"' + mem(T.c_proj) + ">" + T.c_proj[lang] + "</p>" +
        '<p class="coop-v">Einstein on the Beach · 2026</p></span></button>' + h.slice(b);
      spots++;
    }
  }

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("Bogotá : " + breves + " brève(s), " + dates + " fiche(s) datée(s), " +
  spots + " point(s) sur la carte — " + touchées + " page(s) modifiée(s)");
