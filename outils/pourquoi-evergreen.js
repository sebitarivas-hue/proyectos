"use strict";
/* LE MANIFESTE NE DOIT PAS VIEILLIR AVEC LES PROJETS.
 *
 * Sébastien, 29/08 : « les projets évoluent, le manifeste ne devrait pas ».
 * Deux passages de /pourquoi/ nommaient des œuvres et des collaborateurs
 * précis — exactement ce qui périme quand le catalogue change. Le texte
 * garde son idée et son rythme ; il perd les noms propres appelés à changer.
 * Le nom de Sebastian Rivas reste : il n'est pas un projet, c'est le
 * fondateur.
 *
 * Trouvaille au passage : la page allemande n'avait jamais eu de
 * traduction pour le second paragraphe — elle affichait le français brut,
 * en repli silencieux. Traité à part, plus bas : c'est la seule des cinq
 * langues qui ne suit pas le schéma habituel (chaîne existante à
 * remplacer), puisqu'il n'y avait rien à trouver.
 *
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];

var PASSAGES = [
  { nom: "les trois œuvres citées en exemple", lang: {
    fr: ["Elles traversent les œuvres que nous portons : <a href='../productions/ooo/'>OOO</a>, opéra post-humain où les objets, la nature et une intelligence artificielle défaillante héritent d'un monde vidé de ses humains ; <a href='../productions/salamandres/'>We Expected the Disaster… but not the salamanders!</a>, fable écologique d'après Karel Čapek ; <a href='../productions/otages/'>Otages</a>, d'après Nina Bouraoui, qui donne à entendre la violence sociale. La musique, la voix, le corps, le texte, l'espace, l'image et les technologies n'y sont pas des disciplines séparées, mais les composantes d'une même écriture vivante.",
          "Elles traversent chacune des œuvres que nous portons, quels qu'en soient le sujet, la forme ou l'origine. La musique, la voix, le corps, le texte, l'espace, l'image et les technologies n'y sont pas des disciplines séparées, mais les composantes d'une même écriture vivante."],
    en: ["They run through the works we carry: <a href='../productions/ooo/'>OOO</a>, a post-human opera in which objects, nature and a failing artificial intelligence inherit a world emptied of its humans; <a href='../productions/salamandres/'>We Expected the Disaster… but not the salamanders!</a>, an ecological fable after Karel Čapek; <a href='../productions/otages/'>Otages</a>, after Nina Bouraoui, which makes social violence audible. Music, voice, body, text, space, image and technology are not separate disciplines here, but components of a single living form of writing.",
          "They run through every work we carry, whatever its subject, form or origin. Music, voice, body, text, space, image and technology are not separate disciplines here, but components of a single living form of writing."],
    es: ["Atraviesan las obras que llevamos: <a href='../productions/ooo/'>OOO</a>, ópera posthumana donde los objetos, la naturaleza y una inteligencia artificial defectuosa heredan un mundo vaciado de humanos; <a href='../productions/salamandres/'>We Expected the Disaster… but not the salamanders!</a>, fábula ecológica según Karel Čapek; <a href='../productions/otages/'>Otages</a>, según Nina Bouraoui, que da a escuchar la violencia social. La música, la voz, el cuerpo, el texto, el espacio, la imagen y las tecnologías no son aquí disciplinas separadas, sino componentes de una misma escritura viva.",
          "Atraviesan cada una de las obras que llevamos, cualquiera sea su tema, su forma o su origen. La música, la voz, el cuerpo, el texto, el espacio, la imagen y las tecnologías no son aquí disciplinas separadas, sino componentes de una misma escritura viva."],
    it: ["Attraversano le opere che portiamo: <a href='../productions/ooo/'>OOO</a>, opera post-umana in cui gli oggetti, la natura e un'intelligenza artificiale difettosa ereditano un mondo svuotato dei suoi umani; <a href='../productions/salamandres/'>We Expected the Disaster… but not the salamanders!</a>, favola ecologica da Karel Čapek; <a href='../productions/otages/'>Otages</a>, da Nina Bouraoui, che dà voce alla violenza sociale. Musica, voce, corpo, testo, spazio, immagine e tecnologie non vi sono discipline separate, ma componenti di una stessa scrittura viva.",
          "Attraversano ciascuna delle opere che portiamo, qualunque ne sia il tema, la forma o l'origine. Musica, voce, corpo, testo, spazio, immagine e tecnologie non vi sono discipline separate, ma componenti di una stessa scrittura viva."],
    zh: ["它们贯穿我们所承载的作品：<a href='../productions/ooo/'>OOO</a>，一部后人类歌剧，物件、自然与一个失灵的人工智能继承了一个人类已然消失的世界；<a href='../productions/salamandres/'>We Expected the Disaster… but not the salamanders!</a>，一则改编自卡雷尔·恰佩克的生态寓言；<a href='../productions/otages/'>Otages</a>，改编自 Nina Bouraoui，让社会暴力得以被听见。在这里，音乐、声音、身体、文本、空间、影像与技术并非彼此分离的学科，而是同一种鲜活书写的组成部分。",
          "无论主题、形式或出处为何，它们贯穿我们所承载的每一部作品。在这里，音乐、声音、身体、文本、空间、影像与技术并非彼此分离的学科，而是同一种鲜活书写的组成部分。"],
    de: ["Sie durchziehen die Werke, die wir tragen: &lt;a href='../productions/ooo/'&gt;OOO&lt;/a&gt;, posthumane Oper, in der die Objekte, die Natur und eine defekte künstliche Intelligenz eine von ihren Menschen geleerte Welt erben; &lt;a href='../productions/salamandres/'&gt;We Expected the Disaster… but not the salamanders!&lt;/a&gt;, ökologische Fabel nach Karel Čapek; &lt;a href='../productions/otages/'&gt;Otages&lt;/a&gt;, nach Nina Bouraoui, die soziale Gewalt hörbar macht. Musik, Stimme, Körper, Text, Raum, Bild und Technologien sind darin keine getrennten Disziplinen, sondern Bestandteile ein und derselben lebendigen Schreibweise.",
          "Sie durchziehen jedes Werk, das wir tragen, gleich welches Thema, welche Form oder welchen Ursprung es hat. Musik, Stimme, Körper, Text, Raum, Bild und Technologien sind darin keine getrennten Disziplinen, sondern Bestandteile ein und derselben lebendigen Schreibweise."]
  }},
  { nom: "les collaborateurs et institutions nommés", lang: {
    fr: ["se réunissent des artistes, interprètes, auteurs, chercheurs et producteurs — la percussionniste <a href='../artists/olivia-martin/'>Olivia Martin</a>, la soprano <a href='../artists/nicola-beller-carbone/'>Nicola Beller Carbone</a>, le metteur en scène <a href='../artists/martin-bauer/'>Martin Bauer</a>, la curatrice <a href='../artists/anne-laure-chamboissier/'>Anne-Laure Chamboissier</a> — avec le compagnonnage artistique de <a href='../artists/georges-aperghis/'>Georges Aperghis</a>. Les œuvres se fabriquent avec le CETC du Teatro Colón, l'Opéra de Lyon, GRAME — CNCM, le festival Tête à Tête, l'UNSAM.",
          "se réunit un réseau d'artistes, d'interprètes, d'auteurs, de chercheurs et de producteurs, en compagnonnage avec des institutions qui partagent cette recherche — maisons d'opéra, centres de création musicale, festivals."],
    en: ["gather artists, performers, writers, researchers and producers — percussionist <a href='../artists/olivia-martin/'>Olivia Martin</a>, soprano <a href='../artists/nicola-beller-carbone/'>Nicola Beller Carbone</a>, director <a href='../artists/martin-bauer/'>Martin Bauer</a>, curator <a href='../artists/anne-laure-chamboissier/'>Anne-Laure Chamboissier</a> — with the artistic companionship of <a href='../artists/georges-aperghis/'>Georges Aperghis</a>. The works are made with the CETC of the Teatro Colón, the Opéra de Lyon, GRAME — CNCM, the Tête à Tête festival and UNSAM.",
          "gathers a network of artists, performers, writers, researchers and producers, in companionship with institutions that share this research — opera houses, centres for musical creation, festivals."],
    es: ["se reúnen artistas, intérpretes, autores, investigadores y productores — la percusionista <a href='../artists/olivia-martin/'>Olivia Martin</a>, la soprano <a href='../artists/nicola-beller-carbone/'>Nicola Beller Carbone</a>, el director de escena <a href='../artists/martin-bauer/'>Martin Bauer</a>, la curadora <a href='../artists/anne-laure-chamboissier/'>Anne-Laure Chamboissier</a> — con el acompañamiento artístico de <a href='../artists/georges-aperghis/'>Georges Aperghis</a>. Las obras se fabrican con el CETC del Teatro Colón, la Ópera de Lyon, GRAME — CNCM, el festival Tête à Tête y la UNSAM.",
          "se reúne una red de artistas, intérpretes, autores, investigadores y productores, en compañía de instituciones que comparten esta investigación — teatros de ópera, centros de creación musical, festivales."],
    it: ["si riuniscono artisti, interpreti, autori, ricercatori e produttori — la percussionista <a href='../artists/olivia-martin/'>Olivia Martin</a>, il soprano <a href='../artists/nicola-beller-carbone/'>Nicola Beller Carbone</a>, il regista <a href='../artists/martin-bauer/'>Martin Bauer</a>, la curatrice <a href='../artists/anne-laure-chamboissier/'>Anne-Laure Chamboissier</a> — con il compagnonaggio artistico di <a href='../artists/georges-aperghis/'>Georges Aperghis</a>. Le opere si costruiscono con il CETC del Teatro Colón, l'Opéra de Lyon, GRAME — CNCM, il festival Tête à Tête, l'UNSAM.",
          "si riunisce una rete di artisti, interpreti, autori, ricercatori e produttori, in compagnonaggio con istituzioni che condividono questa ricerca — teatri d'opera, centri di creazione musicale, festival."],
    zh: ["聚集了艺术家、演绎者、作者、研究者与制作人——打击乐演奏家 <a href='../artists/olivia-martin/'>Olivia Martin</a>、女高音 <a href='../artists/nicola-beller-carbone/'>Nicola Beller Carbone</a>、导演 <a href='../artists/martin-bauer/'>Martin Bauer</a>、策展人 <a href='../artists/anne-laure-chamboissier/'>Anne-Laure Chamboissier</a>——并有 <a href='../artists/georges-aperghis/'>Georges Aperghis</a> 的艺术同行。作品与科隆剧院 CETC、里昂歌剧院、GRAME — CNCM、Tête à Tête 音乐节及 UNSAM 共同完成。",
          "聚集了一个由艺术家、演绎者、作者、研究者与制作人组成的网络，并与分享这一研究方向的机构同行——歌剧院、音乐创作中心、艺术节。"]
  }}
];

var touches = {};
PASSAGES.forEach(function (p) { touches[p.nom] = 0; });

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "pourquoi", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;
  PASSAGES.forEach(function (p) {
    Object.keys(p.lang).forEach(function (code) {
      var pair = p.lang[code];
      if (h.indexOf(pair[0]) < 0) return;
      h = h.split(pair[0]).join(pair[1]);
      touches[p.nom]++;
    });
  });
  if (h !== avant) fs.writeFileSync(f, h);
});

console.log("passages généralisés :");
Object.keys(touches).forEach(function (nom) { console.log("  " + nom + " : " + touches[nom]); });
