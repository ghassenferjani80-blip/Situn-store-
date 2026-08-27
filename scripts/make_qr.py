from pathlib import Path
import qrcode
from PIL import Image, ImageDraw, ImageFont

url = "https://situnshop-b3hmcevz.manus.space"
out = Path("/home/ubuntu/social-assets-situn/situn-qr-code.png")
out.parent.mkdir(parents=True, exist_ok=True)
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=14, border=5)
qr.add_data(url)
qr.make(fit=True)
code = qr.make_image(fill_color="black", back_color="white").convert("RGB")
canvas = Image.new("RGB", (1000, 1160), (247, 243, 234))
draw = ImageDraw.Draw(canvas)
canvas.paste(code.resize((860, 860), Image.Resampling.NEAREST), (70, 70))
draw.rectangle((40, 40, 960, 1040), outline=(211, 162, 67), width=5)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 34)
    small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
except OSError:
    font = small = None
draw.text((500, 1080), "SITUN  •  SCAN TO VISIT", fill=(20, 18, 15), anchor="mm", font=font)
draw.text((500, 1125), url.replace("https://", ""), fill=(101, 91, 75), anchor="mm", font=small)
canvas.save(out, optimize=True)
print(out)
