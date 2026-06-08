# CLAUDE.md — proyectos
_Instructions de contexte pour Claude Code — repo sebitarivas-hue/proyectos_
_Dernière mise à jour : 8 juin 2026_

---

## Ce repo

`proyectos` est le **système de pilotage de carrière** de Sebastian Rivas.
Il contient les documents fondateurs du **Sebastian OS** — un actif cumulatif, pas un dépôt de fichiers.

---

## Architecture

```
proyectos/
├── CLAUDE.md                  ← ce fichier
├── identity/
│   └── TIMELINE.md            ← source de vérité biographique (1975–2026)
├── professional/
│   ├── CV_MASTER.md           ← CV exhaustif, source pour toutes déclinaisons
│   └── NETWORK.md             ← réseau professionnel structuré avec statuts
├── artistic/
│   └── CATALOGUE.md           ← catalogue complet des œuvres
├── strategy/
│   └── GOALS.md               ← objectifs hiérarchisés + KPIs + risques
└── inbox/
    ├── ideas.md               ← capture brute d'idées (72h avant arbitrage)
    └── TODO.md                ← tâches administratives courantes (à créer)
```

---

## Règles de travail

1. **Ne jamais inventer de faits.** Si une date, un nom ou un chiffre est incertain, le marquer ⚠️ et l'indiquer dans la section "Informations manquantes" du fichier concerné.
2. **Identifier les contradictions.** Si deux fichiers se contredisent, le signaler avant de modifier quoi que ce soit.
3. **Privilégier les données structurées.** Tableaux > listes > prose pour les informations factuelles.
4. **Un seul fichier maître par sujet.** Pas de duplication. Si une info existe dans `CV_MASTER.md`, elle n'est pas recopiée dans `TIMELINE.md` — on y fait référence.
5. **L'administratif ne pollue pas la stratégie.** Les tâches courantes (CPAM, mutuelle, impôts) vivent dans `inbox/TODO.md`, pas dans `GOALS.md`.

---

## Source de vérité globale

Le fichier `~/.claude/CLAUDE.md` (mémoire globale) contient les données d'identité, contacts, projets et statuts administratifs à jour.
Ce repo est la **version structurée et persistante** de cette mémoire.

En cas de contradiction entre `~/.claude/CLAUDE.md` et un fichier de ce repo : **le repo fait foi** (plus récent, plus précis).

---

## Prochaines priorités de complétion

- [ ] Créer `inbox/TODO.md` (tâches admin courantes)
- [ ] Créer `professional/APPLICATIONS.md` (CRM candidatures 2024–2026)
- [ ] Compléter `identity/TIMELINE.md` : années Villa Médicis, formations exactes
- [ ] Compléter `artistic/CATALOGUE.md` : 50+ œuvres documentables
