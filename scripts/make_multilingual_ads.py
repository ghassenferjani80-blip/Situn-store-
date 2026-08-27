from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import qrcode
import arabic_reshaper
from bidi.algorithm import get_display

OUT = Path('/home/ubuntu/social-assets-situn')
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://situnshop-b3hmcevz.manus.space'
W = H = 1080
BG = (8, 8, 8)
PAPER = (244, 238, 226)
GOLD = (211, 162, 67)
SOFT = (188, 173, 148)
SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
SANS_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
SERIF_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
AR = '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf'
AR_BOLD = '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Bold.ttf'

def f(path, size): return ImageFont.truetype(path, size)
def rtl(text): return get_display(arabic_reshaper.reshape(text))

def base(concept):
    image = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(image)
    for y in range(H):
        glow = int(15 * (1 - y / H))
        d.line((0, y, W, y), fill=(8 + glow // 2, 8 + glow // 2, 8 + glow // 3))
    d.rectangle((42, 42, W - 42, H - 42), outline=(79, 59, 31), width=2)
    d.rectangle((60, 60, W - 60, H - 60), outline=(37, 31, 23), width=1)
    # Distinct visual direction for each campaign concept.
    if concept == 'work':
        d.polygon([(620, 110), (982, 190), (900, 880), (540, 980), (470, 470)], fill=(21, 20, 17), outline=GOLD)
        d.line((620, 110, 982, 190, 900, 880), fill=GOLD, width=3)
        for x in range(625, 930, 24): d.line((x, 185, x - 50, 820), fill=(49, 39, 24), width=2)
    elif concept == 'promote':
        d.ellipse((560, 130, 1030, 930), fill=(18, 17, 15), outline=GOLD, width=3)
        for i in range(6):
            box = 625 + i * 42
            d.rounded_rectangle((box, 265 + i * 24, box + 105, 760 - i * 13), radius=20, outline=(106, 80, 37), width=3)
        d.line((560, 530, 1010, 530), fill=(83, 63, 32), width=2)
    else:
        d.polygon([(570, 180), (850, 95), (1000, 270), (955, 870), (610, 945), (500, 540)], fill=(20, 19, 17), outline=GOLD)
        d.rectangle((665, 285, 895, 710), outline=(113, 86, 39), width=3)
        d.line((665, 390, 895, 390), fill=(113, 86, 39), width=3)
        for y in range(430, 670, 50): d.line((695, y, 865, y), fill=(59, 46, 28), width=2)
    d.line((72, 942, 360, 942), fill=GOLD, width=2)
    d.ellipse((65, 935, 79, 949), fill=GOLD)
    return image

def add_logo(d, language):
    d.text((78, 76), 'SITUN', font=f(SERIF_BOLD, 46), fill=PAPER)
    d.line((78, 136, 312, 136), fill=GOLD, width=2)
    labels = {'ar': 'العربية', 'fr': 'FRANÇAIS', 'en': 'ENGLISH'}
    d.text((W - 200, 88), labels[language], font=f(SANS_BOLD, 18), fill=SOFT)

def add_qr(image):
    d = ImageDraw.Draw(image)
    size = 196
    x, y = 790, 735
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=8, border=4)
    qr.add_data(URL); qr.make(fit=True)
    code = qr.make_image(fill_color='black', back_color='white').convert('RGB').resize((size, size), Image.Resampling.NEAREST)
    d.rounded_rectangle((x - 17, y - 17, x + size + 17, y + size + 58), radius=8, fill=(247, 243, 234), outline=GOLD, width=2)
    image.paste(code, (x, y))
    d.text((x + size // 2, y + size + 30), 'SCAN QR / SITUN', anchor='ma', font=f(SANS_BOLD, 15), fill=(20, 18, 15))

def make(language, concept, title, accent, subtitle, cta):
    image = base(concept); d = ImageDraw.Draw(image); add_logo(d, language)
    title_font = f(AR_BOLD if language == 'ar' else SERIF_BOLD, 76 if language == 'ar' else 69)
    body_font = f(AR if language == 'ar' else SANS, 32 if language == 'ar' else 26)
    cta_font = f(AR_BOLD if language == 'ar' else SANS_BOLD, 29 if language == 'ar' else 24)
    draw_title = rtl(title) if language == 'ar' else title
    draw_subtitle = rtl(subtitle) if language == 'ar' else subtitle
    draw_cta = rtl(cta) if language == 'ar' else cta
    d.multiline_text((80, 245), draw_title, font=title_font, fill=accent, spacing=10)
    d.multiline_text((80, 470), draw_subtitle, font=body_font, fill=SOFT, spacing=13)
    d.text((80, 660), draw_cta, font=cta_font, fill=PAPER)
    d.text((80, 970), URL.replace('https://', ''), font=f(SANS, 18), fill=SOFT)
    add_qr(image)
    filename = OUT / f'situn-{concept}-{language}.jpg'
    image.save(filename, quality=95, subsampling=0)
    return filename

campaigns = {
    'work': {
        'ar': ('مهارتك.\nفرصتك.', 'اعرض ما تتقنه، واعمل مع أشخاص\nيبحثون عن خدماتك حول العالم.', 'ابدأ الآن'),
        'fr': ('Votre savoir-faire.\nVos opportunités.', 'Présentez vos compétences et trouvez\ndes clients partout dans le monde.', 'Commencez avec SITUN'),
        'en': ('Your skill.\nYour opportunity.', 'Show what you do best and meet\nclients looking for your service worldwide.', 'Start with SITUN'),
    },
    'promote': {
        'ar': ('روّج لما\nتقدّم.', 'خدمة واضحة لكتابة العرض، زيادة الظهور،\nوتنسيق التواصل مع المهتمين.', 'روّج بوضوح'),
        'fr': ('Faites connaître\nvotre offre.', 'Une présentation claire, plus de visibilité\net une mise en relation humaine.', 'Présentez-vous sur SITUN'),
        'en': ('Promote what\nyou offer.', 'Clear presentation, stronger visibility,\nand a human introduction to interested people.', 'Promote with SITUN'),
    },
    'marketplace': {
        'ar': ('اكتشف.\nتواصل. اختر.', 'خدمات، عروض، بيع وشراء في منصة مستقلة\nتجمع الأشخاص حول العالم.', 'اكتشف الآن'),
        'fr': ('Découvrez.\nÉchangez. Choisissez.', 'Services, offres et marketplace indépendante\npour connecter les personnes dans le monde.', 'Découvrez SITUN'),
        'en': ('Discover.\nConnect. Choose.', 'Services, offers and an independent marketplace\nconnecting people around the world.', 'Discover SITUN'),
    },
}
for concept, languages in campaigns.items():
    for language, (title, subtitle, cta) in languages.items():
        make(language, concept, title, GOLD if concept != 'marketplace' else PAPER, subtitle, cta)
print('\n'.join(str(p) for p in sorted(OUT.glob('situn-*.jpg')) if p.name.count('-') == 2))
