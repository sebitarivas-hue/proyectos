/* VÉRIFICATION — les 295 pages, en 1440 px et en 390 px.
   Ce que ça contrôle : aucun débordement latéral, aucune erreur JavaScript,
   le lien de la marque ramène bien à l'accueil de SA langue.
   Usage : servir docs/ sur 8899, puis  PW=<chemin>/playwright-core node docs/proto/_verif.js */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");

function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) pages(p, a);
    else if (e.name === "index.html") a.push(p);
  });
  return a;
}
var url = f => "http://127.0.0.1:8899/" + f.replace(/^docs\//, "");

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var list = pages("docs/proto"), pb = [];

  for (var w of [1440, 390]) {
    var pg = await b.newPage({ viewport: { width: w, height: 900 } });
    for (var f of list) {
      var errs = [];
      pg.on("pageerror", e => errs.push(e.message));
      await pg.goto(url(f), { waitUntil: "load" });
      var ov = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (ov > 2) pb.push(f + " @" + w + " déborde de " + ov + "px");
      if (errs.length) pb.push(f + " JS: " + errs[0]);
    }
    await pg.close();
  }

  /* la marque, dans chaque langue, depuis une page intérieure */
  var pg2 = await b.newPage({ viewport: { width: 390, height: 844 } });
  for (var l of ["", "en/", "es/", "it/", "zh/"]) {
    var from = "docs/proto/" + l + "oeuvres/index.html";
    if (!fs.existsSync(from)) continue;
    await pg2.goto(url(from), { waitUntil: "load" });
    await Promise.all([pg2.waitForNavigation({ timeout: 5000 }).catch(() => null), pg2.click(".brand")]);
    var want = "/proto/" + l;
    var got = pg2.url().replace("http://127.0.0.1:8899", "");
    if (got !== want) pb.push("marque depuis /proto/" + l + "oeuvres/ → " + got + " au lieu de " + want);
  }
  await pg2.close();
  await b.close();

  console.log("pages : " + list.length);
  console.log(pb.length ? pb.slice(0, 25).join("\n") : "aucun débordement, aucune erreur, la marque ramène à l'accueil dans les cinq langues");
  console.log("total : " + pb.length);
})();
