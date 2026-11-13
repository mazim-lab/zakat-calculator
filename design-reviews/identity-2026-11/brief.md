# Islamic Ḥisāb: identity brief (November 2026)

## Positioning

Islamic Ḥisāb is a calm, careful reckoning tool for ordinary Muslims: a family working out Zakat on a phone, an
heir checking shares, an older person asking about fidya. It should feel like a well-made book of accounts, not a
research terminal. The site keeps FAEConf's colour values and nothing else. Its form comes from Islamic visual
traditions, used with restraint so the tool stays fast, legible and accessible.

## Lineage (what each element draws on)

| Element | Tradition |
| --- | --- |
| Logo, rosette step markers, star bullets, dividers | The **khatam**, the eight-point star of two squares at 45°: Nasrid Alhambra (Granada, 14th c.) zellige and Mamluk (Cairo, 13th to 16th c.) strapwork |
| Background lattice | **Star-and-lozenge strapwork** generated from a square grid: each khatam joined to its eight neighbours, small lozenges at the grid nodes, as in Seljuk and Ilkhanid tile and wood panels (Anatolia and Iran, 13th c.) |
| Colour balance | Lapis (indigo) leading and turquoise (cyan) following: the tile palette of **Timurid Samarkand** (Shah-i Zinda, 14th to 15th c.) and **Safavid Isfahan**. Fuchsia only as rubric |
| Result frames, home welcome | The **four-centred pointed arch** of the Persian iwan and niche panel (Timurid and Safavid). A frame for a statement, not a mosque picture |
| Tool titles on the home page | The **cartouche** with pointed ends, the framed inscription panel of manuscripts and tile friezes |
| Framed blocks (contents, totals, the scholar note) | The **jadwal**, the ruled double frame around a manuscript text block (Persian and Ottoman book arts) |
| Small headings | **Rubrication**: italic headings in colour with a star marker, as section heads are picked out in manuscripts |
| Totals | The bookkeeper's **double rule** under a sum, from ledger (daftar) practice |

No Qurʾānic text or divine names are used as ornament. The basmala on the home page and the verse at the foot
of the Zakat result were already page content and stay as plain set text. No figurative imagery.

## Type

* **Alegreya** (text and headings) and **Alegreya Sans** (buttons, labels, inputs, hints). Juan Pablo del Peral,
  Huerta Tipográfica; SIL Open Font License 1.1. A calligraphy-rooted book family with full transliteration
  coverage (ḥ ṣ ṭ ḍ ẓ ā ī ū ʿ ʾ). Money and fractions use its figures set lining and tabular, never a monospace.
* **Amiri** (Arabic). Khaled Hosny, after the Bulaq Press Naskh (Cairo, 1920s); SIL OFL 1.1. Every Arabic run keeps
  `lang="ar" dir="rtl"`.
* Loaded with `next/font` (self-hosted, metric-matched fallbacks, no layout shift). Body 18px, line length about
  65 characters.

## Layout principles

1. One question per screen in every calculator, inside a single generous card, with a rosette step track above.
2. Touch targets at least 44px (buttons 50px, inputs 52px, options 60px).
3. Results read as statements: an arched niche holds what is owed; inheritance shares read as sentences with the
   fraction, the percentage and the amount.
4. Reference tables stay tables (they are comparisons), but set like a book: serif headers in sentence case, a
   double rule under the header, hairline rows, no zebra striping, no uppercase.
5. Ornament never sits behind body text at more than about 10% line opacity, and all motion respects
   `prefers-reduced-motion`.

## Logo concepts

* **A. The share star (chosen).** A khatam divided into eight equal kites; the upper-right kite (exactly one eighth
  of the area) is drawn apart from the body in turquoise. Review note: the first drawing set apart the top kite with
  a hole at the centre, which read as an exclamation mark; the diagonal kite with true cut-outs does not.
  One eighth is a Qurʾānic share (the wife's share when there are children), so the mark says "a fair portion
  of a whole", which is what every tool on the site computes. Solid silhouette, so it holds at 16px; in one
  colour the gap alone separates the share.
* **B. The reckoning arch** (`logo-alternates/concept-b-reckoning-arch.svg`). A four-centred arch framing ledger
  rules with a double total rule. Ties "ḥisāb" to bookkeeping, but at small sizes it drifts toward a doorway or
  dome silhouette.
* **C. Interlaced khatam** (`logo-alternates/concept-c-interlaced-khatam.svg`). Two square bands woven over and
  under. Faithful to strapwork, but the weave turns to noise below 32px and the form is a common heritage motif.

To swap the mark: replace `MARK_BODY` and `MARK_SHARE` (`src/components/ornament.tsx`) and the constants in
`brand-assets.py`, then run that script to regenerate the favicon, app icons and `public/og.png`.

## Theme control

A pill that cycles Auto, Day and Night, labelled in words on wider screens. Day is an eight-ray sun; Night is a
single crescent (the only crescent on the site).
