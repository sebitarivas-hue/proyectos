/* /oeuvres/ : le catalogue en plan de ville.

   Demande du 09/09/2026 : « un canevas avec 2 ou 3 images selon la ligne,
   que la vue ordi et mobile laisse voir plus d'une œuvre par page — comme
   le dessin d'une ville qui part d'un centre, et l'arborescence montre des
   ramifications. »

   Traduction :
   — une VOIE CENTRALE court sur toute la page ; les noms de blocs s'y posent
     comme des places, et les rangées s'en écartent de part et d'autre ;
   — le CENTRE est ce qui joue : une œuvre seule, large, en haut de la voie ;
   — les RAMIFICATIONS sont des rangées de trois puis de deux, alternées, pour
     que le plan ne devienne jamais une grille régulière ;
   — sur téléphone, deux colonnes : on voit toujours plus d'une œuvre.

   Le script ne réécrit pas les cartes : il les regroupe en rangées et leur
   retire leurs poses d'affiche (a/b/c/d), qui supposaient une œuvre par
   bande. Rejouable : il défait son propre découpage avant de le refaire.

   node outils/oeuvres-plan.js                                              */
"use strict";
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..", "docs");
const LANGS = ["fr", "en", "es", "it", "zh", "de"];

/* ── Une couleur par catégorie ────────────────────────────────────────────
   Les quatorze photos passaient toutes par le même duotone magenta : la page
   entière était rose et rien ne distinguait ce qui joue de ce qui est au
   répertoire. Chaque bloc reçoit donc son duotone, pris dans la palette du
   site, pas inventé :

     à l'affiche   magenta  --mag  la couleur de la section 02, et celle de
                                   l'urgence : c'est ce qui se joue maintenant
     en création   bleu     --blu  le gros du catalogue : profond, calme
     au répertoire graphite --ink  l'encre sur le papier — l'archive, et le
                                   repos visuel entre deux blocs colorés
     laboratoire   cyan     im-labo (existant, inchangé) — Lips Lab garde la
                                   couleur qu'il a déjà partout ailleurs

   Un duotone se règle en deux couleurs : l'ombre (première valeur) et la
   haute lumière (seconde), canal par canal, après passage en luminance. */
const DUOTONE = {
  affiche:    { id: "im-affiche",    r: [0.10, 1.00], g: [0.02, 0.36], b: [0.24, 0.74] },
  creation:   { id: "im-creation",   r: [0.04, 0.64], g: [0.04, 0.63], b: [0.18, 1.00] },
  repertoire: { id: "im-repertoire", r: [0.04, 0.85], g: [0.04, 0.82], b: [0.05, 0.78] },
};
/* Lips Lab n'est pas une œuvre du répertoire : c'est le laboratoire. Il garde
   son duotone, défini ailleurs sur le site. */
const GARDE_SA_COULEUR = { lips: "im-labo" };

function definitions() {
  return Object.values(DUOTONE).map(d =>
    `<filter id="${d.id}" color-interpolation-filters="sRGB">`
    + '<feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  '
    + '0.3 0.59 0.11 0 0  0 0 0 1 0"/><feComponentTransfer>'
    + `<feFuncR type="table" tableValues="${d.r.join(" ")}"/>`
    + `<feFuncG type="table" tableValues="${d.g.join(" ")}"/>`
    + `<feFuncB type="table" tableValues="${d.b.join(" ")}"/>`
    + "</feComponentTransfer></filter>").join("");
}

/* Le rythme des rangées, bloc par bloc. Somme obligatoire : 1 + 9 + 4 = 14. */
const RYTHME = { affiche: [1], creation: [3, 2, 2, 2], repertoire: [2, 2] };

function traiter(f, lang) {
  let s = fs.readFileSync(f, "utf8");

  // 1. défaire un découpage précédent, sans toucher aux cartes
  s = s.replace(/<div class="plan">/g, "").replace(/<\/div><!--\/plan-->/g, "")
       .replace(/<div class="plan-rang[^"]*">/g, "").replace(/<\/div><!--\/rang-->/g, "");

  // 2. relever les blocs et les cartes, dans l'ordre
  const morceaux = [];
  const re = /<div class="oeu-groupe oeu-groupe--([a-z]+)">.*?<\/div><\/div>|<article class="oeu[^"]*">.*?<\/article>/gs;
  let m;
  while ((m = re.exec(s))) morceaux.push({ groupe: m[1] || null, html: m[0] });
  const cartes = morceaux.filter(x => !x.groupe).length;
  if (cartes !== 14) throw new Error(`${f} : ${cartes} cartes, 14 attendues`);

  // 3. recomposer : un bloc, puis ses rangées
  let sortie = '<div class="plan">', i = 0, groupe = null, file = [];
  const vider = () => {
    if (!file.length) return;
    const rythme = RYTHME[groupe] || [2];
    let k = 0, r = 0;
    while (k < file.length) {
      const n = Math.min(rythme[r % rythme.length], file.length - k);
      sortie += `<div class="plan-rang plan-rang--${n}">`
              + file.slice(k, k + n).join("") + "</div><!--/rang-->";
      k += n; r++;
    }
    file = [];
  };
  for (const x of morceaux) {
    if (x.groupe) { vider(); groupe = x.groupe; sortie += x.html; }
    else {
      let h = x.html.replace(/class="oeu oeu--[a-d]"/, 'class="oeu oeu--tuile"');
      const slug = (/href="[^"]*?\/([^"\/]+)\/"/.exec(h) || [])[1];
      const im = GARDE_SA_COULEUR[slug] || (DUOTONE[groupe] || {}).id || "im-oeuvres";
      h = h.replace(/class="im-[a-z-]+\s*"/, `class="${im} "`);
      file.push(h);
    }
  }
  vider();
  sortie += "</div><!--/plan-->";

  // 4. remplacer le bloc d'origine
  const d = s.indexOf('<div class="oeu-groupe');
  const fin = s.lastIndexOf("</article>") + 10;
  s = s.slice(0, d) + sortie + s.slice(fin);

  // les définitions de duotone, dans le bloc <svg> de la page (rejouable)
  for (const d of Object.values(DUOTONE))
    s = s.replace(new RegExp(`<filter id="${d.id}".*?</filter>`, "s"), "");
  s = s.replace("</svg>", definitions() + "</svg>");

  fs.writeFileSync(f, s);
  const rangs = (sortie.match(/plan-rang--/g) || []).length;
  console.log(`  ${lang} — 14 œuvres en ${rangs} rangées`);
}

console.log("Compose le plan :");
for (const l of LANGS)
  traiter(path.join(RACINE, l === "fr" ? "" : l, "oeuvres", "index.html"), l);
