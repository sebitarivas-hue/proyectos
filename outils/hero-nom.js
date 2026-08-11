/* LE NOM DU HERO SE COUPE APRÈS « STOP », PLUS APRÈS « ST ».
   Le grand logo était composé en deux morceaux : « st » en crème, « opera! »
   en magenta. À la lecture, ces deux lettres isolées ne disent pas le début
   de STOP — elles disent l'abréviation de Saint. « st honoré », signalé le
   11/08/2026. C'est le même malentendu qu'avait fabriqué le traducteur
   automatique deux jours plus tôt en annonçant « Saint Opéra ! » : la coupe
   elle-même l'invitait.

   Elle passe donc après le P. « stop » d'un côté, « era! » de l'autre — le
   mot que le nom contient, et ce qui reste quand on l'a dit. La palette ne
   bouge pas : crème et magenta, comme avant.

   La capitale revient au passage, au hero comme au pied : la barre porte
   « So! », et un nom qui s'écrit de deux façons à deux écrans d'intervalle
   n'est plus un nom. La feuille de style forçait le bas de casse sur les
   deux — elle ne le force plus, c'est le texte qui décide.

   Run: node outils/hero-nom.js [--verifier]                                 */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

var AVANT = /<h1( translate="no")?>[Ss]t(op)?<span class="m">(opera|era)!<\/span><\/h1>/g;
var APRES = '<h1 translate="no">Stop<span class="m">era!</span></h1>';

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html" || e.name === "404.html") a.push(p);
  });
  return a;
}

var coupés = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h;
  h = h.replace(AVANT, function () { coupés++; return APRES; });
  if (h !== avant && !VERIF) fs.writeFileSync(f, h);
});

console.log("nom du hero recoupé après « stop » : " + coupés + " page(s)");
