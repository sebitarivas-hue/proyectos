/* LA PHOTO DE PROFIL — LinkedIn et Instagram.
   Deux contraintes que ces plateformes imposent et qu'on ne discute pas :

     · l'image est ROGNÉE EN CERCLE. Tout ce qui vit hors du cercle inscrit
       — les angles, soit 21 % de la surface — disparaît. Le sujet doit tenir
       dans le disque, pas dans le carré.
     · elle s'affiche PETIT. LinkedIn descend à 48 px dans un fil, Instagram à
       32 px dans une story. Un logotype long y devient une tache.

   Le logotype de STOPERA! fait cinq fois plus large que haut : dans un cercle
   de 48 px il ne reste rien. On compose donc dans le système, pas avec le
   fichier : le noir du bandeau, le « st » blanc et le « opera! » magenta,
   empilés — la seule opération graphique que la DA applique déjà au nom.

   Les deux lignes sont mises à la MÊME largeur d'encre — mesuré, pas estimé :
   « st » à 587 px et « opera! » à 196 px font l'un et l'autre 494 px de large.
   Le bloc devient un carré plein qui tient dans le disque ; c'est la
   typographie qui fait l'architecture, pas un cadrage.

   Trois propositions, rendues à 1000 px et éprouvées à 48, 96 et 160 px dans
   un cercle — la seule épreuve qui compte.

   Usage : PW=<…>/playwright-core node outils/profil.js                      */
"use strict";
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");
var SORTIE = process.env.SORTIE || "/tmp/profil";

var BASE = `
  <style>
    @font-face{font-family:"Neutrix";src:url("http://127.0.0.1:8899/assets/fonts/Neutrix-Regular.woff2") format("woff2");font-weight:400}
    @font-face{font-family:"Bricolage Grotesque";src:url("http://127.0.0.1:8899/assets/fonts/BricolageGrotesque-var-latin.woff2") format("woff2");font-weight:200 800}
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1000px;height:1000px}
    .carre{width:1000px;height:1000px;display:grid;place-items:center;
      background:#0A0A0C;position:relative;overflow:hidden}
    .mot{font-family:"Neutrix",sans-serif;font-weight:400;color:#F2EDE4;
      letter-spacing:-.04em;line-height:.80;text-align:center}
    .m{color:#FF0080}
    /* le disque que les plateformes découpent — repère, jamais dessiné */
    .disque{position:absolute;inset:0;border-radius:50%}
  </style>`;

var PROPOSITIONS = {
  /* A — le nom entier, empilé selon la coupure que la DA opère déjà */
  "profil-a-nom": BASE + `
    <div class="carre"><div class="mot" style="line-height:.74">
      <span style="font-size:587px;display:block">st</span>
      <span class="m" style="font-size:196px;display:block;letter-spacing:-.02em">opera!</span>
    </div></div>`,

  /* B — le monogramme : ce qui reste lisible à 32 px */
  "profil-b-monogramme": BASE + `
    <div class="carre"><div class="mot" style="font-size:520px;letter-spacing:-.06em">
      st<span class="m">!</span>
    </div></div>`,

  /* C — la surface crème, pour les fonds sombres des applications */
  "profil-c-creme": BASE + `
    <div class="carre" style="background:#F2EDE4"><div class="mot" style="line-height:.74;color:#0A0A0C">
      <span style="font-size:587px;display:block">st</span>
      <span class="m" style="font-size:196px;display:block;letter-spacing:-.02em">opera!</span>
    </div></div>`
};

(async () => {
  fs.mkdirSync(SORTIE, { recursive: true });
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });

  /* La page est SERVIE depuis le site, pas injectée : une page « about:blank »
     n'a pas d'origine, et la police licenciée refuse de s'y charger. Le rendu
     se faisait alors avec la police de secours du système — ce que la première
     épreuve a montré. */
  var courant = "";
  await pg.route("http://127.0.0.1:8899/__profil", function (route) {
    route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: courant });
  });

  for (var nom in PROPOSITIONS) {
    courant = PROPOSITIONS[nom];
    await pg.goto("http://127.0.0.1:8899/__profil", { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: path.join(SORTIE, nom + ".png") });
    console.log("  " + nom + ".png — 1000 × 1000");
  }

  /* L'ÉPREUVE : les trois, rognées en cercle, aux tailles réelles.
     Les images sont incorporées en base64 — une page sans origine ne peut pas
     lire un fichier du disque, et la première épreuve n'a montré que des
     icônes d'image cassée. */
  var vignettes = Object.keys(PROPOSITIONS).map(function (nom) {
    var b64 = fs.readFileSync(path.join(SORTIE, nom + ".png")).toString("base64");
    return '<div class="ligne"><span class="nom">' + nom.replace("profil-", "") + "</span>" +
      [48, 96, 160].map(function (t) {
        return '<figure><img src="data:image/png;base64,' + b64 +
          '" width="' + t + '" height="' + t + '" style="border-radius:50%;display:block">' +
          "<figcaption>" + t + " px</figcaption></figure>";
      }).join("") + "</div>";
  }).join("");

  await pg.setViewportSize({ width: 720, height: 760 });
  courant = '<style>body{background:#F2EDE4;font:12px/1.4 system-ui;padding:30px;margin:0}' +
    '.ligne{display:flex;gap:28px;align-items:center;padding:18px 0;border-top:2px solid #0A0A0C}' +
    '.nom{font:700 11px/1 system-ui;letter-spacing:.12em;text-transform:uppercase;width:120px;color:#0A0A0C}' +
    'figcaption{text-align:center;margin-top:8px;color:#6E655C}</style>' + vignettes;
  await pg.goto("http://127.0.0.1:8899/__profil", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: path.join(SORTIE, "epreuve-cercle.png") });
  console.log("  epreuve-cercle.png — les trois à 48, 96 et 160 px, rognées en cercle");

  await b.close();
})();
