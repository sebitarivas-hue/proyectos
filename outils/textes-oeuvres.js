"use strict";
/* LES TEXTES DES ŒUVRES — 12/09/2026.
 *
 * Constat, mesuré : la prose visible d'une fiche allait de 353 caractères
 * pour War Madrigals à 2 971 pour Einstein on the Beach. Les fiches les
 * plus pauvres ne disaient rien de leur œuvre, elles la résumaient en
 * vocabulaire d'atmosphère — guerre, mémoire, traumas, résistances — qui
 * pourrait s'appliquer à n'importe quelle pièce.
 *
 * Et pendant ce temps, les faits les plus intéressants dormaient dans les
 * tableaux d'annexe : les huit auteurs de War Madrigals, les quatre
 * compositeurs au programme d'input / body / output. Ce qui distingue une
 * œuvre était relégué en ligne de générique ; ce qui la banalisait tenait
 * le chapô.
 *
 * Cet outil remplace le chapô et ajoute un développement, à partir de ce
 * qui est vérifiable dans la fiche elle-même. Aucune intention d'auteur
 * n'est inventée : on décrit l'effectif, les textes, les partenaires, les
 * étapes. Le reste appartient aux artistes.
 *
 * Idempotent : le développement porte une classe qui le rend repérable.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];
var CODE = { "": "fr", en: "en", es: "es", it: "it", zh: "zh", de: "de" };
var ORDRE = ["fr", "es", "it", "zh", "en", "de"];

function A(d) {
  return ORDRE.map(function (c) {
    return 'data-' + c + '="' + String(d[c]).replace(/"/g, "&quot;") + '"';
  }).join(" ");
}

var OEUVRES = {

"war-madrigals": {
  lead: {
    fr: "Dix madrigaux pour six voix, sur des textes de Paul Celan, Anna Akhmatova, Imre Kertész, Alejandra Pizarnik, Forough Farrokhzad, Pier Paolo Pasolini, Samuel Beckett et Shakespeare. Sept langues dans un seul ensemble vocal : l'allemand de Celan, le russe d'Akhmatova, le hongrois de Kertész, l'espagnol de Pizarnik, le persan de Farrokhzad, l'italien de Pasolini, l'anglais de Beckett et de Shakespeare.",
    en: "Ten madrigals for six voices, on texts by Paul Celan, Anna Akhmatova, Imre Kertész, Alejandra Pizarnik, Forough Farrokhzad, Pier Paolo Pasolini, Samuel Beckett and Shakespeare. Seven languages in a single vocal ensemble: Celan's German, Akhmatova's Russian, Kertész's Hungarian, Pizarnik's Spanish, Farrokhzad's Persian, Pasolini's Italian, the English of Beckett and Shakespeare.",
    es: "Diez madrigales para seis voces, sobre textos de Paul Celan, Anna Ajmátova, Imre Kertész, Alejandra Pizarnik, Forough Farrojzad, Pier Paolo Pasolini, Samuel Beckett y Shakespeare. Siete lenguas en un solo conjunto vocal: el alemán de Celan, el ruso de Ajmátova, el húngaro de Kertész, el español de Pizarnik, el persa de Farrojzad, el italiano de Pasolini, el inglés de Beckett y de Shakespeare.",
    it: "Dieci madrigali per sei voci, su testi di Paul Celan, Anna Achmatova, Imre Kertész, Alejandra Pizarnik, Forough Farrokhzad, Pier Paolo Pasolini, Samuel Beckett e Shakespeare. Sette lingue in un solo ensemble vocale: il tedesco di Celan, il russo di Achmatova, l'ungherese di Kertész, lo spagnolo di Pizarnik, il persiano di Farrokhzad, l'italiano di Pasolini, l'inglese di Beckett e di Shakespeare.",
    zh: "十首为六个声部而作的牧歌，文本取自保罗·策兰、安娜·阿赫玛托娃、凯尔泰斯·伊姆雷、亚历杭德拉·皮萨尼克、芙茹弗·法罗赫扎德、帕索里尼、贝克特与莎士比亚。七种语言汇于同一个声乐团：策兰的德语、阿赫玛托娃的俄语、凯尔泰斯的匈牙利语、皮萨尼克的西班牙语、法罗赫扎德的波斯语、帕索里尼的意大利语，以及贝克特与莎士比亚的英语。",
    de: "Zehn Madrigale für sechs Stimmen, auf Texte von Paul Celan, Anna Achmatowa, Imre Kertész, Alejandra Pizarnik, Forugh Farrochsad, Pier Paolo Pasolini, Samuel Beckett und Shakespeare. Sieben Sprachen in einem einzigen Vokalensemble: Celans Deutsch, Achmatowas Russisch, Kertész' Ungarisch, Pizarniks Spanisch, Farrochsads Persisch, Pasolinis Italienisch, das Englisch von Beckett und Shakespeare."
  },
  dev: [
    {
      fr: "Le madrigal est une forme de la Renaissance tardive : quelques voix sans instruments, un texte profane, et une écriture qui suit le mot de si près qu'elle finit par le mimer. C'est sous ce nom que Monteverdi réunit en 1638 ses <em>Madrigali guerrieri et amorosi</em>, madrigaux de guerre et d'amour. War Madrigals en garde l'effectif nu, six voix et rien d'autre, et le confronte à des auteurs que le XX<sup>e</sup> siècle a traversés de part en part.",
      en: "The madrigal is a late Renaissance form: a few voices without instruments, a secular text, and a writing that follows the word so closely it ends up miming it. It is under that name that Monteverdi gathered his <em>Madrigali guerrieri et amorosi</em> in 1638, madrigals of war and love. War Madrigals keeps the bare forces, six voices and nothing else, and sets them against writers whom the twentieth century went straight through.",
      es: "El madrigal es una forma del Renacimiento tardío: unas pocas voces sin instrumentos, un texto profano y una escritura que sigue la palabra tan de cerca que acaba por imitarla. Con ese nombre reunió Monteverdi en 1638 sus <em>Madrigali guerrieri et amorosi</em>, madrigales de guerra y de amor. War Madrigals conserva ese efectivo desnudo, seis voces y nada más, y lo confronta con autores a los que el siglo XX atravesó de parte a parte.",
      it: "Il madrigale è una forma del tardo Rinascimento: poche voci senza strumenti, un testo profano e una scrittura che segue la parola così da vicino da finire per imitarla. È sotto questo nome che Monteverdi raccoglie nel 1638 i suoi <em>Madrigali guerrieri et amorosi</em>. War Madrigals ne conserva l'organico nudo, sei voci e nulla più, e lo mette di fronte ad autori che il Novecento ha attraversato da parte a parte.",
      zh: "牧歌是文艺复兴晚期的一种形式：数个声部，不用乐器，采用世俗文本，写作贴着词句走，近到最终模仿它。蒙特威尔第 1638 年正是以此名结集出版《战争与爱情牧歌》。《War Madrigals》保留了这一赤裸的编制，仅六个声部，别无其他，并让它面对被二十世纪贯穿而过的作者们。",
      de: "Das Madrigal ist eine Form der Spätrenaissance: wenige Stimmen ohne Instrumente, ein weltlicher Text und eine Schreibweise, die dem Wort so nah folgt, dass sie es am Ende nachahmt. Unter diesem Namen versammelte Monteverdi 1638 seine <em>Madrigali guerrieri et amorosi</em>, Madrigale des Krieges und der Liebe. War Madrigals behält die nackte Besetzung, sechs Stimmen und sonst nichts, und stellt sie Autoren gegenüber, die das 20. Jahrhundert von einem Ende zum anderen durchquert hat."
    },
    {
      fr: "Écrit pour <a class=\"xref\" href=\"/reseau/\">Les Métaboles</a> sous la direction de <a class=\"xref\" href=\"/artists/leo-warynski/\">Léo Warynski</a>. Une première étape a été présentée dans l'émission <em>Création Mondiale</em> d'Anne Montaron, sur France Musique. Création complète en 2026 ; distribution et dates en cours de finalisation.",
      en: "Written for <a class=\"xref\" href=\"/en/reseau/\">Les Métaboles</a> conducted by <a class=\"xref\" href=\"/en/artists/leo-warynski/\">Léo Warynski</a>. A first stage was presented in Anne Montaron's programme <em>Création Mondiale</em> on France Musique. Full premiere in 2026; cast and dates being finalised.",
      es: "Escrito para <a class=\"xref\" href=\"/es/reseau/\">Les Métaboles</a> bajo la dirección de <a class=\"xref\" href=\"/es/artists/leo-warynski/\">Léo Warynski</a>. Una primera etapa se presentó en el programa <em>Création Mondiale</em> de Anne Montaron, en France Musique. Estreno completo en 2026; reparto y fechas en curso de confirmación.",
      it: "Scritto per <a class=\"xref\" href=\"/it/reseau/\">Les Métaboles</a> diretti da <a class=\"xref\" href=\"/it/artists/leo-warynski/\">Léo Warynski</a>. Una prima tappa è stata presentata nella trasmissione <em>Création Mondiale</em> di Anne Montaron, su France Musique. Prima completa nel 2026; cast e date in via di definizione.",
      zh: "为 <a class=\"xref\" href=\"/zh/reseau/\">Les Métaboles</a> 而作，由 <a class=\"xref\" href=\"/zh/artists/leo-warynski/\">Léo Warynski</a> 指挥。首个阶段已在 Anne Montaron 主持的法国音乐台节目《Création Mondiale》中呈现。完整首演定于 2026 年，演出阵容与日期正在确定中。",
      de: "Geschrieben für <a class=\"xref\" href=\"/de/reseau/\">Les Métaboles</a> unter der Leitung von <a class=\"xref\" href=\"/de/artists/leo-warynski/\">Léo Warynski</a>. Eine erste Etappe wurde in Anne Montarons Sendung <em>Création Mondiale</em> auf France Musique vorgestellt. Vollständige Uraufführung 2026; Besetzung und Termine werden derzeit festgelegt."
    }
  ]
},

"rut": {
  lead: {
    fr: "Performance pour une cheffe d'orchestre seule en scène, sous-titrée <em>Conducting the Invisible</em>. Rut Schreiner dirige un orchestre qui n'est pas là : des capteurs lisent son geste en temps réel et le convertissent en son spatialisé et en image. Ce que la direction produit d'ordinaire par l'intermédiaire d'instrumentistes devient ici la matière sonore elle-même.",
    en: "A performance for a conductor alone on stage, subtitled <em>Conducting the Invisible</em>. Rut Schreiner conducts an orchestra that is not there: sensors read her gesture in real time and convert it into spatialised sound and image. What conducting usually produces through instrumentalists becomes here the sound material itself.",
    es: "Performance para una directora sola en escena, subtitulada <em>Conducting the Invisible</em>. Rut Schreiner dirige una orquesta que no está: unos sensores leen su gesto en tiempo real y lo convierten en sonido espacializado y en imagen. Lo que la dirección produce habitualmente a través de instrumentistas se vuelve aquí la materia sonora misma.",
    it: "Performance per una direttrice sola in scena, sottotitolata <em>Conducting the Invisible</em>. Rut Schreiner dirige un'orchestra che non c'è: dei sensori leggono il suo gesto in tempo reale e lo convertono in suono spazializzato e in immagine. Ciò che la direzione produce di solito attraverso gli strumentisti diventa qui la materia sonora stessa.",
    zh: "一部为独自在台上的指挥而作的表演，副标题为《Conducting the Invisible》。Rut Schreiner 指挥着一支并不在场的乐团：传感器实时读取她的动作，并将其转换为空间化的声音与影像。指挥通常要经由演奏者才能产生的东西，在这里直接成为声音材料本身。",
    de: "Performance für eine Dirigentin allein auf der Bühne, im Untertitel <em>Conducting the Invisible</em>. Rut Schreiner dirigiert ein Orchester, das nicht da ist: Sensoren lesen ihre Geste in Echtzeit und übersetzen sie in räumlichen Klang und in Bild. Was das Dirigat sonst über Instrumentalist·innen hervorbringt, wird hier zum Klangmaterial selbst."
  },
  dev: [
    {
      fr: "Le titre énumère les trois termes du dispositif : l'entrée, le geste capté ; le corps, qui le produit ; la sortie, le son et l'image. Rien n'est dissimulé, toute la chaîne est visible en scène. Le programme réunit quatre compositeurs : Fernández, De Mey, Martínez Álvarez et Alsina Tarrès.",
      en: "The title lists the three terms of the device: the input, the captured gesture; the body that produces it; the output, sound and image. Nothing is hidden, the whole chain is visible on stage. The programme brings together four composers: Fernández, De Mey, Martínez Álvarez and Alsina Tarrès.",
      es: "El título enumera los tres términos del dispositivo: la entrada, el gesto captado; el cuerpo que lo produce; la salida, el sonido y la imagen. Nada se oculta, toda la cadena es visible en escena. El programa reúne a cuatro compositores: Fernández, De Mey, Martínez Álvarez y Alsina Tarrès.",
      it: "Il titolo elenca i tre termini del dispositivo: l'entrata, il gesto captato; il corpo che lo produce; l'uscita, il suono e l'immagine. Nulla è nascosto, tutta la catena è visibile in scena. Il programma riunisce quattro compositori: Fernández, De Mey, Martínez Álvarez e Alsina Tarrès.",
      zh: "标题列出了这一装置的三个环节：输入，即被捕捉的动作；身体，动作的来源；输出，声音与影像。没有任何隐藏，整条链路都在台上可见。节目汇集四位作曲家：Fernández、De Mey、Martínez Álvarez 与 Alsina Tarrès。",
      de: "Der Titel zählt die drei Glieder des Dispositivs auf: den Eingang, die erfasste Geste; den Körper, der sie hervorbringt; den Ausgang, Klang und Bild. Nichts ist verborgen, die ganze Kette ist auf der Bühne sichtbar. Das Programm versammelt vier Komponist·innen: Fernández, De Mey, Martínez Álvarez und Alsina Tarrès."
    },
    {
      fr: "Conception et interprétation <a class=\"xref\" href=\"/artists/rut-schreiner/\">Rut Schreiner</a>. Créé en résidence, à la croisée du concert et de la performance. Première fin 2026, dispositif technique en cours de définition. Le projet donne lieu à une masterclass sur le geste de direction comme matière sonore et sur l'électronique en temps réel.",
      en: "Conceived and performed by <a class=\"xref\" href=\"/en/artists/rut-schreiner/\">Rut Schreiner</a>. Created in residency, at the crossing of concert and performance. Premiere late 2026, technical setup being defined. The project gives rise to a masterclass on the conducting gesture as sound material and on real-time electronics.",
      es: "Concepción e interpretación de <a class=\"xref\" href=\"/es/artists/rut-schreiner/\">Rut Schreiner</a>. Creado en residencia, en el cruce del concierto y la performance. Estreno a finales de 2026, dispositivo técnico en curso de definición. El proyecto da lugar a una clase magistral sobre el gesto de dirección como materia sonora y sobre la electrónica en tiempo real.",
      it: "Ideazione e interpretazione di <a class=\"xref\" href=\"/it/artists/rut-schreiner/\">Rut Schreiner</a>. Creato in residenza, all'incrocio tra concerto e performance. Prima a fine 2026, dispositivo tecnico in via di definizione. Il progetto dà luogo a una masterclass sul gesto della direzione come materia sonora e sull'elettronica in tempo reale.",
      zh: "构思与演出：<a class=\"xref\" href=\"/zh/artists/rut-schreiner/\">Rut Schreiner</a>。于驻地创作，处在音乐会与表演的交界处。2026 年底首演，技术配置正在确定中。项目还将开设一场大师课，围绕作为声音材料的指挥动作与实时电子展开。",
      de: "Konzept und Interpretation <a class=\"xref\" href=\"/de/artists/rut-schreiner/\">Rut Schreiner</a>. In Residenz entstanden, an der Kreuzung von Konzert und Performance. Uraufführung Ende 2026, technisches Dispositiv in Definition. Das Projekt mündet in eine Meisterklasse über die Dirigiergeste als Klangmaterial und über Echtzeit-Elektronik."
    }
  ]
}

};

var bilan = [];

Object.keys(OEUVRES).forEach(function (slug) {
  var o = OEUVRES[slug];
  LANGUES.forEach(function (lg) {
    var f = path.join(DOCS, lg, "productions", slug, "index.html");
    if (!fs.existsSync(f)) return;
    var h = fs.readFileSync(f, "utf8"), avant = h;
    var code = CODE[lg];

    /* ── le chapô ──
       Selon la langue il porte la classe lead ou pd-pitch : les deux
       existent dans le dépôt, on garde celle de la page. */
    var cls = "lead";
    var i = h.indexOf('<p class="lead"');
    if (i < 0) { cls = "pd-pitch"; i = h.indexOf('<p class="pd-pitch"'); }
    if (i < 0) { console.log("  " + f + " : chapô introuvable"); return; }
    var fin = h.indexOf("</p>", i) + 4;
    h = h.slice(0, i) + '<p class="' + cls + '" ' + A(o.lead) + ">" + o.lead[code] + "</p>" + h.slice(fin);

    /* ── le développement, après l'image d'ouverture ── */
    var bloc = '<section class="sec pd-dev" style="--sec:var(--mag)"><div class="wrap">' +
      '<div class="num" aria-hidden="true">02</div><div class="body"><div class="prose">' +
      o.dev.map(function (p) { return "<p " + A(p) + ">" + p[code] + "</p>"; }).join("") +
      "</div></div></div></section>";

    var d = h.indexOf('<section class="sec pd-dev"');
    if (d >= 0) {                                   /* déjà posé : on remplace */
      var df = h.indexOf("</section>", d) + 10;
      h = h.slice(0, d) + bloc + h.slice(df);
    } else {
      var fig = h.indexOf("</figure>");
      if (fig < 0) { console.log("  " + f + " : pas d'image d'ouverture"); return; }
      fig += 9;
      h = h.slice(0, fig) + bloc + h.slice(fig);
    }

    if (h !== avant) { fs.writeFileSync(f, h); bilan.push(path.relative(DOCS, f)); }
  });
});

console.log("fiches réécrites : " + bilan.length);
bilan.forEach(function (f) { console.log("  " + f); });
