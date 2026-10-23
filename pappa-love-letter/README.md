# For My Pappa 🤍

A small, static love-and-apology letter page. No build step, backend or database.

## Run it
- **Easiest:** double-click `index.html` in the `Pappa` folder. It opens in your browser.
- **Local server** (optional, good for testing on your phone over Wi-Fi):
  ```bash
  cd Pappa
  python3 -m http.server 8000
  ```
  Then open http://localhost:8000

## Customise
| What | Where |
|---|---|
| Message text, signature | `index.html`, inside the `letter-card` article |
| Photo | Put it in `pappa-love-letter/images/` and set `CONFIG.photo = "pappa-love-letter/images/pappa.jpg"` in `js/script.js` |
| Music | `CONFIG.music` in `js/script.js` (now `pappa-love-letter/music/shower.mp3`). `CONFIG.musicStart` sets the second it starts from (86 = just before the middle chorus). Set `music` to `""` for the built-in piano melody |
| Colours / fonts | CSS variables at the top of `css/style.css` |

## Files
```
Pappa/
├── css/style.css            design, animations, responsive layout
├── js/script.js             reveal button, floating hearts, photo, music
├── pappa-love-letter/
│   ├── images/              your photo (optional)
│   ├── music/shower.mp3     background song
│   └── README.md
└── index.html               page structure and message
```
