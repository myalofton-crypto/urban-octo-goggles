# [Product Name]: Interactive Cooking Assistant

A working prototype of a cooking companion that guides a cook through each recipe with voice commands, a video slot for every step, and tips shaped by the cook's own profile. The prototype runs in any modern browser with no build step and no dependencies, so it can be demoed from a laptop, hosted on GitHub Pages, or handed to a developer as the starting point for the full product.

## Run it

Open `index.html` in Chrome or Edge. Voice recognition depends on the browser's Web Speech API, which Chrome and Edge support fully; Safari and Firefox still read steps aloud and accept typed commands. For microphone access on some systems, serve the folder locally instead of opening the file directly:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Host it on Ignite

`dist/ignite-embed.html` is a ready-to-paste snippet for a Custom Code element on an Ignite (GoHighLevel-style) page, and `dist/cooking-assistant.html` is the same app as one standalone file. Step-by-step instructions live in [HOSTING-IGNITE.md](HOSTING-IGNITE.md). After any change to the source files, rebuild both with `python3 tools/build.py`.

## What the prototype does

The first visit opens **My kitchen**, a short profile covering skill level, dietary preferences, and allergies. The answers stay in the browser and shape the rest of the experience: beginners see a tip on every step without asking, and any ingredient that conflicts with an allergy or diet is flagged on the recipe page with a suggested swap.

Each recipe page carries a **servings scaler**. Quantities update as servings change, fractions display in kitchen-friendly form, and whole items such as eggs and fillets round to whole numbers.

**Cook mode** presents one step at a time in large type, reads each step aloud, and pairs it with a video panel. Steps with a set duration offer a one-tap **timer**, and several timers can run at once, each ending with a chime and a spoken alert.

**Hands-free mode** enlarges the type and buttons, keeps the microphone listening, and asks the device to keep the screen awake while the cook works.

## Voice commands

| Say | Result |
| --- | --- |
| "Next" / "Back" | Move between steps |
| "Go to step 3" | Jump to a step |
| "Repeat" | Hear the current step again |
| "Tip" | Hear advice matched to the cook's skill level |
| "Start timer" | Start the current step's timer |
| "Set a timer for 5 minutes" | Start a custom timer |
| "Stop timer" | Cancel the most recent timer |
| "How much garlic?" | Hear the scaled amount of an ingredient |
| "Ingredients" | Hear the full list for the chosen servings |
| "Play video" / "Pause video" | Control the demonstration |
| "Stop talking" | Silence the assistant |
| "Help" | Show the command list |

Every command can also be typed into the command box in cook mode, which makes the prototype easy to demo in a quiet room or a browser without speech support. Arrow keys move between steps and the space bar repeats the current one.

## Customizing the template

All recipe content lives in `data/recipes.js`. Each step accepts a `video` value, which can be a YouTube link or a direct link to an `.mp4` file; a step without one shows a branded "coming soon" panel. Tips are keyed by skill level (`beginner`, `intermediate`, `confident`, or `all`), and ingredients can carry `allergens`, conflicting `diet` flags, and a `swap` suggestion.

Brand colors sit in the variables at the top of `css/styles.css`. The palette ships in navy and gold.

Placeholder text marked with square brackets needs your details before launch:

- `[Product Name]` in `index.html` (page title, header, and footer) and in this README
- `[Organization Name]`, `[contact@email.com]`, and `[City, State]` in the footer of `index.html`

## Project layout

```
index.html        Page structure and dialogs
css/styles.css    Palette, layout, and hands-free styles
js/app.js         Views, scaling, timers, speech, and command parsing
data/recipes.js   Recipe library
tools/build.py    Bundles everything into dist/ for hosting
dist/             Generated single-file page and Ignite embed
HOSTING-IGNITE.md Ignite setup guide
```

## Paths to a full product

The prototype keeps its logic in plain functions so each piece can grow on its own. Natural next steps include a recipe backend or CMS, account sync for profiles, recorded technique videos for each step, a natural-language layer that answers open questions about a recipe, and a mobile wrapper for app store distribution. The command parser is exposed as `window.CookingAssistant.handleCommand`, which makes it straightforward to test or to replace with a language-model service later.

## License

See `LICENSE`.
