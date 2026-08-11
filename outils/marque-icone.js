/* L'ICÔNE D'ONGLET, COMPOSÉE PUIS APLATIE.
   La marque de la barre est du texte en Neutrix. Un favicon, lui, ne peut pas
   compter sur une police : le navigateur le rend hors de la page, sans la
   feuille de style ni les fontes. On compose donc « So! » dans un navigateur
   qui a Neutrix, et on en tire une image.

   Deux tailles : 32 px pour l'onglet, 180 px pour l'écran d'accueil d'un
   téléphone. Le fond est le papier du site — un favicon transparent devient
   invisible sur les onglets sombres.

   Il faut Chromium : PW=<…>/playwright-core node outils/marque-icone.js     */
"use strict";
var { chromium } = require(process.env.PW ||
  "/opt/node22/lib/node_modules/playwright/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
var DOCS = path.resolve(__dirname, "..", "docs");

/* La page est servie depuis une adresse http feinte, et non par setContent :
   un document sans origine ne charge aucune @font-face, et la marque tombait
   silencieusement dans la police à empattements du système — ce qui ne se
   voit qu'en regardant l'image produite. */
var ORIGINE = "http://marque.invalid/";
var FONTES = ORIGINE + "fontes/";

var TAILLES = [32, 180];

function page(px) {
  /* la marque occupe 78 % du carré, optiquement centrée : le point
     d'exclamation monte plus haut que les lettres, la boîte penche */
  return '<!doctype html><meta charset="utf-8"><style>' +
    '@font-face{font-family:Neutrix;src:url(' + FONTES +
      'Neutrix-Regular.woff2)format("woff2")}' +
    "html,body{margin:0;width:" + px + "px;height:" + px + "px}" +
    "body{background:#F2EDE4;display:flex;align-items:center;justify-content:center}" +
    /* la petite icône serre plus fort : à 16 px, un trait fin de Neutrix
       disparaît, et l'onglet ne montre plus qu'une tache */
    ".m{font-family:Neutrix;font-weight:400;font-size:" +
      Math.round(px * (px <= 48 ? 0.74 : 0.62)) +
      "px;line-height:1;letter-spacing:-.04em;color:#0A0A0C;" +
      "transform:translateY(" + (-px * 0.02).toFixed(2) + "px)}" +
    ".m i{font-style:normal;color:#FF0080}" +
    "</style><div class=\"m\">So<i>!</i></div>";
}

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  for (var px of TAILLES) {
    var pg = await b.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
    await pg.route(ORIGINE + "**", function (route, req) {
      var u = req.url();
      if (u === ORIGINE) return route.fulfill({ contentType: "text/html; charset=utf-8", body: page(px) });
      var f = path.join(DOCS, "assets", "fonts", u.slice((ORIGINE + "fontes/").length));
      if (!fs.existsSync(f)) return route.abort();
      route.fulfill({ contentType: "font/woff2", body: fs.readFileSync(f) });
    });
    await pg.goto(ORIGINE, { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    /* on refuse de produire une image dans une police de repli */
    var ok = await pg.evaluate(() => document.fonts.check("400 20px Neutrix"));
    if (!ok) throw new Error("Neutrix ne s'est pas chargée : image non écrite");
    await pg.waitForTimeout(150);
    var out = path.join(DOCS, "assets", "marque-so-" + px + ".png");
    await pg.screenshot({ path: out });
    console.log("écrit : " + path.relative(DOCS, out) + " (" + fs.statSync(out).size + " o)");
    await pg.close();
  }
  await b.close();
})();
