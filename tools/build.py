#!/usr/bin/env python3
"""Bundle the prototype into single files for hosting on Ignite (or any
GoHighLevel-style builder).

Outputs:
  dist/cooking-assistant.html  one self-contained page (CSS, JS, recipes inline)
  dist/ignite-embed.html       a snippet to paste into a Custom Code element;
                               the app runs inside an iframe so the builder's
                               styles and the app's styles never collide

Run from the repository root:  python3 tools/build.py
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


# Page builders sometimes re-encode pasted code, which garbles symbols such as
# fractions and curly quotes. Escaping every non-ASCII character keeps the
# bundle pure ASCII, so it survives any host. Each language has its own escape.
def ascii_js(text):
    return "".join(c if ord(c) < 128 else "\\u%04x" % ord(c) for c in text)


def ascii_css(text):
    return "".join(c if ord(c) < 128 else "\\%x " % ord(c) for c in text)


def ascii_html(text):
    return "".join(c if ord(c) < 128 else "&#x%x;" % ord(c) for c in text)


def bundle():
    page = ascii_html(read("index.html"))
    css = ascii_css(read("css/styles.css"))
    page = page.replace('<link rel="stylesheet" href="css/styles.css">', f"<style>\n{css}\n</style>")
    for src in ("data/recipes.js", "js/app.js"):
        js = ascii_js(read(src)).replace("</script", "<\\/script")
        page = page.replace(f'<script src="{src}"></script>', f"<script>\n{js}\n</script>")
    if re.search(r'(href|src)="(css|js|data)/', page):
        raise SystemExit("A local asset was not inlined; check index.html references.")
    if any(ord(c) > 127 for c in page):
        raise SystemExit("Bundle still contains non-ASCII characters.")
    return page


def embed(page):
    srcdoc = html.escape(page, quote=True)
    return (
        "<!-- Cooking assistant embed. Paste into a Custom Code (Custom JS/HTML) element. -->\n"
        "<!-- Adjust the height to suit your page. Voice needs the page served over https. -->\n"
        '<iframe title="Interactive cooking assistant"\n'
        '  style="width:100%;height:90vh;min-height:720px;border:0;border-radius:14px;display:block;"\n'
        '  allow="microphone; autoplay; screen-wake-lock; fullscreen; encrypted-media"\n'
        f'  srcdoc="{srcdoc}"></iframe>\n'
    )


def main():
    DIST.mkdir(exist_ok=True)
    page = bundle()
    (DIST / "cooking-assistant.html").write_text(page, encoding="utf-8")
    snippet = embed(page)
    (DIST / "ignite-embed.html").write_text(snippet, encoding="utf-8")
    print(f"dist/cooking-assistant.html  {len(page.encode()) // 1024} KB")
    print(f"dist/ignite-embed.html       {len(snippet.encode()) // 1024} KB")


if __name__ == "__main__":
    main()
