"use strict";
/* NETTOYAGE : LES DEUX PARAGRAPHES PORTAIENT DES ATTRIBUTS DUPLIQUÉS.
 *
 * outils/pourquoi-evergreen.js a généralisé le texte, mais par
 * remplacement de chaîne exacte — et ces deux paragraphes portaient
 * jusqu'à 7 copies de la même traduction, avec des formulations
 * légèrement différentes d'une copie à l'autre (« impulsamos » ×
 * « llevamos », etc.), accumulées au fil de passes de traduction jamais
 * dédupliquées. Le remplacement exact n'en attrapait qu'une.
 *
 * Ici on ne cherche plus à égaler l'ancien texte : on repère les deux
 * paragraphes par leur ouverture, on prend tout le bloc jusqu'à sa
 * fermeture, et on le remplace intégralement par une balise propre — un
 * seul data-<langue> par langue, plus le contenu visible dans la langue
 * de la page.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];
var CODE = { "": "fr", en: "en", es: "es", it: "it", zh: "zh", de: "de" };

var P1 = {
  fr: "Au cœur de cette démarche, une conviction : les grandes transformations de notre époque — technologiques, écologiques, sociales — appellent de nouvelles formes d'<strong>incarnation</strong>. Elles traversent chacune des œuvres que nous portons, quels qu'en soient le sujet, la forme ou l'origine. La musique, la voix, le corps, le texte, l'espace, l'image et les technologies n'y sont pas des disciplines séparées, mais les composantes d'une même écriture vivante.",
  en: "At the heart of this approach lies a conviction: the great transformations of our time — technological, ecological, social — call for new forms of <strong>embodiment</strong>. They run through every work we carry, whatever its subject, form or origin. Music, voice, body, text, space, image and technology are not separate disciplines here, but components of a single living form of writing.",
  es: "En el centro de este planteamiento hay una convicción: las grandes transformaciones de nuestra época — tecnológicas, ecológicas, sociales — exigen nuevas formas de <strong>encarnación</strong>. Atraviesan cada una de las obras que llevamos, cualquiera sea su tema, su forma o su origen. La música, la voz, el cuerpo, el texto, el espacio, la imagen y las tecnologías no son aquí disciplinas separadas, sino componentes de una misma escritura viva.",
  it: "Al centro di questo percorso c'è una convinzione: le grandi trasformazioni della nostra epoca — tecnologiche, ecologiche, sociali — richiedono nuove forme di <strong>incarnazione</strong>. Attraversano ciascuna delle opere che portiamo, qualunque ne sia il tema, la forma o l'origine. Musica, voce, corpo, testo, spazio, immagine e tecnologie non vi sono discipline separate, ma componenti di una stessa scrittura viva.",
  zh: "这一路径的核心是一个信念：我们时代的重大变革——技术的、生态的、社会的——呼唤新的<strong>具身</strong>形式。无论主题、形式或出处为何，它们贯穿我们所承载的每一部作品。在这里，音乐、声音、身体、文本、空间、影像与技术并非彼此分离的学科，而是同一种鲜活书写的组成部分。",
  de: "Im Zentrum dieses Ansatzes steht eine Überzeugung: die großen Umwälzungen unserer Zeit — technologische, ökologische, soziale — verlangen nach neuen Formen der <strong>Verkörperung</strong>. Sie durchziehen jedes Werk, das wir tragen, gleich welches Thema, welche Form oder welchen Ursprung es hat. Musik, Stimme, Körper, Text, Raum, Bild und Technologien sind darin keine getrennten Disziplinen, sondern Bestandteile ein und derselben lebendigen Schreibweise."
};

var P2 = {
  fr: "Autour de <a href='../artists/sebastian-rivas/'>Sebastian Rivas</a> se réunit un réseau d'artistes, d'interprètes, d'auteurs, de chercheurs et de producteurs, en compagnonnage avec des institutions qui partagent cette recherche — maisons d'opéra, centres de création musicale, festivals.",
  en: "Around <a href='../artists/sebastian-rivas/'>Sebastian Rivas</a> gathers a network of artists, performers, writers, researchers and producers, in companionship with institutions that share this research — opera houses, centres for musical creation, festivals.",
  es: "En torno a <a href='../artists/sebastian-rivas/'>Sebastian Rivas</a> se reúne una red de artistas, intérpretes, autores, investigadores y productores, en compañía de instituciones que comparten esta investigación — teatros de ópera, centros de creación musical, festivales.",
  it: "Attorno a <a href='../artists/sebastian-rivas/'>Sebastian Rivas</a> si riunisce una rete di artisti, interpreti, autori, ricercatori e produttori, in compagnonaggio con istituzioni che condividono questa ricerca — teatri d'opera, centri di creazione musicale, festival.",
  zh: "围绕 <a href='../artists/sebastian-rivas/'>Sebastian Rivas</a> 聚集了一个由艺术家、演绎者、作者、研究者与制作人组成的网络，并与分享这一研究方向的机构同行——歌剧院、音乐创作中心、艺术节。",
  de: "Um <a href='../artists/sebastian-rivas/'>Sebastian Rivas</a> versammelt sich ein Netzwerk aus Künstler·innen, Interpret·innen, Autor·innen, Forschenden und Produzent·innen, in Weggefährtenschaft mit Institutionen, die diese Forschung teilen — Opernhäuser, Zentren für Musikschöpfung, Festivals."
};

function balise(dict, langueVisible) {
  var attrs = ["fr", "es", "it", "zh", "en", "de"]
    .map(function (c) { return 'data-' + c + '="' + dict[c].replace(/"/g, "&quot;") + '"'; })
    .join(" ");
  return "<p " + attrs + ">" + dict[langueVisible] + "</p>";
}

var rapport = { p1: 0, p2: 0 };

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "pourquoi", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  var code = CODE[lg];

  var i1 = h.indexOf('<p data-fr="Au cœur de cette démarche');
  if (i1 < 0) { console.log("  " + f + " : paragraphe 1 introuvable (déjà nettoyé ?)"); }
  else {
    var e1 = h.indexOf("</p>", i1) + 4;
    h = h.slice(0, i1) + balise(P1, code) + h.slice(e1);
    rapport.p1++;
  }

  var i2 = h.indexOf("<p data-fr=\"Autour de <a href='../artists/sebastian-rivas/'");
  if (i2 < 0) { console.log("  " + f + " : paragraphe 2 introuvable (déjà nettoyé ?)"); }
  else {
    var e2 = h.indexOf("</p>", i2) + 4;
    h = h.slice(0, i2) + balise(P2, code) + h.slice(e2);
    rapport.p2++;
  }

  fs.writeFileSync(f, h);
});

console.log("paragraphe 1 reconstruit sur " + rapport.p1 + " page(s), paragraphe 2 sur " + rapport.p2 + " page(s)");
