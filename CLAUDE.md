# 🚧 GARDE-FOU — DÉPÔT PUBLIC (site stopera.art)
_Ce dépôt est **PUBLIC** : tout ce qui y est poussé est visible par n'importe qui, immédiatement._

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
