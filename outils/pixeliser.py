#!/usr/bin/env python3
"""INPUT / BODY / OUTPUT — le corps qui devient signal.

La pièce est une performance pour cheffe seule, capteurs, son spatialisé
et vidéo interactive : le geste est capté en temps réel, échantillonné,
puis réémis. Pixeliser n'est donc pas un effet décoratif posé sur une
photographie, c'est le sujet de l'œuvre appliqué à son image.

D'où la composition, qui suit le titre à la lettre : la même image, trois
fois, dans trois états.

    input    le tirage, presque intact — ce qui entre
    body     échantillonné, la grille devient visible, le corps tient
             encore — ce qui est mesuré
    output   réduit à quelques blocs — ce qui sort

La perte n'est pas seulement spatiale. À chaque état, le nombre de
niveaux de gris diminue aussi : un signal qui perd sa définition perd sa
dynamique. Le dernier panneau ne garde que quelques valeurs.

Les trois panneaux sont séparés par une gouttière d'encre, à la largeur
d'un filet du site : la plaque reste une plaque, pas un triptyque décoré.

Usage :
  python3 outils/pixeliser.py <source> <destination>
        [--ratio 2.2] [--largeur 1800] [--pas 2,16,54] [--niveaux 255,12,4]
"""
import sys
from PIL import Image

INK = (10, 10, 12)


def opt(nom, defaut):
    if nom in sys.argv:
        return sys.argv[sys.argv.index(nom) + 1]
    return defaut


def quantifier(v, niveaux):
    if niveaux >= 255:
        return v
    pas = 255.0 / (niveaux - 1)
    return int(round(round(v / pas) * pas))


def mosaique(photo, pas, niveaux):
    """Rend la photographie sur une grille de cellules carrées : chaque
    cellule prend la moyenne de ce qu'elle recouvre, puis cette moyenne
    est ramenée au nombre de niveaux demandé."""
    w, h = photo.size
    out = Image.new("L", (w, h))
    src = photo.load()
    dst = out.load()
    if pas <= 1 and niveaux >= 255:
        return photo.copy()
    y = 0
    while y < h:
        x = 0
        while x < w:
            total = 0
            n = 0
            for yy in range(y, min(y + pas, h)):
                for xx in range(x, min(x + pas, w)):
                    total += src[xx, yy]
                    n += 1
            v = quantifier(total // n, niveaux)
            for yy in range(y, min(y + pas, h)):
                for xx in range(x, min(x + pas, w)):
                    dst[xx, yy] = v
            x += pas
        y += pas
    return out


def cadrer(photo, w, h):
    """Recadre au format du panneau sans jamais déformer."""
    r_cible = w / float(h)
    r = photo.width / float(photo.height)
    if r > r_cible:
        nw = int(round(photo.height * r_cible))
        g = (photo.width - nw) // 2
        photo = photo.crop((g, 0, g + nw, photo.height))
    else:
        nh = int(round(photo.width / r_cible))
        g = int((photo.height - nh) * 0.34)      # un visage vit dans le haut
        photo = photo.crop((0, g, photo.width, g + nh))
    return photo.resize((w, h), Image.LANCZOS)


def traiter(src, dst, ratio=2.2, largeur=1800,
            pas=(2, 16, 54), niveaux=(255, 12, 4)):
    photo = Image.open(src).convert("L")

    W = largeur
    H = int(round(W / ratio))
    plaque = Image.new("RGB", (W, H), INK)

    marge = int(round(H * 0.075))
    gout = max(2, int(round(W * 0.009)))
    hp = H - 2 * marge
    wp = (W - 2 * marge - 2 * gout) // 3

    base = cadrer(photo, wp, hp)

    for i in range(3):
        panneau = mosaique(base, pas[i], niveaux[i]).convert("RGB")
        x = marge + i * (wp + gout)
        plaque.paste(panneau, (x, marge))

    plaque.save(dst, quality=92, optimize=True, progressive=True)
    print("%s -> %s  %dx%d  pas %s  niveaux %s"
          % (src, dst, W, H, pas, niveaux))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    traiter(
        sys.argv[1], sys.argv[2],
        ratio=float(opt("--ratio", 2.2)),
        largeur=int(opt("--largeur", 1800)),
        pas=tuple(int(v) for v in opt("--pas", "2,16,54").split(",")),
        niveaux=tuple(int(v) for v in opt("--niveaux", "255,12,4").split(",")),
    )
