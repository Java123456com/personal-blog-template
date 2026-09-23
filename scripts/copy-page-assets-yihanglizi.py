"""Copy browser-observed source assets into this site's shared namespace."""

import json
import shutil
import sys
from pathlib import Path
from urllib.parse import urlsplit

DEST = Path("public/sites/yihanglizi-cn-bc4c2f76/shared")
for directory in map(Path, sys.argv[1:]):
    for asset in json.loads((directory / "manifest.json").read_text(encoding="utf-8"))["assets"]:
        url = urlsplit(asset["url"])
        if url.netloc != "yihanglizi.cn" or not url.path.startswith("/"):
            continue
        target = DEST / url.path.lstrip("/")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(asset["path"], target)
        print(target)
