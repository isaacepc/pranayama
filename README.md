# Pranayama

A responsive, dependency-free breathing app made with HTML, CSS, and JavaScript.

Open `index.html` in a browser, or serve this folder with `python3 -m http.server 8000` and visit `http://localhost:8000`.

- `techniques.js`: the six technique definitions and their original defaults.
- `engine.js`: pure timeline construction and timestamp-based phase lookup.
- `app.js`: directory, setup and safety acknowledgment, session controls, visual guides, synthesized audio, and completion.
- `styles.css`: responsive layouts and reduced-motion preferences.

Breath duration multipliers apply to all continuous phases; pump cadence and recovery lengths stay fixed. Optional skipped holds are removed from the session timeline. Sessions pause automatically when the page becomes hidden. Reset returns to setup; closing a session discards its progress. Nothing is sent to a server or stored.

Audio begins after interaction and can be muted in the player. Vibration is used only where supported by the browser and device; unavailable audio or haptics do not block practice. Pause, reset, completion, exit, and page unload cancel animation frames and close audio resources.
