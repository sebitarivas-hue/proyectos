/* LA SUSPENSION — l'origine du cercle, et son secours.
   Deux choses, aucune qui puisse empêcher une navigation :

   1. Au clic, on retient le point. Le navigateur navigue de son côté : rien
      n'est intercepté, rien n'est différé, aucun lien n'est annulé.
   2. À l'arrivée, si le navigateur n'a pas joué lui-même la transition entre
      documents, on rejoue le geste : un voile blanc que perce un cercle.

   Le voile n'est posé QUE si le navigateur sait animer une propriété
   enregistrée. Sans cette garantie, un voile qui n'anime pas resterait blanc
   sur la page : mieux vaut pas de transition du tout. */
(function () {
  "use strict";
  var CLE = "st-origine";
  var racine = document.documentElement;

  /* ---- 1. le point du clic ---- */
  addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var u = a.getAttribute("href") || "";
    if (!u || u.charAt(0) === "#" || a.target === "_blank") return;
    if (!/^\/|^\.|^[a-z-]+\//i.test(u)) return;              /* seulement le site */
    try {
      sessionStorage.setItem(CLE, Math.round((e.clientX / innerWidth) * 100) + " " +
        Math.round((e.clientY / innerHeight) * 100));
    } catch (_) { /* mode privé : le cercle partira du centre */ }
  }, true);

  var origine = null;
  try {
    var v = sessionStorage.getItem(CLE);
    if (v) {
      origine = v.split(" ");
      racine.style.setProperty("--st-x", origine[0] + "%");
      racine.style.setProperty("--st-y", origine[1] + "%");
      sessionStorage.removeItem(CLE);
    }
  } catch (_) { /* rien : centre par défaut */ }

  /* ---- 2. le secours ---- */
  /* « pagereveal » se déclenche avant que ce fichier, chargé en defer, ne
     s'exécute : s'y fier faisait jouer le secours PAR-DESSUS la transition
     native. On observe donc directement, au moment de décider, si une
     transition tourne déjà — une animation attachée à ::view-transition. */
  function transitionEnCours() {
    if (!document.getAnimations) return false;
    return document.getAnimations().some(function (a) {
      return String((a.effect && a.effect.pseudoElement) || "").indexOf("view-transition") >= 0;
    });
  }

  var possible = typeof CSS !== "undefined" && CSS.supports &&
    typeof CSS.registerProperty === "function" &&
    CSS.supports("mask-image", "radial-gradient(circle, transparent 0%, #000 1%)");

  function jouer() {
    if (!possible || !origine) return;        /* pas d'origine : arrivée directe */
    if (transitionEnCours()) return;          /* le navigateur s'en charge déjà */
    racine.classList.add("st-arrivee");
    var fin = function () { racine.classList.remove("st-arrivee"); };
    addEventListener("animationend", fin, { once: true });
    setTimeout(fin, 1000);                        /* filet : jamais de voile qui reste */
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", jouer);
  else jouer();
})();

/* LA COULEUR RÉELLE DE LA PHOTOGRAPHIE.
   Les duotones de section sont un état de repos : ils tiennent la page
   ensemble. Ils ne doivent pas être le dernier mot sur une photographie
   qui a sa propre richesse.

   Sur un appareil qui a un pointeur, le survol suffit et la règle est en
   CSS. Sur un écran tactile il n'y a pas de survol : l'image reprend sa
   couleur quand elle passe dans la bande centrale de l'écran, c'est à dire
   quand on arrive devant elle. Une fois révélée elle le reste : on ne
   reteint pas une image qu'on vient de voir en couleur.

   Rien ici n'est nécessaire à la lecture : sans IntersectionObserver, ou
   sans JavaScript, la page garde simplement ses duotones. */
(function () {
  "use strict";
  var SEL = ".im-affiche,.im-creation,.im-repertoire,.im-oeuvres,.im-labo";
  if (!("IntersectionObserver" in window)) return;
  if (matchMedia("(hover: hover)").matches) return;        /* le survol s'en charge */

  function armer() {
    var vues = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("im-vive");
        vues.unobserve(e.target);
      });
    }, { rootMargin: "-22% 0px -22% 0px", threshold: 0 });
    document.querySelectorAll(SEL).forEach(function (el) { vues.observe(el); });
  }

  if (document.readyState === "loading") addEventListener("DOMContentLoaded", armer);
  else armer();
})();

/* LE SÉLECTEUR DE LANGUE FAIT AUTORITÉ.
   La détection automatique posée dans la tête des pages françaises ne se
   déclenche qu'une fois, et jamais si une langue a déjà été arrêtée pour
   ce navigateur. C'est ici qu'on l'arrête : dès qu'on clique une langue
   dans le sélecteur, ce choix est retenu, et la détection ne se réveille
   plus. Quelqu'un qui revient volontairement au français reste donc en
   français, même avec un navigateur réglé sur une autre langue. */
(function () {
  "use strict";
  addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest(".lang-liste a[lang]");
    if (!a) return;
    try { localStorage.setItem("st-langue", a.getAttribute("lang")); } catch (err) {}
  });
})();
