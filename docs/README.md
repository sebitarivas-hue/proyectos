# Site web STOPERA

Site vitrine statique, quadrilingue (FR / ES / EN / 中文), de la compagnie STOPERA — *Sonic Theatre Opera Performance*.

## Fichiers
- `index.html` — page unique (Hero, Manifeste, Projets, Collectif, Contact)
- `styles.css` — mise en forme (thème sombre cinématographique (esprit Opera Lab), serif **Spectral** + grotesque **Archivo**, accent lavande ; **Noto SC** pour le chinois)
- `script.js` — bascule de langue FR/ES/EN/ZH + **données des projets** (cartes dépliables)
- `assets/logo.png` — logo (noir, utilisé sur fond clair) · `favicon.png` · `logo-light.png` (version claire, non utilisée par le thème clair actuel)
- `assets/projects/*.svg` — **visuels des projets** (placeholders clairs à remplacer par de vraies photos)
- `assets/aperghis.svg` — portrait placeholder du président d'honneur (à remplacer)
- `assets/fonts/` — polices **auto-hébergées** (Bodoni Moda + Inter + Noto Serif/Sans SC sous-ensemble chinois, woff2) + `fonts.css`
- `.nojekyll` — désactive le traitement Jekyll sur GitHub Pages

## Modifier les projets
Tout le contenu des projets (titre, photo, pitch, générique/crédits, calendrier, budget) est dans
le tableau `PROJECTS` en haut de `script.js`, dans les 4 langues (fr/es/en/zh). Le texte statique utilise les attributs `data-fr` / `data-es` / `data-en` / `data-zh`. Pour mettre une **vraie photo** :
déposer l'image dans `assets/projects/` et pointer le champ `img` du projet dessus
(ex. `img: "assets/projects/rut.jpg"`). Format conseillé : 3/2, ~1200×800 px.

## Mettre en ligne (GitHub Pages — gratuit)
1. Pousser la branche sur GitHub (déjà fait par Claude Code).
2. Sur GitHub : **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
3. Le workflow `.github/workflows/deploy-pages.yml` publie automatiquement le dossier `docs/`
   à chaque push sur `main` ou `claude/brave-ride-ftbrhu`.
4. L'URL publique s'affiche dans l'onglet **Actions** (et dans Settings → Pages),
   du type `https://sebitarivas-hue.github.io/stopera/`.

> Alternative sans Actions : Settings → Pages → Source = "Deploy from a branch",
> branche `main`, dossier `/docs`.

## Nom de domaine : stopera.art (configuré)
`docs/CNAME` contient déjà `stopera.art`. Pour finaliser :
1. **Posséder le domaine** `stopera.art` (registrar : Gandi, OVH, Namecheap, Infomaniak…).
2. **DNS chez le registrar** :
   - **Apex `stopera.art`** → 4 enregistrements **A** :
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (option IPv6, enregistrements **AAAA** : `2606:50c0:8000::153`, `…8001::153`, `…8002::153`, `…8003::153`)
   - **`www`** → enregistrement **CNAME** vers `sebitarivas-hue.github.io.`
3. **GitHub → Settings → Pages** : Source = **GitHub Actions** ; Custom domain = **stopera.art** ; cocher **Enforce HTTPS** (après propagation DNS).
4. Propagation DNS : quelques minutes à 48 h. Le certificat HTTPS est émis automatiquement par GitHub.

## Éditer le contenu
Tout le texte est dans `index.html`, en double : attribut `data-fr` (français) et `data-en` (anglais).
Modifier les deux pour garder le site bilingue.
