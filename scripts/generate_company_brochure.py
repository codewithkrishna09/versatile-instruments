"""Build a two-page landscape company brochure from the site's own assets."""

from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "client/public/images"
OUTPUT = ROOT / "versatile-instruments-brochure.pdf"
W, H = 792, 612

INK = HexColor("#183337")
DEEP = HexColor("#10282C")
CREAM = HexColor("#F3F1EA")
PALE = HexColor("#E9EDE7")
GREEN = HexColor("#46705B")
RUST = HexColor("#B47856")
MUTED = HexColor("#61716D")
WHITE = HexColor("#FFFFFF")

pdfmetrics.registerFont(TTFont("Lato", "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"))
pdfmetrics.registerFont(TTFont("LatoBold", "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"))
pdfmetrics.registerFont(TTFont("LatoHeavy", "/usr/share/fonts/truetype/lato/Lato-Heavy.ttf"))


def text(c, x, y, value, font="Lato", size=12, color=INK, tracking=None):
    c.setFillColor(color)
    if tracking is None:
        c.setFont(font, size)
        c.drawString(x, y, value)
    else:
        obj = c.beginText(x, y)
        obj.setFont(font, size)
        obj.setCharSpace(tracking)
        obj.textOut(value)
        c.drawText(obj)


def cover_image(c, path, x, y, width, height):
    image = Image.open(path)
    iw, ih = image.size
    scale = max(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    mask = c.beginPath()
    mask.rect(x, y, width, height)
    c.clipPath(mask, stroke=0, fill=0)
    c.drawImage(ImageReader(image), x + (width - dw) / 2, y + (height - dh) / 2, dw, dh)
    c.restoreState()


def logo(c, x, y, size, on_dark=False):
    # Crop only the transparent canvas while placing the existing brand mark.
    image = Image.open(IMAGES / "versatile-mark.png")
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    if on_dark:
        c.setFillColor(CREAM)
        c.roundRect(x, y, size, size, 10, fill=1, stroke=0)
    c.drawImage(ImageReader(image), x + 6, y + 6, size - 12, size - 12, mask="auto")


def section_label(c, x, y, value, color=RUST):
    text(c, x, y, value.upper(), "LatoBold", 9, color, 1.5)


def page_one(c):
    c.setFillColor(DEEP)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    cover_image(c, IMAGES / "laboratory-hero.webp", 365, 89, 427, 523)
    c.setFillColor(DEEP)
    c.rect(0, 0, 365, H, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(365, 89, 5, 523, fill=1, stroke=0)

    logo(c, 38, 518, 57, on_dark=True)
    text(c, 108, 555, "VERSATILE", "LatoHeavy", 17, WHITE, 1.4)
    text(c, 109, 535, "INSTRUMENTS", "LatoBold", 9, CREAM, 2.3)
    section_label(c, 40, 448, "Scientific & industrial equipment", HexColor("#D3A388"))
    for y, line in zip((394, 352, 310), ("The right", "instrument", "changes what")):
        text(c, 40, y, line, "LatoHeavy", 32, WHITE)
    text(c, 40, 268, "is possible.", "LatoHeavy", 32, WHITE)
    c.setStrokeColor(RUST)
    c.setLineWidth(3)
    c.line(40, 246, 91, 246)
    for y, line in zip((215, 198, 181, 164), (
        "Equipment choices start with the work.",
        "Explore analytical, laboratory and industrial",
        "solutions with the application and people",
        "using them in mind.",
    )):
        text(c, 40, y, line, "Lato", 11.5, CREAM)

    c.setFillColor(CREAM)
    c.rect(0, 0, W, 89, fill=1, stroke=0)
    section_label(c, 40, 59, "01 / Company profile", GREEN)
    text(c, 40, 35, "SCIENCE  /  INDUSTRY  /  RESEARCH", "LatoBold", 12, INK, 1.0)
    text(c, 668, 35, "NEW DELHI, INDIA", "LatoBold", 8, MUTED)
    c.showPage()


AREAS = [
    ("01", "Spectroscopy", "Molecular and optical analysis", "category-spectroscopy.webp"),
    ("02", "Microscopy", "Visualise detail at small scales", "category-microscopy.webp"),
    ("03", "X-ray analysis", "Explore structure and composition", "category-x-ray-analysis.webp"),
    ("04", "Rheology & processing", "Study flow and material behaviour", "category-rheology-processing.webp"),
    ("05", "Material testing", "Evaluate performance and properties", "category-material-testing.webp"),
    ("06", "Reactor systems", "Support controlled process work", "category-reactor-system.webp"),
]


def area_card(c, x, y, number, title, detail, image):
    width, height = 223, 155
    c.setFillColor(WHITE)
    c.roundRect(x, y, width, height, 8, fill=1, stroke=0)
    cover_image(c, IMAGES / image, x + 8, y + 67, 80, 80)
    section_label(c, x + 101, y + 130, f"Area {number}", GREEN)
    title_size = 13 if len(title) > 18 else 15
    text(c, x + 101, y + 107, title, "LatoBold", title_size, INK)
    c.setStrokeColor(PALE)
    c.setLineWidth(0.8)
    c.line(x + 12, y + 56, x + width - 12, y + 56)
    text(c, x + 14, y + 31, detail, "Lato", 10, MUTED)


def page_two(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    section_label(c, 40, 570, "02 / Areas of focus", GREEN)
    text(c, 40, 534, "Explore the work. Find the instrument.", "LatoHeavy", 25, INK)
    text(c, 40, 510, "A starting point for matching equipment to practical scientific and industrial requirements.", "Lato", 11, MUTED)

    for index, (number, title, detail, image) in enumerate(AREAS):
        col, row = index % 3, index // 3
        area_card(c, 40 + col * 244, 329 - row * 169, number, title, detail, image)

    c.setFillColor(DEEP)
    c.rect(0, 0, W, 135, fill=1, stroke=0)
    section_label(c, 40, 108, "Let's discuss your requirement", HexColor("#D3A388"))
    text(c, 40, 80, "Tell us what your work demands.", "LatoBold", 19, WHITE)
    text(c, 40, 54, "+91 95594 54555", "Lato", 11, CREAM)
    text(c, 187, 54, "versatileinstru@gmail.com", "Lato", 11, CREAM)
    text(c, 40, 30, "H. No. 2753, 3rd Floor, Street No. 13, Ranjit Nagar, Patel Nagar South, New Delhi, Central Delhi, Delhi 110008", "Lato", 8.4, HexColor("#D3DEDA"))
    text(c, 670, 107, "VERSATILE", "LatoHeavy", 11, WHITE)
    text(c, 671, 93, "INSTRUMENTS", "Lato", 7, CREAM, 1.1)
    c.showPage()


def main():
    c = canvas.Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("Versatile Instruments | Company Brochure")
    c.setAuthor("Versatile Instruments")
    c.setSubject("Scientific and industrial equipment company profile")
    page_one(c)
    page_two(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
