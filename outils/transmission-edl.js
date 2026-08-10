/* LES TROIS AXES DE LA TRANSMISSION.
   La page listait les actions œuvre par œuvre, sans jamais dire ce qui les
   tient ensemble. Or c'est cela qu'un lecteur institutionnel cherche —
   DRAC, collectivité, fondation : la logique, avant le catalogue.

   Trois axes, demandés par la direction artistique : logique territoriale,
   démocratisation, parité.

   Chacun s'appuie sur un fait déjà porté par le site, et sur rien d'autre :

     · le territoire — la recherche-action de six ans dans le quartier Briand
       à Mulhouse, et les matériaux collectés sur place avec les habitant·es
       et les associations, à chaque lieu d'accueil (fiche salamandres) ;
     · la démocratisation — la médiation de [FAM]E, « ouverte à tou·te·s »,
       et l'éducation populaire (fiches [FAM]E et salamandres) ;
     · la parité — « le laboratoire défend l'égalité femmes-hommes »
       (fiche LIPS).

   Aucun chiffre, aucun partenaire, aucun dispositif n'est inventé pour
   l'occasion : un élément de langage qui avance un fait non vérifiable se
   retourne contre son auteur au premier contrôle.

   Run: node outils/transmission-edl.js [--verifier]                         */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGS = ["fr", "en", "es", "it", "zh"];
var VERIF = process.argv.indexOf("--verifier") > 0;

var TITRE = {
  fr: "Une transmission située", en: "A situated transmission",
  es: "Una transmisión situada", it: "Una trasmissione situata", zh: "在地的传承"
};
var CHAPEAU = {
  fr: "La transmission ne se sépare pas de la création : elle en prolonge la recherche, et elle se fait là où les œuvres se fabriquent.",
  en: "Transmission is not separate from creation: it extends its research, and it happens where the works are made.",
  es: "La transmisión no se separa de la creación: prolonga su investigación y ocurre allí donde se fabrican las obras.",
  it: "La trasmissione non si separa dalla creazione: ne prolunga la ricerca e avviene là dove le opere si fabbricano.",
  zh: "传承与创作不可分割：它延续着创作的研究，并发生在作品被制造出来的地方。"
};
var AXES = [
  {
    k: { fr: "Logique territoriale", en: "Territorial logic", es: "Lógica territorial",
         it: "Logica territoriale", zh: "在地逻辑" },
    v: { fr: "Les actions se mènent avec les lieux d'accueil, dans la durée : ateliers, rencontres et recherche-action au long cours — jusqu'à collecter sur place, avec les habitant·es et les associations, les matériaux d'un spectacle.",
         en: "The work is carried out with the host venues, over time: workshops, encounters and long-term action research — to the point of gathering the materials of a production on site, with residents and local associations.",
         es: "Las acciones se llevan a cabo con los espacios de acogida, en la duración: talleres, encuentros e investigación-acción a largo plazo — hasta recoger in situ, con los habitantes y las asociaciones, los materiales de un espectáculo.",
         it: "Le azioni si conducono con i luoghi ospitanti, nella durata: laboratori, incontri e ricerca-azione di lungo periodo — fino a raccogliere sul posto, con gli abitanti e le associazioni, i materiali di uno spettacolo.",
         zh: "行动与接待场所长期共同展开：工作坊、交流与持续的行动研究——直至与居民和当地协会一起，就地收集一部演出的材料。" }
  },
  {
    k: { fr: "Démocratisation", en: "Widening access", es: "Democratización",
         it: "Democratizzazione", zh: "普及" },
    v: { fr: "Les formats s'adressent à des publics qui ne fréquentent pas l'opéra : médiation en amont, rencontres ouvertes à tou·te·s, éducation populaire.",
         en: "The formats address audiences who do not go to the opera: preparatory mediation, encounters open to all, popular education.",
         es: "Los formatos se dirigen a públicos que no frecuentan la ópera: mediación previa, encuentros abiertos a todas y todos, educación popular.",
         it: "I formati si rivolgono a pubblici che non frequentano l'opera: mediazione a monte, incontri aperti a tutte e tutti, educazione popolare.",
         zh: "这些形式面向并不走进歌剧院的观众：前置的导赏、向所有人开放的交流、平民教育。" }
  },
  {
    k: { fr: "Parité", en: "Gender parity", es: "Paridad", it: "Parità", zh: "性别平等" },
    v: { fr: "L'égalité femmes-hommes est une règle du laboratoire, appliquée au choix des artistes accueilli·es comme aux intervenant·es qui les accompagnent.",
         en: "Gender equality is a rule of the laboratory, applied to the selection of the artists hosted as well as to the mentors who accompany them.",
         es: "La igualdad entre mujeres y hombres es una regla del laboratorio, aplicada a la selección de los artistas acogidos y a los mentores que los acompañan.",
         it: "La parità tra donne e uomini è una regola del laboratorio, applicata alla scelta degli artisti accolti come agli intervenienti che li accompagnano.",
         zh: "男女平等是实验室的一条规则，既适用于所接纳艺术家的遴选，也适用于陪伴他们的导师。" }
  }
];

function attrs(t) {
  return LANGS.map(function (l) {
    return " data-" + l + '="' + t[l].replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
  }).join("");
}

var poses = 0;

LANGS.forEach(function (lang) {
  var f = path.join(DOCS, lang === "fr" ? "" : lang, "transmission", "index.html");
  if (!fs.existsSync(f)) { console.log("  page absente : " + lang); return; }
  var h = fs.readFileSync(f, "utf8");

  var bloc = '<div class="pd-block pd-full st-axes">' +
    "<h3" + attrs(TITRE) + ">" + TITRE[lang] + "</h3>" +
    '<p class="pd-pitch"' + attrs(CHAPEAU) + ">" + CHAPEAU[lang] + "</p>" +
    '<ul class="facts">' + AXES.map(function (a) {
      return "<li>" + '<span class="k"' + attrs(a.k) + ">" + a.k[lang] + "</span>" +
        '<span class="v"' + attrs(a.v) + ">" + a.v[lang] + "</span></li>";
    }).join("") + "</ul></div>";

  /* on remplace le bloc s'il existe déjà — l'outil doit être rejouable */
  var avant = h;
  if (h.indexOf('class="pd-block pd-full st-axes"') >= 0) {
    h = h.replace(/<div class="pd-block pd-full st-axes">[\s\S]*?<\/ul><\/div>/, bloc);
  } else {
    /* il se pose en tête de page : c'est la logique, avant le catalogue */
    var i = h.indexOf("</h1>");
    if (i < 0) return;
    var j = h.indexOf(">", h.indexOf("<", i + 5));
    void j;
    h = h.slice(0, i + 5) + bloc + h.slice(i + 5);
  }
  if (h === avant) return;
  poses++;
  if (!VERIF) fs.writeFileSync(f, h);
});

console.log((VERIF ? "à poser : " : "axes posés sur : ") + poses + " page(s)");
