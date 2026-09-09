/* Réordonne /oeuvres/ en trois blocs — à l'affiche · en création · au répertoire —
   et remonte sur chaque carte le statut que sa fiche portait déjà.

   Pourquoi ce script existe : la page listait quatorze œuvres à plat, avec pour
   seule information une année nue, sans ordre. Einstein on the Beach y affichait
   « 2023 » alors que sa fiche annonçait deux dates à Bogotá dans dix-sept jours,
   billetterie ouverte. L'information existait, elle n'était pas remontée.

   Il agit sur les six fichiers de langue. Le français porte des attributs
   data-xx (sélecteur de langue en page) ; les cinq miroirs portent du texte
   traduit en clair. Idempotent : relançable sans dupliquer.

   node outils/oeuvres-ranger.js                                                */
"use strict";
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..", "docs");
const LANGS = ["fr", "en", "es", "it", "zh", "de"];

/* ── Les trois blocs ────────────────────────────────────────────────────── */
const BLOCS = [
  { id: "affiche",
    t: { fr:"À l'affiche", en:"On stage now", es:"En cartel", it:"In scena",
         zh:"正在上演", de:"Auf dem Spielplan" },
    s: { fr:"Les dates à venir, billetterie ouverte.",
         en:"Upcoming dates, tickets on sale.",
         es:"Próximas funciones, entradas a la venta.",
         it:"Prossime date, biglietteria aperta.",
         zh:"近期场次，购票已开放。",
         de:"Kommende Termine, Tickets erhältlich." } },
  { id: "creation",
    t: { fr:"En création", en:"In creation", es:"En creación", it:"In creazione",
         zh:"创作中", de:"In Entstehung" },
    s: { fr:"Œuvres en cours de production, par ordre de création.",
         en:"Works in production, in order of premiere.",
         es:"Obras en producción, por orden de estreno.",
         it:"Opere in produzione, in ordine di debutto.",
         zh:"制作中的作品，按首演时间排列。",
         de:"Werke in Produktion, nach Uraufführung geordnet." } },
  { id: "repertoire",
    t: { fr:"Au répertoire", en:"In repertoire", es:"En repertorio",
         it:"In repertorio", zh:"保留剧目", de:"Im Repertoire" },
    s: { fr:"Œuvres créées, de la plus récente à la plus ancienne.",
         en:"Premiered works, most recent first.",
         es:"Obras estrenadas, de la más reciente a la más antigua.",
         it:"Opere già debuttate, dalla più recente alla più antica.",
         zh:"已首演作品，由近及远。",
         de:"Uraufgeführte Werke, neueste zuerst." } },
];

/* ── Les rôles ───────────────────────────────────────────────────────────
   Source unique : le tableau des rôles du projet artistique (stopera privé,
   01_STRATEGIE/Projet_artistique.md). Il ne couvre que onze œuvres sur
   quatorze. Les trois autres — Espaces bruts, Otages, Snow on Her Lips —
   n'ont d'étiquette NULLE PART : ni fiche, ni projet artistique. Elles
   restent donc sans étiquette. Ne pas en inventer une ici.              */
const ROLES = {
  production:    { fr:"Production", en:"Production", es:"Producción",
                   it:"Produzione", zh:"制作", de:"Produktion" },
  accompagnement:{ fr:"Accompagnement", en:"Support", es:"Acompañamiento",
                   it:"Accompagnamento", zh:"支持陪伴", de:"Begleitung" },
  diffusion:     { fr:"Tournée & diffusion", en:"Touring", es:"Gira y difusión",
                   it:"Tournée e diffusione", zh:"巡演与推广", de:"Tournee & Verbreitung" },
  pedagogie:     { fr:"Pédagogie", en:"Education", es:"Pedagogía",
                   it:"Pedagogia", zh:"教育传承", de:"Pädagogik" },
};

/* ── L'ordre, et ce que chaque carte annonce ─────────────────────────────
   `an`     remplace l'année nue de la carte ; court, il tient sur une ligne.
   `statut` est la ligne nouvelle, reprise mot pour mot de la fiche.        */
const OEUVRES = [
  { slug:"einstein-on-the-beach", bloc:"affiche", role:"diffusion",
    an:{fr:"2026",en:"2026",es:"2026",it:"2026",zh:"2026",de:"2026"},
    statut:{ fr:"Bogotá, 26 & 27 septembre 2026",
             en:"Bogotá, 26 & 27 September 2026",
             es:"Bogotá, 26 y 27 de septiembre de 2026",
             it:"Bogotá, 26 e 27 settembre 2026",
             zh:"波哥大，2026年9月26日与27日",
             de:"Bogotá, 26. & 27. September 2026" } },

  { slug:"rut", bloc:"creation", role:"accompagnement",
    an:{fr:"2026",en:"2026",es:"2026",it:"2026",zh:"2026",de:"2026"},
    statut:{ fr:"Première fin 2026", en:"Premiere late 2026",
             es:"Estreno a finales de 2026", it:"Prima fine 2026",
             zh:"2026年底首演", de:"Premiere Ende 2026" } },

  { slug:"war-madrigals", bloc:"creation", role:"production",
    an:{fr:"2026",en:"2026",es:"2026",it:"2026",zh:"2026",de:"2026"},
    statut:{ fr:"Création 2026", en:"Premiere 2026", es:"Estreno 2026",
             it:"Prima 2026", zh:"2026年首演", de:"Uraufführung 2026" } },

  { slug:"insistir", bloc:"creation", role:"accompagnement",
    an:{fr:"2026",en:"2026",es:"2026",it:"2026",zh:"2026",de:"2026"},
    statut:{ fr:"Création 2026, Mexico", en:"Premiere 2026, Mexico City",
             es:"Estreno 2026, Ciudad de México", it:"Prima 2026, Città del Messico",
             zh:"2026年首演，墨西哥城", de:"Uraufführung 2026, Mexiko-Stadt" } },

  { slug:"espaces-bruts", bloc:"creation", role:null,
    an:{fr:"26/27",en:"26/27",es:"26/27",it:"26/27",zh:"26/27",de:"26/27"},
    statut:{ fr:"En production, saison 26/27", en:"In production, 26/27 season",
             es:"En producción, temporada 26/27", it:"In produzione, stagione 26/27",
             zh:"制作中，26/27演季", de:"In Produktion, Spielzeit 26/27" } },

  { slug:"mamma-roma", bloc:"creation", role:"production",
    an:{fr:"2027",en:"2027",es:"2027",it:"2027",zh:"2027",de:"2027"},
    statut:{ fr:"Création juillet 2027, Teatro Colón",
             en:"Premiere July 2027, Teatro Colón",
             es:"Estreno julio de 2027, Teatro Colón",
             it:"Prima luglio 2027, Teatro Colón",
             zh:"2027年7月首演，科隆剧院",
             de:"Uraufführung Juli 2027, Teatro Colón" } },

  { slug:"salamandres", bloc:"creation", role:"accompagnement",
    an:{fr:"2027",en:"2027",es:"2027",it:"2027",zh:"2027",de:"2027"},
    statut:{ fr:"Création 2027, festival Tête à Tête (Londres)",
             en:"Premiere 2027, Tête à Tête festival (London)",
             es:"Estreno 2027, festival Tête à Tête (Londres)",
             it:"Prima 2027, festival Tête à Tête (Londra)",
             zh:"2027年首演，Tête à Tête 音乐节（伦敦）",
             de:"Uraufführung 2027, Festival Tête à Tête (London)" } },

  { slug:"america", bloc:"creation", role:"production",
    an:{fr:"à venir",en:"to come",es:"por venir",it:"in arrivo",zh:"待定",de:"folgt"},
    statut:{ fr:"Création à Mexico, date à venir",
             en:"Premiere in Mexico City, date to come",
             es:"Estreno en Ciudad de México, fecha por confirmar",
             it:"Prima a Città del Messico, data da definire",
             zh:"墨西哥城首演，日期待定",
             de:"Uraufführung in Mexiko-Stadt, Termin folgt" } },

  { slug:"nous", bloc:"creation", role:"production",
    an:{fr:"en cours",en:"in progress",es:"en curso",it:"in corso",zh:"进行中",de:"in Arbeit"},
    statut:{ fr:"En cours d'écriture", en:"In progress", es:"En curso",
             it:"In corso", zh:"创作进行中", de:"In Arbeit" } },

  { slug:"lips", bloc:"creation", role:"pedagogie", lien:"/lips/",
    an:{fr:"2028",en:"2028",es:"2028",it:"2028",zh:"2028",de:"2028"},
    statut:{ fr:"Prochaine édition 2028", en:"Next edition 2028",
             es:"Próxima edición 2028", it:"Prossima edizione 2028",
             zh:"下一届 2028", de:"Nächste Ausgabe 2028" } },

  { slug:"ooo", bloc:"repertoire", role:"diffusion",
    an:{fr:"2025",en:"2025",es:"2025",it:"2025",zh:"2025",de:"2025"},
    statut:{ fr:"Créé en 2025 au Teatro Colón",
             en:"Premiered 2025 at Teatro Colón",
             es:"Estrenada en 2025 en el Teatro Colón",
             it:"Debuttata nel 2025 al Teatro Colón",
             zh:"2025年于科隆剧院首演",
             de:"2025 am Teatro Colón uraufgeführt" } },

  { slug:"otages", bloc:"repertoire", role:null,
    an:{fr:"2024",en:"2024",es:"2024",it:"2024",zh:"2024",de:"2024"},
    statut:{ fr:"Créé en 2024 à l'Opéra de Lyon",
             en:"Premiered 2024 at Opéra de Lyon",
             es:"Estrenada en 2024 en la Ópera de Lyon",
             it:"Debuttata nel 2024 all'Opéra de Lyon",
             zh:"2024年于里昂歌剧院首演",
             de:"2024 an der Opéra de Lyon uraufgeführt" } },

  { slug:"fame", bloc:"repertoire", role:"pedagogie",
    an:{fr:"2021",en:"2021",es:"2021",it:"2021",zh:"2021",de:"2021"},
    statut:{ fr:"Créé en 2021 à l'Auditorium de Lyon",
             en:"Premiered 2021 at the Auditorium de Lyon",
             es:"Estrenada en 2021 en el Auditorium de Lyon",
             it:"Debuttata nel 2021 all'Auditorium de Lyon",
             zh:"2021年于里昂音乐厅首演",
             de:"2021 im Auditorium de Lyon uraufgeführt" } },

  { slug:"snow-on-her-lips", bloc:"repertoire", role:null,
    an:{fr:"2021",en:"2021",es:"2021",it:"2021",zh:"2021",de:"2021"},
    statut:{ fr:"Créé en 2021 au Printemps des Arts de Monte-Carlo",
             en:"Premiered 2021 at Printemps des Arts, Monte-Carlo",
             es:"Estrenada en 2021 en el Printemps des Arts de Montecarlo",
             it:"Debuttata nel 2021 al Printemps des Arts di Montecarlo",
             zh:"2021年于蒙特卡洛艺术之春首演",
             de:"2021 beim Printemps des Arts, Monte-Carlo, uraufgeführt" } },
];

/* Le rythme des poses (a: bandeau large · b: image à droite · c: image à
   gauche · d: texte sur image sombre). Réaffecté après le tri pour que
   l'alternance visuelle survive au réordonnancement.                      */
const POSES = ["a","b","c","d"];

const esc = t => String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;")
                          .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const attrs = m => LANGS.map(l => ` data-${l}="${esc(m[l])}"`).join("");

function bloc(b, lang) {
  const t = lang === "fr"
    ? `<h2 class="oeu-groupe-t"${attrs(b.t)}>${esc(b.t.fr)}</h2>`
      + `<p class="oeu-groupe-s"${attrs(b.s)}>${esc(b.s.fr)}</p>`
    : `<h2 class="oeu-groupe-t">${esc(b.t[lang])}</h2>`
      + `<p class="oeu-groupe-s">${esc(b.s[lang])}</p>`;
  return `<div class="oeu-groupe oeu-groupe--${b.id}"><div class="oeu-groupe-w">${t}</div></div>`;
}

function traiter(fichier, lang) {
  let s = fs.readFileSync(fichier, "utf8");

  // 1. purge d'un passage précédent
  s = s.replace(/<div class="oeu-groupe[^"]*">.*?<\/div><\/div>/gs, "");

  // 2. récolte des articles, indexés par slug
  const arts = {};
  const re = /<article class="oeu[^"]*">.*?<\/article>/gs;
  let m, tous = [];
  while ((m = re.exec(s))) tous.push(m[0]);
  if (tous.length !== OEUVRES.length)
    throw new Error(`${fichier} : ${tous.length} articles, ${OEUVRES.length} attendus`);
  for (const a of tous) {
    const h = /href="([^"]+)"/.exec(a)[1];
    const slug = h.replace(/\/$/, "").split("/").pop();
    arts[slug] = a;
  }

  // 3. réécriture de chaque carte, dans le nouvel ordre
  let sortie = "", blocCourant = null, i = 0;
  for (const o of OEUVRES) {
    let a = arts[o.slug];
    if (!a) throw new Error(`${fichier} : œuvre introuvable — ${o.slug}`);

    if (o.bloc !== blocCourant) {
      sortie += bloc(BLOCS.find(b => b.id === o.bloc), lang);
      blocCourant = o.bloc;
    }

    // pose
    a = a.replace(/class="oeu oeu--[a-d]"/, `class="oeu oeu--${POSES[i % 4]}"`);

    // année
    const an = lang === "fr"
      ? `<span class="oeu-y"${attrs(o.an)}>${esc(o.an.fr)}</span>`
      : `<span class="oeu-y">${esc(o.an[lang])}</span>`;
    a = a.replace(/<span class="oeu-y"[^>]*>.*?<\/span>/s, an);

    // purge d'une ligne de statut déjà posée (le script doit pouvoir tourner
    // deux fois de suite sans empiler deux statuts sur la même carte)
    a = a.replace(/<p class="oeu-st">.*?<\/p>/s, "");

    // statut (+ rôle quand il est établi), inséré avant le résumé
    const r = o.role ? ROLES[o.role] : null;
    const et = r
      ? (lang === "fr"
          ? `<span class="oeu-role"${attrs(r)}>${esc(r.fr)}</span>`
          : `<span class="oeu-role">${esc(r[lang])}</span>`)
      : "";
    const st = lang === "fr"
      ? `<span class="oeu-statut-t"${attrs(o.statut)}>${esc(o.statut.fr)}</span>`
      : `<span class="oeu-statut-t">${esc(o.statut[lang])}</span>`;
    a = a.replace(/<p class="oeu-s"/, `<p class="oeu-st">${et}${st}</p><p class="oeu-s"`);

    sortie += a;
    i++;
  }

  // 4. remplacement en bloc
  const d = s.indexOf("<article"), f = s.lastIndexOf("</article>") + 10;
  s = s.slice(0, d) + sortie + s.slice(f);
  fs.writeFileSync(fichier, s);
  console.log(`  ${lang} — ${OEUVRES.length} œuvres, 3 blocs`);
}

console.log("Range /oeuvres/ en trois blocs :");
for (const l of LANGS)
  traiter(path.join(RACINE, l === "fr" ? "" : l, "oeuvres", "index.html"), l);
console.log("Fait. Vérifier le rendu avant de publier.");
