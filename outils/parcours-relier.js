/* Rend les Parcours atteignables et referme la boucle.

   Constat du 09/09/2026 : les trente pages de /parcours/ existent, sont
   complètes, sont dans le sitemap — et AUCUN lien du site n'y mène, dans
   aucune des six langues. Pire, le bouton de l'accueil qui dit « Explorer
   par parcours » pointe sur /oeuvres/. Seul un moteur de recherche pouvait
   trouver cette partie du site.

   Trois gestes, aucun contenu inventé :
     1. /oeuvres/ propose la lecture transversale en bas de page ;
     2. chaque fiche d'œuvre affiche les parcours auxquels elle appartient,
        cliquables — la carte du parcours menait à l'œuvre, l'œuvre ne
        revenait pas.
   (Une troisième étape, qui détournait le bouton de l'accueil vers
   /parcours/, a été retirée le 09/09 : l'accueil va aux œuvres.)

   La correspondance œuvre ↔ parcours n'est pas saisie ici : elle est LUE
   dans les pages /parcours/<slug>/ publiées, qui font foi.

   node outils/parcours-relier.js                                          */
"use strict";
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..", "docs");
const LANGS = ["fr", "en", "es", "it", "zh", "de"];
const prefixe = l => (l === "fr" ? "" : "/" + l);
const dossier = l => path.join(RACINE, l === "fr" ? "" : l);

const MOT = { // « Parcours », dans le titre de la page de chaque langue
  fr:"Parcours", en:"Threads", es:"Recorridos", it:"Percorsi", zh:"主题", de:"Themenwege" };
const INVITE = {
  fr:"Lire le répertoire par parcours", en:"Read the repertoire by thread",
  es:"Leer el repertorio por recorridos", it:"Leggere il repertorio per percorsi",
  zh:"按主题阅读作品", de:"Das Repertoire nach Themenwegen lesen" };
const RETOUR = { // le lien « ← toutes les œuvres » : il n'existait qu'en fr et de
  fr:"toutes les œuvres", en:"all works", es:"todas las obras",
  it:"tutte le opere", zh:"全部作品", de:"alle Werke" };

const esc = t => String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;")
                          .replace(/>/g,"&gt;").replace(/"/g,"&quot;");

/* ── 1. Lire la correspondance dans les pages publiées ─────────────────── */
function correspondance(lang) {
  const base = path.join(dossier(lang), "parcours");
  const carte = {};                       // slug d'œuvre → [{slug, titre}]
  for (const p of fs.readdirSync(base)) {
    const f = path.join(base, p, "index.html");
    if (!fs.existsSync(f)) continue;
    const s = fs.readFileSync(f, "utf8");
    // Le titre est prélevé dans du HTML : il porte déjà ses entités
    // (« Corps &amp; présence »). Le ré-échapper afficherait « &amp;amp; ».
    const m = /<h1[^>]*>(.*?)<\/h1>/s.exec(s);
    const titre = m ? m[1].replace(/<[^>]+>/g, "").trim() : esc(p);
    const vus = new Set();
    for (const l of s.matchAll(/href="(?:\.\.\/\.\.\/|\/(?:[a-z]{2}\/)?)(productions\/[^"\/]+|lips)\//g)) {
      const slug = l[1].replace("productions/", "");
      if (vus.has(slug)) continue;
      vus.add(slug);
      (carte[slug] = carte[slug] || []).push({ slug: p, titre });
    }
  }
  return carte;
}

/* ── 2. L'accueil : NE PAS Y TOUCHER ───────────────────────────────────
   Ce script a d'abord fait pointer le bouton du bloc 02 de l'accueil vers
   /parcours/, parce que son libellé disait « Explorer par parcours ».
   Sébastien a tranché le 09/09/2026 : **le bloc 02 va aux œuvres**, et le
   libellé a été refait pour le dire (« Voir les œuvres »). Les Parcours
   restent atteignables depuis /oeuvres/, ce qui suffit — vérifié : zéro
   page orpheline. Ne pas rétablir l'étape supprimée ici.                */

/* ── 3. /oeuvres/ → /parcours/ ─────────────────────────────────────────── */
function oeuvres(lang) {
  const f = path.join(dossier(lang), "oeuvres", "index.html");
  let s = fs.readFileSync(f, "utf8");
  s = s.replace(/<p class="oeu-vers-parcours">.*?<\/p>/s, "");   // rejouable
  const lien = `<p class="oeu-vers-parcours"><a class="more" href="${prefixe(lang)}/parcours/">`
             + `${esc(INVITE[lang])} <span aria-hidden="true">&rarr;</span></a></p>`;
  // la note de bas de page n'existe pas dans toutes les langues : on retombe
  // alors sur le pied de page, qui lui est partout.
  const anc = s.includes('<p class="section-note"')
    ? '<p class="section-note"' : '<footer class="foot">';
  if (!s.includes(anc)) return `  ${lang} — /oeuvres/ : ancre introuvable`;
  s = s.replace(anc, lien + anc);
  fs.writeFileSync(f, s);
  return `  ${lang} — /oeuvres/ → /parcours/`;
}

/* ── 4. Chaque fiche → ses parcours ────────────────────────────────────── */
function fiches(lang) {
  const carte = correspondance(lang);
  let n = 0, sans = [];
  const cibles = fs.readdirSync(path.join(dossier(lang), "productions"))
    .map(d => [d, path.join(dossier(lang), "productions", d, "index.html")]);
  cibles.push(["lips", path.join(dossier(lang), "lips", "index.html")]);

  for (const [slug, f] of cibles) {
    if (!fs.existsSync(f)) continue;
    let s = fs.readFileSync(f, "utf8");
    s = s.replace(/<p class="fiche-parcours">.*?<\/p>/s, "");    // rejouable
    const ps = carte[slug];
    if (!ps || !ps.length) { sans.push(slug); fs.writeFileSync(f, s); continue; }

    const liens = ps.map(p =>
      `<a href="${prefixe(lang)}/parcours/${p.slug}/">${p.titre}</a>`).join("");
    const bloc = `<p class="fiche-parcours"><span class="fiche-parcours-t">`
               + `${esc(MOT[lang])}</span>${liens}</p>`;

    // Juste avant le retour « ← toutes les œuvres ». Ce retour n'existait
    // qu'en français et en allemand : les quatre autres langues laissaient le
    // visiteur au bout d'une fiche sans autre issue que la barre de navigation.
    // Il est posé au passage, sur le pied de page.
    const re = new RegExp(`<a class="more" href="${prefixe(lang)}/oeuvres/"`);
    if (re.test(s)) {
      s = s.replace(re, bloc + `<a class="more" href="${prefixe(lang)}/oeuvres/"`);
    } else if (s.includes('<footer class="foot">')) {
      const retour = `<a class="more" href="${prefixe(lang)}/oeuvres/">`
                   + `<span aria-hidden="true">&larr;</span> ${esc(RETOUR[lang])}</a>`;
      s = s.replace('<footer class="foot">',
                    `<div class="wrap fiche-fin">${bloc}${retour}</div><footer class="foot">`);
    } else continue;
    fs.writeFileSync(f, s);
    n++;
  }
  return `  ${lang} — ${n} fiches reliées` + (sans.length ? ` · sans parcours : ${sans.join(", ")}` : "");
}

console.log("Relie les Parcours :");
for (const l of LANGS) {
  console.log(oeuvres(l));
  console.log(fiches(l));
}
