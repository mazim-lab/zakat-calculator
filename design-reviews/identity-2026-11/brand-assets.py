"""Render favicon, app icons and the social image from the shipped mark. One browser, one page."""
import io, re
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path("E:/business/islamichisab")
STAR = "M32 1l9.08 9.08h12.84v12.84L63 32l-9.08 9.08v12.84H41.08L32 63l-9.08-9.08H10.08V41.08L1 32l9.08-9.08V10.08h12.84Z"
KITE = "M32 32 22.92 10.08 32 1l9.08 9.08Z"
OCT = "m33.91 27.38 2.71 2.71v3.82l-2.71 2.71h-3.82l-2.71-2.71v-3.82l2.71-2.71Z"


def mark_svg(size, star="#4f46e5", share="#0891b2", gap_w=2.4, pad=0, bg=None, radius=0):
    """Mark with true cut-outs (works on any background)."""
    vb = 64 + 2 * pad
    bgrect = f'<rect x="{-pad}" y="{-pad}" width="{vb}" height="{vb}" rx="{radius}" fill="{bg}"/>' if bg else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="{-pad} {-pad} {vb} {vb}">
  <defs><mask id="m" maskUnits="userSpaceOnUse" x="{-pad}" y="{-pad}" width="{vb}" height="{vb}">
    <rect x="{-pad}" y="{-pad}" width="{vb}" height="{vb}" fill="#fff"/>
    <path d="{KITE}" fill="none" stroke="#000" stroke-width="{gap_w}" stroke-linejoin="round"/>
    <path d="{OCT}" fill="#000"/>
  </mask></defs>
  {bgrect}
  <g mask="url(#m)"><path d="{STAR}" fill="{star}"/><path d="{KITE}" fill="{share}"/></g>
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
<svg class="niche" viewBox="0 0 330 460"><path d="M1 460V150C1 95 40 68 99 52 132 43 152 30 165 2c13 28 33 41 66 50 59 16 98 43 98 98v310" fill="#eef0ff" stroke="#c9cdfa" stroke-width="2"/>
<g transform="translate(85 160) scale(2.5)">STARG</g></svg>
<div class="wrap">
 <div class="row"><span class="wm">Islamic Ḥisāb</span><span class="ar">حساب</span></div>
 <h1>Zakat, inheritance, fidya and kaffārah, with the reasoning shown.</h1>
 <p>Free calculators that follow your school of law: Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī.</p>
</div>
<div class="rule"></div>
</body></html>"""

css = (ROOT / "src/app/globals.css").read_text(encoding="utf-8")
lattice = re.search(r"--lattice-light: (url\(.*?\"\));", css).group(1)
starg = f'<path d="{STAR}" fill="#4f46e5"/><path d="{KITE}" fill="#0891b2" stroke="#eef0ff" stroke-width="2.4" stroke-linejoin="round"/><path d="{OCT}" fill="#eef0ff"/>'
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
        icos = [render(mark_svg(s, gap_w=3.4 if s <= 32 else 2.6), s) for s in (16, 32, 48)]
        icos[2].save(ROOT / "src/app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icos[:2])
        # app icons: mark on the lapis tint, inside the maskable safe zone
        tile = lambda s: mark_svg(s, pad=26, bg="#eef0ff", gap_w=2.4)
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
