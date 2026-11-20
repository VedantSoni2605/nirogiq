# NirogiQ

NirogiQ is a small app that helps you keep your medicine list and schedule in one place. It can read printed text from a medicine photo and show the text inside a QR code.

NirogiQ is not a doctor. Check medicine details and instructions with your package, prescription, doctor, or pharmacist.

## Run NirogiQ on your computer

You need Node.js 18 or newer and npm.

1. Open a terminal in this project folder.
2. Install the packages:

   ```sh
   npm install
   ```

   If PowerShell blocks that command, use `npm.cmd install`.
3. Copy `.env.example` to `.env`. In PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```
4. Open `.env` and add your Google Gemini API key after `GEMINI_API_KEY=`. The default vision model is `gemini-3.5-flash-lite`; change `GEMINI_MODEL` if needed.
5. Start the app:

   ```sh
   npm start
   ```

   If PowerShell blocks that command, use `npm.cmd start`.
6. Open <http://localhost:3000> in your browser.

The medicine list, QR reader, and other screens work without a Gemini key. The key is needed only for reading text from a medicine photo.

## What the app can do

- Save medicine names, strengths, prescription instructions, and reminder times.
- Save optional start and end dates from a prescription. The app displays the schedule but does not send phone notifications.
- Read visible text from a chosen medicine photo with Google Gemini. The app marks unclear text as “Not sure”; the model does not independently verify medicine identity or authenticity. Check the package, prescription, or ask a pharmacist.
- Read the contents of a QR code. A QR code does not prove that a medicine is genuine.
- Read saved medicine details aloud in English, Hindi, or Punjabi.
- Store your name, medicines, and feedback in this browser.
- Guide new users through a short feature intro and one-time profile and consent setup.
- Let you update your name and read-aloud language in Settings from the bottom navigation.

## How the code works

1. `index.html` opens the app and loads its local scripts and styles.
2. `app.js` displays each screen, handles button clicks, and saves your list in the browser.
3. `styles.css` controls the colors, spacing, and mobile layout.
4. `server.js` serves the app and handles `/api/scan-image`. It reads `GEMINI_API_KEY` from `.env` and sends a chosen label photo to Google Gemini for text reading.

## Main files

- `index.html` - the app page
- `app.js` - screens, medicines, schedules, and scanning
- `styles.css` - the app design
- `server.js` - the local server and Gemini connection
- `assets/nirogiq-mark.svg` - the app logo
- `assets/app-icon.png` - the install icon
- `manifest.webmanifest` - the name and settings used when installing the app
- `package.json` - the packages the app needs

## Privacy and safety

- Your name, medicines, schedules, and feedback stay in this browser; they do not sync to another device.
- Browser storage is not encrypted. Keep your computer account private and locked.
- A medicine photo is sent to this app's server and Google Gemini only when you choose to scan a label.
- Keep your Gemini API key in `.env`. Never put it in `app.js` or share it in a message.
- Gemini API usage may incur charges; check Google's current pricing and limits before scanning.
- If an API key is exposed, revoke it with its provider and create a replacement.
- `.gitignore` excludes `.env` so the key is not added to the project by mistake.
- The app server listens only on your computer. The scan endpoint has no login, so do not expose port 3000 or change the server to listen on a network address.
- Public hosting needs HTTPS, access control, and request limits in front of the scan endpoint. Set the HSTS header at the HTTPS proxy; this local HTTP server cannot set it.
- The server allows camera access only for this app and blocks microphone and location access.
- Camera access is requested only when you open the scanner. Camera access requires `localhost` or an HTTPS connection.
- NirogiQ does not choose medicines or doses. Ask a pharmacist or doctor if you are unsure.

NirogiQ is a prototype, not a medical device or a replacement for professional care.
