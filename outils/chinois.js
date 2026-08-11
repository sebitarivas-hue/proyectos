/* LE CHINOIS, RELU DANS SON CONTEXTE.
   Personne ici ne lit le chinois. Ce contrôle ne juge donc pas la langue : il
   vérifie ce qui se vérifie sans la parler — les pièges de sens que le
   français tend, et les conventions typographiques que le chinois impose et
   qu'une traduction faite depuis le français perd toujours aux mêmes endroits.

   1. LES MOTS À DEUX SENS. Le même mot français ne dit pas la même chose
      selon l'endroit : « Parcours » est un fil thématique sur /parcours/ et
      un curriculum sur une fiche d'artiste ; « Direction » est une fonction
      ou un geste de chef ; « Création » est une première. L'anglais déjà posé
      tranche : si deux emplois d'un mot ont deux anglais différents et un
      seul chinois, le chinois a perdu la distinction.

   2. LES FAUX AMIS DU VOCABULAIRE. 音乐剧 est la comédie musicale ; le théâtre
      musical se dit 音乐剧场. La confusion est la même qu'en allemand entre
      Musical et Musiktheater — et elle change ce qu'est la compagnie.

   3. LA PONCTUATION. Le chinois écrit sa ponctuation en pleine chasse —
      ，。：；！？（）—— et jamais d'espace autour. Une virgule latine ou une
      espace insécable devant un deux-points sont des importations du français
      qui se voient à l'écran.

   4. LES NOMS PROPRES. Un titre d'œuvre ne se traduit pas.

   Run: node outils/chinois.js                                              */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
function decode(s) {
  return s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&middot;/g, "·").replace(/&nbsp;/g, "\u00a0")
    .replace(/&amp;/g, "&");
}
/* l'analyseur : les balises, en tenant compte des guillemets */
function balises(h) {
  var res = [], i = 0;
  while (i < h.length) {
    var lt = h.indexOf("<", i);
    if (lt < 0) break;
    var c = h.charAt(lt + 1);
    if (c === "!") {
      var e = h.substr(lt, 4) === "<!--" ? h.indexOf("-->", lt) + 3 : h.indexOf(">", lt) + 1;
      i = e > 0 ? e : h.length; continue;
    }
    if (!/[a-zA-Z\/]/.test(c)) { i = lt + 1; continue; }
    var j = lt + 1;
    if (h.charAt(j) === "/") j++;
    var q = null;
    while (j < h.length) {
      var ch = h.charAt(j);
      if (q) { if (ch === q) q = null; }
      else if (ch === '"' || ch === "'") q = ch;
      else if (ch === ">") break;
      j++;
    }
    res.push(h.slice(lt, j + 1));
    i = j + 1;
  }
  return res;
}
function lire(b, nom) {
  var m = b.match(new RegExp("\\s" + nom + '="([^"]*)"'));
  return m ? m[1] : null;
}

/* ---- la mémoire, relevée sur le site ---- */
var M = {};              /* fr → { zh:Set, en:Set, pages:Set } */
pages(DOCS).forEach(function (f) {
  var rel = path.relative(DOCS, f);
  balises(fs.readFileSync(f, "utf8")).forEach(function (b) {
    var fr = lire(b, "data-fr"), zh = lire(b, "data-zh"), en = lire(b, "data-en");
    if (fr === null || zh === null) return;
    fr = decode(fr).trim(); zh = decode(zh).trim();
    if (!fr) return;
    var e = M[fr] || (M[fr] = { zh: {}, en: {}, pages: {} });
    e.zh[zh] = 1;
    if (en) e.en[decode(en).trim()] = 1;
    e.pages[rel] = 1;
  });
});
var CLES = Object.keys(M);
console.log("paires français → chinois : " + CLES.length + "\n");

var pb = [];

/* ---- 1. les mots à deux sens ---- */
CLES.forEach(function (fr) {
  var en = Object.keys(M[fr].en), zh = Object.keys(M[fr].zh);
  if (en.length > 1 && zh.length === 1) {
    pb.push(["distinction perdue", fr + "  →  " + zh[0] +
      "   (l'anglais dit " + en.map(function (x) { return "« " + x + " »"; }).join(" et ") + ")"]);
  }
});

/* ---- 2. les faux amis ---- */
var FAUX = [
  ["音乐剧场", "音乐剧", "comédie musicale au lieu de théâtre musical"],
  ["歌剧", null, null]
];
CLES.forEach(function (fr) {
  Object.keys(M[fr].zh).forEach(function (zh) {
    FAUX.forEach(function (t) {
      if (!t[1]) return;
      /* 音乐剧 seul, non suivi de 场 */
      var re = new RegExp(t[1] + "(?!场)", "g");
      if (re.test(zh)) pb.push(["faux ami", fr.slice(0, 60) + "  →  " + zh.slice(0, 60) +
        "   (" + t[2] + " ; " + t[0] + " attendu)"]);
    });
  });
});

/* ---- 3. la ponctuation ---- */
var HAN = /[\u4e00-\u9fff]/;
CLES.forEach(function (fr) {
  Object.keys(M[fr].zh).forEach(function (zh) {
    if (!HAN.test(zh)) return;
    var maux = [];
    if (/[\u00a0\u202f][：，。；！？]/.test(zh)) maux.push("espace insécable devant une ponctuation pleine chasse");
    if (/[\u4e00-\u9fff],[^\d]/.test(zh)) maux.push("virgule latine entre deux caractères han");
    if (/[\u4e00-\u9fff];/.test(zh)) maux.push("point-virgule latin");
    if (/[\u4e00-\u9fff]\s:/.test(zh)) maux.push("deux-points latin précédé d'une espace");
    if (/[\u4e00-\u9fff]\.(\s|$)/.test(zh)) maux.push("point latin en fin de phrase");
    if (/ [：，。；！？]| $/.test(zh)) maux.push("espace ordinaire accolée à une ponctuation pleine chasse");
    if (/«|»/.test(zh)) maux.push("guillemets français (《》 ou «» pleine chasse attendus)");
    maux.forEach(function (m) { pb.push(["ponctuation", zh.slice(0, 64) + "   — " + m]); });
  });
});

/* ---- 4. les noms propres traduits ---- */
var NOMS = ["Otages", "Insistir", "Mamma Roma", "Snow on Her Lips", "War Madrigals",
  "A World to Blast", "De l'Innocence", "OOO", "[FAM]E", "Lips Lab", "STOPERA!"];
CLES.forEach(function (fr) {
  NOMS.forEach(function (n) {
    if (fr.trim() !== n) return;
    Object.keys(M[fr].zh).forEach(function (zh) {
      if (zh !== n) pb.push(["nom propre traduit", n + "  →  " + zh]);
    });
  });
});

/* ---- 5. resté en français ---- */
CLES.forEach(function (fr) {
  Object.keys(M[fr].zh).forEach(function (zh) {
    if (zh === fr && /[a-zà-ÿ]{4}/i.test(fr) && !HAN.test(zh) && NOMS.indexOf(fr) < 0)
      pb.push(["non traduit", fr.slice(0, 70)]);
  });
});

var par = {};
pb.forEach(function (p) { (par[p[0]] = par[p[0]] || []).push(p[1]); });
Object.keys(par).forEach(function (k) {
  var l = [...new Set(par[k])];
  console.log("== " + k.toUpperCase() + " : " + l.length);
  l.slice(0, 25).forEach(function (x) { console.log("   " + x); });
  console.log("");
});
if (!pb.length) console.log("rien à signaler");
