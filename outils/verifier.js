/* CONTRÔLE GÉNÉRAL — les 300 pages, en 1440 px et en 390 px.
   Débordement latéral, paragraphe répété, pied unique, erreur JavaScript.
   Usage : servir docs/ sur 8899, puis
   PW=<…>/playwright-core node outils/verifier.js                           */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
function pages(d, a) {
  a = a || [];
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "assets") pages(p, a); return; }
    if (e.name === "index.html") a.push(p);
  });
  return a;
}
(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var list = pages("docs"), pb = [];
  for (var w of [1440, 390]) {
    var pg = await b.newPage({ viewport: { width: w, height: 900 } });
    for (var f of list) {
      var errs = [];
      pg.on("pageerror", e => errs.push(e.message));
      await pg.goto("http://127.0.0.1:8899/" + f.replace(/^docs\//, ""), { waitUntil: "load" });
      var r = await pg.evaluate(() => {
        var de = document.documentElement;
        /* La piste défilante écrit sa phrase deux fois pour que la boucle
           n'ait pas de raccord ; la copie porte aria-hidden. Ce n'est pas un
           doublon de contenu, et le contrôle ne doit pas le compter. */
        document.querySelectorAll('.st-defile [aria-hidden="true"]').forEach(function (e) { e.remove(); });
        var t = document.body.innerText.split(/\n+/).map(s => s.trim()).filter(s => s.length > 60);
        var vus = new Set(), dup = 0;
        t.forEach(s => { if (vus.has(s)) dup++; vus.add(s); });
        return { ov: de.scrollWidth - de.clientWidth, foot: document.querySelectorAll("footer").length, dup: dup };
      });
      if (r.ov > 2) pb.push(f + " @" + w + " déborde de " + r.ov + "px");
      if (w === 1440 && r.foot !== 1) pb.push(f + " : " + r.foot + " pieds");
      if (w === 1440 && r.dup > 0) pb.push(f + " : " + r.dup + " doublon(s)");
      if (errs.length) pb.push(f + " JS: " + errs[0]);
    }
    await pg.close();
  }
  await b.close();
  console.log("pages : " + list.length);
  console.log(pb.length ? pb.slice(0, 12).join("\n") : "aucun débordement, aucun doublon, un seul pied, aucune erreur");
  console.log("total : " + pb.length);
})();
