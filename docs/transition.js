/* LA SUSPENSION — l'origine du cercle.
   Le cercle qui ouvre la page suivante part de l'endroit exact où l'on a
   cliqué. Ce fichier ne fait que cela : retenir le point, et le rendre à la
   page d'arrivée. Il n'intercepte aucun lien, n'annule aucun clic, ne diffère
   aucune navigation — si ce script ne s'exécute pas, le cercle part du centre
   et rien d'autre ne change. */
(function () {
  "use strict";
  var CLE = "st-origine";

  /* au clic, on note où : le navigateur navigue de son côté, sans nous */
  addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var u = a.getAttribute("href") || "";
    if (!u || u.charAt(0) === "#" || a.target === "_blank") return;
    if (!/^\/|^\.|^[a-z-]+\//i.test(u)) return;          /* seulement le site */
    try {
      sessionStorage.setItem(CLE, Math.round((e.clientX / innerWidth) * 100) + " " +
        Math.round((e.clientY / innerHeight) * 100));
    } catch (_) { /* mode privé : le cercle partira du centre */ }
  }, true);

  /* à l'arrivée, on rend le point au CSS */
  try {
    var v = sessionStorage.getItem(CLE);
    if (v) {
      var p = v.split(" ");
      document.documentElement.style.setProperty("--st-x", p[0] + "%");
      document.documentElement.style.setProperty("--st-y", p[1] + "%");
      sessionStorage.removeItem(CLE);
    }
  } catch (_) { /* rien : centre par défaut */ }
})();
