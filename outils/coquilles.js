/* LES COQUILLES DE LANGUE — ce que le contrôle des phrases ne voyait pas.
   L'audit de traduction ne compte que les phrases d'au moins cinq mots : il
   laissait passer les intitulés courts. « créations & productions » restait
   en français sur les cinq accueils, comme les appels de l'accueil avant lui.

   Ce contrôle prend le problème par l'autre bout : il relève, page par page,
   tout texte affiché IDENTIQUE entre le français et sa traduction, sans
   condition de longueur, et écarte ce qui n'a pas à être traduit — les noms
   propres, les titres d'œuvres, les millésimes, les adresses.

   Il ne corrige rien : il montre. La traduction d'un intitulé est une
   décision éditoriale, elle ne s'improvise pas dans un script.

   Usage : servir docs/ sur 8899, puis
   PW=<…>/playwright-core node outils/coquilles.js                          */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
var LANGS = ["en", "es", "it", "zh"];

/* ce qui s'écrit pareil dans toutes les langues, et doit le rester */
var PROPRES = /^(stopera!?|lips|ooo|otages|nous|rut|insistir|[0-9\s·—–.,:&+×]+|.{0,2})$/i;
var NOMS = /teatro col[oó]n|grame|ircam|unsam|cetc|t[eê]te [aà] t[eê]te|pasolini|[cč]apek|bouraoui|angot|aperghis|rivas|bauer|porte renaud|lacroch|salabert|jerez|gentilly|buenos aires|monte-?carlo|instagram|youtube|facebook|sonic theatre|mamma roma|america|war madrigals|snow on her lips|fame|trilobite|dalida|mantegna|cie |op[eé]ra de lyon|croix-rousse|p[oô]le pixel|printemps des arts|radio france|muse en circuit|g[eé]n[eé]rateur|ville de|chartreuse|ensembleinter|futurs compos|m[eé]taboles|artenr[eé]el|ola|drac/i;

function routes(base) {
  var out = [];
  (function w(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
      var p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== "assets" && LANGS.indexOf(e.name) < 0) w(p); return; }
      if (e.name === "index.html") {
        var r = path.relative(base, d).split(path.sep).join("/");
        out.push(r === "." ? "" : r);
      }
    });
  })(base);
  return out;
}

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage({ viewport: { width: 1280, height: 900 } });

  async function morceaux(u) {
    await pg.goto("http://127.0.0.1:8899/" + u, { waitUntil: "load" });
    return pg.evaluate(function () {
      var out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        var t = (n.nodeValue || "").replace(/\s+/g, " ").trim();
        if (!t) continue;
        var e = n.parentElement;
        if (!e || e.closest("script, style, svg")) continue;
        out.push(t);
      }
      return out;
    });
  }

  var suspects = new Map();
  for (var r of routes("docs")) {
    var fr = await morceaux(r ? r + "/" : "");
    var ensembleFr = new Set(fr);
    for (var l of LANGS) {
      var tr;
      try { tr = await morceaux(l + "/" + (r ? r + "/" : "")); } catch (_) { continue; }
      tr.forEach(function (t) {
        if (!ensembleFr.has(t)) return;
        if (PROPRES.test(t) || NOMS.test(t)) return;
        var k = t.toLowerCase();
        if (!suspects.has(k)) suspects.set(k, { t: t, langues: new Set(), ou: (r || "(accueil)") });
        suspects.get(k).langues.add(l);
      });
    }
  }
  await b.close();

  var liste = [...suspects.values()].filter(function (s) { return s.langues.size >= 2; });
  liste.sort(function (a, b2) { return b2.langues.size - a.langues.size || a.t.localeCompare(b2.t); });

  console.log("intitulés identiques au français dans au moins deux langues : " + liste.length);
  liste.slice(0, 40).forEach(function (s) {
    console.log("  [" + [...s.langues].sort().join(" ") + "] « " + s.t.slice(0, 68) + " »   — " + s.ou);
  });
})();
