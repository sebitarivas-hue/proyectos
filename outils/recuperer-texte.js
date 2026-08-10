/* LE TEXTE QUE LA COMPOSITION AVAIT LAISSÉ.
   La comparaison avec le site d'avant la V2 a montré des paragraphes entiers
   absents des pages françaises — le récit de « NOUS » autour de Christine
   Angot, celui de Dalida dans OOO, le travail de terrain des salamandres, des
   dates de création, la phrase sur les cookies des mentions légales.

   Ils manquaient parce que les pages françaises ont été composées à partir
   d'un sous-ensemble des données, là où les quatre autres langues étaient
   reprises des pages publiées. Le texte est repris tel quel, avec ses
   attributs de traduction : rien n'est réécrit.

   L'extraction passe par le navigateur, jamais par une expression régulière :
   les attributs data-<lang> de ce site contiennent du HTML — des « < » et des
   « > » à l'intérieur d'une valeur d'attribut. Tout découpage textuel s'y
   trompe et finit par recopier un morceau d'attribut dans la page.

   Deux exclusions volontaires :
     · la phrase « STOPERA! n'est pas une compagnie, ni un collectif… », que la
       direction artistique a fait retirer — c'est justement une compagnie ET
       un collectif ;
     · l'accueil, dont la composition V2 est une décision de DA et non un
       oubli : ce qu'il ne reprend plus est signalé, jamais réinjecté.

   Usage : servir docs/ sur 8899, l'ancien site sur 8898, puis
   PW=<…>/playwright-core node outils/recuperer-texte.js [--verifier]        */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");
var ANCIEN = process.env.ANCIEN || "/tmp/ancien/docs";
var VERIF = process.argv.indexOf("--verifier") > 0;
var ACCUEIL = new Set(["", "en", "es", "it", "zh"]);

function pages(base, a, d) {
  a = a || []; d = d || base;
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(base, a, p); return; }
    if (e.name === "index.html") a.push(path.relative(base, d).split(path.sep).join("/").replace(/^\.$/, ""));
  });
  return a;
}
function cle(s) {
  return String(s).replace(/<[^>]+>/g, " ").toLowerCase()
    .replace(/-?\s*porte renaud\s*-?/g, "porterenaud")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage({ viewport: { width: 1280, height: 900 } });

  /* tout le texte du nouveau site, normalisé */
  var neuf = "";
  for (var rn of pages(DOCS)) {
    await pg.goto("http://127.0.0.1:8899/" + (rn ? rn + "/" : ""), { waitUntil: "load" });
    neuf += cle(await pg.evaluate(() => document.body.innerText)) + " ";
  }

  var repris = 0, touchees = 0, accueil = [];

  for (var r of pages(ANCIEN)) {
    var fN = path.join(DOCS, r, "index.html");
    if (!fs.existsSync(fN)) continue;

    await pg.goto("http://127.0.0.1:8898/" + (r ? r + "/" : ""), { waitUntil: "load" });
    await pg.waitForTimeout(120);            /* l'ancien site compose en JavaScript */

    /* le navigateur rend le bloc porteur ; aucune analyse de chaîne ici */
    await pg.evaluate(t => { window.__NEUF = t; }, neuf);
    var candidats = await pg.evaluate(function () {
      var EXCLU = /n'est pas une compagnie, ni un collectif|is not a company, nor a collective|no es una compañía, ni un colectivo|non è una compagnia, né un collettivo/i;
      var racine = document.querySelector("main") || document.body;
      var out = [], vus = new Set();
      racine.querySelectorAll("p, li, dd, blockquote").forEach(function (e) {
        var t = (e.innerText || "").trim();
        if (t.length < 40 || EXCLU.test(t)) return;
        if (e.closest("nav, footer, .site-footer, .float-actions, .pd-eyebrow")) return;
        /* .section est la page entière chez l'ancien site : la prendre pour
           bloc reviendrait à tout recopier. On se limite aux vraies unités. */
        var bloc = e.closest(".pd-block, .meta, .prose, .pd-dim") || e;
        /* le filtre doit porter sur le BLOC, pas seulement sur le paragraphe :
           la phrase retirée voisine avec du texte à reprendre, et la
           réinjecter avec son bloc la ferait revenir par la bande. */
        if (EXCLU.test(bloc.innerText || "")) return;
        /* un bloc peut mêler du neuf et du déjà-dit : on ne reprend que ses
           parties absentes, sinon la page répète un paragraphe deux fois. */
        var copie = bloc.cloneNode(true);
        [...copie.children].forEach(function (c) {
          var k = (c.innerText || "").toLowerCase()
            .replace(/-?\s*porte renaud\s*-?/g, "porterenaud")
            .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
          if (k.length >= 30 && window.__NEUF.indexOf(k) >= 0) c.remove();
        });
        if (!(copie.innerText || "").trim()) return;
        var h = copie.outerHTML;
        if (vus.has(h)) return;
        vus.add(h);
        out.push({ texte: copie.innerText, html: h });
      });
      return out;
    });

    var perdus = candidats.filter(c => {
      var k = cle(c.texte);
      /* un fil d'ariane ou un intitulé court n'est pas un contenu perdu :
         il a seulement changé de formulation. On ne reprend que de la matière. */
      return k.length >= 60 && neuf.indexOf(k) < 0;
    });
    if (!perdus.length) continue;

    if (ACCUEIL.has(r)) { accueil.push([r, perdus.length]); continue; }

    var neufH = fs.readFileSync(fN, "utf8");
    var aAjouter = perdus.map(c => c.html);
    repris += aAjouter.length; touchees++;
    console.log("  /" + (r ? r + "/" : "") + " ← " + aAjouter.length + " bloc(s) : « " +
      perdus[0].texte.replace(/\s+/g, " ").slice(0, 70) + " »");
    if (VERIF) continue;

    var ancre = neufH.lastIndexOf('<a class="more"');
    if (ancre < 0) ancre = neufH.indexOf('<footer class="foot">');
    fs.writeFileSync(fN, neufH.slice(0, ancre) +
      '<div class="pd-block pd-full">' + aAjouter.join("") + "</div>" + neufH.slice(ancre));
  }
  await b.close();

  console.log((VERIF ? "à récupérer : " : "récupéré : ") + repris + " bloc(s) sur " +
    touchees + " page(s)");
  if (accueil.length) {
    console.log("\nl'accueil n'est pas touché — sa composition V2 est une décision, pas un oubli :");
    accueil.forEach(x => console.log("  /" + (x[0] ? x[0] + "/" : "") + " : " +
      x[1] + " passage(s) de l'ancien accueil non repris"));
  }
})();
