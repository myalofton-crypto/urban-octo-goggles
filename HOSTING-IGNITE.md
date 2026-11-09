# Hosting on Ignite

Ignite works like GoHighLevel, so the assistant goes onto an Ignite page through a **Custom Code** element (labeled "Custom JS/HTML" or "Code" in some versions of the builder). The file `dist/ignite-embed.html` holds everything the app needs, with styles, scripts, and recipes included, so nothing has to be hosted anywhere else.

The app runs inside its own frame on the page. The frame keeps Ignite's styles and the app's styles from colliding, and it carries the microphone permission the voice commands need.

## Add the assistant to a page

1. Open `dist/ignite-embed.html` in a plain text editor and copy everything in the file.
2. In Ignite, open **Sites**, then the funnel or website, then the page where the assistant should live.
3. Add a full-width section with a single column, and drag a **Custom Code** element into it.
4. Paste the copied code into the element and save.
5. Publish the page, then open the live URL in Chrome or Edge.

The builder's editor often blocks scripts while you edit, so judge the app on the published page or the preview link, never inside the editor itself.

## Before going live

**Connect your domain with SSL.** Browsers grant microphone access only on secure `https://` pages. Ignite issues SSL certificates for connected domains, and the default preview links already use HTTPS.

**Expect the microphone prompt.** The first time a cook taps the voice button, the browser asks permission to use the microphone. Mention the prompt on the page above the assistant so it arrives as an expected step rather than a surprise.

**Set the height.** The embed opens at 90 percent of the screen height, never shorter than 720 pixels. To change it, edit `height:90vh;min-height:720px` at the top of the snippet.

**Replace the placeholders.** `[Product Name]`, `[Organization Name]`, `[contact@email.com]`, and `[City, State]` appear in `index.html`. Edit them there, then rebuild.

## Updating recipes or branding

The files in `dist/` are generated. After changing recipes, colors, or text, rebuild them from the repository root:

```
python3 tools/build.py
```

Then paste the new `dist/ignite-embed.html` into the Custom Code element, replacing the old code.

## If the builder rejects the code

Some accounts cap the size of a Custom Code element or strip scripts from it. In that case, host the standalone page `dist/cooking-assistant.html` on any static host with HTTPS, such as GitHub Pages, Netlify, or Cloudflare Pages, and paste this shorter snippet into Ignite instead, with your hosted address in place of the placeholder:

```html
<iframe title="Interactive cooking assistant"
  src="https://[your-hosted-address]/cooking-assistant.html"
  style="width:100%;height:90vh;min-height:720px;border:0;border-radius:14px;display:block;"
  allow="microphone; autoplay; screen-wake-lock; fullscreen; encrypted-media"></iframe>
```

## What carries over and what stays behind

Cook profiles are saved in each visitor's browser for your Ignite domain, so a returning cook keeps their settings on the same device. Profiles do not sync across devices or flow into Ignite contacts. Connecting the assistant to Ignite contacts, for example to tag cooks by dietary need or send recipe follow-ups, would be a natural next phase.
