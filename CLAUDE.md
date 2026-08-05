# 🚧 GARDE-FOU — DÉPÔT PUBLIC (site stopera.art)
_Ce dépôt est **PUBLIC** : tout ce qui y est poussé est visible par n'importe qui, immédiatement._

## ⛔ Contrôle obligatoire avant toute modification du site
> Règle posée le 05/08/2026 après qu'une session ait passé du temps à essayer de modifier le
> site depuis le dépôt `stopera` — impossible par construction, `stopera` ne publie jamais rien.
> Ne jamais supposer que le bon dépôt est déjà ouvert. Vérifier explicitement, à chaque session :

1. **Dépôt actuel** — c'est bien `sebitarivas-hue/proyectos` ? Si tu es sur `stopera`,
   **arrête-toi, ne modifie rien**, bascule sur `proyectos` avant de continuer.
2. **Branche actuelle** — `main` (c'est la seule branche qui publie).
3. **Workflow de publication** — build Pages natif de GitHub sur push à `main`, aucun fichier
   workflow custom dans ce dépôt (voir « Vérification automatique » plus bas pour `garde-fou.yml`,
   qui est un contrôle de contenu, pas le déploiement lui-même).
4. Après avoir poussé : vérifier que `pages build and deployment` a réussi (Actions du dépôt),
   pas juste que le push a fonctionné. Un 403 en essayant de charger `stopera.art` depuis un
   outil automatisé n'est pas une preuve de panne — vérifier depuis un vrai navigateur.

## Règles absolues
1. Contenu autorisé ici : **uniquement le site public** — `docs/`, `partials/`, `build.js`, `README.md`, `LICENSE`, ce fichier et `.github/`.
2. **JAMAIS** de contenu du hub privé `stopera` : `memory/`, `ops/`, `ADMIN-STOPERA/`, `DOCS_STOPERA/`, `Projets_STopera/`, `inbox/`, `ADMIN-REPRISE/`, `DOCTORAT-MALMO/`, `.roots/`, `Career/`, ni aucune donnée personnelle (santé, finances, famille, administratif), ni fichiers `.docx`/`.xlsx`/`.pages`/`.numbers`/`.zip`.
3. **JAMAIS** de contenu `cm2-kpop` ici — c'est une app séparée dans son propre dépôt. Ne jamais mélanger le site stopera.art et l'app cm2-kpop, dans aucun sens.
4. En cas de doute sur un fichier → il va dans `stopera` (privé), jamais ici.

## Source unique
Le site vit **ici** (source unique actée le 27/07/2026, action R1 de l'audit GitHub).
L'ancienne copie dans `stopera` a été retirée — ne jamais la recréer.

## Vérification automatique
`.github/workflows/garde-fou.yml` contrôle chaque push :
- il **échoue** (et GitHub envoie un mail) *uniquement* si un fichier interdit est réellement détecté — c'est l'alarme voulue, pas une erreur ;
- la détection de motifs sensibles dans le contenu est en avertissement seul et ne fait jamais échouer le workflow ;
- aucun autre workflow n'existe dans ce dépôt ; les 3 routines de `stopera` sont indépendantes et non affectées.
