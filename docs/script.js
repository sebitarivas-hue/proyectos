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
    "mamma-roma": "2027",
    "aliados": "2013",
    "lips": { fr: "annuel", es: "anual", en: "annual", zh: "每年" }
  };

  var ONGOING = { fr: "en cours", es: "en curso", en: "ongoing", zh: "进行中" };

  var PERIOD = { "war-madrigals":"up","rayon-n":"up","nous":"up","rut":"up","america":"up","lips":"up","mamma-roma":"up","aliados":"past","fame":"past","snow-on-her-lips":"past" };

  var PROJECTS = [
    {
      slug: "war-madrigals", title: "War Madrigals", img: "assets/projects/war-madrigals.svg", photo: "assets/projects/war-madrigals.svg",
      tag: { fr: "Création 2026", es: "Estreno 2026", en: "Premiere 2026", zh: "2026 首演" },
      short: { fr: "Cycle de dix madrigaux pour six voix.", es: "Ciclo de diez madrigales para seis voces.", en: "A cycle of ten madrigals for six voices.", zh: "为六个声部创作的十首牧歌套曲。" },
      pitch: {
        fr: "Cycle de madrigaux contemporains qui confronte la voix à l'expérience de la guerre, de l'exil et de l'intime. Sur des textes de Paul Celan, Anaïs Nin, Samuel Beckett et Forough Farrokhzad.",
        es: "Ciclo de madrigales contemporáneos que confronta la voz con la experiencia de la guerra, el exilio y lo íntimo. Sobre textos de Paul Celan, Anaïs Nin, Samuel Beckett y Forough Farrokhzad.",
        en: "A cycle of contemporary madrigals confronting the voice with the experience of war, exile and intimacy. On texts by Paul Celan, Anaïs Nin, Samuel Beckett and Forough Farrokhzad.",
        zh: "当代牧歌套曲，让人声直面战争、流亡与亲密的体验。文本取自 Paul Celan、Anaïs Nin、Samuel Beckett 与 Forough Farrokhzad。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Cycle vocal", es: "Ciclo vocal", en: "Vocal cycle", zh: "声乐套曲" } },
        { k: { fr: "Effectif", es: "Formación", en: "Forces", zh: "编制" }, v: { fr: "6 voix", es: "6 voces", en: "6 voices", zh: "6 个声部" } },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: "2026" }
      ],
      credits: [
        { role: { fr: "Composition", es: "Composición", en: "Composition", zh: "作曲" }, who: "Sebastian Rivas" },
        { role: { fr: "Textes", es: "Textos", en: "Texts", zh: "文本" }, who: "Celan · Nin · Beckett · Farrokhzad" },
        { role: { fr: "Ensemble", es: "Ensemble", en: "Ensemble", zh: "乐团" }, who: "Les Métaboles" },
        { role: { fr: "Direction", es: "Dirección", en: "Conducting", zh: "指挥" }, who: "Léo Warynski" }
      ],
      partners: ["Les Métaboles"],
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
      slug: "nous", title: "De l'Innocence", titleHtml: "De l'Innocence",
      img: "assets/projects/nous.svg", photo: "assets/projects/nous.svg",
      tag: ONGOING,
      short: { fr: "Opéra de chambre avec Christine Angot.", es: "Ópera de cámara con Christine Angot.", en: "A chamber opera with Christine Angot.", zh: "与 Christine Angot 合作的室内歌剧。" },
      pitch: {
        fr: "Opéra de chambre né d'une série de conversations avec Christine Angot. Non pas mettre en musique un thème, mais trouver une forme qui accueille ce qui résiste au langage et au récit : la perte de l'innocence, l'envahissement du réel, l'expérience de la fracture intérieure.",
        es: "Ópera de cámara nacida de una serie de conversaciones con Christine Angot. No poner en música un tema, sino encontrar una forma que acoja lo que resiste al lenguaje y al relato: la pérdida de la inocencia, la invasión de lo real, la fractura interior.",
        en: "A chamber opera born from a series of conversations with Christine Angot. Not setting a theme to music, but finding a form that holds what resists language and narrative: the loss of innocence, the flooding of the real, the experience of inner fracture.",
        zh: "一部室内歌剧，源自与 Christine Angot 的一系列对话。并非为主题谱曲，而是寻找一种能容纳那些抗拒语言与叙事之物的形式：纯真的丧失、现实的侵入、内在断裂的体验。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra de chambre", es: "Ópera de cámara", en: "Chamber opera", zh: "室内歌剧" } },
        { k: { fr: "Avec", es: "Con", en: "With", zh: "合作" }, v: "Christine Angot" },
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
      slug: "snow-on-her-lips", title: "Snow on Her Lips", titleHtml: "Snow on Her Lips",
      img: "assets/projects/snow.svg",
      tag: { fr: "2021", es: "2021", en: "2021", zh: "2021" },
      short: { fr: "Pièce performative : corps, musique, électronique et vidéo.", es: "Pieza performativa: cuerpo, música, electrónica y vídeo.", en: "A performative piece: body, music, electronics and video.", zh: "表演性作品：身体、音乐、电子与影像。" },
      pitch: {
        fr: "Pièce performative mêlant danse, deux musicien·nes, électronique en temps réel et vidéo : une traversée sensorielle où le corps, le son et l'image se métamorphosent.",
        es: "Pieza performativa que mezcla danza, dos músicos, electrónica en tiempo real y vídeo: una travesía sensorial donde el cuerpo, el sonido y la imagen se metamorfosean.",
        en: "A performative piece weaving dance, two musicians, real-time electronics and video: a sensory crossing where body, sound and image metamorphose.",
        zh: "一部表演性作品，融合舞蹈、两位乐手、实时电子与影像：身体、声音与影像在感官旅程中相互变形。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Performance", es: "Performance", en: "Performance", zh: "表演" } },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: "2021" }
      ],
      credits: [
        { role: { fr: "Conception & musique", es: "Concepción & música", en: "Concept & music", zh: "构思与音乐" }, who: "Sebastian Rivas" }
      ],
      partners: []
    },
    {
      slug: "aliados", title: "Aliados", titleHtml: "Aliados",
      photo: "assets/projects/aliados.jpg",
      tag: { fr: "Création 2013", es: "Estreno 2013", en: "Premiere 2013", zh: "2013 首演" },
      short: { fr: "Opéra du temps réel : Thatcher & Pinochet.", es: "Ópera en tiempo real: Thatcher y Pinochet.", en: "A real-time opera: Thatcher & Pinochet.", zh: "实时歌剧：撒切尔与皮诺切特。" },
      pitch: {
        fr: "Opéra « du temps réel » sur la rencontre, à Londres en 1999, de Margaret Thatcher et du général Pinochet. Vidéo en direct, voix transformées en temps réel : un face-à-face crépusculaire entre fiction et réalité, mémoire et responsabilité.",
        es: "Ópera «en tiempo real» sobre el encuentro, en Londres en 1999, de Margaret Thatcher y el general Pinochet. Vídeo en directo, voces transformadas en tiempo real: un cara a cara crepuscular entre ficción y realidad, memoria y responsabilidad.",
        en: "A “real-time opera” on the 1999 London meeting of Margaret Thatcher and General Pinochet. Live video, voices transformed in real time: a twilight face-off between fiction and reality, memory and responsibility.",
        zh: "一部「实时歌剧」，讲述 1999 年伦敦撒切尔夫人与皮诺切特将军的会面。现场影像、实时变形的人声：一场介于虚构与现实、记忆与责任之间的暮色对峙。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra du temps réel", es: "Ópera en tiempo real", en: "Real-time opera", zh: "实时歌剧" } },
        { k: { fr: "Livret", es: "Libreto", en: "Libretto", zh: "剧本" }, v: "Esteban Buch" },
        { k: { fr: "Mise en scène", es: "Dirección", en: "Stage direction", zh: "导演" }, v: "Antoine Gindt" },
        { k: { fr: "Direction musicale", es: "Dirección musical", en: "Conducting", zh: "音乐指挥" }, v: "Léo Warynski" },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: { fr: "T2G · ManiFeste — Ircam, 2013", es: "T2G · ManiFeste — Ircam, 2013", en: "T2G · ManiFeste — Ircam, 2013", zh: "T2G · ManiFeste — Ircam，2013" } }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Livret", es: "Libreto", en: "Libretto", zh: "剧本" }, who: "Esteban Buch" },
        { role: { fr: "Mise en scène", es: "Dirección de escena", en: "Stage direction", zh: "导演" }, who: "Antoine Gindt" },
        { role: { fr: "Direction musicale", es: "Dirección musical", en: "Conducting", zh: "音乐指挥" }, who: "Léo Warynski" },
        { role: { fr: "Vidéo", es: "Vídeo", en: "Video", zh: "影像" }, who: "Philippe Béziat" }
      ],
      partners: ["Ircam — Centre Pompidou", "GRAME", "T2G — Théâtre de Gennevilliers", "Festival ManiFeste"],
      note: { fr: "Création le 14 juin 2013 (Festival ManiFeste · Ircam). Photo : Pacôme Poirier / WikiSpectacle.", es: "Estreno el 14 de junio de 2013 (Festival ManiFeste · Ircam). Foto: Pacôme Poirier / WikiSpectacle.", en: "Premiered 14 June 2013 (ManiFeste Festival · Ircam). Photo: Pacôme Poirier / WikiSpectacle.", zh: "2013 年 6 月 14 日首演（ManiFeste 音乐节 · Ircam）。摄影：Pacôme Poirier / WikiSpectacle。" }
    },
    {
      slug: "mamma-roma", title: "Mamma Roma", titleHtml: "Mamma Roma",
      tag: { fr: "Création · juillet 2027", es: "Estreno · julio 2027", en: "Premiere · July 2027", zh: "首演 · 2027 年 7 月" },
      short: { fr: "Opéra autour d'une table qui devient tombeau.", es: "Ópera en torno a una mesa que se vuelve tumba.", en: "An opera around a table that becomes a tomb.", zh: "一部围绕餐桌化为坟墓的歌剧。" },
      pitch: {
        fr: "Opéra construit autour d'une grande table carrée qui se transforme lentement en tombeau. Au CETC du Teatro Colón — nef souterraine entourée de chapelles —, le public se fait face de part et d'autre de l'espace central : la mort d'Ettore rejoue la <em>Lamentation sur le Christ mort</em> de Mantegna que Pasolini cite dans le film. Tout le dispositif est purement acoustique, sans amplification : trois percussionnistes actionnent à vue les mécanismes de la table, opérateurs d'un sacrifice où le banquet, la cérémonie et la mort deviennent une seule et même chose.",
        es: "Ópera construida alrededor de una gran mesa cuadrada que lentamente se transforma en tumba. En el CETC del Teatro Colón —nave subterránea rodeada de capillas—, el público se enfrenta entre sí a través del espacio central: la muerte de Ettore retoma la <em>Lamentación sobre Cristo muerto</em> de Mantegna que Pasolini cita en la película. Todo el dispositivo es puramente acústico, sin amplificación: tres percusionistas accionan a la vista los mecanismos de la mesa, operadores de un sacrificio donde el banquete, la ceremonia y la muerte terminan siendo una misma cosa.",
        en: "An opera built around a large square table that slowly turns into a tomb. At the CETC of the Teatro Colón — an underground nave ringed with side chapels — the audience faces itself across the central space: Ettore's death restages Mantegna's <em>Lamentation over the Dead Christ</em>, quoted by Pasolini in the film. The whole device is purely acoustic, without amplification: three percussionists operate the table's mechanisms in full view, operators of a sacrifice in which banquet, ceremony and death become one and the same.",
        zh: "一部围绕一张方形大桌展开的歌剧，桌子缓缓化为坟墓。在 Teatro Colón 的 CETC——一座被侧礼拜堂环绕的地下中殿——观众隔着中央空间彼此相望：Ettore 之死重现了帕索里尼在影片中引用的曼特尼亚《哀悼基督》。整个装置纯然声学、不加扩音：三位打击乐手当众操作餐桌机械，成为献祭的执行者，让宴席、仪式与死亡合为一体。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra", es: "Ópera", en: "Opera", zh: "歌剧" } },
        { k: { fr: "D'après", es: "Según", en: "After", zh: "改编自" }, v: "Pier Paolo Pasolini" },
        { k: { fr: "Mise en scène", es: "Dirección", en: "Stage direction", zh: "导演" }, v: "Martin Bauer" },
        { k: { fr: "Lieu", es: "Lugar", en: "Venue", zh: "场地" }, v: { fr: "CETC — Teatro Colón", es: "CETC — Teatro Colón", en: "CETC — Teatro Colón", zh: "CETC — 科隆剧院" } },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: { fr: "Juillet 2027", es: "Julio 2027", en: "July 2027", zh: "2027 年 7 月" } },
        { k: { fr: "Dispositif", es: "Dispositivo", en: "Set-up", zh: "装置" }, v: { fr: "Acoustique, sans amplification", es: "Acústico, sin amplificación", en: "Acoustic, no amplification", zh: "纯声学，无扩音" } }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Mise en scène & scénographie", es: "Dirección & escenografía", en: "Staging & set design", zh: "导演与舞台设计" }, who: "Martin Bauer" },
        { role: { fr: "Percussions", es: "Percusión", en: "Percussion", zh: "打击乐" }, who: { fr: "Trois percussionnistes", es: "Tres percusionistas", en: "Three percussionists", zh: "三位打击乐手" } }
      ],
      partners: ["CETC — Teatro Colón (Buenos Aires)"]
    },
    {
      slug: "america", title: "América", titleHtml: "América",
      img: "assets/projects/america.svg",
      tag: { fr: "Création 2027", es: "Estreno 2027", en: "Premiere 2027", zh: "2027 首演" },
      short: { fr: "Nouveau projet scénique, créé à Mexico.", es: "Nuevo proyecto escénico, creado en México.", en: "A new stage project, created in Mexico City.", zh: "在墨西哥城创作的新舞台项目。" },
      pitch: {
        fr: "Nouveau projet scénique créé à Mexico, dans une mise en scène de Marcelo Lombardero. Écriture d'un livret et résidences de création vers une première en 2027.",
        es: "Nuevo proyecto escénico creado en México, con dirección de escena de Marcelo Lombardero. Escritura de un libreto y residencias de creación hacia un estreno en 2027.",
        en: "A new stage project created in Mexico City, staged by Marcelo Lombardero. Libretto writing and creation residencies towards a 2027 premiere.",
        zh: "在墨西哥城创作的新舞台项目，由 Marcelo Lombardero 执导。剧本写作与创作驻地，目标 2027 年首演。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Projet scénique", es: "Proyecto escénico", en: "Stage project", zh: "舞台项目" } },
        { k: { fr: "Mise en scène", es: "Dirección", en: "Stage direction", zh: "导演" }, v: "Marcelo Lombardero" },
        { k: { fr: "Lieu", es: "Lugar", en: "Venue", zh: "场地" }, v: { fr: "Mexico", es: "México", en: "Mexico City", zh: "墨西哥城" } },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: "2027" }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Mise en scène", es: "Dirección de escena", en: "Stage direction", zh: "导演" }, who: "Marcelo Lombardero" }
      ],
      partners: [],
      note: { fr: "Création à Mexico. Production en cours de montage.", es: "Estreno en México. Producción en construcción.", en: "Premiere in Mexico City. Production being assembled.", zh: "墨西哥城首演。制作筹备中。" }
    },
    {
      slug: "lips", title: "LIPS Lab", titleHtml: "LIPS Lab",
      img: "assets/projects/lips.svg",
      tag: { fr: "Laboratoire international", es: "Laboratorio internacional", en: "International lab", zh: "国际工作坊" },
      short: { fr: "Laboratoire de prototypes scéniques & sonores.", es: "Laboratorio de prototipos escénicos & sonoros.", en: "A laboratory of scenic & sound prototypes.", zh: "舞台与声音原型工作坊。" },
      pitch: {
        fr: "Laboratoire interdisciplinaire de prototypes scéniques et sonores. Chaque année, de jeunes artistes de toutes disciplines — composition, mise en scène, arts visuels, théâtre, danse — prototypent ensemble de nouvelles formes, accompagnés par des artistes confirmés. Un espace d'échange, d'expérimentation et de co-écriture, où la transmission se fait par la pratique.",
        es: "Laboratorio interdisciplinario de prototipos escénicos y sonoros. Cada año, jóvenes artistas de todas las disciplinas —composición, dirección de escena, artes visuales, teatro, danza— prototipan juntos nuevas formas, acompañados por artistas consagrados. Un espacio de intercambio, experimentación y co-escritura, donde la transmisión se hace por la práctica.",
        en: "An interdisciplinary laboratory of scenic and sound prototypes. Each year, young artists from all disciplines — composition, stage direction, visual arts, theatre, dance — prototype new forms together, mentored by established artists. A space for exchange, experimentation and co-writing, where transmission happens through practice.",
        zh: "一个跨学科的舞台与声音原型工作坊。每年，来自各学科——作曲、导演、视觉艺术、戏剧、舞蹈——的青年艺术家在资深艺术家的陪伴下共同打造新形式的雏形。一个交流、实验与共同书写的空间，让传承通过实践发生。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Laboratoire / transmission", es: "Laboratorio / transmisión", en: "Lab / transmission", zh: "工作坊 / 传承" } },
        { k: { fr: "Démarche", es: "Enfoque", en: "Approach", zh: "方法" }, v: { fr: "Co-écriture · interdisciplinarité · intermédialité", es: "Co-escritura · interdisciplinariedad · intermedialidad", en: "Co-writing · interdisciplinarity · intermediality", zh: "共同书写 · 跨学科 · 跨媒介" } },
        { k: { fr: "Rythme", es: "Ritmo", en: "Frequency", zh: "频率" }, v: { fr: "Annuel", es: "Anual", en: "Annual", zh: "每年" } },
        { k: { fr: "Éditions précédentes", es: "Ediciones anteriores", en: "Previous editions", zh: "往届" }, v: "Pôle Pixel (Villeurbanne) · GRAME (Lyon) · UNSAM (Buenos Aires)" }
      ],
      pitchExtra: true,
      credits: [
        { role: { fr: "Direction", es: "Dirección", en: "Direction", zh: "负责人" }, who: "Sebastian Rivas" }
      ],
      partners: ["GRAME", "Pôle Pixel", "Le Générateur", "La Muse en Circuit", "La Chartreuse", "UNSAM"]
    }
  ];

  var activeSlug = null;

  // Charte couleur élégante — palette BEHR Color Trends 2026 (tons muets, sophistiqués)
  var COLORS = {
    "war-madrigals":    "#2f3f49",  // Nocturne Blue — bleu nuit profond
    "rayon-n":          "#4f5f60",  // Hidden Gem — teal-gris profond
    "nous":             "#5e3c41",  // Rumors — bordeaux feutré
    "rut":              "#6f8f8a",  // Dragonfly — vert-bleu
    "fame":             "#d6a65c",  // Beehive — ocre chaud
    "snow-on-her-lips": "#aebfbd",  // Watery — bleu-gris pâle
    "america":          "#a85c45",  // Terra Cotta Urn — terre cuite
    "lips":             "#939a7e",  // Urban Nature — sauge
    "mamma-roma":       "#4a3a2f"   // Baronial Brown — brun profond
  };

  function hx(h) { h = h.replace("#", ""); return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)]; }
  function tx(n) { n = Math.max(0, Math.min(255, Math.round(n))); return ("0" + n.toString(16)).slice(-2); }
  function darken(h, f) { var c = hx(h); return "#" + tx(c[0]*f) + tx(c[1]*f) + tx(c[2]*f); }
  function inkOn(h) { var c = hx(h); var l = (0.299*c[0] + 0.587*c[1] + 0.114*c[2]) / 255; return l > 0.62 ? "#1a1410" : "#ffffff"; }

  function tileBg(p) {
    var base = COLORS[p.slug] || "#4f5f60";
    return "linear-gradient(152deg," + base + " 0%," + darken(base, 0.86) + " 100%)";
  }
  function tileInk(p) { return inkOn(COLORS[p.slug] || "#4f5f60"); }

  function tileHTML(p) {
    var year = t(YEARS[p.slug] || "");
    if (p.photo) {
      return ''
        + '<button class="ptile" type="button" aria-controls="project-detail">'
        +   '<span class="ptile-img" style="background-image:url(\'' + p.photo + '\')"></span>'
        +   '<span class="ptile-scrim"></span>'
        +   '<span class="ptile-meta">'
        +     '<span class="ptile-title">' + (p.titleHtml || p.title) + '</span>'
        +     (year ? '<span class="ptile-year">' + year + '</span>' : '')
        +   '</span>'
        + '</button>';
    }
    var tag = t(p.tag || "");
    return ''
      + '<button class="ptile ptile--color" type="button" aria-controls="project-detail" style="background:' + tileBg(p) + ';color:' + tileInk(p) + '">'
      +   (tag ? '<span class="ptile-tag">' + tag + '</span>' : '')
      +   '<span class="ptile-meta">'
      +     '<span class="ptile-title">' + (p.titleHtml || p.title) + '</span>'
      +     (year ? '<span class="ptile-year">' + year + '</span>' : '')
      +   '</span>'
      + '</button>';
  }

  function detailHTML(p) {
    var facts = (p.facts || []).map(function (f) {
      return '<li><span class="k">' + t(f.k) + '</span><span class="v">' + t(f.v) + '</span></li>';
    }).join("");
    var credits = (p.credits || []).map(function (c) {
      return '<li><span class="role">' + t(c.role) + ' — </span><span class="who">' + t(c.who) + '</span></li>';
    }).join("");
    var partners = (p.partners && p.partners.length)
      ? '<div class="pd-block pd-full"><h4>' + t(UI.partners) + '</h4><ul class="taglist">'
        + p.partners.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul></div>'
      : "";
    var note = p.note ? '<p class="pd-note">' + t(p.note) + '</p>' : "";
    var media = p.photo
      ? '<div class="pd-media"><img src="' + p.photo + '" alt="" loading="lazy"></div>'
      : '<div class="pd-media pd-media--color" style="background:' + tileBg(p) + ';color:' + tileInk(p) + '"><span class="pd-media-title">' + (p.titleHtml || p.title) + '</span></div>';
    return ''
      + '<div class="pd-head"><h3 class="pd-title">' + (p.titleHtml || p.title) + '</h3>'
      +   '<button class="pd-close" type="button">' + t(UI.close) + ' ✕</button></div>'
      + media
      + '<p class="pd-pitch">' + t(p.pitch) + '</p>'
      + '<div class="pd-grid">'
      +   '<div class="pd-block"><h4>' + t(UI.details) + '</h4><ul class="facts">' + facts + '</ul></div>'
      +   '<div class="pd-block"><h4>' + t(UI.credits) + '</h4><ul class="credits">' + credits + '</ul></div>'
      +   partners + note
      + '</div>';
  }

  function closeDetail() {
    activeSlug = null;
    var d = document.getElementById("project-detail");
    if (d) { d.hidden = true; d.innerHTML = ""; }
    document.querySelectorAll(".project.active").forEach(function (el) { el.classList.remove("active"); });
  }

  function openDetail(slug, scroll) {
    var p = PROJECTS.filter(function (x) { return x.slug === slug; })[0];
    var d = document.getElementById("project-detail");
    if (!p || !d) return;
    activeSlug = slug;
    d.innerHTML = detailHTML(p);
    d.hidden = false;
    document.querySelectorAll(".project").forEach(function (el) { el.classList.toggle("active", el.dataset.slug === slug); });
    if (scroll) d.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderProjects() {
    var up = document.getElementById("grid-upcoming");
    var pa = document.getElementById("grid-past");
    if (!up || !pa) return;
    up.innerHTML = ""; pa.innerHTML = "";
    PROJECTS.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "project";
      li.dataset.slug = p.slug;
      li.innerHTML = tileHTML(p);
      (PERIOD[p.slug] === "past" ? pa : up).appendChild(li);
    });
    if (activeSlug) openDetail(activeSlug, false); else closeDetail();
  }

  function onGridClick(e) {
    if (e.target.closest(".pd-close")) { closeDetail(); return; }
    var tile = e.target.closest(".ptile");
    if (!tile) return;
    var slug = tile.closest(".project").dataset.slug;
    if (slug === activeSlug) closeDetail(); else openDetail(slug, true);
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

    var prod = document.getElementById("productions");
    if (prod) prod.addEventListener("click", onGridClick);

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
