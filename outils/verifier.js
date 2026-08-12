/* CONTRÔLE GÉNÉRAL — les 300 pages, en 1440 px et en 390 px.
   Débordement latéral, paragraphe répété, entité visible, pied unique,
   mesure d'audience présente, erreur JavaScript.
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
    /* Le contrôle se joue hors ligne : tout ce qui sort du site est coupé.
       Sans cela, la balise de mesure d'audience partirait chercher
       Cloudflare à chaque page et le contrôle attendrait le réseau. Sa
       présence se vérifie dans le document, pas dans son exécution. */
    await pg.route("**", function (route, req) {
      return req.url().indexOf("http://127.0.0.1:8899/") === 0 ? route.continue() : route.abort();
    });
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
        /* Deux copies d'une même phrase ne s'écrivent pas toujours pareil :
           l'une peut porter une espace insécable devant le deux-points là où
           l'autre a une espace ordinaire. Comparées octet à octet, elles
           passaient pour deux phrases différentes — c'est ainsi qu'un
           paragraphe en double a dormi des mois sur les mentions légales. */
        /* Une entité visible à l'écran est toujours un défaut : &nbsp; se lit
           « &nbsp; » au lieu de faire une espace. C'est ce qui a laissé dormir
           un paragraphe en double sur les mentions légales — les deux copies
           ne s'écrivaient pas pareil, l'une portant l'entité en clair. */
        var ent = (document.body.innerText.match(/&(nbsp|amp|lt|gt|quot|#39);/g) || []).length;
        /* La mesure d'audience a disparu du site pendant deux semaines sans que
           rien ne le dise : un compteur à zéro ressemble à un site sans
           visiteurs. Elle est désormais comptée comme le reste. */
        var cf = document.querySelector('script[src*="cloudflareinsights"]') ? 1 : 0;
        var normalise = s => s.replace(/&nbsp;/g, " ")
          .replace(/[\u00a0\u202f]/g, " ").replace(/\s+/g, " ").trim();
        var t = document.body.innerText.split(/\n+/).map(normalise)
          .filter(s => s.length > 60);
        var vus = new Set(), dup = 0;
        t.forEach(s => { if (vus.has(s)) dup++; vus.add(s); });
        return { ov: de.scrollWidth - de.clientWidth, foot: document.querySelectorAll("footer").length, dup: dup, ent: ent, cf: cf };
      });
      if (r.ov > 2) pb.push(f + " @" + w + " déborde de " + r.ov + "px");
      if (w === 1440 && r.foot !== 1) pb.push(f + " : " + r.foot + " pieds");
      if (w === 1440 && r.dup > 0) pb.push(f + " : " + r.dup + " doublon(s)");
      if (w === 1440 && r.ent > 0) pb.push(f + " : " + r.ent + " entité(s) visible(s) à l'écran");
      if (w === 1440 && !r.cf) pb.push(f + " : pas de balise de mesure d'audience");
      if (errs.length) pb.push(f + " JS: " + errs[0]);
    }
    await pg.close();
  }
  await b.close();
  console.log("pages : " + list.length);
  console.log(pb.length ? pb.slice(0, 12).join("\n") : "aucun débordement, aucun doublon, aucune entité visible, un seul pied,\n  la mesure d'audience partout, aucune erreur");
  console.log("total : " + pb.length);
})();
