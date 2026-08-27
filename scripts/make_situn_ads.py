from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode
import arabic_reshaper
from bidi.algorithm import get_display

OUT = Path('/home/ubuntu/social-assets-situn')
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://situnshop-b3hmcevz.manus.space'
BG = (8, 8, 8)
GOLD = (207, 158, 65)
PALE = (244, 238, 226)
MUTED = (178, 164, 139)

FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
SERIF = str(FONT_DIR / 'DejaVuSerif.ttf')
SERIF_BOLD = str(FONT_DIR / 'DejaVuSerif-Bold.ttf')
SANS = str(FONT_DIR / 'DejaVuSans.ttf')
SANS_BOLD = str(FONT_DIR / 'DejaVuSans-Bold.ttf')
ARABIC = '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf'
ARABIC_BOLD = '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Bold.ttf'

def font(path, size):
    return ImageFont.truetype(path, size)

def ar(text):
    return get_display(arabic_reshaper.reshape(text))

def background(w, h, variant):
    image = Image.new('RGB', (w, h), BG)
    draw = ImageDraw.Draw(image)
    for y in range(h):
        glow = int(17 * (1 - y / h))
        draw.line((0, y, w, y), fill=(8 + glow // 2, 8 + glow // 2, 8 + glow // 3))
    # Architectural grid and gold frames create a recognizable luxury visual without inventing brands.
    for inset in (int(min(w, h) * .04), int(min(w, h) * .055)):
        draw.rectangle((inset, inset, w - inset, h - inset), outline=(70, 53, 30), width=2)
    if variant == 'square':
        points = [(int(w*.55), int(h*.86)), (int(w*.63), int(h*.34)), (int(w*.9), int(h*.27)), (int(w*.96), int(h*.86))]
        draw.polygon(points, fill=(21, 20, 18), outline=(116, 87, 39))
        draw.line((int(w*.63), int(h*.34), int(w*.9), int(h*.27), int(w*.96), int(h*.86)), fill=GOLD, width=3)
        draw.ellipse((int(w*.72), int(h*.5), int(w*.95), int(h*.84)), fill=(13, 13, 12), outline=(82, 64, 35), width=3)
        for x in range(int(w*.74), int(w*.94), max(8, int(w*.018))):
            draw.line((x, int(h*.5), x, int(h*.82)), fill=(38, 31, 21), width=2)
    elif variant == 'story':
        draw.polygon([(int(w*.42), int(h*.62)), (int(w*.56), int(h*.23)), (int(w*.92), int(h*.31)), (int(w*.98), int(h*.7)), (int(w*.7), int(h*.85))], fill=(20, 19, 17), outline=(115, 86, 39))
        draw.line((int(w*.56), int(h*.23), int(w*.92), int(h*.31), int(w*.98), int(h*.7)), fill=GOLD, width=3)
        draw.ellipse((int(w*.1), int(h*.58), int(w*.48), int(h*.92)), fill=(13, 13, 12), outline=(78, 59, 31), width=3)
    else:
        draw.polygon([(int(w*.53), int(h*.17)), (int(w*.72), int(h*.1)), (int(w*.96), int(h*.22)), (int(w*.93), int(h*.88)), (int(w*.62), int(h*.8))], fill=(20, 19, 17), outline=(116, 87, 39))
        draw.line((int(w*.53), int(h*.17), int(w*.72), int(h*.1), int(w*.96), int(h*.22)), fill=GOLD, width=3)
        for x in range(int(w*.7), int(w*.9), 13):
            draw.line((x, int(h*.22), x, int(h*.82)), fill=(42, 34, 23), width=2)
    # Fine gold accents
    draw.line((int(w*.06), int(h*.9), int(w*.32), int(h*.9)), fill=GOLD, width=2)
    draw.ellipse((int(w*.06)-5, int(h*.9)-5, int(w*.06)+5, int(h*.9)+5), fill=GOLD)
    return image

def qr(size=210):
    code = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=8, border=4)
    code.add_data(URL)
    code.make(fit=True)
    return code.make_image(fill_color='black', back_color='white').convert('RGB').resize((size, size), Image.Resampling.NEAREST)

def logo(draw, x, y, size):
    draw.text((x, y), 'SITUN', font=font(SERIF_BOLD, size), fill=PALE)
    draw.line((x, y + size + 10, x + size * 5.6, y + size + 10), fill=GOLD, width=2)

def add_qr_card(image, x, y, size):
    draw = ImageDraw.Draw(image)
    pad = 18
    draw.rounded_rectangle((x-pad, y-pad, x+size+pad, y+size+pad+48), radius=8, fill=(245, 241, 232), outline=GOLD, width=2)
    image.paste(qr(size), (x, y))
    draw.text((x+size//2, y+size+26), 'SCAN QR / SITUN', anchor='ma', font=font(SANS_BOLD, max(14, size//13)), fill=(20, 18, 15))

def square():
    w = h = 1080
    image = background(w, h, 'square')
    draw = ImageDraw.Draw(image)
    logo(draw, 80, 72, 44)
    draw.text((80, 210), ar('سوقك العالمي'), font=font(ARABIC_BOLD, 78), fill=PALE)
    draw.text((80, 305), ar('يبدأ من هنا.'), font=font(ARABIC_BOLD, 78), fill=GOLD)
    draw.multiline_text((80, 430), ar('خدمات مستقلة، عروض مميزة،\nوإعلانات تصل إلى من يبحث عنها.'), font=font(ARABIC, 35), fill=MUTED, spacing=12)
    draw.text((80, 590), ar('اعمل، روّج، اشترِ، بِع'), font=font(ARABIC_BOLD, 31), fill=PALE)
    add_qr_card(image, 785, 760, 190)
    draw.text((80, 950), URL.replace('https://', ''), font=font(SANS, 18), fill=MUTED)
    image.save(OUT / 'situn-social-square-ar.jpg', quality=95, subsampling=0)

def story():
    w, h = 1080, 1920
    image = background(w, h, 'story')
    draw = ImageDraw.Draw(image)
    logo(draw, 74, 90, 46)
    draw.text((74, 330), 'SITUN', font=font(SERIF_BOLD, 118), fill=PALE)
    draw.multiline_text((74, 475), ar('اعمل. روّج.\nتسوّق بثقة.'), font=font(ARABIC_BOLD, 86), fill=GOLD, spacing=12)
    draw.multiline_text((74, 760), ar('منصة مستقلة للخدمات\nوالعروض والبيع والشراء\nحول العالم.'), font=font(ARABIC, 43), fill=PALE, spacing=17)
    draw.line((74, 1035, 420, 1035), fill=GOLD, width=3)
    draw.multiline_text((74, 1090), ar('أنشئ حضورك\nوابدأ الآن.'), font=font(ARABIC_BOLD, 68), fill=PALE, spacing=12)
    add_qr_card(image, 710, 1510, 250)
    draw.text((74, 1815), URL.replace('https://', ''), font=font(SANS, 21), fill=MUTED)
    image.save(OUT / 'situn-social-story-ar.jpg', quality=95, subsampling=0)

def landscape():
    w, h = 1200, 628
    image = background(w, h, 'landscape')
    draw = ImageDraw.Draw(image)
    logo(draw, 54, 42, 32)
    draw.text((54, 165), ar('الخيار الواضح'), font=font(ARABIC_BOLD, 62), fill=PALE)
    draw.text((54, 235), ar('للعمل والترويج والشراء.'), font=font(ARABIC_BOLD, 54), fill=GOLD)
    draw.multiline_text((54, 332), ar('SITUN يجمع الخدمات المستقلة\nوالعروض المميزة في مكان واحد.'), font=font(ARABIC, 30), fill=MUTED, spacing=9)
    draw.text((54, 505), URL.replace('https://', ''), font=font(SANS_BOLD, 18), fill=PALE)
    add_qr_card(image, 945, 345, 170)
    image.save(OUT / 'situn-social-landscape-ar.jpg', quality=95, subsampling=0)

square()
story()
landscape()
print('\n'.join(str(p) for p in sorted(OUT.glob('situn-social-*.jpg'))))
