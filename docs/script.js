// STOPERA! — quadrilingual site (FR / ES / EN / ZH) + expandable project cards
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
    partners: { fr: "Production & partenaires", es: "Producción & socios", en: "Production & partners", zh: "制作与合作" },
    press:    { fr: "Revue de presse", es: "Reseña de prensa", en: "Press", zh: "媒体评论" },
    links:    { fr: "À voir & écouter", es: "Ver & escuchar", en: "Watch & listen", zh: "观看与聆听" },
    pressPdf: { fr: "Télécharger la revue de presse (PDF)", es: "Descargar la reseña de prensa (PDF)", en: "Download the press review (PDF)", zh: "下载媒体评论（PDF）" }
  };

  var YEARS = {
    "war-madrigals": "2026",
    "rayon-n": "2026 – 2027",
    "nous": { fr: "en cours", es: "en curso", en: "ongoing", zh: "进行中" },
    "rut": "2026",
    "insistir": "2026",
    "fame": "2025",
    "america": { fr: "en création", es: "en creación", en: "in creation", zh: "创作中" },
    "mamma-roma": "2027",
    "otages": "2024",
    "aliados": "2013",
    "lips": { fr: "annuel", es: "anual", en: "annual", zh: "每年" }
  };

  var ONGOING = { fr: "en cours", es: "en curso", en: "ongoing", zh: "进行中" };

  var PERIOD = { "war-madrigals":"up","rayon-n":"up","nous":"up","rut":"up","insistir":"up","america":"up","lips":"up","mamma-roma":"up","otages":"past","aliados":"past","fame":"past","snow-on-her-lips":"past" };

  var PROJECTS = [
    {
      slug: "war-madrigals", title: "War Madrigals", img: "assets/projects/war-madrigals.svg", photo: "assets/projects/war-madrigals.jpg",
      tag: { fr: "Création 2026", es: "Estreno 2026", en: "Premiere 2026", zh: "2026 首演" },
      short: { fr: "Cycle de dix madrigaux pour six voix.", es: "Ciclo de diez madrigales para seis voces.", en: "A cycle of ten madrigals for six voices.", zh: "为六个声部创作的十首牧歌套曲。" },
      pitch: {
        fr: "Cycle de dix madrigaux pour six voix qui explore la guerre, la mémoire et l'effritement du langage. Un parcours multilingue et polyphonique, miroir sonore des déplacements, des traumas et des résistances intimes.",
        es: "Ciclo de diez madrigales para seis voces que explora la guerra, la memoria y la erosión del lenguaje. Un recorrido multilingüe y polifónico, espejo sonoro de los desplazamientos, los traumas y las resistencias íntimas.",
        en: "A cycle of ten madrigals for six voices exploring war, memory and the erosion of language. A multilingual, polyphonic journey — a sonic mirror of displacement, trauma and intimate resistance.",
        zh: "为六个声部创作的十首牧歌套曲，探索战争、记忆与语言的崩解。一段多语、复调的旅程——流离、创伤与私密抵抗的声音之镜。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Cycle vocal", es: "Ciclo vocal", en: "Vocal cycle", zh: "声乐套曲" } },
        { k: { fr: "Effectif", es: "Formación", en: "Forces", zh: "编制" }, v: { fr: "6 voix", es: "6 voces", en: "6 voices", zh: "6 个声部" } },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: "2026" }
      ],
      credits: [
        { role: { fr: "Composition", es: "Composición", en: "Composition", zh: "作曲" }, who: "Sebastian Rivas" },
        { role: { fr: "Textes", es: "Textos", en: "Texts", zh: "文本" }, who: "Celan · Kertész · Pasolini · Pizarnik · Farrokhzad · Akhmatova · Beckett · Shakespeare" },
        { role: { fr: "Ensemble", es: "Ensemble", en: "Ensemble", zh: "乐团" }, who: "Les Métaboles" },
        { role: { fr: "Direction", es: "Dirección", en: "Conducting", zh: "指挥" }, who: "Léo Warynski" }
      ],
      partners: ["Les Métaboles"],
      note: { fr: "Distribution et dates en cours de finalisation.", es: "Reparto y fechas en proceso de confirmación.", en: "Cast and dates being finalised.", zh: "演员与日期确认中。" }
    },
    {
      slug: "rayon-n", title: "Rayon N", img: "assets/projects/rayon-n.svg", photo: "assets/projects/rayon-n.jpg",
      tag: { fr: "Production 2026 · diffusion 2027", es: "Producción 2026 · gira 2027", en: "Production 2026 · touring 2027", zh: "2026 制作 · 2027 巡演" },
      short: { fr: "Opéra-film animé par intelligence artificielle.", es: "Ópera-film animada por inteligencia artificial.", en: "An AI-animated film-opera.", zh: "由人工智能生成影像的影像歌剧。" },
      pitch: {
        fr: "Opéra inspiré d'un épisode réel : la prétendue découverte du « rayon N » par le physicien René Blondlot en 1903. Une fable sur la croyance, la construction du réel et la manipulation des savoirs, où l'image — aujourd'hui générée et animée — dialogue avec la musique jouée en direct. Livret et mise en scène d'Antoine Gindt, avec Philippe Béziat.",
        es: "Ópera inspirada en un episodio real: la supuesta invención del «rayo N» por el físico René Blondlot en 1903. Una fábula sobre la creencia, la construcción de lo real y la manipulación de los saberes, donde la imagen —hoy generada y animada— dialoga con la música en vivo. Libreto y dirección de Antoine Gindt, con Philippe Béziat.",
        en: "An opera inspired by a real episode: physicist René Blondlot's supposed 1903 discovery of the “N-ray.” A fable on belief, the construction of reality and the manipulation of knowledge, where the image — today generated and animated — converses with live music. Libretto and staging by Antoine Gindt, with Philippe Béziat.",
        zh: "一部取材自真实事件的歌剧：物理学家 René Blondlot 于 1903 年声称发现「N 射线」。一则关于信念、现实建构与知识操纵的寓言；影像——如今由生成技术动画化——与现场音乐对话。Antoine Gindt 编剧与导演，Philippe Béziat 参与。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra-film", es: "Ópera-film", en: "Film-opera", zh: "影像歌剧" } },
        { k: { fr: "Commande", es: "Encargo", en: "Commission", zh: "委约" }, v: "Ensemble intercontemporain" },
        { k: { fr: "Livret & mise en scène", es: "Libreto & dirección", en: "Libretto & staging", zh: "剧本与导演" }, v: "Antoine Gindt" },
        { k: { fr: "Direction musicale", es: "Dirección musical", en: "Conducting", zh: "音乐指挥" }, v: "Léo Warynski" },
        { k: { fr: "Production", es: "Producción", en: "Production", zh: "制作" }, v: { fr: "2026 · diffusion 2027", es: "2026 · gira 2027", en: "2026 · touring 2027", zh: "2026 · 2027 巡演" } }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Livret & mise en scène", es: "Libreto & dirección", en: "Libretto & staging", zh: "剧本与导演" }, who: "Antoine Gindt" },
        { role: { fr: "Réalisation", es: "Realización", en: "Film direction", zh: "影像导演" }, who: "Philippe Béziat" },
        { role: { fr: "Direction musicale", es: "Dirección musical", en: "Conducting", zh: "音乐指挥" }, who: "Léo Warynski" },
        { role: { fr: "Ensembles", es: "Ensembles", en: "Ensembles", zh: "乐团" }, who: "Les Métaboles · Ensemble intercontemporain" }
      ],
      partners: ["Ensemble intercontemporain", "Lavoir Numérique (Gentilly)"],
      links: [
        { label: "GRAME — Rayon N, étape 1 (film de Julien Ravoux)", url: "https://www.grame.fr/evenements/2021-02-rayon-n-etape-1-diffusion-du-film-de-julien-ravoux" },
        { label: "T&M Paris — Rayon N", url: "https://theatre-musique.com/spectacle/rayon-n/" }
      ],
      note: { fr: "Recherche de coproductions et de diffuseurs en cours.", es: "Búsqueda de coproducciones y programadores en curso.", en: "Coproductions and venues being sought.", zh: "正在寻找联合制作方与演出场所。" }
    },
    {
      slug: "nous", title: "De l'Innocence", titleHtml: "De l'Innocence",
      img: "assets/projects/nous.svg", photo: "assets/projects/nous.jpg",
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
      img: "assets/projects/rut.svg", photo: "assets/projects/rut.jpg",
      tag: { fr: "Première fin 2026", es: "Estreno fin de 2026", en: "Premiere late 2026", zh: "2026 年底首演" },
      short: { fr: "Performance solo de Rut Schreiner.", es: "Performance solo de Rut Schreiner.", en: "A solo performance by Rut Schreiner.", zh: "Rut Schreiner 的独角表演。" },
      pitch: {
        fr: "Performance pour cheffe solo, capteurs, son spatialisé et vidéo interactive — sous-titrée « Conducting the Invisible ». Le geste de direction de Rut Schreiner, capté en temps réel, génère, module et sculpte le son : le corps devient instrument, la direction d'orchestre, matière musicale.",
        es: "Performance para directora sola, sensores, sonido espacializado y vídeo interactivo —subtitulada «Conducting the Invisible». El gesto de dirección de Rut Schreiner, captado en tiempo real, genera, modula y esculpe el sonido: el cuerpo se vuelve instrumento, la dirección de orquesta, materia musical.",
        en: "A performance for solo conductor, sensors, spatialised sound and interactive video — subtitled “Conducting the Invisible.” Rut Schreiner's conducting gesture, captured in real time, generates, modulates and sculpts sound: the body becomes an instrument, conducting becomes musical material.",
        zh: "一场为独奏指挥、传感器、空间化声音与互动影像而作的表演——副标题「Conducting the Invisible」。Rut Schreiner 的指挥手势经实时捕捉，生成、调制并雕塑声音：身体成为乐器，指挥成为音乐素材。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Performance", es: "Performance", en: "Performance", zh: "表演" } },
        { k: { fr: "Dispositif", es: "Dispositivo", en: "Set-up", zh: "装置" }, v: { fr: "Capteurs · son spatialisé · vidéo", es: "Sensores · sonido espacial · vídeo", en: "Sensors · spatial sound · video", zh: "传感器 · 空间声 · 影像" } },
        { k: { fr: "Programme", es: "Programa", en: "Programme", zh: "曲目" }, v: "Fernández · De Mey · Martínez Álvarez · Alsina Tarrès" },
        { k: { fr: "Première", es: "Estreno", en: "Premiere", zh: "首演" }, v: { fr: "Fin 2026", es: "Fin de 2026", en: "Late 2026", zh: "2026 年底" } }
      ],
      credits: [
        { role: { fr: "Conception & interprétation", es: "Concepción & interpretación", en: "Concept & performance", zh: "构思与表演" }, who: "Rut Schreiner" }
      ],
      partners: [],
      note: { fr: "Création en résidence. Dispositif technique en cours de définition.", es: "Creación en residencia. Dispositivo técnico en definición.", en: "Created in residency. Technical set-up being defined.", zh: "驻地创作。技术装置确定中。" }
    },
    {
      slug: "fame", title: "F[A]ME", titleHtml: "F[A]ME",
      img: "assets/projects/fame.svg", photo: "assets/projects/fame.jpg",
      tag: { fr: "Diffusion 2025", es: "Difusión 2025", en: "Touring 2025", zh: "2025 演出" },
      short: { fr: "Performance solo d'Olivia Martin : renommée, effacement, féminité.", es: "Performance solo de Olivia Martin: fama, borrado, feminidad.", en: "A solo performance by Olivia Martin: fame, erasure, femininity.", zh: "Olivia Martin 的个人表演：名望、消隐、女性气质。" },
      pitch: {
        fr: "Performance musicale solo conçue et interprétée par Olivia Martin. Entre composition, voix et présence scénique, elle explore la renommée, l'effacement et la féminité dans les arts vivants.",
        es: "Performance musical solo concebida e interpretada por Olivia Martin. Entre composición, voz y presencia escénica, explora la fama, el borrado y la feminidad en las artes vivas.",
        en: "A solo musical performance conceived and performed by Olivia Martin. Between composition, voice and stage presence, it explores fame, erasure and femininity in the live arts.",
        zh: "由 Olivia Martin 构思并演出的个人音乐表演。游走于作曲、人声与舞台存在之间，探索名望、消隐与表演艺术中的女性气质。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Performance solo", es: "Performance solo", en: "Solo performance", zh: "独角表演" } },
        { k: { fr: "Diffusion", es: "Difusión", en: "Touring", zh: "演出" }, v: "2025" }
      ],
      credits: [
        { role: { fr: "Conception & interprétation", es: "Concepción & interpretación", en: "Concept & performance", zh: "构思与表演" }, who: "Olivia Martin" }
      ],
      partners: ["GRAME"],
      links: [
        { label: "GRAME — Pop-up exploratoire #1 : F[A]ME", url: "https://www.grame.fr/evenements/2021-10-pop-up-exploratoire-1-fam-e" }
      ]
    },
    {
      slug: "snow-on-her-lips", title: "Snow on Her Lips", titleHtml: "Snow on Her Lips",
      img: "assets/projects/snow.svg", photo: "assets/projects/snow.jpg", video: "BVKdEvoWh6U",
      tag: { fr: "Monte-Carlo · 2021", es: "Monte-Carlo · 2021", en: "Monte-Carlo · 2021", zh: "蒙特卡洛 · 2021" },
      short: { fr: "Monodrame : théâtre musical, danse, vidéo & électronique.", es: "Monodrama: teatro musical, danza, vídeo y electrónica.", en: "A monodrama: music theatre, dance, video & electronics.", zh: "独角戏：音乐剧场、舞蹈、影像与电子。" },
      pitch: {
        fr: "Monodrame immersif pour une performeuse, deux instrumentistes, objets, électronique et vidéo. Inspiré de Hans Bellmer et de textes de Heiner Müller (<em>Hamlet-Machine</em>), il suit le monologue d'une femme qui se défait, se libère et se consume — jusqu'à faire de cette destruction le prélude possible d'une reconstruction. Commande du Printemps des Arts de Monte-Carlo.",
        es: "Monodrama inmersivo para una performer, dos instrumentistas, objetos, electrónica y vídeo. Inspirado en Hans Bellmer y en textos de Heiner Müller (<em>Hamlet-Machine</em>), sigue el monólogo de una mujer que se deshace, se libera y se consume — hasta hacer de esa destrucción el posible preludio de una reconstrucción. Encargo del Printemps des Arts de Monte-Carlo.",
        en: "An immersive monodrama for a performer, two instrumentalists, objects, electronics and video. Inspired by Hans Bellmer and texts by Heiner Müller (<em>Hamletmachine</em>), it follows the monologue of a woman who breaks apart, frees and consumes herself — until that destruction becomes the possible prelude to a reconstruction. Commissioned by the Printemps des Arts de Monte-Carlo.",
        zh: "一部沉浸式独角戏，为一位表演者、两位乐手、物件、电子与影像而作。灵感取自汉斯·贝尔默与海纳·穆勒的文本（<em>哈姆雷特机器</em>），追随一位女性自我瓦解、解放与焚毁的独白——直到这种毁灭成为重建的可能序曲。受蒙特卡洛艺术之春委约。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Monodrame / théâtre musical", es: "Monodrama / teatro musical", en: "Monodrama / music theatre", zh: "独角戏 / 音乐剧场" } },
        { k: { fr: "D'après", es: "A partir de", en: "After", zh: "取材自" }, v: { fr: "Hans Bellmer · Heiner Müller", es: "Hans Bellmer · Heiner Müller", en: "Hans Bellmer · Heiner Müller", zh: "汉斯·贝尔默 · 海纳·穆勒" } },
        { k: { fr: "Durée", es: "Duración", en: "Duration", zh: "时长" }, v: "55 min" },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: { fr: "Printemps des Arts de Monte-Carlo, 2021", es: "Printemps des Arts de Monte-Carlo, 2021", en: "Printemps des Arts de Monte-Carlo, 2021", zh: "蒙特卡洛艺术之春，2021" } }
      ],
      credits: [
        { role: { fr: "Composition & mise en scène", es: "Composición & dirección", en: "Composition & staging", zh: "作曲与导演" }, who: "Sebastian Rivas" },
        { role: { fr: "Performeuse", es: "Performer", en: "Performer", zh: "表演者" }, who: "Emma Terno" },
        { role: { fr: "Vidéo & informatique musicale", es: "Vídeo & informática musical", en: "Video & music computing", zh: "影像与音乐信息" }, who: "Daniel Zea" },
        { role: { fr: "Ensemble", es: "Ensemble", en: "Ensemble", zh: "乐团" }, who: "Êkheía — Bastien Roblot, Olivia Martin" },
        { role: { fr: "Lumières & scénographie", es: "Luces & escenografía", en: "Lighting & set design", zh: "灯光与舞美" }, who: "Jean-Cyrille Burdet" },
        { role: { fr: "Regard extérieur", es: "Mirada externa", en: "Outside eye", zh: "外部视角" }, who: "Géraldine Kosiak" }
      ],
      partners: ["Printemps des Arts de Monte-Carlo", "GRAME"],
      note: { fr: "Création au Sporting Monte-Carlo (Monaco), 2021. Captation disponible sur notre chaîne YouTube.", es: "Estreno en el Sporting Monte-Carlo (Mónaco), 2021. Grabación disponible en nuestro canal de YouTube.", en: "Premiered at the Sporting Monte-Carlo (Monaco), 2021. Recording available on our YouTube channel.", zh: "2021 年于蒙特卡洛 Sporting（摩纳哥）首演。录像见我们的 YouTube 频道。" }
    },
    {
      slug: "otages", title: "Otages", titleHtml: "Otages",
      photo: "assets/projects/otages.jpg",
      tag: { fr: "Création 2024", es: "Estreno 2024", en: "Premiere 2024", zh: "2024 首演" },
      short: { fr: "Opéra d'après Nina Bouraoui — Opéra de Lyon.", es: "Ópera a partir de Nina Bouraoui — Opéra de Lyon.", en: "An opera after Nina Bouraoui — Opéra de Lyon.", zh: "改编自 Nina Bouraoui 的歌剧 —— 里昂歌剧院。" },
      pitch: {
        fr: "Opéra en trois actes d'après le texte de Nina Bouraoui. Le portrait de Sylvie Meyer, femme « ordinaire et extraordinaire » qui se conforme cinquante-trois ans durant à ce que l'on attend d'elle — jusqu'au geste qui fait tout basculer, répréhensible et libérateur : « je suis Sylvie Meyer ». Mise en scène de Richard Brunel.",
        es: "Ópera en tres actos a partir del texto de Nina Bouraoui. El retrato de Sylvie Meyer, mujer «ordinaria y extraordinaria» que durante cincuenta y tres años se conforma con lo que se espera de ella — hasta el gesto que lo trastoca todo, reprensible y liberador: «soy Sylvie Meyer». Dirección de escena de Richard Brunel.",
        en: "An opera in three acts after the text by Nina Bouraoui. The portrait of Sylvie Meyer, an “ordinary and extraordinary” woman who conforms for fifty-three years to what is expected of her — until the act that overturns everything, reprehensible and liberating: “I am Sylvie Meyer.” Staged by Richard Brunel.",
        zh: "一部根据 Nina Bouraoui 文本创作的三幕歌剧。Sylvie Meyer 的肖像——一个「平凡而非凡」的女人，五十三年来顺从他人的期待，直到那个颠覆一切、既应受谴责又带来解放的举动：「我是 Sylvie Meyer」。Richard Brunel 执导。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra (3 actes)", es: "Ópera (3 actos)", en: "Opera (3 acts)", zh: "歌剧（三幕）" } },
        { k: { fr: "Texte", es: "Texto", en: "Text", zh: "文本" }, v: "Nina Bouraoui" },
        { k: { fr: "Mise en scène", es: "Dirección", en: "Stage direction", zh: "导演" }, v: "Richard Brunel" },
        { k: { fr: "Direction musicale", es: "Dirección musical", en: "Conducting", zh: "音乐指挥" }, v: "Rut Schreiner" },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: { fr: "Opéra de Lyon · Croix-Rousse, mars 2024", es: "Opéra de Lyon · Croix-Rousse, marzo 2024", en: "Opéra de Lyon · Croix-Rousse, March 2024", zh: "里昂歌剧院 · Croix-Rousse，2024 年 3 月" } }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Texte", es: "Texto", en: "Text", zh: "文本" }, who: "Nina Bouraoui" },
        { role: { fr: "Mise en scène", es: "Dirección de escena", en: "Stage direction", zh: "导演" }, who: "Richard Brunel" },
        { role: { fr: "Direction musicale", es: "Dirección musical", en: "Conducting", zh: "音乐指挥" }, who: "Rut Schreiner" },
        { role: { fr: "Avec", es: "Con", en: "With", zh: "演员" }, who: "Nicola Beller Carbone · Yvan Ludlow" }
      ],
      partners: ["Opéra de Lyon", "GRAME", "Théâtre de la Croix-Rousse"],
      press: [
        { quote: { fr: "Une femme de 53 ans s'y livre au commentaire très rationnel de l'acte de violence qui l'a libérée de tout ce qu'elle a subi jusque-là.", es: "Una mujer de 53 años se entrega al comentario muy racional del acto de violencia que la liberó de todo lo que había sufrido.", en: "A 53-year-old woman delivers a coolly rational commentary on the act of violence that freed her from all she had endured.", zh: "一位 53 岁的女性，冷静而理性地讲述那个将她从此前所受的一切中解放出来的暴力行为。" }, source: "Le Monde", url: "https://www.lemonde.fr/culture/article/2024/03/19/otages-un-opera-qui-libere-la-parole-feminine-mais-pas-le-chant_6222903_3246.html" },
        { quote: { fr: "Le compositeur franco-argentin donne à entendre la violence sociale et sexiste.", es: "El compositor franco-argentino hace oír la violencia social y sexista.", en: "The French-Argentine composer makes social and sexist violence audible.", zh: "这位法国-阿根廷作曲家让社会与性别暴力被听见。" }, source: "Diapason", url: "https://www.diapasonmag.fr/critiques/otages-de-sebastian-rivas-a-lyon-un-drame-feministe-en-musique-46011.html" },
        { quote: { fr: "Sylvie Meyer découvre qu'elle est doublement otage : amoureuse et économique.", es: "Sylvie Meyer descubre que es doblemente rehén: amorosa y económica.", en: "Sylvie Meyer discovers she is a hostage twice over: emotionally and economically.", zh: "Sylvie Meyer 发现自己是双重人质：情感的与经济的。" }, source: "ResMusica", url: "https://www.resmusica.com/2024/03/20/otages-a-lyon-la-fin-de-la-soumission/" },
        { quote: { fr: "Le livret s'avère d'une grande richesse, en prise avec notre époque.", es: "El libreto resulta de gran riqueza, en sintonía con nuestra época.", en: "The libretto proves richly resonant, in touch with our time.", zh: "剧本极为丰富，紧扣我们的时代。" }, source: "Forum Opéra", url: "https://www.forumopera.com/spectacle/rivas-otages-lyon/" },
        { quote: { fr: "Entre musique et théâtre, le mariage est réussi.", es: "Entre música y teatro, la unión es lograda.", en: "Between music and theatre, the marriage is a success.", zh: "音乐与戏剧的结合十分成功。" }, source: "Classykéo", url: "https://www.classykeo.com/2024/03/29/otages-faites-entrer-laccuse/" }
      ],
      pressPdf: "assets/press/otages-revue-presse.pdf",
      note: { fr: "Création mondiale le 17 mars 2024 (Festival de l'Opéra de Lyon).", es: "Estreno mundial el 17 de marzo de 2024 (Festival de la Opéra de Lyon).", en: "World premiere on 17 March 2024 (Opéra de Lyon Festival).", zh: "2024 年 3 月 17 日世界首演（里昂歌剧院艺术节）。" }
    },
    {
      slug: "aliados", title: "Aliados", titleHtml: "Aliados",
      photo: "assets/projects/aliados.jpg", video: "z2sobYeFzmE",
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
      press: [
        { quote: "La voix inoubliable des oubliés.", source: "Laura Plas — La Terrasse" },
        { quote: "Sebastian Rivas joue des conventions mais ne tombe pas dedans.", source: "Franck Madlener — Ircam" },
        { quote: "Un opéra de l'oubli et du néant.", source: "Bruno Serrou" }
      ],
      pressPdf: "assets/press/aliados-revue-presse.pdf",
      note: { fr: "Création le 14 juin 2013 (Festival ManiFeste · Ircam). Couverture internationale (La Stampa, The Times, Le Monde, El País, El Mundo, Clarín, Página/12…). Photo : Pacôme Poirier / WikiSpectacle.", es: "Estreno el 14 de junio de 2013 (Festival ManiFeste · Ircam). Cobertura internacional (La Stampa, The Times, Le Monde, El País, El Mundo, Clarín, Página/12…). Foto: Pacôme Poirier / WikiSpectacle.", en: "Premiered 14 June 2013 (ManiFeste Festival · Ircam). International coverage (La Stampa, The Times, Le Monde, El País, El Mundo, Clarín, Página/12…). Photo: Pacôme Poirier / WikiSpectacle.", zh: "2013 年 6 月 14 日首演（ManiFeste 音乐节 · Ircam）。国际媒体报道（La Stampa、The Times、Le Monde、El País、El Mundo、Clarín、Página/12…）。摄影：Pacôme Poirier / WikiSpectacle。" }
    },
    {
      slug: "insistir", title: "Insistir", titleHtml: "Insistir",
      photo: "assets/projects/insistir.jpg",
      tag: { fr: "Création 2026 · Mexico", es: "Estreno 2026 · México", en: "Premiere 2026 · Mexico City", zh: "2026 首演 · 墨西哥城" },
      short: { fr: "Performance pour Nicola Beller Carbone, autour de pièces de Georges Aperghis.", es: "Performance para Nicola Beller Carbone, en torno a piezas de Georges Aperghis.", en: "A performance for Nicola Beller Carbone, around works by Georges Aperghis.", zh: "为 Nicola Beller Carbone 而作的表演，围绕 Georges Aperghis 的作品。" },
      pitch: {
        fr: "Performance scénique pour une interprète seule en scène, portée par Nicola Beller Carbone et construite autour de pièces de Georges Aperghis. En dialogue avec un geste fondateur — la mise en scène d'<em>En attendant Godot</em> par Susan Sontag dans Sarajevo assiégée (1993) —, elle interroge la présence en situation extrême : la voix comme matière, la répétition comme acte, l'insistance comme résistance. Création prévue à Mexico en 2026.",
        es: "Performance escénica para una intérprete sola en escena, encarnada por Nicola Beller Carbone y construida en torno a piezas de Georges Aperghis. En diálogo con un gesto fundador —la puesta en escena de <em>Esperando a Godot</em> por Susan Sontag en el Sarajevo sitiado (1993)—, interroga la presencia en situación extrema: la voz como materia, la repetición como acto, la insistencia como resistencia. Estreno previsto en México en 2026.",
        en: "A stage performance for a single performer, embodied by Nicola Beller Carbone and built around works by Georges Aperghis. In dialogue with a founding gesture — Susan Sontag staging <em>Waiting for Godot</em> in besieged Sarajevo (1993) — it questions presence in extreme conditions: voice as material, repetition as act, insistence as resistance. Premiere planned in Mexico City in 2026.",
        zh: "一部为独奏表演者而作的舞台表演，由 Nicola Beller Carbone 演绎，围绕 Georges Aperghis 的作品构建。它与一个奠基性姿态对话——1993 年 Susan Sontag 在被围困的萨拉热窝执导《<em>等待戈多</em>》——追问极端处境中的在场：人声作为材料，重复作为行动，坚持作为抵抗。预计 2026 年于墨西哥城首演。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Performance", es: "Performance", en: "Performance", zh: "表演" } },
        { k: { fr: "Œuvres", es: "Obras", en: "Works", zh: "作品" }, v: "Georges Aperghis" },
        { k: { fr: "Interprète", es: "Intérprete", en: "Performer", zh: "表演者" }, v: "Nicola Beller Carbone" },
        { k: { fr: "Direction artistique", es: "Dirección artística", en: "Artistic direction", zh: "艺术指导" }, v: "Nicola Beller Carbone · Martin Bauer" },
        { k: { fr: "Création", es: "Estreno", en: "Premiere", zh: "首演" }, v: { fr: "Mexico, 2026", es: "México, 2026", en: "Mexico City, 2026", zh: "墨西哥城，2026" } }
      ],
      credits: [
        { role: { fr: "Direction artistique", es: "Dirección artística", en: "Artistic direction", zh: "艺术指导" }, who: "Nicola Beller Carbone · Martin Bauer" },
        { role: { fr: "Interprète", es: "Intérprete", en: "Performer", zh: "表演者" }, who: "Nicola Beller Carbone" },
        { role: { fr: "Œuvres", es: "Obras", en: "Works", zh: "作品" }, who: "Georges Aperghis" }
      ],
      partners: [],
      note: { fr: "Projet en développement — en référence au geste de Susan Sontag à Sarajevo (1993).", es: "Proyecto en desarrollo — en referencia al gesto de Susan Sontag en Sarajevo (1993).", en: "Project in development — referencing Susan Sontag's gesture in Sarajevo (1993).", zh: "开发中的项目——参照 1993 年 Susan Sontag 在萨拉热窝的姿态。" }
    },
    {
      slug: "mamma-roma", title: "Mamma Roma", titleHtml: "Mamma Roma",
      photo: "assets/projects/mamma-roma.jpg",
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
      slug: "america", title: "A World to Blast", titleHtml: "A World to Blast",
      img: "assets/projects/america.svg", photo: "assets/projects/america-scarfo.jpg",
      tag: { fr: "Opéra · Mexico", es: "Ópera · México", en: "Opera · Mexico City", zh: "歌剧 · 墨西哥城" },
      short: { fr: "Opéra : América Scarfó & Soledad Rosas, l'amour comme acte révolutionnaire.", es: "Ópera: América Scarfó y Soledad Rosas, el amor como acto revolucionario.", en: "An opera: América Scarfó & Soledad Rosas, love as a revolutionary act.", zh: "歌剧：América Scarfó 与 Soledad Rosas，爱作为革命行动。" },
      pitch: {
        fr: "Opéra qui entrelace les destins d'<em>América Scarfó</em> et de <em>Soledad Rosas</em>, deux femmes liées par l'amour, l'exil et la lutte — l'anarchisme des années 1930 (Argentine, Europe) et les mouvements squat de l'Italie des années 1990. Comme la <em>Lulu</em> de Berg, l'œuvre sonde le pouvoir de l'amour ; mais ici l'amour devient un acte révolutionnaire, affirmation d'autonomie face aux systèmes oppressifs. Musique de Sebastian Rivas, dramaturgie et mise en scène de Marcelo Lombardero.",
        es: "Ópera que entrelaza los destinos de <em>América Scarfó</em> y <em>Soledad Rosas</em>, dos mujeres unidas por el amor, el exilio y la lucha — el anarquismo de los años 30 (Argentina, Europa) y los movimientos «okupas» de la Italia de los 90. Como la <em>Lulu</em> de Berg, la obra indaga el poder del amor; pero aquí el amor es un acto revolucionario, afirmación de autonomía frente a los sistemas opresivos. Música de Sebastian Rivas, dramaturgia y dirección de Marcelo Lombardero.",
        en: "An opera weaving together the fates of <em>América Scarfó</em> and <em>Soledad Rosas</em>, two women bound by love, exile and struggle — 1930s anarchism (Argentina, Europe) and the 1990s squat movements of Italy. Like Berg's <em>Lulu</em>, it probes the power of love; but here love becomes a revolutionary act, an assertion of autonomy against oppressive systems. Music by Sebastian Rivas, dramaturgy and staging by Marcelo Lombardero.",
        zh: "一部歌剧，交织 <em>América Scarfó</em> 与 <em>Soledad Rosas</em> 两位女性的命运——她们因爱、流亡与抗争而相连：1930 年代的无政府主义（阿根廷、欧洲）与 1990 年代意大利的占屋运动。如同贝尔格的《<em>璐璐</em>》，作品探问爱的力量；但在这里，爱成为革命行动，是面对压迫体制的自主宣言。Sebastian Rivas 作曲，Marcelo Lombardero 戏剧构作与导演。" },
      facts: [
        { k: { fr: "Genre", es: "Género", en: "Genre", zh: "类型" }, v: { fr: "Opéra", es: "Ópera", en: "Opera", zh: "歌剧" } },
        { k: { fr: "Aussi", es: "También", en: "Also", zh: "别名" }, v: { fr: "Un mundo por quemar · Un Monde à brûler", es: "Un mundo por quemar · Un Monde à brûler", en: "Un mundo por quemar · A World to Blast", zh: "Un mundo por quemar · 燃尽的世界" } },
        { k: { fr: "Figures", es: "Figuras", en: "Figures", zh: "人物" }, v: "América Scarfó · Soledad Rosas" },
        { k: { fr: "Dramaturgie & mise en scène", es: "Dramaturgia & dirección", en: "Dramaturgy & staging", zh: "戏剧构作与导演" }, v: "Marcelo Lombardero" },
        { k: { fr: "Création", es: "Creación", en: "Creation", zh: "创作" }, v: { fr: "Mexico — date à venir", es: "México — fecha por confirmar", en: "Mexico City — date TBC", zh: "墨西哥城 — 日期待定" } }
      ],
      credits: [
        { role: { fr: "Musique", es: "Música", en: "Music", zh: "音乐" }, who: "Sebastian Rivas" },
        { role: { fr: "Dramaturgie & mise en scène", es: "Dramaturgia & dirección", en: "Dramaturgy & staging", zh: "戏剧构作与导演" }, who: "Marcelo Lombardero" },
        { role: { fr: "Distribution", es: "Reparto", en: "Cast", zh: "演员" }, who: { fr: "Scarfó (soprano), Rosas (mezzo), Di Giovanni & Massari (barytons), chœur", es: "Scarfó (soprano), Rosas (mezzo), Di Giovanni y Massari (barítonos), coro", en: "Scarfó (soprano), Rosas (mezzo), Di Giovanni & Massari (baritones), chorus", zh: "Scarfó（女高音）、Rosas（次女高音）、Di Giovanni 与 Massari（男中音）、合唱" } }
      ],
      partners: [],
      note: { fr: "Sous-titre : Cineres Amoris et Rebellionis. D'après Martín Caparrós (Amor y Anarquía) et Osvaldo Bayer. Création à Mexico — date à venir.", es: "Subtítulo: Cineres Amoris et Rebellionis. A partir de Martín Caparrós (Amor y Anarquía) y Osvaldo Bayer. Estreno en México — fecha por confirmar.", en: "Subtitle: Cineres Amoris et Rebellionis. After Martín Caparrós (Amor y Anarquía) and Osvaldo Bayer. Premiere in Mexico City — date to be confirmed.", zh: "副标题：Cineres Amoris et Rebellionis。取材自 Martín Caparrós（《爱与无政府》）与 Osvaldo Bayer。于墨西哥城首演 —— 日期待定。" }
    },
    {
      slug: "lips", title: "LIPS Lab", titleHtml: "LIPS Lab",
      img: "assets/projects/lips.svg", photo: "assets/projects/lips.jpg",
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
        { role: { fr: "Direction", es: "Dirección", en: "Direction", zh: "负责人" }, who: "Sebastian Rivas" },
        { role: { fr: "Informatique musicale", es: "Informática musical", en: "Music computing", zh: "音乐信息" }, who: "Max Bruckert" },
        { role: { fr: "Intervenant·es", es: "Invitados/as", en: "Mentors & guests", zh: "导师与嘉宾" }, who: "François Chaignaud · Julie Desprairies · Daniel Zea · Géraldine Kosiak · Pierre Jodlowski · Marc Monnet · Richard Brunel · Jean-Cyrille Burdet · Alexander Schubert · Benoit Renaudin · Géraldine Farage" }
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
    "mamma-roma":       "#4a3a2f",  // Baronial Brown — brun profond
    "otages":           "#6d7f8d",  // Adirondack Blue — bleu-gris
    "insistir":         "#6b6470"   // Curtain Call — gris-prune
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
    var press = (p.press && p.press.length)
      ? '<div class="pd-block pd-full pd-press"><h4>' + t(UI.press) + '</h4>'
        + p.press.map(function (q) {
            var src = q.url ? '<a href="' + q.url + '" target="_blank" rel="noopener">' + q.source + '</a>' : q.source;
            return '<blockquote class="pdq">« ' + t(q.quote) + ' »<cite>' + src + '</cite></blockquote>';
          }).join("")
        + (p.pressPdf ? '<a class="pd-dl" href="' + p.pressPdf + '" target="_blank" rel="noopener">' + t(UI.pressPdf) + ' ↓</a>' : '')
        + '</div>'
      : "";
    var links = (p.links && p.links.length)
      ? '<div class="pd-block pd-full"><h4>' + t(UI.links) + '</h4><ul class="taglist">'
        + p.links.map(function (l) { return '<li><a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + '</a></li>'; }).join("")
        + '</ul></div>'
      : "";
    var media;
    if (p.video) {
      media = '<div class="pd-media pd-media--video">'
        + '<iframe src="https://www.youtube-nocookie.com/embed/' + p.video + '?autoplay=1&mute=1&loop=1&playlist=' + p.video + '&controls=0&modestbranding=1&playsinline=1&rel=0&disablekb=1" title="' + (p.title) + '" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
        + '</div>';
    } else if (p.photo) {
      media = '<div class="pd-media"><img src="' + p.photo + '" alt="" loading="lazy"></div>';
    } else {
      media = '<div class="pd-media pd-media--color" style="background:' + tileBg(p) + ';color:' + tileInk(p) + '"><span class="pd-media-title">' + (p.titleHtml || p.title) + '</span></div>';
    }
    return ''
      + '<div class="pd-head"><h3 class="pd-title">' + (p.titleHtml || p.title) + '</h3>'
      +   '<button class="pd-close" type="button">' + t(UI.close) + ' ✕</button></div>'
      + media
      + '<p class="pd-pitch">' + t(p.pitch) + '</p>'
      + '<div class="pd-grid">'
      +   '<div class="pd-block"><h4>' + t(UI.details) + '</h4><ul class="facts">' + facts + '</ul></div>'
      +   '<div class="pd-block"><h4>' + t(UI.credits) + '</h4><ul class="credits">' + credits + '</ul></div>'
      +   partners + press + links + note
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
