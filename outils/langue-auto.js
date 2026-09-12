"use strict";
/* LA LANGUE DU VISITEUR — 12/09/2026.
 *
 * Le site existe en six langues, avec les 64 mêmes routes dans chacune :
 * passer d'une version à l'autre est donc une simple bascule de préfixe,
 * et aucune adresse ne peut tomber dans le vide.
 *
 * Quatre garde-fous, parce qu'une redirection automatique mal posée est
 * pire que pas de redirection du tout :
 *
 *   1. On ne redirige QUE depuis les pages françaises, celles qui n'ont
 *      pas de préfixe. Une adresse en /de/ ou en /zh/ est un choix
 *      explicite, de celui qui l'a ouverte ou de celui qui l'a envoyée :
 *      on n'y touche jamais.
 *   2. Une seule fois. Le choix est retenu dans le navigateur ; aux
 *      visites suivantes, plus rien ne bouge.
 *   3. Le sélecteur de langue fait autorité : dès qu'on s'en sert, son
 *      choix est enregistré et la détection ne se déclenche plus jamais.
 *      (Cette part vit dans transition.js, qui est chargé partout.)
 *   4. On utilise location.replace et non une affectation : l'historique
 *      ne garde pas la page d'où l'on vient, donc le bouton Retour ne
 *      renvoie pas dans une boucle.
 *
 * Le script est posé en ligne dans la tête du document, avant tout le
 * reste : une redirection différée laisserait voir la page française une
 * fraction de seconde avant de basculer. Il est enveloppé dans un try :
 * un navigateur qui refuse le stockage local garde simplement le site en
 * français, sans rien casser.
 *
 * Idempotent.
 */
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var PREFIXES = ["en", "es", "it", "zh", "de"];
var MARQUE = "st-langue-auto";

var SCRIPT =
  '<script id="' + MARQUE + '">(function(){try{' +
    'var L=["en","es","it","zh","de"],p=location.pathname;' +
    'if(/^\\/(en|es|it|zh|de)(\\/|$)/.test(p))return;' +          /* version explicite */
    'var m=localStorage.getItem("st-langue");' +
    'if(m==="fr")return;' +                                       /* français voulu */
    'if(m&&L.indexOf(m)>=0){location.replace("/"+m+p+location.search+location.hash);return;}' +
    'var n=navigator.languages||[navigator.language||"fr"],c=null;' +
    'for(var i=0;i<n.length&&!c;i++){' +
      'var t=String(n[i]).toLowerCase();' +
      'if(t.indexOf("fr")===0)return;' +                          /* le français est ici */
      'for(var j=0;j<L.length;j++){if(t.indexOf(L[j])===0){c=L[j];break;}}' +
    '}' +
    'if(!c)return;' +
    'localStorage.setItem("st-langue",c);' +
    'location.replace("/"+c+p+location.search+location.hash);' +
  '}catch(e){}})();<\/script>';

function pagesFr(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === "assets") return;
      if (d === DOCS && PREFIXES.indexOf(e.name) >= 0) return;     /* versions traduites */
      pagesFr(p, a);
      return;
    }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}

var posees = 0, deja = 0;

pagesFr(DOCS).forEach(function (f) {
  var h = fs.readFileSync(f, "utf8");

  /* si une version antérieure est déjà posée, on la remplace : l'outil
     reste rejouable après chaque affinage de la règle */
  var rx = new RegExp('\\n?<script id="' + MARQUE + '">[\\s\\S]*?<\\/script>');
  if (rx.test(h)) {
    var neuf = h.replace(rx, "\n" + SCRIPT);
    if (neuf === h) { deja++; return; }
    fs.writeFileSync(f, neuf);
    posees++;
    return;
  }

  /* juste après le viewport : avant toute feuille de style, donc avant
     que quoi que ce soit ne s'affiche */
  var ancre = h.indexOf('<meta name="viewport"');
  if (ancre < 0) { console.log("  " + f + " : viewport introuvable"); return; }
  var fin = h.indexOf(">", ancre) + 1;

  fs.writeFileSync(f, h.slice(0, fin) + "\n" + SCRIPT + h.slice(fin));
  posees++;
});

console.log("détection posée sur " + posees + " page(s) française(s), déjà présente sur " + deja);
