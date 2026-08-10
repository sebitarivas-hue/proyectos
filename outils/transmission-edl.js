/* LES TROIS AXES DE LA TRANSMISSION.
   La page listait les actions œuvre par œuvre, sans jamais dire ce qui les
   tient ensemble. Or c'est cela qu'un lecteur institutionnel cherche —
   DRAC, collectivité, fondation : la logique, avant le catalogue.

   Trois axes, demandés par la direction artistique : logique territoriale,
   démocratisation, parité.

   Chacun s'appuie sur un fait déjà porté par le site, et sur rien d'autre :

     · le territoire, à deux échelles — la recherche-action de six ans dans le
       quartier Briand à Mulhouse et les matériaux collectés sur place (fiche
       salamandres) ; et l'orientation vers le sud, que la carte des
       coopérations documente déjà : Buenos Aires (CETC — Teatro Colón,
       UNSAM), Santiago (Ópera Latinoamérica), Mexico (A World to Blast),
       Monte-Carlo. « Territorial » ne veut pas dire « local » ;
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
    v: { fr: "Deux échelles, une même logique. Sur place : ateliers, rencontres et recherche-action au long cours avec les lieux d'accueil, jusqu'à collecter les matériaux d'un spectacle avec les habitant·es et les associations. Et vers le sud : les œuvres se fabriquent avec Buenos Aires, Santiago, Mexico et le sud de l'Europe — une coopération qui suit d'autres axes que ceux du centre.",
         en: "Two scales, one logic. On the ground: workshops, encounters and long-term action research with the host venues, to the point of gathering the materials of a production with residents and local associations. And southwards: the works are made with Buenos Aires, Santiago, Mexico City and southern Europe — a cooperation that follows other axes than those of the centre.",
         es: "Dos escalas, una misma lógica. Sobre el terreno: talleres, encuentros e investigación-acción a largo plazo con los espacios de acogida, hasta recoger los materiales de un espectáculo con los habitantes y las asociaciones. Y hacia el sur: las obras se fabrican con Buenos Aires, Santiago, Ciudad de México y el sur de Europa — una cooperación que sigue otros ejes que los del centro.",
         it: "Due scale, una stessa logica. Sul posto: laboratori, incontri e ricerca-azione di lungo periodo con i luoghi ospitanti, fino a raccogliere i materiali di uno spettacolo con gli abitanti e le associazioni. E verso sud: le opere si fabbricano con Buenos Aires, Santiago, Città del Messico e il sud dell'Europa — una cooperazione che segue assi diversi da quelli del centro.",
         zh: "两个尺度，同一种逻辑。在地：与接待场所长期开展工作坊、交流与行动研究，直至与居民和协会一起收集一部演出的材料。以及朝南：作品与布宜诺斯艾利斯、圣地亚哥、墨西哥城以及南欧共同完成——一种沿着中心之外的轴线展开的合作。" }
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
