"""Capture the site's public SSR pages and self-hosted assets for local routes."""

import hashlib
import json
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from lxml import html

ORIGIN = "https://yihanglizi.cn"
SITE = "yihanglizi-cn-bc4c2f76"
PATHS = [
    "/blog/", "/blog/static-blog-setup.html",
    "/moments/tech/", "/moments/life/", "/friends/", "/tools/",
    "/about/", "/resume/",
]
PUBLIC = Path("public/sites") / SITE / "shared"
COMPONENTS = Path("src/components/sites") / SITE
RESEARCH = Path("docs/research") / SITE
ASSETS = set()


def fetch(path):
    request = urllib.request.Request(ORIGIN + path, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            return response.read()
    except Exception:
        result = subprocess.run(["curl.exe", "--silent", "--show-error", "--fail", "--retry", "2", "--max-time", "20", ORIGIN + path], capture_output=True, check=True)
        return result.stdout


def local_asset(value):
    parsed = urllib.parse.urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path.startswith("/"):
        return value
    if not re.search(r"\.(?:png|jpe?g|webp|svg|gif|ico|avif|woff2?|mp3|mp4)$", parsed.path, re.I):
        return value
    ASSETS.add(parsed.path)
    return f"/sites/{SITE}/shared{parsed.path}" + ("?" + parsed.query if parsed.query else "")


for route in PATHS:
    key = route.strip("/").replace("/", "-").replace(".", "-") + "-" + hashlib.sha256(route.encode()).hexdigest()[:8]
    capture = RESEARCH / "browser-captures" / (route.strip("/").replace("/", "-").replace(".", "-") + ".html")
    source = capture.read_bytes() if capture.exists() else fetch(route)
    doc = html.fromstring(source.decode("utf-8"))
    if route == "/moments/life/":
        for hidden in doc.xpath('//*[contains(concat(" ", normalize-space(@class), " "), " moments-content ") and contains(concat(" ", normalize-space(@class), " "), " locked ")]'):
            hidden.getparent().remove(hidden)
        source = html.tostring(doc, encoding="utf-8", method="html")
        if capture.exists():
            capture.write_bytes(source)
    app = doc.xpath('//*[@id="app"]')[0]
    title = doc.xpath("//title")[0].text or route
    for el in app.iter():
        for attr in ("src", "poster", "href"):
            value = el.get(attr)
            if not value:
                continue
            if value.startswith(ORIGIN + "/"):
                value = value[len(ORIGIN):]
            elif value.rstrip("/") == ORIGIN:
                value = "/"
            rewritten = local_asset(value)
            if rewritten != value or value.startswith("/"):
                el.set(attr, rewritten)
        srcset = el.get("srcset")
        if srcset:
            el.set("srcset", ", ".join(local_asset(part.strip().split(" ")[0]) + (" " + " ".join(part.strip().split(" ")[1:]) if len(part.strip().split(" ")) > 1 else "") for part in srcset.split(",")))
        style = el.get("style")
        if style:
            el.set("style", re.sub(r"url\(['\"]?(/[^)'\"]+)", lambda match: match.group(0).replace(match.group(1), local_asset(match.group(1))), style))
    frame = {"/blog/": "blog-hero-frame.png", "/moments/tech/": "tech-hero-frame.png", "/moments/life/": "life-hero-frame.png"}.get(route)
    if frame:
        for video in app.xpath('.//video'):
            image = html.Element("img")
            image.set("class", (video.get("class") or "") + " capture-frame")
            image.set("src", f"/sites/{SITE}/shared/videos/{frame}")
            image.set("alt", "")
            image.set("aria-hidden", "true")
            for name, value in video.attrib.items():
                if name.startswith("data-v-"):
                    image.set(name, value)
            video.getparent().replace(video, image)
    if route == "/about/":
        for video in app.xpath('.//video'):
            video.getparent().remove(video)
        for link in app.xpath('.//a[@href="#"]'):
            link.attrib.pop("href", None)
            link.set("title", "原站暂未提供链接")
    component_dir = COMPONENTS / key
    research_dir = RESEARCH / key
    component_dir.mkdir(parents=True, exist_ok=True)
    research_dir.mkdir(parents=True, exist_ok=True)
    (research_dir / "original.html").write_bytes(source)
    markup = "".join(html.tostring(child, encoding="unicode", method="html") for child in app)
    (component_dir / "markup.html").write_text(markup, encoding="utf-8")
    (component_dir / "meta.json").write_text(json.dumps({"route": route, "title": title, "key": key}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{route}: {key}, {len(markup)} characters")

for path in [] if "--skip-assets" in sys.argv else sorted(ASSETS):
    dest = PUBLIC / path.lstrip("/")
    if dest.exists():
        continue
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        dest.write_bytes(fetch(path))
        print(f"asset {path}: {dest.stat().st_size} bytes")
    except Exception as exc:
        print(f"asset unavailable {path}: {exc}")

print(f"Referenced local assets: {len(ASSETS)}")
