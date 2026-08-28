"use strict";
/* LES CINQ AUTRES LANGUES, ET L'ÉCHO SUR LA PAGE D'ACCUEIL.
 *
 * Le brief du 21/08 donnait le texte en français. Il n'a été posé qu'en
 * français : les cinq autres langues de /pourquoi/ gardaient l'ancien
 * texte, et les six pages d'accueil citent le même titre en aperçu, dans
 * leur propre langue, sans jamais avoir été touchées. Deux défauts de
 * cohérence signalés le 21/08 — celui-ci les referme.
 *
 * Traductions faites à la main, dans le registre déjà établi par le
 * traducteur d'origine sur cette page (mêmes tournures, mêmes choix —
 * « formes scéniques » = « stage forms », pas « performing arts »).
 *
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");

/* ---- pourquoi/index.html, quatre passages, cinq langues ---- */
var POURQUOI = [
  { nom: "titre", lang: {
    es: ["Las formas escénicas atraviesan hoy una profunda transformación.", "Las formas escénicas cambian."],
    en: ["The performing arts are undergoing a profound transformation.", "Stage forms are changing."],
    it: ["Le forme sceniche attraversano oggi una profonda trasformazione.", "Le forme sceniche cambiano."],
    zh: ["舞台形式正经历一场深刻的转变。", "舞台形式正在改变。"],
    de: ["Die szenischen Formen durchlaufen heute einen tiefgreifenden Wandel.", "Die szenischen Formen verändern sich."]
  }},
  { nom: "positionnement", lang: {
    es: ["STOPERA! es una compañía y un colectivo: una infraestructura ligera de investigación y creación dedicada a las nuevas escrituras de la escena musical contemporánea.",
         "STOPERA! es una plataforma independiente de investigación y creación, dedicada a las nuevas escrituras de la escena musical contemporánea."],
    en: ["STOPERA! is a company and a collective: a light infrastructure for research and creation dedicated to the new forms of contemporary musical theatre.",
         "STOPERA! is an independent platform for research and creation, dedicated to the new forms of contemporary musical theatre."],
    it: ["STOPERA! è una compagnia e un collettivo: un'infrastruttura leggera di ricerca e creazione dedicata alle nuove scritture della scena musicale contemporanea.",
         "STOPERA! è una piattaforma indipendente di ricerca e creazione, dedicata alle nuove scritture della scena musicale contemporanea."],
    zh: ["STOPERA! 是一家剧团，也是一个团体：一个轻量的研究与创作基础设施，致力于当代音乐舞台的新书写。",
         "STOPERA! 是一个独立的研究与创作平台，致力于当代音乐舞台的新书写。"],
    de: ["STOPERA! ist eine Kompanie und ein Kollektiv: eine leichte Infrastruktur für Forschung und Kreation, den neuen Schreibweisen der zeitgenössischen Musikbühne gewidmet.",
         "STOPERA! ist eine unabhängige Plattform für Forschung und Kreation, den neuen Schreibweisen der zeitgenössischen Musikbühne gewidmet."]
  }},
  { nom: "redondance « plus qu'une compagnie »", lang: {
    es: ["Más que una compañía, STOPERA! es un espacio donde", "Es un espacio donde"],
    en: ["More than a company, STOPERA! is a space where", "It is a space where"],
    it: ["Più che una compagnia, STOPERA! è uno spazio dove", "È uno spazio dove"],
    zh: ["STOPERA! 不止是一家剧团，而是一个让作品", "STOPERA! 是一个让作品"],
    de: ["Mehr als eine Kompanie ist STOPERA! ein Raum, in dem", "Es ist ein Raum, in dem"]
  }},
  { nom: "paragraphe final", lang: {
    es: ["STOPERA! contribuye a la renovación de las escrituras escénicas contemporáneas y a la aparición de un espacio de investigación compartido entre creación artística, innovación y sociedad.",
         "STOPERA! contribuye a la renovación de las escrituras escénicas contemporáneas y crea espacios de investigación y encuentro entre artistas, investigadores, instituciones y públicos."],
    en: ["STOPERA! contributes to renewing contemporary stage writing and to the emergence of a research space shared between artistic creation, innovation and society.",
         "STOPERA! contributes to renewing contemporary stage writing and creates spaces for research and exchange between artists, researchers, institutions and audiences."],
    it: ["STOPERA! contribuisce al rinnovamento delle scritture sceniche contemporanee e alla nascita di uno spazio di ricerca condiviso tra creazione artistica, innovazione e società.",
         "STOPERA! contribuisce al rinnovamento delle scritture sceniche contemporanee e crea spazi di ricerca e condivisione tra artisti, ricercatori, istituzioni e pubblico."],
    zh: ["STOPERA! 推动当代舞台书写的更新，并促成一个在艺术创作、创新与社会之间共享的研究空间。",
         "STOPERA! 推动当代舞台书写的更新，并在艺术家、研究者、机构与公众之间创造研究与共享的空间。"],
    de: ["trägt STOPERA! zur Erneuerung der zeitgenössischen szenischen Schreibweisen bei und zur Entstehung eines gemeinsamen Forschungsraums zwischen künstlerischem Schaffen, Innovation und Gesellschaft.",
         "trägt STOPERA! zur Erneuerung der zeitgenössischen szenischen Schreibweisen bei und schafft Räume für Forschung und Austausch zwischen Künstler·innen, Forschenden, Institutionen und Publikum."]
  }}
];

var LANGUES = ["", "en", "es", "it", "zh", "de"];
var touches = {};
POURQUOI.forEach(function (p) { touches[p.nom] = 0; });

LANGUES.forEach(function (lg) {
  var f = path.join(DOCS, lg, "pourquoi", "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8"), avant = h;
  POURQUOI.forEach(function (p) {
    Object.keys(p.lang).forEach(function (code) {
      var pair = p.lang[code];
      if (h.indexOf(pair[0]) < 0) return;
      h = h.split(pair[0]).join(pair[1]);
      touches[p.nom]++;
    });
  });
  if (h !== avant) fs.writeFileSync(f, h);
});

console.log("pourquoi, cinq langues :");
Object.keys(touches).forEach(function (nom) { console.log("  " + nom + " : " + touches[nom]); });

/* ---- écho sur les six pages d'accueil : le même titre, en aperçu ---- */
var ACCUEIL = [
  { f: "index.html", avant: "<h2>Les formes scéniques traversent une transformation profonde.</h2>", apres: "<h2>Les formes scéniques changent.</h2>" },
  { f: "en/index.html", avant: "<h2>The stage forms are undergoing a profound transformation.</h2>", apres: "<h2>Stage forms are changing.</h2>" },
  { f: "es/index.html", avant: "<h2>Las formas escénicas atraviesan una transformación profunda.</h2>", apres: "<h2>Las formas escénicas cambian.</h2>" },
  { f: "it/index.html", avant: "<h2>Le forme sceniche attraversano una trasformazione profonda.</h2>", apres: "<h2>Le forme sceniche cambiano.</h2>" },
  { f: "zh/index.html", avant: "<h2>舞台形式正经历深刻的转变。</h2>", apres: "<h2>舞台形式正在改变。</h2>" },
  { f: "de/index.html", avant: "<h2>Die szenischen Formen durchlaufen einen tiefgreifenden Wandel.</h2>", apres: "<h2>Die szenischen Formen verändern sich.</h2>" }
];

var poses = 0;
ACCUEIL.forEach(function (a) {
  var f = path.join(DOCS, a.f);
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  if (h.indexOf(a.avant) < 0) return;
  h = h.split(a.avant).join(a.apres);
  fs.writeFileSync(f, h);
  poses++;
});
console.log("accueil, six langues : " + poses + " page(s) alignée(s) sur le nouveau titre");
