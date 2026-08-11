/* LA PAGE DES MENTIONS LÉGALES : TROIS DÉFAUTS DE CONTENU.
   Trouvés le 11/08/2026 en relisant la page. Aucun n'est récent : ils
   dorment depuis des mois sur une page que personne n'ouvrait — et que rien
   ne liait, jusqu'à ce que le pied lui rende un lien avant-hier.

   1. UN PARAGRAPHE EN DOUBLE. Le paragraphe sur Cloudflare est écrit deux
      fois : une fois à sa place, une fois encore tout en bas, dans un bloc
      posé HORS de la section — donc hors de la colonne de texte, collé au
      bord de la page. Venu de 56f2c949, la passe qui rapatriait les blocs
      perdus de l'ancien site : celui-ci n'était pas perdu.

   2. UN LIEN CASSÉ. L'adresse de courriel est un lien dont les guillemets
      sont écrits en entités — href=&quot;mailto:… — donc l'attribut vaut
      littéralement « "mailto:info@stopera.art" », guillemets compris, et le
      lien ne mène nulle part. Il est souligné, il a l'air d'un lien, il n'en
      est pas un. Venu de 968a0d84, la traduction des mentions légales : la
      valeur avait été échappée une fois de trop.

   3. UNE ESPACE INSÉCABLE AFFICHÉE. « lorsque vous en lancez la
      lecture&nbsp;; » — l'entité est écrite &amp;nbsp; dans la mémoire, donc
      rendue telle quelle à l'écran. Trois occurrences, en français, en
      espagnol et en chinois.

   Les trois sont corrigés dans le texte affiché ET dans la mémoire de
   traduction, sur les six langues.

   Run: node outils/mentions.js [--verifier]                                 */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

/* la fin du div ouvert en i, en comptant les div imbriqués */
function ferme(h, i) {
  var p = i, d = 0;
  while (p < h.length) {
    var o = h.indexOf("<div", p), f = h.indexOf("</div>", p);
    if (f < 0) return -1;
    if (o >= 0 && o < f) { d++; p = o + 4; continue; }
    d--; p = f + 6;
    if (!d) return p;
  }
  return -1;
}

var doublons = 0, liens = 0, espaces = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* 3. l'espace insécable écrite en clair */
  var n = (h.match(/&amp;nbsp;/g) || []).length;
  if (n) { espaces += n; h = h.split("&amp;nbsp;").join("&nbsp;"); }

  /* 1. le bloc en trop, posé après la fermeture de la section.
     Tous les blocs posés là ne sont pas fautifs : la page Soutenir y porte
     légitimement le défilé de la section 06. On ne retire donc que celui
     dont le texte est DÉJÀ écrit plus haut dans la page — c'est la
     définition d'un doublon, et c'est vérifiable. Le bloc est fermé en
     comptant sa profondeur, jamais sur le premier </div> rencontré.
     L'espace insécable est réparée avant, sans quoi les deux copies ne
     s'écrivent pas pareil et le doublon passe inaperçu — l'une porte
     &amp;nbsp;, l'autre &nbsp;. */
  var i = h.indexOf('</section>\n<div class="pd-block pd-full">');
  if (i < 0) i = h.indexOf('</section><div class="pd-block pd-full">');
  if (i >= 0) {
    var début = h.indexOf('<div class="pd-block pd-full">', i);
    var fin = ferme(h, début);
    if (fin > 0) {
      var bloc = h.slice(début, fin);
      var clé = (bloc.match(/\sdata-fr="([^"]{40,})"/) || [])[1];
      /* les deux copies ne s'écrivent pas exactement pareil — l'une met une
         espace insécable devant le deux-points, l'autre une espace ordinaire.
         C'est la même phrase : on compare le texte nu, pas les octets. */
      var nu = function (t) {
        return t.replace(/&nbsp;|\u00a0/g, " ").replace(/&lt;[^&]*&gt;/g, "")
          .replace(/\s+/g, " ").trim();
      };
      var ailleurs = [], re = /\sdata-fr="([^"]{40,})"/g, m;
      var amont = h.slice(0, début);
      while ((m = re.exec(amont))) ailleurs.push(nu(m[1]));
      if (clé && ailleurs.indexOf(nu(clé)) >= 0) {
        h = h.slice(0, début) + h.slice(fin);
        doublons++;
      }
    }
  }

  /* 2. les guillemets du lien, échappés une fois de trop */
  h = h.split('href=&quot;mailto:info@stopera.art&quot;')
       .join('href="mailto:info@stopera.art"');
  h = h.split('href=&amp;quot;mailto:info@stopera.art&amp;quot;')
       .join('href=&quot;mailto:info@stopera.art&quot;');
  if (h.indexOf('href="mailto:info@stopera.art"') > avant.indexOf('href="mailto:info@stopera.art"')
      || avant.indexOf('href=&quot;mailto:') >= 0) liens++;

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("mentions légales : " + doublons + " paragraphe(s) en double retiré(s), " +
  liens + " page(s) au lien réparé, " + espaces + " espace(s) insécable(s) rendue(s) — " +
  touchées + " page(s)");
