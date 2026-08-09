/* Répare les génériques des fiches et la découpe du mot.
   Les données de facts/credits sont des objets ({k,v} et {role,who}), pas des
   tableaux : elles étaient lues comme r[0]/r[1], donc vides. */
"use strict";
var fs = require("fs"), path = require("path");
var DOCS = "/home/user/proyectos/docs";
var src = fs.readFileSync(path.join(DOCS, "script.js"), "utf8");
function g(re) { return src.match(re)[1]; }
var D = new Function("var ONGOING=" + g(/var ONGOING = (\{[^;]*\});/) +
  ";var YEARS=" + g(/var YEARS = (\{[\s\S]*?\});/) +
  ";var PERIOD=" + g(/var PERIOD = (\{[^;]*\});/) +
  ";var COLORS=" + g(/var COLORS = (\{[\s\S]*?\});/) +
  ";var DIM=" + g(/var DIM = (\{[\s\S]*?\n  \});/) +
  ";var PROJECTS=" + g(/var PROJECTS = (\[[\s\S]*?\n  \]);/) +
  ";return{PROJECTS:PROJECTS}")();

function fr(v) { return v == null ? "" : (typeof v === "string" ? v : (v.fr || "")); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

var fixed = 0;
D.PROJECTS.forEach(function (p) {
  var f = path.join(DOCS, "proto/oeuvres", p.slug, "index.html");
  if (!fs.existsSync(f)) return;
  var h = fs.readFileSync(f, "utf8");
  var facts = (p.facts || []).map(function (r) {
    return "<dt>" + esc(fr(r.k)) + "</dt><dd>" + fr(r.v) + "</dd>";
  }).join("");
  var creds = (p.credits || []).map(function (r) {
    return "<dt>" + esc(fr(r.role)) + "</dt><dd>" + fr(r.who) + "</dd>";
  }).join("");
  var before = h;
  h = h.replace(/(<h3>Informations<\/h3><dl>)[\s\S]*?(<\/dl>)/, "$1" + facts + "$2");
  h = h.replace(/(<h3>Générique<\/h3><dl>)[\s\S]*?(<\/dl>)/, "$1" + creds + "$2");
  if (h !== before) { fs.writeFileSync(f, h); fixed++; }
  console.log("  " + p.slug.padEnd(18) + (p.facts || []).length + " info · " + (p.credits || []).length + " générique");
});
console.log("fiches réparées : " + fixed);

/* Découpe du mot : ST en crème, OPERA! en magenta. */
var idx = path.join(DOCS, "proto/index.html");
var t = fs.readFileSync(idx, "utf8");
t = t.replace('sto<span class="m">pera!</span>', 'st<span class="m">opera!</span>');
fs.writeFileSync(idx, t);
console.log("mot découpé : st | opera!");
