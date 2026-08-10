/* CE QUE LA MIGRATION A LAISSÉ DERRIÈRE, PAGE PAR PAGE.
   La comparaison avec le site d'avant la V2 a montré des liens de partenaires
   et des images absents du nouveau site. Plutôt que de recoller des liens un
   à un — ce qui perdrait leur intitulé, leur rôle et leur traduction —, ce
   contrôle remonte au BLOC qui les portait dans l'ancienne page et le
   réinjecte entier.

   Deux garde-fous :
     · un bloc n'est repris que si son intitulé n'existe pas déjà dans la page
       (les deux vocabulaires nomment les mêmes choses) ;
     · si le bloc existe déjà, seuls les éléments de liste porteurs d'un lien
       manquant y sont ajoutés — on ne duplique jamais.

   Run: node outils/recuperer-blocs.js [--verifier]                          */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var ANCIEN = process.env.ANCIEN || "/tmp/ancien/docs";
var VERIF = process.argv.indexOf("--verifier") > 0;

function pages(base, a, d) {
  a = a || []; d = d || base;
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(base, a, p); return; }
    if (e.name === "index.html") a.push(path.relative(base, d).split(path.sep).join("/").replace(/^\.$/, ""));
  });
  return a;
}
var nu = s => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase();

function finDe(h, from, nom) {
  var d = 0, i = from, o = "<" + nom, f = "</" + nom + ">", bas = h.toLowerCase();
  while (i < h.length) {
    var a = bas.indexOf(o, i), b = bas.indexOf(f, i);
    if (b < 0) return -1;
    if (a >= 0 && a < b && /[\s>/]/.test(h[a + o.length] || "")) { d++; i = a + o.length; continue; }
    if (d === 0) return b;
    d--; i = b + f.length;
  }
  return -1;
}
/* le plus petit <li> ou <p> qui contient la position i */
function porteur(h, i) {
  for (var nom of ["li", "p"]) {
    var j = h.lastIndexOf("<" + nom, i);
    if (j < 0) continue;
    var k = finDe(h, h.indexOf(">", j) + 1, nom);
    if (k > i) return { html: h.slice(j, k + nom.length + 3), nom: nom };
  }
  return null;
}
/* le bloc (div à classe) qui contient la position i, avec son intitulé */
function blocDe(h, i) {
  var j = h.lastIndexOf('<div class="', i);
  while (j >= 0) {
    var ouvre = h.indexOf(">", j) + 1;
    var k = finDe(h, ouvre, "div");
    if (k > i) {
      var corps = h.slice(ouvre, k);
      var t = corps.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/);
      if (t) return { html: h.slice(j, k + 6), titre: nu(t[1]) };
    }
    j = h.lastIndexOf('<div class="', j - 1);
  }
  return null;
}
var liens = h => [...new Set((h.match(/href="(https?:\/\/[^"]+)"/g) || [])
  .map(x => x.slice(6, -1)).filter(u => !/stopera\.art|instagram|youtube|facebook/.test(u)))];

var blocsRepris = 0, elementsRepris = 0, touchees = 0;

pages(DOCS).forEach(function (r) {
  var fNouveau = path.join(DOCS, r, "index.html");
  var fAncien = path.join(ANCIEN, r, "index.html");
  if (!fs.existsSync(fAncien)) return;

  var neuf = fs.readFileSync(fNouveau, "utf8");
  var vieux = fs.readFileSync(fAncien, "utf8");
  var manquants = liens(vieux).filter(u => neuf.indexOf('"' + u + '"') < 0);
  if (!manquants.length) return;

  var titres = (neuf.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g) || []).map(nu);
  var aAjouter = [], dejaVu = new Set();
  var nb = 0, ne = 0;

  manquants.forEach(function (u) {
    var i = vieux.indexOf('"' + u + '"');
    if (i < 0) return;
    var bloc = blocDe(vieux, i);
    if (bloc && titres.indexOf(bloc.titre) < 0) {
      if (dejaVu.has(bloc.titre)) return;
      dejaVu.add(bloc.titre); titres.push(bloc.titre);
      aAjouter.push(bloc.html); nb++;
      return;
    }
    /* le bloc existe : on n'ajoute que l'élément porteur du lien */
    var el = porteur(vieux, i);
    if (!el || dejaVu.has(el.html)) return;
    dejaVu.add(el.html);
    if (bloc) {
      var ancre = neuf.indexOf("</ul>", neuf.indexOf(">", neuf.lastIndexOf('<div class="', neuf.indexOf(bloc.titre))) );
      void ancre;
    }
    aAjouter.push('<ul class="taglist">' + el.html + "</ul>"); ne++;
  });

  if (!aAjouter.length) return;
  blocsRepris += nb; elementsRepris += ne; touchees++;
  console.log("  /" + (r ? r + "/" : "") + " ← " + nb + " bloc(s), " + ne + " élément(s) : " +
    manquants.slice(0, 3).join(", ") + (manquants.length > 3 ? "…" : ""));

  if (VERIF) return;
  var ancre = neuf.lastIndexOf('<a class="more"');
  if (ancre < 0) ancre = neuf.indexOf('<footer class="foot">');
  fs.writeFileSync(fNouveau, neuf.slice(0, ancre) + aAjouter.join("") + neuf.slice(ancre));
});

console.log((VERIF ? "à récupérer : " : "récupéré : ") + blocsRepris + " bloc(s) et " +
  elementsRepris + " élément(s) sur " + touchees + " page(s)");
