/* LES GUILLEMETS ET LES ESPACES, DANS LA LANGUE DE CHACUN.
   Relevé le 11/08/2026 en relisant le chinois. Deux importations du français
   qui traversent tout le site.

   1. LES GUILLEMETS. Les citations de presse sont écrites « … » dans les six
      langues — y compris en anglais, en allemand et en chinois, où ce n'est
      pas la forme. Chaque langue a la sienne :
        fr, es, it  « … »   — les chevrons sont bien les leurs
        en, zh      “ … ”   — en chinois, en pleine chasse
        de          „ … “   — bas puis haut
      Les espaces intérieures des chevrons français ne suivent pas : les
      guillemets anglais, allemands et chinois se collent au texte.

   2. L'ESPACE DEVANT LA PONCTUATION, EN CHINOIS. Le français met une espace
      insécable devant « : » ; le chinois écrit « ： » en pleine chasse, qui
      porte déjà son blanc. L'espace importée fait un trou. Elle venait des
      &amp;nbsp; réparés hier : jusque-là elle s'affichait « &nbsp; » en
      toutes lettres, ce qui masquait le vrai problème.

   Le français, l'espagnol et l'italien ne sont pas touchés : les chevrons
   sont leur forme à tous les trois.

   Run: node outils/ponctuation.js [--verifier]                              */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;
var LANGS = ["fr", "en", "es", "it", "zh", "de"];

/* la paire de guillemets de chaque langue ; null = les chevrons lui vont */
var PAIRE = { fr: null, es: null, it: null, en: ["“", "”"],
              zh: ["“", "”"], de: ["„", "“"] };

/* « X » ou «&nbsp;X&nbsp;» — l'espace intérieure est française, elle tombe */
var CHEVRONS = /«(?:&nbsp;|\s| | )*([\s\S]*?)(?:&nbsp;|\s| | )*»/g;

function guillemets(t, lang) {
  var p = PAIRE[lang];
  if (!p) return t;
  return t.replace(CHEVRONS, function (m, dedans) { return p[0] + dedans + p[1]; });
}

/* le chinois : rien ne se glisse devant une ponctuation pleine chasse */
var PLEINE = "：，。；！？、》）";
function espaces(t) {
  return t.replace(new RegExp("(?:&nbsp;|\\u00a0|\\u202f|[ \\t])+([" + PLEINE + "])", "g"), "$1");
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

var compte = { en: 0, zh: 0, de: 0, espaces: 0 }, touchées = 0;

pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, f).split(path.sep)[0];
  var lang = LANGS.indexOf(rel) > 0 ? rel : "fr";
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* la mémoire : chaque langue est corrigée partout où elle est écrite */
  ["en", "zh", "de"].forEach(function (l) {
    h = h.replace(new RegExp(' data-' + l + '="([^"]*)"', "g"), function (m, v) {
      var n = guillemets(v, l);
      if (l === "zh") n = espaces(n);
      if (n !== v) { compte[l]++; }
      return ' data-' + l + '="' + n + '"';
    });
  });

  /* le texte affiché : seulement sur les pages de cette langue */
  if (PAIRE[lang] || lang === "zh") {
    var i = h.indexOf("<body");
    var tête = h.slice(0, i), corps = h.slice(i);
    /* on ne touche pas aux valeurs d'attribut, déjà traitées ci-dessus :
       le remplacement ne porte que sur ce qui est hors des balises */
    var out = "", pos = 0;
    corps.replace(/<[^>]*>/g, function (bal, k) {
      var texte = corps.slice(pos, k);
      var n = guillemets(texte, lang);
      if (lang === "zh") n = espaces(n);
      if (n !== texte) compte.espaces++;
      out += n + bal;
      pos = k + bal.length;
      return bal;
    });
    corps = out + corps.slice(pos);
    h = tête + corps;
  }

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("guillemets : " + compte.en + " en anglais, " + compte.zh + " en chinois, " +
  compte.de + " en allemand · textes affichés retouchés : " + compte.espaces +
  " — " + touchées + " page(s)");
