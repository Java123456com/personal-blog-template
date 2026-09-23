"""Temporary loopback receiver for the browser's rendered public HTML."""

from http.server import BaseHTTPRequestHandler, HTTPServer
import base64
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from lxml import html

TARGET = Path("docs/research/yihanglizi-cn-bc4c2f76/browser-captures")
TARGET.mkdir(parents=True, exist_ok=True)


class Receiver(BaseHTTPRequestHandler):
    def do_GET(self):
        page = b'<html><meta charset="utf-8"><form method="post"><textarea name="html" autofocus></textarea><button type="submit">Save capture</button></form></html>'
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(page)))
        self.end_headers()
        self.wfile.write(page)

    def do_POST(self):
        route = urlsplit(self.path).query.removeprefix("route=")
        if not route or not all(c.isalnum() or c in "-_" for c in route):
            self.send_error(400)
            return
        length = int(self.headers.get("Content-Length", "0"))
        if length < 100 or length > 2_000_000:
            self.send_error(413)
            return
        body = self.rfile.read(length).decode("utf-8")
        markup = parse_qs(body).get("html", [""])[0]
        if route in {"blog-hero-frame", "tech-hero-frame", "life-hero-frame"} and markup.startswith("data:image/png;base64,"):
            target = Path("public/sites/yihanglizi-cn-bc4c2f76/shared/videos") / (route + ".png")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(base64.b64decode(markup.split(",", 1)[1]))
            page = f"Saved image: {target.stat().st_size} bytes".encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(page)))
            self.end_headers()
            self.wfile.write(page)
            return
        if 'id="app"' not in markup:
            self.send_error(400, "No app markup")
            return
        if route == "moments-life":
            doc = html.fromstring(markup)
            for hidden in doc.xpath('//*[contains(concat(" ", normalize-space(@class), " "), " moments-content ") and contains(concat(" ", normalize-space(@class), " "), " locked ")]'):
                hidden.getparent().remove(hidden)
            markup = html.tostring(doc, encoding="unicode", method="html")
        (TARGET / f"{route}.html").write_text(markup, encoding="utf-8")
        page = f"Saved {route}: {len(markup)} characters".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(page)))
        self.end_headers()
        self.wfile.write(page)


HTTPServer(("127.0.0.1", 3011), Receiver).serve_forever()
