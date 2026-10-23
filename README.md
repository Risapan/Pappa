# For My Pappa 🤍

A small, static love-and-apology letter page. No build step, backend or database.

## Run it
- **Easiest:** double-click `index.html`. It opens in your browser.
- **Local server** (optional, good for testing on your phone over Wi-Fi):
  ```bash
  cd pappa-love-letter
  python3 -m http.server 8000
  ```
  Then open http://localhost:8000

## Customise
| What | Where |
|---|---|
| Message text, signature | `index.html`, inside the `letter-card` article |
| Photo | Put it in `images/` and set `CONFIG.photo = "images/pappa.jpg"` in `js/script.js` |
| Music | Put an mp3 in `music/` and set `CONFIG.music = "music/your-song.mp3"`. If you leave it empty, a gentle built-in piano melody plays |
| Colours / fonts | CSS variables at the top of `css/style.css` |

## Files
```
index.html      page structure and message
css/style.css   design, animations, responsive layout
js/script.js    reveal button, floating hearts, photo, music
images/ music/  your own photo and audio (optional)
```
