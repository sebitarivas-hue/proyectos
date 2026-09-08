"use strict";
/* ESPACES BRUTS. RE-INHABITATION — fiche œuvre, six langues.
 *
 * Version conforme à la mise à jour envoyée par Dmitri le 05/07 : toutes
 * les figures sont des mannequins, il n'y a plus d'interprètes en direct,
 * les projections sont fixes et les projecteurs sont des projecteurs de
 * diapositives.
 *
 * Cette version ne perd pas la tension du dossier d'origine, elle la
 * déplace : le corps médié et le corps présent sont maintenant tous les
 * deux arrêtés, et le seul corps vivant du dispositif est celui du
 * visiteur. C'est ce que dit le lead.
 *
 * Deuxième passe, WhatsApp du 05/07 à 17h38 et 17h39 : Dmitri ne veut pas
 * que les scènes soient décrites une à une, il suffit de dire que chaque
 * salle présente un scénario différent avec des mannequins ; et la durée
 * n'est pas fixée. Le bloc « Le parcours » a donc été retiré et les
 * quatre-vingt-dix minutes du dossier ne sont plus annoncées.
 *
 * Squelette repris de la fiche Insistir : tête de document, navigation et
 * pied de page conservés, corps remplacé. Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var LANGUES = ["", "en", "es", "it", "zh", "de"];
var CODE = { "": "fr", en: "en", es: "es", it: "it", zh: "zh", de: "de" };
var SLUG = "espaces-bruts";
var MODELE = "insistir";
var ORDRE = ["fr", "es", "it", "zh", "en", "de"];

function A(d) {
  return ORDRE.map(function (c) {
    return 'data-' + c + '="' + String(d[c]).replace(/"/g, "&quot;") + '"';
  }).join(" ");
}
function T(tag, d, code, cls) {
  return "<" + tag + (cls ? ' class="' + cls + '" ' : " ") + A(d) + ">" + d[code] + "</" + tag + ">";
}

var EYEBROW = {
  fr: "02 &middot; œuvres &middot; En production · saison 26/27",
  en: "02 &middot; works &middot; In production · 26/27 season",
  es: "02 &middot; obras &middot; En producción · temporada 26/27",
  it: "02 &middot; opere &middot; In produzione · stagione 26/27",
  zh: "02 · 作品 · 制作中 · 26/27 演季",
  de: "02 &middot; Werke &middot; In Produktion · Spielzeit 26/27"
};

var LEAD = {
  fr: "Installation performative pour six espaces reliés, construite sur le recyclage et la réhabitation. Le visiteur traverse six salles qui présentent chacune un scénario différent, avec son propre environnement sonore et visuel, et qui se déroulent toutes en même temps. Les figures y sont des mannequins et les images projetées sont fixes : dans tout le dispositif, le seul corps vivant est celui du visiteur. La matière sonore est faite de sources recyclées, enregistrements inachevés, fragments écartés, artefacts numériques. Conçue pour des sous-sols, des friches industrielles, des bâtiments abandonnés.",
  en: "A performance installation for six connected spaces, built on recycling and re-inhabitation. Visitors move through six rooms, each presenting a different scenario with its own acoustic and visual environment, all of them unfolding at the same time. The figures are mannequins and the projected images are still: in the whole device, the only living body is the visitor's. The sound material is made of recycled sources, unfinished recordings, discarded fragments, digital artefacts. Conceived for basements, industrial sites and abandoned buildings.",
  es: "Instalación performativa para seis espacios conectados, construida sobre el reciclaje y la re-habitación. El visitante atraviesa seis salas que presentan cada una un escenario diferente, con su propio entorno sonoro y visual, y que se desarrollan todas al mismo tiempo. Las figuras son maniquíes y las imágenes proyectadas son fijas: en todo el dispositivo, el único cuerpo vivo es el del visitante. La materia sonora está hecha de fuentes recicladas, grabaciones inacabadas, fragmentos descartados, artefactos digitales. Concebida para sótanos, naves industriales y edificios abandonados.",
  it: "Installazione performativa per sei spazi collegati, costruita sul riciclo e sulla ri-abitazione. Il visitatore attraversa sei sale che presentano ciascuna uno scenario diverso, con il proprio ambiente sonoro e visivo, e che si svolgono tutte nello stesso momento. Le figure sono manichini e le immagini proiettate sono fisse: in tutto il dispositivo, l'unico corpo vivo è quello del visitatore. La materia sonora è fatta di fonti riciclate, registrazioni incompiute, frammenti scartati, artefatti digitali. Concepita per scantinati, siti industriali ed edifici abbandonati.",
  zh: "一件为六个相连空间构思的表演性装置，建立在回收与「再栖居」之上。观众穿行于六个房间，每间呈现一个不同的场景，各有其声音与视觉环境，并且全部同时进行。其中的人形皆为人体模型，投影影像为静止画面：在整个装置里，唯一活着的身体是观众自己的身体。声音材料取自被回收的素材，包括未完成的录音、被舍弃的片段与数字残迹。作品为地下室、工业废墟与废弃建筑而构思。",
  de: "Performative Installation für sechs verbundene Räume, gebaut auf Wiederverwertung und Wiederbewohnung. Die Besucher·innen durchqueren sechs Räume, von denen jeder ein eigenes Szenario zeigt, mit eigener akustischer und visueller Umgebung, und die alle gleichzeitig ablaufen. Die Figuren sind Schaufensterpuppen und die projizierten Bilder stehen still: Im gesamten Dispositiv ist der einzige lebende Körper der der Besucher·innen. Das Klangmaterial besteht aus wiederverwerteten Quellen, unfertigen Aufnahmen, verworfenen Fragmenten, digitalen Artefakten. Konzipiert für Keller, Industriebrachen und verlassene Gebäude."
};

var BADGE = {
  fr: "À l'entrée, chaque visiteur reçoit un badge nominatif : au recto son numéro et ses heures d'entrée et de sortie, au verso un QR code vers l'archive numérique du projet. Le badge repart avec lui. Ce n'est ni un billet ni un souvenir, c'est une pièce de l'œuvre qui continue d'exister au dehors.",
  en: "On entering, each visitor receives a personal badge: on the front, their number and their entry and exit times; on the back, a QR code to the project's digital archive. The badge leaves with them. It is neither a ticket nor a souvenir, but a part of the work that goes on existing outside it.",
  es: "A la entrada, cada visitante recibe un distintivo nominativo: en el anverso su número y sus horas de entrada y de salida; en el reverso, un código QR hacia el archivo digital del proyecto. El distintivo se va con él. No es ni una entrada ni un recuerdo, sino una pieza de la obra que sigue existiendo fuera de ella.",
  it: "All'ingresso, ogni visitatore riceve un badge nominativo: sul recto il suo numero e gli orari di entrata e di uscita; sul verso, un codice QR verso l'archivio digitale del progetto. Il badge se ne va con lui. Non è né un biglietto né un souvenir, ma un pezzo dell'opera che continua a esistere all'esterno.",
  zh: "入场时，每位观众领取一枚署名的证章：正面是编号与进出时间，背面是通往项目数字档案的二维码。证章由观众带走。它既不是门票也不是纪念品，而是作品的一部分，在作品之外继续存在。",
  de: "Beim Eintritt erhält jede·r Besucher·in einen persönlichen Ausweis: auf der Vorderseite die Nummer sowie Eintritts- und Austrittszeit, auf der Rückseite ein QR-Code zum digitalen Archiv des Projekts. Der Ausweis geht mit. Er ist weder Ticket noch Andenken, sondern ein Teil des Werks, das außerhalb weiterbesteht."
};

/* ── libellés ── */
var L = {
  infos:   { fr: "Informations", en: "Details", es: "Información", it: "Informazioni", zh: "信息", de: "Angaben" },
  genre:   { fr: "Genre", en: "Genre", es: "Género", it: "Genere", zh: "类型", de: "Gattung" },
  concep:  { fr: "Conception & musique", en: "Concept & music", es: "Concepción & música", it: "Ideazione & musica", zh: "构思与音乐", de: "Konzept & Musik" },
  duree:   { fr: "Durée", en: "Duration", es: "Duración", it: "Durata", zh: "时长", de: "Dauer" },
  disp:    { fr: "Dispositif", en: "Setup", es: "Dispositivo", it: "Dispositivo", zh: "装置", de: "Dispositiv" },
  lieux:   { fr: "Lieux", en: "Venues", es: "Lugares", it: "Luoghi", zh: "场地", de: "Orte" },
  statut:  { fr: "Statut", en: "Status", es: "Estado", it: "Stato", zh: "状态", de: "Status" },
  tech:    { fr: "Dispositif technique", en: "Technical setup", es: "Dispositivo técnico", it: "Dispositivo tecnico", zh: "技术配置", de: "Technisches Dispositiv" },
  prod:    { fr: "Production", en: "Production", es: "Producción", it: "Produzione", zh: "制作", de: "Produktion" },
  lproj:   { fr: "Projection", en: "Projection", es: "Proyección", it: "Proiezione", zh: "投影", de: "Projektion" },
  lson:    { fr: "Son", en: "Sound", es: "Sonido", it: "Suono", zh: "声音", de: "Ton" },
  llum:    { fr: "Lumière", en: "Lighting", es: "Luz", it: "Luce", zh: "灯光", de: "Licht" },
  lcam:    { fr: "Vidéo en direct", en: "Live video", es: "Vídeo en directo", it: "Video in diretta", zh: "实时影像", de: "Live-Video" },
  lscen:   { fr: "Éléments scéniques", en: "Scenic elements", es: "Elementos escénicos", it: "Elementi scenici", zh: "舞台元素", de: "Szenische Elemente" }
};

var V = {
  genre:  { fr: "Installation performative", en: "Performance installation", es: "Instalación performativa", it: "Installazione performativa", zh: "表演性装置", de: "Performative Installation" },
  duree:  { fr: "Non fixée", en: "Not fixed", es: "No fijada", it: "Non fissata", zh: "未定", de: "Nicht festgelegt" },
  disp:   { fr: "Six espaces reliés, parcourus librement", en: "Six connected spaces, freely walked through", es: "Seis espacios conectados, recorridos libremente", it: "Sei spazi collegati, percorsi liberamente", zh: "六个相连的空间，自由穿行", de: "Sechs verbundene Räume, frei durchschritten" },
  lieux:  { fr: "Sous-sols, friches industrielles, bâtiments abandonnés", en: "Basements, industrial sites, abandoned buildings", es: "Sótanos, naves industriales, edificios abandonados", it: "Scantinati, siti industriali, edifici abbandonati", zh: "地下室、工业废墟、废弃建筑", de: "Keller, Industriebrachen, verlassene Gebäude" },
  statut: { fr: "En production · saison 2026-2027", en: "In production · 2026-2027 season", es: "En producción · temporada 2026-2027", it: "In produzione · stagione 2026-2027", zh: "制作中 · 2026-2027 演季", de: "In Produktion · Spielzeit 2026-2027" },
  proj:   { fr: "Six systèmes de projection fixe, un par salle, en projecteurs de diapositives", en: "Six still-projection systems, one per room, using slide projectors", es: "Seis sistemas de proyección fija, uno por sala, con proyectores de diapositivas", it: "Sei sistemi di proiezione fissa, uno per sala, con proiettori per diapositive", zh: "六套静止投影系统，每室一套，使用幻灯片投影机", de: "Sechs Standbild-Projektionssysteme, eines pro Raum, mit Diaprojektoren" },
  son:    { fr: "Six systèmes multicanaux indépendants, stéréo minimum, quatre canaux de préférence", en: "Six independent multichannel systems, stereo minimum, four channels preferred", es: "Seis sistemas multicanal independientes, estéreo como mínimo, cuatro canales preferentemente", it: "Sei sistemi multicanale indipendenti, stereo minimo, quattro canali preferibilmente", zh: "六套独立多声道音响系统，最低立体声，建议四声道", de: "Sechs unabhängige Mehrkanalsysteme, mindestens Stereo, bevorzugt vier Kanäle" },
  lum:    { fr: "Occultation complète ou lumière entièrement maîtrisée, éclairage adapté à chaque salle", en: "Full blackout or fully controlled lighting, adapted to each room", es: "Oscuridad total o luz enteramente controlada, adaptada a cada sala", it: "Oscuramento completo o luce interamente controllata, adattata a ciascuna sala", zh: "完全遮光或完全可控的照明，并适配各室", de: "Vollständige Verdunkelung oder vollständig kontrolliertes Licht, auf jeden Raum abgestimmt" },
  cam:    { fr: "Une caméra dans la première salle, seule image en direct de l'installation", en: "One camera in the first room, the only live image in the installation", es: "Una cámara en la primera sala, única imagen en directo de la instalación", it: "Una telecamera nella prima sala, unica immagine in diretta dell'installazione", zh: "第一间房内一台摄像机，是整件装置中唯一的实时影像", de: "Eine Kamera im ersten Raum, das einzige Live-Bild der Installation" },
  scen:   { fr: "Mannequins, grands sacs de déchets dans les six salles, badges visiteurs avec cordon", en: "Mannequins, large refuse bags in all six rooms, visitor badges with lanyards", es: "Maniquíes, grandes bolsas de basura en las seis salas, distintivos de visitante con cordón", it: "Manichini, grandi sacchi di rifiuti nelle sei sale, badge per i visitatori con cordino", zh: "人体模型、六个房间内的大号垃圾袋、带挂绳的观众证章", de: "Schaufensterpuppen, große Müllsäcke in allen sechs Räumen, Besucherausweise mit Band" },
  prod:   { fr: "Projet porté par STOPERA! pour la saison 26/27, en recherche de lieux et de partenaires de production.",
            en: "A project carried by STOPERA! for the 26/27 season, looking for venues and production partners.",
            es: "Proyecto llevado por STOPERA! para la temporada 26/27, en busca de lugares y de socios de producción.",
            it: "Progetto portato da STOPERA! per la stagione 26/27, alla ricerca di luoghi e partner di produzione.",
            zh: "由 STOPERA! 于 26/27 演季推动的项目，正在寻找场地与制作伙伴。",
            de: "Ein von STOPERA! für die Spielzeit 26/27 getragenes Projekt, auf der Suche nach Orten und Produktionspartnern." }
};

function corps(code, lg) {
  var p = lg ? "/" + lg : "";
  var dl = "<dl>" +
    T("dt", L.genre, code) + T("dd", V.genre, code) +
    T("dt", L.concep, code) + '<dd><a class="xref" href="' + p + '/artists/dmitri-kourliandski/" translate="no">Dmitri Kourliandski</a></dd>' +
    T("dt", L.duree, code) + T("dd", V.duree, code) +
    T("dt", L.disp, code) + T("dd", V.disp, code) +
    T("dt", L.lieux, code) + T("dd", V.lieux, code) +
    T("dt", L.statut, code) + T("dd", V.statut, code) +
    "</dl>";

  var titre = { fr: "Espaces bruts. Re-inhabitation", en: "Espaces bruts. Re-inhabitation", es: "Espaces bruts. Re-inhabitation", it: "Espaces bruts. Re-inhabitation", zh: "Espaces bruts. Re-inhabitation", de: "Espaces bruts. Re-inhabitation" };

  var tech = "<dl>" +
    T("dt", L.lproj, code) + T("dd", V.proj, code) +
    T("dt", L.lson, code) + T("dd", V.son, code) +
    T("dt", L.llum, code) + T("dd", V.lum, code) +
    T("dt", L.lcam, code) + T("dd", V.cam, code) +
    T("dt", L.lscen, code) + T("dd", V.scen, code) +
    "</dl>";

  return '<section class="sec " style="--sec:var(--mag)"><div class="wrap"><div class="num" aria-hidden="true">02</div><div class="body">' +
      '<p class="eyebrow" ' + A(EYEBROW) + '>' + EYEBROW[code] + '</p>' +
      '<h2 ' + A(titre) + ' translate="no">' + titre[code] + '</h2>' +
      '<p class="lead" ' + A(LEAD) + '>' + LEAD[code] + '</p>' +
    '</div></div></section>' +
    '<figure class="fig-full"><img src="/assets/projects/espaces-bruts.jpg" alt="Espaces bruts. Re-inhabitation" /></figure>' +
    '<section class="sec sec--right" style="--sec:var(--mag)"><div class="wrap"><div class="num" aria-hidden="true">02</div><div class="body">' +
      '<div class="meta">' + T("h3", L.infos, code) + dl + "</div>" +
      '<div class="meta">' + T("h3", L.tech, code) + tech + "</div>" +
    '</div></div></section>' +
    '<figure class="fig-full"><img src="/assets/projects/espaces-bruts-six.jpg" alt="' +
      { fr: "Les six espaces", en: "The six spaces", es: "Los seis espacios", it: "I sei spazi", zh: "六个空间", de: "Die sechs Räume" }[code] + '" loading="lazy" /></figure>' +
    '<section class="sec " style="--sec:var(--mag)"><div class="wrap"><div class="num" aria-hidden="true">02</div><div class="body">' +
      '<div class="prose">' + T("p", BADGE, code) + T("p", V.prod, code) + "</div>" +
    '</div></div></section>';
}

var faits = [];

LANGUES.forEach(function (lg) {
  var src = path.join(DOCS, lg, "productions", MODELE, "index.html");
  var h = fs.readFileSync(src, "utf8");
  var code = CODE[lg];

  h = h.split(MODELE).join(SLUG);
  h = h.replace(/<title>[^<]*<\/title>/, "<title>Espaces bruts. Re-inhabitation — STOPERA!</title>");

  var i = h.indexOf('<section class="sec');
  var j = h.indexOf("<footer");
  if (i < 0 || j < 0) throw new Error("corps introuvable dans " + src);
  h = h.slice(0, i) + corps(code, lg) + h.slice(j);

  var dossier = path.join(DOCS, lg, "productions", SLUG);
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(path.join(dossier, "index.html"), h);
  faits.push(path.relative(DOCS, path.join(dossier, "index.html")));
});

console.log("fiches œuvre écrites :");
faits.forEach(function (f) { console.log("  " + f); });
