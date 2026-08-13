/* MAMMA ROMA : LE CETC EST COPRODUCTEUR, ET LE SITE NE LE DISAIT PAS.
   Confirmé par la direction artistique le 12/08/2026.

   La fiche portait « Lieu : CETC — Teatro Colón » et, sous Partenariats,
   « Création à Buenos Aires, en dialogue avec la scène lyrique argentine ».
   Un lieu n'est pas un coproducteur, et « en dialogue avec » ne dit rien :
   une coproduction est un engagement, elle se nomme.

   La mention entre donc dans les informations de la fiche, à sa place —
   entre le lieu et la date — et la phrase de territoire cesse de tourner
   autour.

   Le nom du CETC ne se traduit pas ; seul l'intitulé « Coproduction » suit
   la langue. Le logo, lui, n'est pas là : il viendra du partenaire avec ses
   règles d'usage, et rien ne sera dessiné à sa place.

   Run: node outils/coproduction.js [--verifier]                             */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

var LABEL = {
  fr: "Coproduction", en: "Co-production", es: "Coproducción",
  it: "Coproduzione", zh: "联合制作", de: "Koproduktion"
};
var NOM = "CETC — Teatro Colón (Buenos Aires)";

/* la phrase de territoire, qui disait le flou */
var TERRITOIRE = {
  fr: ["Création à Buenos Aires, en dialogue avec la scène lyrique argentine.",
       "Coproduction avec le CETC — Teatro Colón, où l'œuvre sera créée."],
  en: ["Created in Buenos Aires, in dialogue with the Argentine opera scene.",
       "Co-produced with the CETC — Teatro Colón, where the work will premiere."],
  es: ["Creación en Buenos Aires, en diálogo con la escena lírica argentina.",
       "Coproducción con el CETC — Teatro Colón, donde la obra se estrenará."],
  it: ["Creazione a Buenos Aires, in dialogo con la scena lirica argentina.",
       "Coproduzione con il CETC — Teatro Colón, dove l'opera sarà creata."],
  zh: ["在布宜诺斯艾利斯首演，与阿根廷歌剧界对话。",
       "与 CETC — 科隆剧院联合制作，作品将在此首演。"],
  de: ["Uraufführung in Buenos Aires, im Dialog mit der argentinischen Opernszene.",
       "Koproduktion mit dem CETC — Teatro Colón, wo das Werk uraufgeführt wird."]
};

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function attr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Le site porte DEUX vocabulaires de balisage pour la même liste de faits :
   les fiches composées écrivent <dl><dt>/<dd>, celles reprises de l'ancien
   site écrivent <ul class="facts"><li><span class="k">/<span class="v">.
   Sur Mamma Roma, le français et l'allemand sont dans le premier, l'anglais,
   l'espagnol, l'italien et le chinois dans le second. Poser la mention dans
   un seul des deux la laissait absente de quatre langues sur six. */
var MEM_LAB = LANGS.map(function (l) { return ' data-' + l + '="' + attr(LABEL[l]) + '"'; }).join("");
function paire(lang, facts) {
  return facts
    ? '<li><span class="k"' + MEM_LAB + ">" + LABEL[lang] + '</span><span class="v">' + NOM + "</span></li>"
    : "<dt" + MEM_LAB + ">" + LABEL[lang] + "</dt><dd>" + NOM + "</dd>";
}

/* La brève d'actualité disait « le CETC, qui en assure la production » —
   ce qui n'est pas une coproduction mais une production déléguée. Deux
   phrases du site se contredisaient sur le même fait. */
var BREVE = {
  fr: ["Création au Centro de Experimentación del Teatro Colón (CETC), qui en assure la production.",
       "Coproduction STOPERA! et Centro de Experimentación del Teatro Colón (CETC), où l'œuvre est créée."],
  en: ["Premiered at the Centro de Experimentación del Teatro Colón (CETC), which produces it.",
       "Co-produced by STOPERA! and the Centro de Experimentación del Teatro Colón (CETC), where it premieres."],
  es: ["Estreno en el Centro de Experimentación del Teatro Colón (CETC), que asegura su producción.",
       "Coproducción de STOPERA! y el Centro de Experimentación del Teatro Colón (CETC), donde se estrena."],
  it: ["Prima al Centro de Experimentación del Teatro Colón (CETC), che ne assicura la produzione.",
       "Coproduzione STOPERA! e Centro de Experimentación del Teatro Colón (CETC), dove l'opera è creata."],
  zh: ["于科隆剧院实验中心（CETC）首演并由其制作。",
       "由 STOPERA! 与科隆剧院实验中心（CETC）联合制作，并在此首演。"],
  de: ["Uraufführung am Centro de Experimentación del Teatro Colón (CETC), das die Produktion trägt.",
       "Koproduktion von STOPERA! und dem Centro de Experimentación del Teatro Colón (CETC), wo das Werk uraufgeführt wird."]
};

var posées = 0, phrases = 0, breves = 0, touchées = 0, manquantes = [];

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, path.dirname(f)).split(path.sep).join("/");
  var fiche = rel.indexOf("productions/mamma-roma") >= 0;
  var breve = rel.indexOf("news/mamma-roma-cetc") >= 0;
  if (!fiche && !breve) return;
  var lang = LANGS.indexOf(rel.split("/")[0]) > 0 ? rel.split("/")[0] : "fr";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* la coproduction se pose juste avant le lieu : qui, puis où, puis quand */
  if (fiche && h.indexOf('data-fr="Coproduction"') < 0) {
    var facts = h.indexOf('<ul class="facts">') >= 0;
    var i = facts ? h.lastIndexOf("<li>", h.indexOf('data-fr="Lieu"'))
                  : h.indexOf('<dt data-fr="Lieu"');
    if (i > 0) { h = h.slice(0, i) + paire(lang, facts) + h.slice(i); posées++; }
    else manquantes.push(path.relative(DOCS, f));
  }

  /* les deux phrases, dans la langue de la page et dans la mémoire */
  LANGS.forEach(function (l) {
    if (h.indexOf(TERRITOIRE[l][0]) >= 0) {
      h = h.split(TERRITOIRE[l][0]).join(TERRITOIRE[l][1]); phrases++;
    }
    if (h.indexOf(BREVE[l][0]) >= 0) {
      h = h.split(BREVE[l][0]).join(BREVE[l][1]); breves++;
    }
  });

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("coproduction CETC : " + posées + " mention(s) posée(s), " + phrases +
  " phrase(s) de territoire et " + breves + " phrase(s) d'actualité reprises — " +
  touchées + " page(s)");
if (manquantes.length) console.log("  point d'accroche introuvable : " + manquantes.join(", "));
