"use strict";
/* LA BANDE DU BANDEAU.
 *
 * Le bandeau titre ne prend que le bas de la photo d'Einstein on the Beach :
 * le plateau et les trois corps. Le néon qui surmonte la scène reste hors du
 * cadre — c'est une typographie, et il n'y en a qu'une dans le bandeau, celle
 * du nom.
 *
 * Le découpage se fait ici plutôt qu'en CSS : un `background-position` calé
 * sur la partie basse ne tient pas d'une largeur d'écran à l'autre, alors
 * qu'un fichier au bon cadrage se comporte partout comme prévu.
 *
 * Idempotent : réécrit le même fichier à partir de la même source.
 * Usage : node outils/hero-bande.js
 */
var { chromium } = require(process.env.PW || "/tmp/pw/node_modules/playwright-core");
var fs = require("fs"), path = require("path");

var DOSSIER = path.resolve(__dirname, "..", "docs", "assets", "projects", "einstein");
var SRC = path.join(DOSSIER, "einstein-neon.jpg");
var OUT = path.join(DOSSIER, "scene-bandeau.jpg");
var LARGE = 1600, HAUTE = 868;
var Y = 340;                       /* sous la dernière porteuse du néon */
var H = HAUTE - Y;

(async () => {
  var b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  var pg = await b.newPage();
  /* une page servie depuis une fausse origine http : un document file:// n'a
     pas d'origine, et le canvas s'y déclare souillé au premier dessin */
  await pg.route("http://bande.invalid/**", function (r, q) {
    return q.url().endsWith(".jpg")
      ? r.fulfill({ contentType: "image/jpeg", body: fs.readFileSync(SRC) })
      : r.fulfill({ contentType: "text/html", body: "<!doctype html><meta charset=utf-8>" });
  });
  await pg.goto("http://bande.invalid/", { waitUntil: "load" });
  var d = await pg.evaluate(async function (a) {
    var im = new Image();
    im.src = "http://bande.invalid/source.jpg";
    await im.decode();
    var c = document.createElement("canvas");
    c.width = a.L; c.height = a.H;
    c.getContext("2d").drawImage(im, 0, a.Y, a.L, a.H, 0, 0, a.L, a.H);
    return { url: c.toDataURL("image/jpeg", 0.84), w: im.naturalWidth, h: im.naturalHeight };
  }, { L: LARGE, H: H, Y: Y });
  await b.close();

  if (d.w !== LARGE || d.h !== HAUTE)
    throw new Error("source inattendue : " + d.w + "x" + d.h +
      " — le cadrage est calé sur " + LARGE + "x" + HAUTE);

  fs.writeFileSync(OUT, Buffer.from(d.url.split(",")[1], "base64"));
  console.log("bande du bandeau : " + LARGE + "×" + H + " — " +
    Math.round(fs.statSync(OUT).size / 1024) + " Ko");
})();
