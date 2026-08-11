/* DEUX MOTS ALLEMANDS DE TROP.
   Relevé le 11/08/2026, en relisant le hero allemand à travers une machine à
   traduire — le seul contrôle possible quand personne ici ne lit l'allemand.

   « Schöpfung » traduit bien « création », mais pas celle-là : en allemand
   le mot dit d'abord la Création du monde, et Haydn. Pour le travail d'une
   compagnie, le mot du milieu est « Kreation ». Neuf phrases, dont la
   première que voit un visiteur : « eine internationale Plattform für
   Schöpfung, Produktion, Forschung und Weitergabe ».

   « Volksbildung » traduit littéralement « éducation populaire », et c'est le
   terme historique — mais les composés en « Volks- » portent en allemand une
   charge dont ce projet n'a pas besoin. « Außerschulische Bildungsarbeit »
   dit la même chose sans elle.

   Ne sont PAS touchés, malgré ce qu'en dit la machine :
   — « Musiktheater » : c'est le terme allemand du théâtre musical. La
     comédie musicale, elle, se dit « Musical » — jamais « Musiktheater ».
   — « Performance » : le même mot qu'en français, dans le même sens.
   — « st opera! » : le logo. Une machine y lit « Sankt Oper » ; ce n'est pas
     du texte traduisible, et il est identique dans les six langues.

   Run: node outils/allemand-registre.js [--verifier]                        */
"use strict";
var fs = require("fs"), path = require("path");
var RACINE = path.resolve(__dirname, "..");
var DOCS = path.join(RACINE, "docs");
var VERIF = process.argv.indexOf("--verifier") > 0;

var MOTS = [
  ["Schöpfung", "Kreation"],
  ["schöpfungen", "kreationen"],
  ["Schöpfungen", "Kreationen"],
  ["in der Volksbildung", "in der außerschulischen Bildungsarbeit"],
  ["Begegnungen, Volksbildung.", "Begegnungen, außerschulische Bildungsarbeit."],
  ["Aktionsforschung, Volksbildung)", "Aktionsforschung, außerschulische Bildungsarbeit)"]
];

function corriger(t) {
  MOTS.forEach(function (m) { t = t.split(m[0]).join(m[1]); });
  return t;
}

/* ---- le dictionnaire ---- */
var faitsDico = 0;
["court", "long-1", "long-2", "long-3", "long-4", "long-5", "long-6", "fragments"]
  .forEach(function (n) {
    var p = path.join(__dirname, "allemand-" + n + ".json");
    var o = JSON.parse(fs.readFileSync(p, "utf8")), out = {};
    Object.keys(o).sort().forEach(function (k) {
      var v = corriger(o[k]);
      if (v !== o[k]) faitsDico++;
      out[k] = v;
    });
    if (!VERIF) {
      fs.writeFileSync(p, "{\n" + Object.keys(out).map(function (k) {
        return "  " + JSON.stringify(k) + ": " + JSON.stringify(out[k]);
      }).join(",\n") + "\n}\n");
    }
  });

/* ---- les pages : l'attribut data-de et le texte des pages allemandes ---- */
function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var faitsPages = 0, touchees = 0;

pages(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8"), avant = h, allemande = false;
  var rel = path.relative(DOCS, f).split(path.sep)[0];
  allemande = rel === "de";

  /* dans la mémoire, sur toutes les pages */
  h = h.replace(/ data-de="([^"]*)"/g, function (m, v) {
    var n = corriger(v);
    if (n !== v) faitsPages++;
    return ' data-de="' + n + '"';
  });
  /* dans le texte affiché, sur les pages allemandes seules */
  if (allemande) {
    var head = h.slice(0, h.indexOf("<body"));
    var body = corriger(h.slice(h.indexOf("<body")));
    h = head + body;
  }

  if (h !== avant) { touchees++; if (!VERIF) fs.writeFileSync(f, h); }
});

console.log("registre allemand : " + faitsDico + " entrées du dictionnaire, " +
  faitsPages + " attributs, " + touchees + " page(s)");
