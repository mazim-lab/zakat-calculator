"""Render favicon, app icons and the social image from the shipped mark. One browser, one page."""
import io, re
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path("E:/business/islamichisab")
from shapely.geometry import Polygon
from shapely.affinity import translate

# The khatam: two squares at 45 degrees (outer radius 31 in a 64 box).
A_, B_, C_, D_ = 10.08, 53.92, 22.92, 41.08
STAR_POLY = Polygon([(32, 1), (D_, A_), (B_, A_), (B_, C_), (63, 32), (B_, D_), (B_, B_), (D_, B_), (32, 63),
                     (C_, B_), (A_, B_), (A_, D_), (1, 32), (A_, C_), (A_, A_), (C_, A_)])
# One of the eight congruent kites (centre, two inner vertices, the upper-right tip): exactly 1/8 of the area.
KITE_POLY = Polygon([(32, 32), (D_, A_), (B_, A_), (B_, C_)])
assert abs(KITE_POLY.area / STAR_POLY.area - 0.125) < 1e-3


def _path(p):
    f = lambda v: ("%.2f" % v).rstrip("0").rstrip(".")
    return "M" + " ".join(f"{f(x)} {f(y)}" for x, y in list(p.exterior.coords)[:-1]) + "Z"


def mark_paths(cut=1.3):
    """Star with the kite cut out (gap `cut`), and the kite drawn apart along its axis."""
    body = STAR_POLY.difference(KITE_POLY.buffer(cut, join_style="mitre", mitre_limit=4))
    share = translate(KITE_POLY.buffer(-0.5, join_style="mitre"), 1.5, -1.5)
    return _path(body), _path(share)


BODY, SHARE = mark_paths()  # the same paths as MARK_BODY / MARK_SHARE in src/components/ornament.tsx


def mark_svg(size, star="#4f46e5", share="#0891b2", cut=1.3, pad=0, bg=None, radius=0):
    """Mark with true cut-outs (works on any background)."""
    body, kite = mark_paths(cut)
    vb = 64 + 2 * pad
    bgrect = f'<rect x="{-pad}" y="{-pad}" width="{vb}" height="{vb}" rx="{radius}" fill="{bg}"/>' if bg else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="{-pad} {-pad} {vb} {vb}">
  {bgrect}<path d="{body}" fill="{star}"/><path d="{kite}" fill="{share}"/>
</svg>'''


# The shipped mark as standalone SVG files (colour, and one-colour).
brand = ROOT / "public/brand"
brand.mkdir(exist_ok=True)
(brand / "mark.svg").write_text(mark_svg(64), encoding="utf-8")
(brand / "mark-mono.svg").write_text(mark_svg(64, star="#18181b", share="#18181b"), encoding="utf-8")

OG = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,700;1,400&family=Alegreya+Sans:wght@500;700&family=Amiri&display=block" rel="stylesheet">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#fff;font-family:Alegreya,serif;color:#18181b}
.lat{position:absolute;inset:0;background-image:LATTICE;background-size:64px 64px;opacity:1}
.fade{position:absolute;inset:0;background:linear-gradient(90deg,#fff 0,#fff 52%,rgba(255,255,255,0) 80%)}
.wrap{position:absolute;left:84px;top:84px;right:470px}
.row{display:flex;align-items:center;gap:22px}
.wm{font-size:68px;font-weight:700;line-height:1}
.ar{font-family:Amiri,serif;font-size:66px;color:#4338ca;line-height:1;direction:rtl}
h1{font-size:44px;line-height:1.18;margin:48px 0 0;font-weight:700}
p{font-family:'Alegreya Sans',sans-serif;font-size:27px;color:#52525b;margin:22px 0 0;line-height:1.4}
.rule{position:absolute;left:84px;right:84px;bottom:64px;height:4px;border-top:1px solid #d4d4d8;border-bottom:1px solid #e4e4e7}
.niche{position:absolute;right:96px;top:70px;width:330px;height:460px}
</style></head><body>
<div class="lat"></div><div class="fade"></div>
<svg class="niche" viewBox="-1 -1 202 280"><path d="M0 279V70.72A36 36 0 0 1 15.35 41.23A300 300 0 0 1 100 0A300 300 0 0 1 184.65 41.23A36 36 0 0 1 200 70.72V279" fill="#eef0ff" stroke="#c9cdfa" stroke-width="1.2"/>
<g transform="translate(52 96) scale(1.5)">STARG</g></svg>
<div class="wrap">
 <div class="row"><span class="wm">Islamic Ḥisāb</span><span class="ar">حساب</span></div>
 <h1>Zakat, inheritance, fidya and kaffārah, with the reasoning shown.</h1>
 <p>Free calculators that follow your school of law: Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī.</p>
</div>
<div class="rule"></div>
</body></html>"""

css = (ROOT / "src/app/globals.css").read_text(encoding="utf-8")
lattice = re.search(r"--lattice-light: (url\(.*?\"\));", css).group(1)
starg = f'<path d="{BODY}" fill="#4f46e5"/><path d="{SHARE}" fill="#0891b2"/>'
OG = OG.replace("LATTICE", lattice).replace("STARG", starg)

with sync_playwright() as p:
    b = p.chromium.launch()
    try:
        pg = b.new_page()

        def render(svg, size, transparent=True):
            pg.set_viewport_size({"width": size, "height": size})
            pg.set_content(f"<html><body style='margin:0;background:transparent'>{svg}</body></html>")
            return Image.open(io.BytesIO(pg.screenshot(omit_background=transparent, clip={"x": 0, "y": 0, "width": size, "height": size})))

        # favicon: bare mark, transparent, slightly heavier gap at tiny sizes
        icos = [render(mark_svg(s, cut=2.2 if s <= 32 else 1.6), s) for s in (16, 32, 48)]
        icos[2].save(ROOT / "src/app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icos[:2])
        # app icons: mark on the lapis tint, inside the maskable safe zone
        tile = lambda s: mark_svg(s, pad=26, bg="#eef0ff")
        render(tile(192), 192, False).convert("RGB").save(ROOT / "public/icons/icon-192.png")
        render(tile(512), 512, False).convert("RGB").save(ROOT / "public/icons/icon-512.png")
        render(mark_svg(180, pad=18, bg="#eef0ff"), 180, False).convert("RGB").save(ROOT / "public/icons/apple-touch-icon.png")
        # social image
        pg.set_viewport_size({"width": 1200, "height": 630})
        pg.set_content(OG, wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(400)
        pg.screenshot(path=str(ROOT / "public/og.png"))
        pg.close()
    finally:
        b.close()
print("done")
