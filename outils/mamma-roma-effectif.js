/* MAMMA ROMA — L'EFFECTIF.
   La fiche ne portait qu'une ligne : « Percussions — Trois percussionnistes ».
   L'œuvre en compte bien davantage : piano, violon, alto, violoncelle,
   contrebasse, clarinette basse, et les trois percussions qui actionnent la
   table à vue.

   Les voix sont nommées par leur tessiture — soprano, contre-ténor, ténor,
   baryton. C'est ce qu'écrit un générique : l'écriture vocale de l'œuvre, pas
   le nombre d'hommes et de femmes qui la chanteront.

   Le récit de la fiche n'est pas touché : « trois percussionnistes actionnent
   à vue les mécanismes de la table » reste vrai — il était incomplet, pas
   faux, et ce texte appartient à la direction artistique.

   Run: node outils/mamma-roma-effectif.js [--verifier]                      */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var VERIF = process.argv.indexOf("--verifier") > 0;

var LIGNES = [
  {
    role: { fr: "Ensemble", en: "Ensemble", es: "Conjunto", it: "Ensemble", zh: "乐队编制" },
    qui: {
      fr: "Piano, violon, alto, violoncelle, contrebasse, clarinette basse, trois percussions",
      en: "Piano, violin, viola, cello, double bass, bass clarinet, three percussionists",
      es: "Piano, violín, viola, violonchelo, contrabajo, clarinete bajo, tres percusiones",
      it: "Pianoforte, violino, viola, violoncello, contrabbasso, clarinetto basso, tre percussioni",
      zh: "钢琴、小提琴、中提琴、大提琴、低音提琴、低音单簧管、三名打击乐手"
    }
  },
  {
    /* Un générique nomme des tessitures, pas un décompte de personnes.
       « Trois hommes et une femme » décrivait la distribution ; ce qui
       s'écrit, c'est l'écriture vocale de l'œuvre. Ordre par tessiture,
       du plus aigu au plus grave, comme le fait un programme. */
    role: { fr: "Voix", en: "Voices", es: "Voces", it: "Voci", zh: "声部" },
    qui: {
      fr: "Soprano, contre-ténor, ténor, baryton",
      en: "Soprano, countertenor, tenor, baritone",
      es: "Soprano, contratenor, tenor, barítono",
      it: "Soprano, controtenore, tenore, baritono",
      zh: "女高音、假声男高音、男高音、男中音"
    }
  }
];

function attrs(t) {
  return LANGS.map(function (l) {
    return " data-" + l + '="' + t[l].replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
  }).join("");
}
function ligne(e, lang) {
  return "<li>" +
    '<span class="role"' + attrs(e.role) + ">" + e.role[lang] + "</span> — " +
    '<span class="who"' + attrs(e.qui) + ">" + e.qui[lang] + "</span></li>";
}

var faits = 0;

LANGS.forEach(function (lang) {
  var f = path.join(DOCS, lang === "fr" ? "" : lang, "productions", "mamma-roma", "index.html");
  if (!fs.existsSync(f)) { console.log("  page absente : " + lang); return; }
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* Deux vocabulaires pour la même chose : la fiche française composée écrit
     son générique en <dt>/<dd>, celles reprises du site en <li> role/who. La
     règle reconnaît les deux — sans quoi la langue de référence serait la
     seule à ne pas être corrigée, ce qui est exactement ce qui s'est passé. */
  var reLi = /<li>(?:(?!<\/li>)[\s\S])*?data-fr="(?:Percussions|Ensemble)"(?:(?!<\/li>)[\s\S])*?<\/li>/;
  var reDt = /<dt[^>]*>Percussions<\/dt><dd[^>]*>[^<]*<\/dd>/;
  if (reLi.test(h)) {
    h = h.replace(reLi, LIGNES.map(function (e) { return ligne(e, lang); }).join(""));
  } else if (reDt.test(h)) {
    h = h.replace(reDt, LIGNES.map(function (e) {
      return "<dt" + attrs(e.role) + ">" + e.role[lang] + "</dt>" +
             "<dd" + attrs(e.qui) + ">" + e.qui[lang] + "</dd>";
    }).join(""));
  } else { console.log("  ligne introuvable : " + lang); return; }

  if (h === avant) return;
  faits++;
  console.log("  " + (lang === "fr" ? "/" : "/" + lang + "/") + "productions/mamma-roma/ ← effectif + voix");
  if (!VERIF) fs.writeFileSync(f, h);
});

console.log((VERIF ? "à corriger : " : "effectif corrigé sur : ") + faits + " page(s)");
