# Prototype V2 — notes de fabrication

Pages de travail, **non référencées** (`noindex`) et sans lien depuis le site.
Elles ont leur propre feuille (`proto.css`) : aucune page du site n'est affectée.

## Règles du système

- **Sol crème** partout. Le noir est une *surface* (bandeau de titre, blocs de
  collision, pastilles), jamais le sol d'une page. Sur l'accueil il occupe 21 %
  de la hauteur, 0 % sur les autres pages.
- **Numérotation continue** à l'échelle du site : `01` pourquoi · `02` œuvres ·
  `03` laboratoire · `04` réseau · `05` transmission · `06` soutenir. Une
  sous-page reprend le rang de sa section — jamais de compteur local. La presse
  n'est pas numérotée : c'est une couche transversale.
- **Grille 12 colonnes**, blocs 3/5/7/12, jamais 6+6. Le décentrement alterne.
- **Typographie** : Neutrix pour les titres (graisse 400 uniquement — ne jamais
  demander 800, le faux gras abîme ses courbes) ; Bricolage Grotesque 800 pour
  les chiffres, la navigation et les étiquettes.
- **Images** : le traitement porte l'information — magenta = œuvres,
  cyan = laboratoire, noir et blanc = portraits, brut = archives et presse.
- **Surfaces** : elles se rencontrent sans marge, sans arrondi, sans ombre.
  Deux aplats saturés peuvent se toucher directement.

## Contenu

Le contenu est **repris tel quel** des pages publiées : le générateur lit
`docs/<section>/index.html`, en extrait le corps et ne change que l'enveloppe.
Aucun texte n'est réécrit, la casse d'origine est conservée. C'est de la
direction artistique, pas de l'éditorialisation.
