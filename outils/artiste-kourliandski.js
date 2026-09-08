"use strict";
/* DMITRI KOURLIANDSKI ENTRE DANS LE COLLECTIF.
 *
 * Crée docs/<langue>/artists/dmitri-kourliandski/index.html dans les six
 * langues, et l'ajoute au roster « Artistes associé·e·s » de la page réseau.
 *
 * Le squelette est repris d'une fiche existante à portrait en initiales
 * (Oksana Trypolska) : on garde sa tête de document, sa navigation et son
 * pied de page, on change le slug partout, on remplace le corps.
 *
 * Deux corrections silencieuses sur la bio fournie :
 *   « Wissentschaftskolleg » → Wissenschaftskolleg zu Berlin (l'institution
 *   s'écrit sans t ; la faute était dans les deux versions envoyées) ;
 *   « Editions Jobert » → Éditions Jobert.
 *
 * Idempotent : relancer réécrit les fiches et ne duplique pas le roster.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];
var CODE = { "": "fr", en: "en", es: "es", it: "it", zh: "zh", de: "de" };
var SLUG = "dmitri-kourliandski";
var MODELE = "oksana-trypolska";

var ROLE = {
  fr: "Compositeur", en: "Composer", es: "Compositor",
  it: "Compositore", zh: "作曲家", de: "Komponist"
};

var RETOUR = { fr: "← Réseau", en: "← Network", es: "← Red", it: "← Rete", zh: "← 网络", de: "← Netzwerk" };

var PITCH = {
  fr: "Compositeur, membre du collectif depuis 2026. Sa musique traite la pièce comme un objet et l'écoute comme une expérience d'espace.",
  en: "Composer, member of the collective since 2026. His music treats the piece as an object and listening as an experience of space.",
  es: "Compositor, miembro del colectivo desde 2026. Su música trata la pieza como un objeto y la escucha como una experiencia del espacio.",
  it: "Compositore, membro del collettivo dal 2026. La sua musica tratta il pezzo come un oggetto e l'ascolto come un'esperienza dello spazio.",
  zh: "作曲家，自 2026 年起加入本集体。在他的音乐里，作品被当作一个物件，聆听则是一次关于空间的经验。",
  de: "Komponist, seit 2026 Mitglied des Kollektivs. Seine Musik behandelt das Stück als Objekt und das Hören als Raumerfahrung."
};

var BIO1 = {
  fr: "Né en 1976 à Moscou, il étudie la composition au conservatoire de Moscou auprès de Leonid Bobylev. Il vit et travaille en France depuis 2022. Lauréat de plusieurs concours internationaux, dont les prix Gaudeamus, Franco Abbiati, Gianni Bergamo et Johann Joseph Fux, il est artiste en résidence du Berliner Künstlerprogramm en 2008, puis fellow du Wissenschaftskolleg zu Berlin en 2025/26.",
  en: "Born in Moscow in 1976, he studied composition at the Moscow Conservatory with Leonid Bobylev. He has lived and worked in France since 2022. Winner of several international competitions, including the Gaudeamus, Franco Abbiati, Gianni Bergamo and Johann Joseph Fux prizes, he was artist in residence of the Berliner Künstlerprogramm in 2008, then a fellow of the Wissenschaftskolleg zu Berlin in 2025/26.",
  es: "Nacido en Moscú en 1976, estudió composición en el Conservatorio de Moscú con Leonid Bobylev. Vive y trabaja en Francia desde 2022. Laureado en varios concursos internacionales, entre ellos los premios Gaudeamus, Franco Abbiati, Gianni Bergamo y Johann Joseph Fux, fue artista residente del Berliner Künstlerprogramm en 2008 y luego fellow del Wissenschaftskolleg zu Berlin en 2025/26.",
  it: "Nato a Mosca nel 1976, studia composizione al Conservatorio di Mosca con Leonid Bobylev. Vive e lavora in Francia dal 2022. Vincitore di numerosi concorsi internazionali, tra cui i premi Gaudeamus, Franco Abbiati, Gianni Bergamo e Johann Joseph Fux, è artista in residenza del Berliner Künstlerprogramm nel 2008 e poi fellow del Wissenschaftskolleg zu Berlin nel 2025/26.",
  zh: "1976 年生于莫斯科，在莫斯科音乐学院师从 Leonid Bobylev 学习作曲。自 2022 年起定居法国并在此工作。他曾获多项国际比赛奖项，包括 Gaudeamus、Franco Abbiati、Gianni Bergamo 与 Johann Joseph Fux 等奖项；2008 年为柏林艺术家计划（Berliner Künstlerprogramm）驻留艺术家，2025/26 年度为柏林高等研究院（Wissenschaftskolleg zu Berlin）研究员。",
  de: "1976 in Moskau geboren, studierte er Komposition am Moskauer Konservatorium bei Leonid Bobylev. Seit 2022 lebt und arbeitet er in Frankreich. Preisträger mehrerer internationaler Wettbewerbe, darunter der Gaudeamus-, Franco-Abbiati-, Gianni-Bergamo- und Johann-Joseph-Fux-Preis, war er 2008 Artist in Residence des Berliner Künstlerprogramms und 2025/26 Fellow des Wissenschaftskollegs zu Berlin."
};

var BIO2 = {
  fr: "Auteur d'œuvres de chambre, d'orchestre et d'opéra jouées dans le monde entier, il est invité depuis 2012 à donner master-classes et conférences en Autriche, en Italie, aux Pays-Bas, en Ukraine, en France, en Israël, en Espagne, en Suisse, en Suède et en Russie. Dans ses compositions, souvent statiques et répétitives, il développe le concept de musique objective : la pièce y vaut comme objet, comme phénomène visuel ou, plus largement, comme installation dans l'espace, souvent interactive. Ses œuvres sont publiées par Donemus et les Éditions Jobert.",
  en: "The author of chamber, orchestral and opera works performed worldwide, he has been invited since 2012 to give masterclasses and lectures in Austria, Italy, the Netherlands, Ukraine, France, Israel, Spain, Switzerland, Sweden and Russia. In his compositions, often static and repetitive, he develops the concept of objective music: the piece stands as an object, as a visual phenomenon or, more broadly, as a spatial installation, frequently interactive. His works are published by Donemus and Éditions Jobert.",
  es: "Autor de obras de cámara, de orquesta y de ópera interpretadas en todo el mundo, desde 2012 es invitado a dar clases magistrales y conferencias en Austria, Italia, los Países Bajos, Ucrania, Francia, Israel, España, Suiza, Suecia y Rusia. En sus composiciones, a menudo estáticas y repetitivas, desarrolla el concepto de música objetiva: la pieza vale como objeto, como fenómeno visual o, más ampliamente, como instalación en el espacio, a menudo interactiva. Sus obras están publicadas por Donemus y las Éditions Jobert.",
  it: "Autore di opere da camera, orchestrali e liriche eseguite in tutto il mondo, dal 2012 è invitato a tenere masterclass e conferenze in Austria, Italia, Paesi Bassi, Ucraina, Francia, Israele, Spagna, Svizzera, Svezia e Russia. Nelle sue composizioni, spesso statiche e ripetitive, sviluppa il concetto di musica oggettiva: il pezzo vi vale come oggetto, come fenomeno visivo o, più ampiamente, come installazione nello spazio, spesso interattiva. Le sue opere sono pubblicate da Donemus e dalle Éditions Jobert.",
  zh: "他的室内乐、管弦乐与歌剧作品在世界各地上演；自 2012 年起，他应邀在奥地利、意大利、荷兰、乌克兰、法国、以色列、西班牙、瑞士、瑞典与俄罗斯开设大师课与讲座。在其常常静止而反复的作品中，他发展出「客体音乐」的概念：作品在此被视为一个物件、一种视觉现象，或更广义地，一个常具互动性的空间装置。其作品由 Donemus 与 Éditions Jobert 出版。",
  de: "Als Autor von Kammer-, Orchester- und Opernwerken, die weltweit aufgeführt werden, ist er seit 2012 eingeladen, Meisterkurse und Vorträge in Österreich, Italien, den Niederlanden, der Ukraine, Frankreich, Israel, Spanien, der Schweiz, Schweden und Russland zu geben. In seinen oft statischen und repetitiven Kompositionen entwickelt er das Konzept der objektiven Musik: Das Stück gilt darin als Objekt, als visuelles Phänomen oder, weiter gefasst, als räumliche, häufig interaktive Installation. Seine Werke erscheinen bei Donemus und den Éditions Jobert."
};

var ORDRE = ["fr", "es", "it", "zh", "en", "de"];

function attrs(dict) {
  return ORDRE.map(function (c) {
    return 'data-' + c + '="' + dict[c].replace(/"/g, "&quot;") + '"';
  }).join(" ");
}

function corps(code, lg) {
  var prefixe = lg ? "/" + lg + "/reseau/" : "/reseau/";
  return '<div class="body">' +
    '<p class="pd-eyebrow"><a href="' + prefixe + '" data-fr="Réseau" data-en="Network" data-es="Red" data-it="Rete" data-zh="网络" data-de="Netzwerk">' + RETOUR[code] + '</a></p>' +
    '<div class="artist-head">' +
      '<div class="artist-portrait artist-mono" style="background:linear-gradient(152deg,#1a2e4a 0%,#12202f 100%);color:#ffffff" aria-hidden="true"><span>DK</span></div>' +
      '<div><h1 class="pd-title pd-title--page">Dmitri Kourliandski</h1>' +
      '<p class="artist-role-lg" ' + attrs(ROLE) + '>' + ROLE[code] + '</p></div>' +
    '</div>' +
    '<p class="pd-pitch" ' + attrs(PITCH) + '>' + PITCH[code] + '</p>' +
    '<div class="prose artist-bio-long">' +
      '<p ' + attrs(BIO1) + '>' + BIO1[code] + '</p>' +
      '<p ' + attrs(BIO2) + '>' + BIO2[code] + '</p>' +
    '</div>';
}

var faits = [];

LANGUES.forEach(function (lg) {
  var src = path.join(DOCS, lg, "artists", MODELE, "index.html");
  var h = fs.readFileSync(src, "utf8");
  var code = CODE[lg];

  h = h.split(MODELE).join(SLUG);
  h = h.replace(/<title>[^<]*<\/title>/, "<title>Dmitri Kourliandski — STOPERA!</title>");

  var i = h.indexOf('<div class="body">');
  var j = h.indexOf("</div></div></section>");
  if (i < 0 || j < 0) throw new Error("corps introuvable dans " + src);
  h = h.slice(0, i) + corps(code, lg) + h.slice(j);

  var dossier = path.join(DOCS, lg, "artists", SLUG);
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(path.join(dossier, "index.html"), h);
  faits.push(path.relative(DOCS, path.join(dossier, "index.html")));
});

/* ── le roster « Artistes associé·e·s » de la page réseau ── */

var ROLE_ROSTER = {
  fr: "Composition", en: "Composition", es: "Composición",
  it: "Composizione", zh: "作曲", de: "Komposition"
};

var rosters = 0;

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "reseau", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf("artists/" + SLUG + "/") >= 0) return;

  // on se raccroche au dernier <li> du roster, celui de Daniel Zea
  var a = h.indexOf('artists/daniel-zea/');
  if (a < 0) { console.log("  " + f + " : Daniel Zea introuvable, roster non modifié"); return; }
  var fin = h.indexOf("</li>", a);
  if (fin < 0) { console.log("  " + f + " : </li> introuvable"); return; }
  fin += 5;

  var li = '\n              <li><span class="who"><a href="../artists/' + SLUG + '/" ' +
    'data-fr="Dmitri Kourliandski" data-en="Dmitri Kourliandski" data-es="Dmitri Kourliandski" ' +
    'data-it="Dmitri Kourliandski" data-zh="Dmitri Kourliandski" data-de="Dmitri Kourliandski" ' +
    'translate="no">Dmitri Kourliandski</a></span>' +
    '<span class="role" ' + attrs(ROLE_ROSTER) + '>' + ROLE_ROSTER[CODE[lg]] + '</span></li>';

  h = h.slice(0, fin) + li + h.slice(fin);
  fs.writeFileSync(f, h);
  rosters++;
});

console.log("fiches écrites :");
faits.forEach(function (p) { console.log("  " + p); });
console.log("roster réseau complété sur " + rosters + " page(s)");
