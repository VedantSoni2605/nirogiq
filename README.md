# Vedhita

Vedhita is a small, mobile-friendly medicine support app. It can read text from a medicine photo, scan QR codes, save a personal medicine list, and collect feedback.

> **Health and safety:** Vedhita does not diagnose, prescribe, or choose doses. A camera or AI reading can be wrong. Check medicine information with your package, prescription, doctor, or pharmacist.

## What you need

- Node.js 18 or newer
- A Gemini API key to use AI label reading
- A modern browser; camera access works on `localhost` or an HTTPS website

## Run the app

1. Open a terminal in this folder.
2. Make a private settings file by copying `.env.example` to `.env`.
3. Open `.env` and add your Gemini API key after `GEMINI_API_KEY=`.
4. Start Vedhita:

   ```sh
   npm start
   ```

5. Open <http://localhost:3000>.

The app has no package dependencies. If you skip the API key, the rest of the app still works, but AI label reading will show a setup message.

## Features

- A short welcome and privacy-consent screen
- A dashboard, medicine list, and optional reminder times saved in this browser
- English, Hindi, or Punjabi read-aloud support using your browser's speech voices
- Medicine label reading with the Gemini API
- Camera and image QR scanning in browsers that support `BarcodeDetector`
- A five-question health check-in with general next steps, not a diagnosis
- A feedback form; notes stay in this browser
- Responsive layout for phones and computers

## Privacy and API key

Your name, feedback, and saved medicines are stored in the browser's local storage. The medicine photo you choose is sent to this app's server, then to Gemini to read the visible label text. Personal profile details are not included in that request.

The Gemini key is read by `server.js` from the `.env` file and is never placed in browser code. Do not commit `.env` or paste an API key into `app.js`. `.gitignore` already excludes `.env`.

## Project files

- `index.html` — page entry point
- `styles.css` — colours, layout, and mobile styles
- `app.js` — screens, navigation, camera access, and browser storage
- `server.js` — local web server and private Gemini API request
- `assets/vedhita-mark.svg` — simple Vedhita logo

## Before sharing publicly

- Set `GEMINI_API_KEY` as a secret environment variable on your hosting service.
- Deploy over HTTPS so browsers can grant camera access.
- Review the Gemini service's privacy and data-retention terms.
- Test camera permissions and QR scanning on the browsers and phones you plan to support.
- Ask a qualified clinician and pharmacist to review any health content before using Vedhita in real care.

Vedhita is a prototype, not a medical device or a substitute for professional care.
