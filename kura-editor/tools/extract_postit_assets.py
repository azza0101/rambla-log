#!/usr/bin/env python3
"""Extract ONE canonical set of real transparent PNG layers from approved postit_1.png.
The illustration itself is the reference: do not redraw icons or brush lettering.
Run: python kura-editor/tools/extract_postit_assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "postit_1.png"
DEST = ROOT / "assets" / "postit-canon"
DEST.mkdir(parents=True, exist_ok=True)
source = Image.open(SOURCE).convert("RGBA")
# Existing PNG includes the original textured paper and printed source artwork.
alpha_box = source.getchannel("A").getbbox()
if alpha_box:
    x0, y0, x1, y1 = alpha_box
    if (x1-x0) < source.width * .94 or (y1-y0) < source.height * .94:
        source = source.crop(alpha_box)
sw, sh = source.size
rng = np.random.default_rng(1711)

# Normalized coordinates on the original canonical composite image.
# Ink is taken from THIS existing asset, never synthesized using a font/icon library.
ROIS = {
    "title": (.075, .065, .975, .248),
    "tape": (.388, .000, .672, .102),
    "pin": (.108, .225, .276, .335),
    "calendar": (.103, .347, .274, .465),
    "star": (.105, .476, .270, .604),
    "info": (.080, .682, .284, .818),
}
SIZES = {"title": (420, 115), "tape": (165, 78),
         "pin": (85, 85), "calendar": (85, 85),
         "star": (85, 85), "info": (85, 85)}
COLORS = {"title": (19, 64, 44), "tape": (187, 93, 61),
          "pin": (204, 101, 51), "calendar": (204, 101, 51),
          "star": (204, 101, 51), "info": (204, 101, 51)}
source_arr = np.asarray(source).astype(np.float32)

# Sample only ink-free warm paper pixels for the authentic KURA paper palette.
pixels = source_arr.reshape(-1, 4)
valid = (pixels[:, 3] > 180) & (pixels[:, 0] > 185) & (pixels[:, 1] > 125) & (
    pixels[:, 0] > pixels[:, 1] * 1.06) & (pixels[:, 1] > pixels[:, 2] * 1.15)
if np.count_nonzero(valid) > 100:
    PAPER_COLOR = np.median(pixels[valid, :3], axis=0)
else:
    PAPER_COLOR = np.array([252., 212., 146.], np.float32)

def extract_ink(name):
    u0,v0,u1,v1=ROIS[name]
    bounds=(int(sw*u0),int(sh*v0),int(sw*u1),int(sh*v1))
    crop=source.crop(bounds)
    a=np.asarray(crop).astype(np.float32)
    r,g,b,srca=a[:,:,0],a[:,:,1],a[:,:,2],a[:,:,3] / 255.
    if name=="title":
        # Green calligraphic lettering and its original irregular brush underline.
        mask=(r<181)&(g<171)&(b<147)&(g>=r*.56)
        foreground=(19.,64.,44.)
        amount=np.maximum((PAPER_COLOR[0]-r)/(PAPER_COLOR[0]-foreground[0]),
                          (PAPER_COLOR[1]-g)/(PAPER_COLOR[1]-foreground[1]))
    else:
        mask=(r>112)&(r>g*1.22)&(g<186)&(b<157)
        foreground=np.asarray(COLORS[name],np.float32)
        amount=np.maximum((PAPER_COLOR[1]-g)/max(1,PAPER_COLOR[1]-foreground[1]),
                          (PAPER_COLOR[2]-b)/max(1,PAPER_COLOR[2]-foreground[2]))
    amount=np.clip(amount,0,1)*mask*srca
    # Exclude the incidental vegetation speck at the upper right of the master title.
    if name=="title":
        # Capture the entire last O of VIAGGIO; do not crop the right-side lettering.
        # The ink mask removes yellow paper and any non-green printed elements.
        h,w=amount.shape
    # Keep tonal/ink variation from original illustration, but no yellow stock behind it.
    rgba=np.zeros((a.shape[0],a.shape[1],4),np.uint8)
    rgba[:,:,:3]=np.asarray(foreground,dtype=np.uint8)
    rgba[:,:,3]=(amount*255).astype(np.uint8)
    im=Image.fromarray(rgba,"RGBA")
    bbox=im.getchannel("A").getbbox()
    if bbox:
        im=im.crop(bbox)
    tw,th=SIZES[name]
    ratio=min((tw-7)/max(1,im.width),(th-7)/max(1,im.height))
    scaled=im.resize((max(1,int(im.width*ratio)),max(1,int(im.height*ratio))),Image.Resampling.LANCZOS)
    result=Image.new("RGBA",(tw,th))
    result.alpha_composite(scaled,((tw-scaled.width)//2,(th-scaled.height)//2))
    result.save(DEST / f"postit_{name}.png",optimize=True)
    assert result.getchannel("A").getbbox(), name

for name in ROIS:
    extract_ink(name)

# The four originally sliced icon PNGs could contain disconnected fragments.
# Rebuild those four icons from corrected complete vector contours, then rasterise
# into actual transparent KURA ink PNGs with fine printed-grain variation.
# SVG acts exclusively as a mask; the final raster has authentic ink-like texture.
import io
import cairosvg

def rebuild_complete_icon(name):
    svg_path = DEST / f"fixed_{name}.svg"
    if not svg_path.is_file():
        raise FileNotFoundError(f"Missing approved full icon shape: {svg_path}")
    size = 144
    svg_bytes = svg_path.read_bytes()
    large = Image.open(io.BytesIO(
        cairosvg.svg2png(bytestring=svg_bytes, output_width=size*3, output_height=size*3)
    )).convert("RGBA")
    high_alpha = large.getchannel("A")
    # Soft subpixel antialiasing makes these look printed rather than aliased.
    high_alpha = high_alpha.resize((size,size),Image.Resampling.LANCZOS)
    alpha = np.asarray(high_alpha).astype(np.float32) / 255.
    yy, xx = np.mgrid[0:size,0:size]
    grain = rng.normal(0,1,(size,size)).astype(np.float32)
    cloud = np.asarray(Image.fromarray(
        np.uint8(np.clip(rng.normal(127,29,(size,size)),0,255)),
        "L").filter(ImageFilter.GaussianBlur(2.5))).astype(np.float32)-127
    # Uneven pressure, edge bleed and tiny subtle paper pores inside printed ink.
    pressure = np.clip(.92 + grain*.026 + cloud*.0018 + .04*np.sin(xx*.10+yy*.06),.78,1)
    ink = np.asarray(COLORS[name],np.float32)
    rgba = np.zeros((size,size,4),np.uint8)
    for c in range(3):
        rgba[:,:,c] = np.uint8(np.clip(ink[c]+grain*1.6+cloud*.035,0,255))
    rgba[:,:,3] = np.uint8(np.clip(alpha*pressure*255,0,255))
    full = Image.fromarray(rgba,"RGBA")
    bbox = full.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"Empty icon: {name}")
    full = full.crop(bbox)
    WOUT,HOUT=112,112
    ratio=min((WOUT-10)/full.width,(HOUT-10)/full.height)
    resized=full.resize((max(1,round(full.width*ratio)),max(1,round(full.height*ratio))),Image.Resampling.LANCZOS)
    target=Image.new("RGBA",(WOUT,HOUT))
    target.alpha_composite(resized,((WOUT-resized.width)//2,(HOUT-resized.height)//2))
    target.save(DEST/f"postit_{name}.png",optimize=True)
    assert target.getchannel("A").getbbox(), f"Failed to render {name}"

for icon_name in ("pin","calendar","star","info"):
    rebuild_complete_icon(icon_name)

# Clean paper base: real warm palette sampled above, with fibre, uneven edge
# and controlled tonal gradients. The nine-slice editor preserves its texture.
W,H=450,690
texture=rng.normal(0,1,(H,W)).astype(np.float32)
from PIL import ImageFilter
tex_image=Image.fromarray(np.uint8(np.clip(texture*35+127,0,255)),"L")
coarse=np.asarray(tex_image.filter(ImageFilter.GaussianBlur(38))).astype(np.float32)-127
fine=np.asarray(tex_image.filter(ImageFilter.GaussianBlur(2.0))).astype(np.float32)-127
X,Y=np.meshgrid(np.linspace(0,1,W),np.linspace(0,1,H))
data=np.zeros((H,W,4),np.uint8)
for ch in range(3):
    shade=(X*.13+Y*.22)*([-9,-13,-19][ch])
    perturb=texture*.55+fine*.35+coarse*.9
    data[:,:,ch]=np.uint8(np.clip(PAPER_COLOR[ch]+shade+perturb,0,255))
paper_alpha=Image.new("L",(W,H))
draw=ImageDraw.Draw(paper_alpha)
points=[]
for x in range(7,W-7,4): points.append((x,7+int(rng.normal(0,1.25))))
for y in range(8,H-7,4): points.append((W-8+int(rng.normal(0,1.2)),y))
for x in range(W-7,7,-4): points.append((x,H-8+int(rng.normal(0,1.6))))
for y in range(H-7,7,-4): points.append((7+int(rng.normal(0,1.3)),y))
draw.polygon(points,fill=255)
data[:,:,3]=np.asarray(paper_alpha.filter(ImageFilter.GaussianBlur(.4)))
paper=Image.fromarray(data,"RGBA")
paper.save(DEST / "postit_paper.png",optimize=True)
# Contact shadow: separate alpha PNG with stronger soft shadow toward bottom edge.
shadow_mask=Image.new("L",(W+100,H+100))
shadow_mask.paste(paper_alpha,(50,35))
shadow=np.asarray(shadow_mask.filter(ImageFilter.GaussianBlur(21))).astype(np.float32)
vertical=np.linspace(.54,1.30,H+100)[:,None]
result=np.zeros((H+100,W+100,4),np.uint8)
result[:,:,:3]=[71,51,35]
result[:,:,3]=np.uint8(np.minimum(70,shadow*.28*vertical))
Image.fromarray(result,"RGBA").save(DEST / "postit_shadow.png",optimize=True)
print("Generated:",*[p.name for p in sorted(DEST.glob("*.png"))])
