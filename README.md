# DISSTOPIA Portfolio

Open `index.html` directly in a browser.

## Replace media

Drop the final exported files into `assets/` with these names:

- `tiktok-01.mp4`
- `tiktok-02.mp4`
- `tiktok-03.mp4`
- `tiktok-04.mp4`

The intro media has been downloaded from Google Drive and is already wired into the hero/project overview:

- `intro-video.mp4`
- `intro-01.jpg`
- `intro-02.jpg`
- `intro-03.jpg`

The Facebook phase images have been downloaded from Google Drive:

- `fb-phase1-01.jpg` to `fb-phase1-04.jpg`
- `fb-phase2-01.jpg` to `fb-phase2-03.jpg`
- `fb-phase3-01.jpg`

The remaining SVG files in `assets/` are temporary posters/placeholders for intro, TikTok, and FMV media.

## Content to customize

- Team names are currently `Member 1` to `Member 6`.
- Facebook phase cards currently point to the main Facebook page because individual post links were not provided.
- Project overview text is drafted from the brief. Replace with the final report summary if you want it to match the official wording exactly.

## Gemini chatbot

The chatbox calls Gemini from the browser with `gemini-2.0-flash`.

1. Copy `config.example.js` to `config.local.js`.
2. Replace `PASTE_YOUR_GEMINI_API_KEY_HERE` with your real Gemini API key.
3. Reload the page and start chatting.

`config.local.js` is ignored by git so the API key is not pushed to GitHub.

For a public production site, move the Gemini call behind a backend or serverless proxy so the API key is not exposed to visitors.
