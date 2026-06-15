# MACHINE À CANDIDATURES — Sébastien RIVAS
_Instructions permanentes pour Claude Code · Mise à jour : juin 2026_

---

## RÔLE DE CE DÉPÔT

Ce dépôt (`sebitarivas-hue/proyectos`) est la **machine à candidatures** de Sébastien RIVAS.

Objectif : passer de **4 heures par candidature à 30 minutes**.

---

## QUI EST SÉBASTIEN RIVAS

**Compositeur et directeur artistique franco-argentin** (Buenos Aires / Gentilly, 94250).

- Fondateur de **STOPERA — Sonic Theatre Opera** (compagnie lyrique contemporaine)
- Ancien **responsable de la création musicale à GRAME** (Lyon, CNCM labellisé, 2013–2024)
- Profil rare : compositeur + directeur artistique + producteur + leveur de fonds
- Financements levés : ~90 k€ (LIPS), ~300 k€ (opéra *Otages*), nombreux autres
- Réseau : Futurs Composés, Tête à Tête (Londres), Teatro Colón / CETC (Buenos Aires), DRAC, CNM
- Projets actuels : **Rayon N**, **War Madrigals**, **Angot**, **Mamma Roma** (CETC Buenos Aires), **Porte des Salamandres**
- Contact : sebitarivas@gmail.com · 8 rue Victor Hugo, 94250 Gentilly

---

## STRUCTURE

```
proyectos/
├── CLAUDE.md                           ← ce fichier
├── .claude/agents/agent-carriere.md    ← sous-agent candidatures
├── Career/
│   ├── README.md                       → mode d'emploi de la machine
│   ├── CV_master/                      → CV maître (toutes versions)
│   ├── Lettres/
│   │   ├── modeles/                    → modèles par type de poste
│   │   └── envoyees/                   → lettres envoyées (archivées)
│   ├── Offres/
│   │   └── SUIVI.md                    → tableau de suivi des candidatures en cours
│   ├── Realisations/
│   │   ├── biographies.md              → toutes les biographies (courte/longue/EN)
│   │   └── portfolio-cles.md           → 10 réalisations clés avec chiffres
│   ├── Recommandations/
│   │   └── README.md                   → qui peut recommander, pour quoi
│   ├── Enseignement/
│   │   └── README.md                   → expériences pédagogiques
│   ├── Direction_artistique/
│   │   └── README.md                   → postes et missions de direction
│   ├── Financements_obtenus/
│   │   └── README.md                   → historique financements (argument clé)
│   └── Candidatures_envoyees/
│       └── SUIVI.md                    → historique complet avec résultats
└── docs/                               → site web public (existant)
```

---

## PROTOCOLE CANDIDATURE

Quand on te soumet une offre d'emploi :

1. **Lire** l'offre : poste, employeur, date limite, compétences demandées, points distinctifs.
2. **Évaluer** l'adéquation avec le profil (0–10) + justification.
3. **Identifier** les 3 expériences les plus pertinentes dans `Career/Realisations/portfolio-cles.md`.
4. **Rédiger** une lettre adaptée (s'appuyer sur `Career/Lettres/modeles/`).
5. **Lister** les pièces nécessaires et signaler ce qui manque.
6. **Mettre à jour** `Career/Offres/SUIVI.md`.

Ton : professionnel, singulier, jamais générique. Lettre en français sauf indication contraire.

---

## RÈGLES

- Ne jamais inventer des expériences ou des chiffres — s'appuyer uniquement sur les fichiers `Career/`.
- Signaler les manques plutôt que combler avec du générique.
- Priorité aux candidatures à fort levier : direction artistique, enseignement supérieur, postes à responsabilité.
