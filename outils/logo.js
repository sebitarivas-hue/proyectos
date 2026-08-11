/* LA MARQUE DE LA BARRE : « So! », EN NEUTRIX.
   La barre a porté trois choses en deux jours. D'abord le logotype d'avant —
   un mot en capitales grasses à filet intérieur, servi en PNG, étranger à la
   direction artistique et flou sur les écrans denses. Puis l'O suspendu, un
   signe dessiné ; écarté à l'usage. Maintenant « So! », choisi le 11/08/2026 :
   les deux lettres et le point d'exclamation du nom, dans la typographie du
   site.

   Elle est écrite, pas dessinée : Neutrix 400, comme le grand
   logo du hero, avec le magenta sur la fin — « st » / « opera! » là-haut,
   « So » / « ! » ici. C'est du texte, donc net à toute densité d'écran, et
   l'encre suit la couleur de la barre où qu'elle aille.

   Compact aussi : à 390 px le fil des rangs a besoin de toute la largeur, et
   le mot entier la lui prenait.

   Run: node outils/logo.js [--verifier]                                     */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

/* le point prend le magenta : c'est lui qu'on doit voir passer */
var MARQUE = '<span class="marque" translate="no">So<span class="m">!</span></span>';

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html" || e.name === "404.html") a.push(p);
  });
  return a;
}

var posées = 0, icônes = 0, touchées = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;

  /* ce que la barre portait avant — l'image, puis le signe — cède la place ;
     le lien et son libellé pour les lecteurs d'écran ne bougent pas */
  h = h.replace(/(<a class="brand"[^>]*>)\s*(?:<img[^>]*>|<svg class="marque"[\s\S]*?<\/svg>|<span class="marque"[\s\S]*?<\/span><\/span>)\s*(<\/a>)/g,
    function (m, ouvre, ferme) { posées++; return ouvre + MARQUE + ferme; });

  /* l'onglet : la même marque, en image, car un mot de trois signes ne se
     compose pas dans un favicon — la police n'y est pas garantie */
  h = h.replace(/<link rel="icon" type="image\/svg\+xml" href="\/assets\/marque\.svg" \/>\n?/, "");
  if (h.indexOf('href="/assets/marque-so-180.png"') < 0) {
    h = h.replace(/<link rel="icon" type="image\/png" href="\/assets\/favicon\.png" \/>/,
      function () {
        icônes++;
        return '<link rel="icon" type="image/png" sizes="32x32" href="/assets/marque-so-32.png" />\n' +
          '<link rel="icon" type="image/png" sizes="180x180" href="/assets/marque-so-180.png" />\n' +
          '<link rel="apple-touch-icon" href="/assets/marque-so-180.png" />';
      });
  }

  if (h !== avant) { touchées++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("marque posée : " + posées + " barres, " + icônes + " onglets — " +
  touchées + " page(s)");
