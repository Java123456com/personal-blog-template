"""Extract the reference site's server-rendered app markup for a faithful local shell."""
from lxml import html
from pathlib import Path

SITE = "yihanglizi-cn-bc4c2f76"
PAGE = "root-8a5edab2"
SOURCE = Path(f"docs/research/{SITE}/{PAGE}/original.html")
DEST = Path(f"src/components/sites/{SITE}/{PAGE}/markup.html")
PREFIX = f"/sites/{SITE}/{PAGE}"

tree = html.fromstring(SOURCE.read_text(encoding="utf-8"))
app = tree.xpath('//*[@id="app"]')[0]
wasteland = app.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," wasteland ")]')[0]
wasteland.set("class", "wasteland boot-done")
for boot in wasteland.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," boot-screen ")]'):
    boot.getparent().remove(boot)

for element in app.iter():
    for attribute in ("src", "href", "style"):
        value = element.get(attribute)
        if not value:
            continue
        value = value.replace("/img/lizhi-logo.png", f"{PREFIX}/img/lizhi-logo.png")
        value = value.replace("/img/cat-sprite.png", f"{PREFIX}/img/cat-sprite.png")
        value = value.replace("/knight/Idle.png", f"{PREFIX}/knight/Idle.png")
        value = value.replace("/logo.svg", f"{PREFIX}/logo.svg")
        element.set(attribute, value)

DEST.write_text("".join(html.tostring(child, encoding="unicode", method="html") for child in app), encoding="utf-8")
print(f"Wrote {DEST} ({DEST.stat().st_size} bytes)")
