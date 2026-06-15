// STOPERA — quadrilingual site (FR / ES / EN / ZH) + expandable project cards
(function () {
  "use strict";

  var STORAGE_KEY = "stopera-lang";
  var LANGS = ["fr", "es", "en", "zh"];
  var LANG = "fr";

  function t(o) {
    if (o == null) return "";
    if (typeof o !== "object") return o;
    return o[LANG] != null ? o[LANG] : o.fr;
  }

  var UI = {
    sheet:    { fr: "Voir la fiche", es: "Ver la ficha", en: "View sheet", zh: "查看详情" },
    close:    { fr: "Replier", es: "Cerrar", en: "Close", zh: "收起" },
    details:  { fr: "Informations", es: "Información", en: "Details", zh: "信息" },
    credits:  { fr: "Générique", es: "Créditos", en: "Credits", zh: "创作团队" },
    partners: { fr: "Production & partenaires", es: "Producción & socios", en: "Production & partners", zh: "制作与合作" }
  };

  var YEARS = {
    "war-madrigals": "2026",
    "rayon-n": "2026 – 2027",
    "nous": { fr: "en cours", es: "en curso", en: "ongoing", zh: "进行中" },
    "rut": "2026",
    "fame": "2025",
    "america": "2027",
    "lips": { fr: "annuel", es: "anual", en: "annual", zh: "每年" }
  };

  var ONGOING = { fr: "en cours", es: "en curso", en: "ongoing", zh: "进行中" };

  var PROJECTS = [
    {
      slug: "war-madrigals", title: "War Madrigals", img: "assets/projects/war-madrigals.svg",
      tag: { fr: "Création 2026", es: "Estreno 2026", en: "Premiere 2026", zh: "2026 首演" },
      short: { fr: "Cycle vocal pour le Neue Vocalsolisten Stuttgart.", es: "Ciclo vocal para el Neue Vocalsolisten Stuttgart.", en: "A vocal cycle for the Neue Vocalsolisten Stuttgart.", zh: "为 Neue Vocalsolisten Stuttgart 创作的声乐套曲。" },
      pitch: {
        fr: "Cycle de madrigaux contemporains qui confronte la voix à l'expérience de la guerre, de l'exil et de l'intime. Sur des textes de Paul Celan, Anaïs Nin, Samuel Beckett et Forough Farrokhzad.",
        es: "Ciclo de madrigales contemporáneos que confronta la voz con la experiencia de la guerra, el exilio y lo íntimo. Sobre textos de Paul Celan, Anaïs Nin, Samuel Beckett y Forough Farrokhzad.",
        en: "A cycle of contemporary madrigals confronting the voice with the experience of war, exile and intimacy. On texts by Paul Celan, Anaïs Nin, Samuel Beckett and Forough Farrokhzad.",
        zh: "当代牧歌套曲，让人声直面战争、流亡与亲密的体验。文本取自 Paul Celan、Anaïs Nin、Samuel Beckett 与 Forough Farrokhzad。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Cycle vocal", es: "Ciclo vocal", en: "Vocal cycle", zh: "声乐套曲" } },
        { k: { fr: "Effectif", es: "Formación", en: "Forces", zh: "编制" }, v: { fr: "Ensemble vocal", es: "Ensemble vocal", en: "Vocal ensemble", zh: "人声乐团" } },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: "2026" }
      ],
      credits: [
        { role: { fr: "Composition", es: "Composición", en: "Composition", zh: "作曲" }, who: "Sebastian Rivas" },
        { role: { fr: "Textes", es: "Textos", en: "Texts", zh: "文本" }, who: "Celan · Nin · Beckett · Farrokhzad" },
        { role: { fr: "Interprétation", es: "Interpretación", en: "Performance", zh: "演出" }, who: "Neue Vocalsolisten Stuttgart" }
      ],
      partners: ["Neue Vocalsolisten Stuttgart"],
      note: { fr: "Distribution et dates en cours de finalisation.", es: "Reparto y fechas en proceso de confirmación.", en: "Cast and dates being finalised.", zh: "演员与日期确认中。" }
    },
    {
      slug: "rayon-n", title: "Rayon N", img: "assets/projects/rayon-n.svg",
      tag: { fr: "Production 2026 · diffusion 2027", es: "Producción 2026 · gira 2027", en: "Production 2026 · touring 2027", zh: "2026 制作 · 2027 巡演" },
      short: { fr: "Opéra-film animé par intelligence artificielle.", es: "Ópera-film animada por inteligencia artificial.", en: "An AI-animated film-opera.", zh: "由人工智能生成影像的影像歌剧。" },
      pitch: {
        fr: "Opéra-film où l'image animée par intelligence artificielle dialogue avec la musique jouée en direct. Livret d'Antoine Gindt, développé avec le Lavoir Numérique à Gentilly.",
        es: "Ópera-film donde la imagen animada por inteligencia artificial dialoga con la música en vivo. Libreto de Antoine Gindt, desarrollada con el Lavoir Numérique en Gentilly.",
        en: "A film-opera in which AI-animated imagery converses with live music. Libretto by Antoine Gindt, developed with the Lavoir Numérique in Gentilly.",
        zh: "一部影像歌剧，由人工智能生成的影像与现场音乐对话。Antoine Gindt 编剧，与让蒂伊的 Lavoir Numérique 合作开发。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra-film", es: "Ópera-film", en: "Film-opera", zh: "影像歌剧" } },
        { k: { fr: "Livret", es: "Libreto", en: "Libretto", zh: "剧本" }, v: "Antoine Gindt" },
        { k: { fr: "Production", es: "Producción", en: "Production", zh: "制作" }, v: "2026" },
        { k: { fr: "Diffusion", es: "Gira", en: "Touring", zh: "巡演" }, v: "2027" }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Livret", es: "Libreto", en: "Libretto", zh: "剧本" }, who: "Antoine Gindt" },
        { role: { fr: "Image / IA", es: "Imagen / IA", en: "Image / AI", zh: "影像 / AI" }, who: "Lavoir Numérique" }
      ],
      partners: ["Lavoir Numérique (Gentilly)"],
      note: { fr: "Recherche de coproductions et de diffuseurs en cours.", es: "Búsqueda de coproducciones y programadores en curso.", en: "Coproductions and venues being sought.", zh: "正在寻找联合制作方与演出场所。" }
    },
    {
      slug: "nous", title: "Nous", titleHtml: "Nous",
      img: "assets/projects/nous.svg",
      tag: ONGOING,
      short: { fr: "Opéra de chambre d'après Christine Angot.", es: "Ópera de cámara a partir de Christine Angot.", en: "A chamber opera after Christine Angot.", zh: "改编自 Christine Angot 的室内歌剧。" },
      pitch: {
        fr: "Opéra de chambre construit à partir de fragments textuels de l'écrivaine Christine Angot, pour une forme scénique libre, au plus près de la parole et de l'intime.",
        es: "Ópera de cámara construida a partir de fragmentos textuales de la escritora Christine Angot, para una forma escénica libre, muy cerca de la palabra y de lo íntimo.",
        en: "A chamber opera built from textual fragments by the writer Christine Angot, for a free stage form, close to speech and intimacy.",
        zh: "以作家 Christine Angot 的文本片段构建的室内歌剧，采用自由的舞台形式，贴近言语与亲密。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra de chambre", es: "Ópera de cámara", en: "Chamber opera", zh: "室内歌剧" } },
        { k: { fr: "D'après", es: "A partir de", en: "After", zh: "改编自" }, v: "Christine Angot" },
        { k: { fr: "Statut", es: "Estado", en: "Status", zh: "状态" }, v: ONGOING }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Textes", es: "Textos", en: "Texts", zh: "文本" }, who: "Christine Angot" }
      ],
      partners: [],
      note: { fr: "Bourse CNM. Coproductions en cours de montage.", es: "Beca CNM. Coproducciones en construcción.", en: "CNM grant. Coproductions being assembled.", zh: "CNM 资助。联合制作筹备中。" }
    },
    {
      slug: "rut", title: "input / body / output", titleHtml: "<span class=\"it\">input / body / output</span>",
      img: "assets/projects/rut.svg",
      tag: { fr: "Première fin 2026", es: "Estreno fin de 2026", en: "Premiere late 2026", zh: "2026 年底首演" },
      short: { fr: "Performance solo de Rut Schreiner.", es: "Performance solo de Rut Schreiner.", en: "A solo performance by Rut Schreiner.", zh: "Rut Schreiner 的独角表演。" },
      pitch: {
        fr: "Performance solo où le geste de direction de Rut Schreiner, capté par des capteurs, génère et spatialise son et vidéo en temps réel. Le corps devient instrument.",
        es: "Performance solo donde el gesto de dirección de Rut Schreiner, captado por sensores, genera y espacializa sonido y vídeo en tiempo real. El cuerpo se vuelve instrumento.",
        en: "A solo performance where Rut Schreiner's conducting gesture, captured by sensors, generates and spatialises sound and video in real time. The body becomes an instrument.",
        zh: "一场独角表演：Rut Schreiner 的指挥手势经由传感器捕捉，实时生成并空间化声音与影像。身体成为乐器。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Performance", es: "Performance", en: "Performance", zh: "表演" } },
        { k: { fr: "Dispositif", es: "Dispositivo", en: "Set-up", zh: "装置" }, v: { fr: "Capteurs · son spatialisé · vidéo", es: "Sensores · sonido espacial · vídeo", en: "Sensors · spatial sound · video", zh: "传感器 · 空间声 · 影像" } },
        { k: { fr: "Première", es: "Estreno", en: "Premiere", zh: "首演" }, v: { fr: "Fin 2026", es: "Fin de 2026", en: "Late 2026", zh: "2026 年底" } }
      ],
      credits: [
        { role: { fr: "Conception & interprétation", es: "Concepción & interpretación", en: "Concept & performance", zh: "构思与表演" }, who: "Rut Schreiner" }
      ],
      partners: [],
      note: { fr: "Création en résidence. Dispositif technique en cours de définition.", es: "Creación en residencia. Dispositivo técnico en definición.", en: "Created in residency. Technical set-up being defined.", zh: "驻地创作。技术装置确定中。" }
    },
    {
      slug: "fame", title: "fame", titleHtml: "fame",
      img: "assets/projects/fame.svg",
      tag: { fr: "Diffusion 2025", es: "Difusión 2025", en: "Touring 2025", zh: "2025 演出" },
      short: { fr: "Performance musicale solo d'Olivia Martin.", es: "Performance musical solo de Olivia Martin.", en: "A solo musical performance by Olivia Martin.", zh: "Olivia Martin 的个人音乐表演。" },
      pitch: {
        fr: "Performance musicale solo conçue et interprétée par Olivia Martin, entre composition, voix et présence scénique.",
        es: "Performance musical solo concebida e interpretada por Olivia Martin, entre composición, voz y presencia escénica.",
        en: "A solo musical performance conceived and performed by Olivia Martin, between composition, voice and stage presence.",
        zh: "由 Olivia Martin 构思并演出的个人音乐表演，游走于作曲、人声与舞台存在之间。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Performance solo", es: "Performance solo", en: "Solo performance", zh: "独角表演" } },
        { k: { fr: "Diffusion", es: "Difusión", en: "Touring", zh: "演出" }, v: "2025" }
      ],
      credits: [
        { role: { fr: "Conception & interprétation", es: "Concepción & interpretación", en: "Concept & performance", zh: "构思与表演" }, who: "Olivia Martin" }
      ],
      partners: []
    },
    {
      slug: "america", title: "América", titleHtml: "América",
      img: "assets/projects/america.svg",
      tag: { fr: "Création 2027", es: "Estreno 2027", en: "Premiere 2027", zh: "2027 首演" },
      short: { fr: "Nouveau projet scénique — livret & résidences.", es: "Nuevo proyecto escénico: libreto y residencias.", en: "A new stage project: libretto and residencies.", zh: "新的舞台项目：剧本与驻地。" },
      pitch: {
        fr: "Nouveau projet scénique en développement : écriture d'un livret et résidences de création, vers une création en 2027 et des résidences croisées avec l'Amérique latine.",
        es: "Nuevo proyecto escénico en desarrollo: escritura de un libreto y residencias de creación, hacia un estreno en 2027 y residencias cruzadas con América Latina.",
        en: "A new stage project in development: writing a libretto and creation residencies, towards a 2027 premiere and cross-residencies with Latin America.",
        zh: "正在发展中的新舞台项目：剧本创作与创作驻地，目标 2027 年首演，并与拉丁美洲进行交流驻地。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Projet scénique", es: "Proyecto escénico", en: "Stage project", zh: "舞台项目" } },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: "2027" }
      ],
      credits: [
        { role: { fr: "Direction artistique", es: "Dirección artística", en: "Artistic direction", zh: "艺术指导" }, who: "Sebastian Rivas" }
      ],
      partners: ["Teatro Colón — Buenos Aires"],
      note: { fr: "Résidences croisées 2027 (Teatro Colón) à confirmer.", es: "Residencias cruzadas 2027 (Teatro Colón) por confirmar.", en: "2027 cross-residencies (Teatro Colón) to be confirmed.", zh: "2027 交流驻地（Teatro Colón）待确认。" }
    },
    {
      slug: "lips", title: "LIPS Summer Course", titleHtml: "LIPS Summer Course",
      img: "assets/projects/lips.svg",
      tag: { fr: "Laboratoire annuel", es: "Laboratorio anual", en: "Annual lab", zh: "年度工作坊" },
      short: { fr: "Laboratoire estival de création scénique, Gentilly.", es: "Laboratorio estival de creación escénica, Gentilly.", en: "A summer lab for stage creation, Gentilly.", zh: "让蒂伊的夏季舞台创作工作坊。" },
      pitch: {
        fr: "Laboratoire estival de création scénique contemporaine à Gentilly. Il rassemble compositeur·ices, metteur·euses en scène et interprètes autour de modules pratiques, et incarne la mission de transmission de STOPERA.",
        es: "Laboratorio estival de creación escénica contemporánea en Gentilly. Reúne a compositoras/es, directoras/es de escena e intérpretes en torno a módulos prácticos, y encarna la misión de transmisión de STOPERA.",
        en: "A summer laboratory for contemporary stage creation in Gentilly. It gathers composers, directors and performers around practical modules, embodying STOPERA's mission of transmission.",
        zh: "让蒂伊的当代舞台创作夏季工作坊。它围绕实践模块汇集作曲家、导演与表演者，体现 STOPERA 的传承使命。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Laboratoire / transmission", es: "Laboratorio / transmisión", en: "Lab / transmission", zh: "工作坊 / 传承" } },
        { k: { fr: "Lieu", es: "Lugar", en: "Place", zh: "地点" }, v: "Gentilly" },
        { k: { fr: "Rythme", es: "Ritmo", en: "Frequency", zh: "频率" }, v: { fr: "Annuel", es: "Anual", en: "Annual", zh: "每年" } }
      ],
      credits: [
        { role: { fr: "Direction", es: "Dirección", en: "Direction", zh: "负责人" }, who: "Sebastian Rivas" }
      ],
      partners: ["Le Générateur", "La Muse en Circuit", "La Chartreuse"]
    }
  ];

  function buildCard(p) {
    var panelId = "panel-" + p.slug;
    var facts = (p.facts || []).map(function (f) {
      return '<li><span class="k">' + t(f.k) + '</span><span class="v">' + t(f.v) + "</span></li>";
    }).join("");
    var credits = (p.credits || []).map(function (c) {
      return '<li><span class="role">' + t(c.role) + " — </span><span class=\"who\">" + t(c.who) + "</span></li>";
    }).join("");
    var partners = (p.partners && p.partners.length)
      ? '<div class="panel-block panel-full"><h4>' + t(UI.partners) + '</h4><ul class="taglist">'
        + p.partners.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>"
      : "";
    var note = p.note ? '<p class="panel-note">' + t(p.note) + "</p>" : "";
    var year = t(YEARS[p.slug] || "");

    return ''
      + '<button class="project-trigger" type="button" aria-expanded="false" aria-controls="' + panelId + '">'
      +   '<span class="p-row">'
      +     '<span class="p-name">' + (p.titleHtml || p.title) + "</span>"
      +     '<span class="p-year">' + year + "</span>"
      +   "</span>"
      +   '<span class="p-short">' + t(p.short) + "</span>"
      +   '<span class="p-toggle"><span class="more-label">' + t(UI.sheet) + '</span><span class="chev">+</span></span>'
      + "</button>"
      + '<div class="project-panel" id="' + panelId + '" role="region">'
      +   '<div class="panel-media"><img src="' + p.img + '" alt="" loading="lazy"></div>'
      +   '<p class="panel-pitch">' + t(p.pitch) + "</p>"
      +   '<div class="panel-grid">'
      +     '<div class="panel-block"><h4>' + t(UI.details) + '</h4><ul class="facts">' + facts + "</ul></div>"
      +     '<div class="panel-block"><h4>' + t(UI.credits) + '</h4><ul class="credits">' + credits + "</ul></div>"
      +     partners
      +     note
      +   "</div>"
      + "</div>";
  }

  function renderProjects() {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;
    var open = {};
    grid.querySelectorAll(".project.open").forEach(function (el) { open[el.dataset.slug] = true; });
    grid.innerHTML = "";
    PROJECTS.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "project";
      li.dataset.slug = p.slug;
      li.innerHTML = buildCard(p);
      if (open[p.slug]) setOpen(li, true);
      grid.appendChild(li);
    });
  }

  function setOpen(li, isOpen) {
    li.classList.toggle("open", isOpen);
    var btn = li.querySelector(".project-trigger");
    var label = li.querySelector(".more-label");
    if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (label) label.textContent = t(isOpen ? UI.close : UI.sheet);
  }

  function onGridClick(e) {
    var btn = e.target.closest(".project-trigger");
    if (!btn) return;
    setOpen(btn.closest(".project"), !btn.closest(".project").classList.contains("open"));
  }

  function applyStaticLang() {
    document.body.setAttribute("data-lang", LANG);
    document.documentElement.setAttribute("lang", LANG);
    document.querySelectorAll("[data-fr]").forEach(function (el) {
      var value = el.getAttribute("data-" + LANG);
      if (value == null) value = el.getAttribute("data-fr");
      if (value == null) return;
      if (el.tagName === "META") el.setAttribute("content", value);
      else el.innerHTML = value;
    });
    document.querySelectorAll("[data-setlang]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-setlang") === LANG);
    });
  }

  function setLang(lang) {
    LANG = LANGS.indexOf(lang) >= 0 ? lang : "fr";
    applyStaticLang();
    renderProjects();
    try { localStorage.setItem(STORAGE_KEY, LANG); } catch (e) {}
  }

  function initialLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (LANGS.indexOf(stored) >= 0) return stored;
    var nav = (navigator.language || "fr").toLowerCase();
    for (var i = 0; i < LANGS.length; i++) if (nav.indexOf(LANGS[i]) === 0) return LANGS[i];
    return "fr";
  }

  document.addEventListener("DOMContentLoaded", function () {
    setLang(initialLang());

    var grid = document.getElementById("projects-grid");
    if (grid) grid.addEventListener("click", onGridClick);

    document.querySelectorAll("[data-setlang]").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-setlang")); });
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      document.querySelectorAll("main > section").forEach(function (sec) { sec.classList.add("reveal"); io.observe(sec); });
    }

    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
