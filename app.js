const app = document.querySelector("#app");
const storage = {
  name: "vedhita-name",
  medicines: "vedhita-medicines",
  feedback: "vedhita-feedback",
  consent: "vedhita-consent",
  language: "vedhita-language"
};

const state = {
  name: localStorage.getItem(storage.name) || "",
  language: localStorage.getItem(storage.language) || "en-IN",
  medicines: readList(storage.medicines),
  feedback: readList(storage.feedback),
  route: localStorage.getItem(storage.consent) ? "home" : "welcome",
  camera: null,
  cameraMode: ""
};

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function stopCamera() {
  if (state.camera) {
    state.camera.getTracks().forEach(track => track.stop());
    state.camera = null;
  }
}

function go(route) {
  stopCamera();
  state.cameraMode = "";
  state.route = route;
  render();
  window.scrollTo(0, 0);
}

function showMessage(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 3200);
}

function brand() {
  return `<a class="brand" href="#" data-action="home" aria-label="Vedhita home">
    <img src="assets/vedhita-mark.svg" alt="" />
    <span>vedhita<small>CARE, WITH CLARITY</small></span>
  </a>`;
}

function navigation() {
  const items = [
    ["home", "⌂", "Home"],
    ["medicines", "▱", "Medicines"],
    ["scanner", "▦", "Scan"],
    ["checkin", "♡", "Health check"],
    ["feedback", "✳", "Feedback"]
  ];
  return `<nav class="navigation" aria-label="Main navigation">${items.map(([route, icon, label]) =>
    `<button class="${state.route === route ? "active" : ""}" data-action="${route}" aria-current="${state.route === route ? "page" : "false"}">
      <span aria-hidden="true">${icon}</span><small>${label}</small>
    </button>`
  ).join("")}</nav>`;
}

function shell(content) {
  return `<div class="layout"><aside class="sidebar">${brand()}${navigation()}
    <div class="sidebar-note"><span class="shield">✓</span><strong>Your care stays yours</strong>
      <p>Your profile and saved medicines stay in this browser.</p></div>
    <p class="sidebar-foot">A little more clarity, every day.</p>
  </aside><section class="workspace"><header class="mobile-header">${brand()}</header>${content}</section>
  <div class="mobile-nav">${navigation()}</div></div>`;
}

function welcomePage() {
  return `<section class="welcome-layout"><div class="welcome-art">
    ${brand()}<div class="art-copy"><span class="overline">A CALMER WAY TO MANAGE CARE</span>
      <h1>Good care begins<br>with understanding.</h1>
      <p>Read medicine labels, keep your routine close, and find clear next steps — with your doctor at the center.</p>
      <div class="art-points"><span>✓ No confusing medical jargon</span><span>✓ Your information stays on this device</span></div>
    </div><div class="art-footer">Made for everyday care, with people in mind.</div>
  </div><div class="welcome-form-wrap"><form class="welcome-card" id="welcome-form">
    <span class="overline">WELCOME TO VEDHITA</span><h2>Care that feels clear.</h2>
    <p class="muted">Let’s set up your personal space. It only takes a moment.</p>
    <label for="name">What should we call you?</label><input id="name" name="name" maxlength="40" autocomplete="given-name" placeholder="Your first name" required />
    <label for="language">Choose a voice language</label><select id="language" name="language"><option value="en-IN">English</option><option value="hi-IN">हिंदी · Hindi</option><option value="pa-IN">ਪੰਜਾਬੀ · Punjabi</option></select>
    <div class="promise-card"><span class="promise-icon">✳</span><div><strong>Here’s what you can expect</strong>
      <p>Helpful medicine-label reading, simple reminders, and health information that never replaces your clinician.</p></div></div>
    <label class="consent-row"><input type="checkbox" name="consent" required /><span>I understand my information is stored in this browser and that Vedhita does not diagnose or prescribe.</span></label>
    <button class="button primary full" type="submit">Continue to Vedhita <span>→</span></button>
    <p class="micro-copy">No account needed. You can clear your saved details from this browser at any time.</p>
  </form></div></section>`;
}

function pageHeader(kicker, title, description = "") {
  return `<header class="page-header"><div><span class="overline">${kicker}</span><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div></header>`;
}

function homePage() {
  const firstName = escapeHtml(state.name || "there");
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const latest = state.medicines.slice(0, 2);
  return shell(`<main class="page">
    <div class="welcome-line"><div><span class="overline">${greeting.toUpperCase()}</span><h1>Hello, ${firstName} <span class="wave">✳</span></h1>
      <p>Let’s make today’s care a little easier.</p></div><button class="profile-button" data-action="profile" aria-label="Open your profile">${firstName.charAt(0).toUpperCase()}</button></div>
    <section class="hero-card"><div class="hero-copy"><span class="hero-tag"><span class="live-dot"></span> YOUR CARE, MADE CLEAR</span>
      <h2>Feel more confident<br>about your medicines.</h2><p>Scan a label or keep your routine in one simple place.</p>
      <button class="button white-button" data-action="scanner">Scan a medicine <span>→</span></button></div>
      <div class="hero-symbol" aria-hidden="true"><img src="assets/vedhita-mark.svg" alt="" /></div>
    </section>
    <div class="section-title"><div><span class="overline">YOUR TOOLS</span><h2>How can we help?</h2></div></div>
    <div class="action-grid">
      <button class="action-card" data-action="medicines"><span class="action-icon blue">▱</span><strong>My medicines</strong><small>Keep your list together</small><span class="card-arrow">↗</span></button>
      <button class="action-card" data-action="scanner"><span class="action-icon lilac">▦</span><strong>Scan a label</strong><small>Read medicine packaging</small><span class="card-arrow">↗</span></button>
      <button class="action-card" data-action="checkin"><span class="action-icon mint">♡</span><strong>Health check-in</strong><small>Find a safe next step</small><span class="card-arrow">↗</span></button>
      <button class="action-card" data-action="feedback"><span class="action-icon peach">✳</span><strong>Share feedback</strong><small>Help us make Vedhita better</small><span class="card-arrow">↗</span></button>
    </div>
    <div class="section-title medicine-heading"><div><span class="overline">YOUR ROUTINE</span><h2>Saved medicines</h2></div><button class="text-button" data-action="medicines">See all →</button></div>
    ${latest.length ? `<div class="medicine-list">${latest.map(medicineCard).join("")}</div>` :
      `<div class="empty-state"><span class="empty-icon">▱</span><strong>Your list starts here</strong><p>Add a medicine after checking its name against the packaging and your prescription.</p><button class="text-button" data-action="scanner">Scan a label →</button></div>`}
    <div class="safety-strip"><span>✓</span><p><strong>A note about medicine safety</strong><br>Vedhita can help read a label, but only your doctor or pharmacist can confirm what you should take.</p></div>
    </main>`);
}

function medicineCard(medicine, index) {
  return `<article class="medicine-row"><span class="medicine-icon">▱</span><div class="medicine-info">
    <strong>${escapeHtml(medicine.name)}</strong><small>${escapeHtml(medicine.strength || "Strength not added")}${medicine.time ? ` · ${escapeHtml(formatTime(medicine.time))}` : ""}</small>
    </div><button class="listen-button" data-action="listen-medicine" data-index="${index}" aria-label="Read ${escapeHtml(medicine.name)} aloud">▶</button>
    <button class="remove-button" data-action="remove-medicine" data-index="${index}" aria-label="Remove ${escapeHtml(medicine.name)}">×</button></article>`;
}

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function addMedicinePage() {
  const result = state.scanResult || {};
  return shell(`<main class="page">${pageHeader("SAVE TO YOUR ROUTINE", "Add a medicine", "Check the name against your package. Only enter timing or instructions from your own prescription.")}
    <form class="quiz-card" id="medicine-form">
      <label for="medicine-name">Name on the package</label><input id="medicine-name" name="name" maxlength="120" value="${escapeHtml(result.name || "")}" required />
      <label for="medicine-strength">Strength on the package</label><input id="medicine-strength" name="strength" maxlength="80" value="${escapeHtml(result.strength || "")}" placeholder="For example, 500 mg" />
      <label for="medicine-time">Reminder time (optional)</label><input id="medicine-time" name="time" type="time" />
      <label for="medicine-instructions">Your prescription instructions (optional)</label><textarea id="medicine-instructions" name="instructions" maxlength="180" rows="2" placeholder="Copy from your prescription, if you wish"></textarea>
      <div class="safety-strip"><span>!</span><p><strong>Vedhita does not suggest a dose.</strong><br>Leave instructions blank if you are unsure. Ask your pharmacist to explain your prescription.</p></div>
      <button class="button primary full" type="submit">Save to My medicines <span>→</span></button>
    </form>
  </main>`);
}

function medicinesPage() {
  return shell(`<main class="page">${pageHeader("YOUR ROUTINE", "My medicines", "Keep a list to help you stay organised. Follow the directions from your clinician.")}
    <div class="page-actions"><button class="button primary" data-action="scanner">＋ Scan a label</button><button class="button secondary" data-action="add-medicine">Add manually</button></div>
    ${state.medicines.length ? `<div class="medicine-list full-list">${state.medicines.map(medicineCard).join("")}</div>` :
      `<div class="empty-state"><span class="empty-icon">▱</span><strong>No medicines saved yet</strong><p>You can add a medicine after scanning its label. A scan is only a reading aid, not a medical confirmation.</p><button class="button primary" data-action="scanner">Scan a label</button></div>`}
    <div class="safety-strip"><span>!</span><p><strong>Use your prescription for instructions</strong><br>Vedhita will never choose a dose or tell you to start or stop a medicine.</p></div>
  </main>`);
}

function scannerPage() {
  const liveView = state.cameraMode ? `<div class="camera-view"><video id="camera-video" autoplay playsinline muted></video><span class="camera-frame"></span></div>
    <div class="camera-controls">${state.cameraMode === "medicine" ? `<button class="button primary" data-action="capture">Capture label</button>` : `<span class="scan-hint">Point at a QR code. Keep it inside the frame.</span>`}
      <button class="button secondary" data-action="stop-camera">Stop camera</button></div>` : "";
  return shell(`<main class="page">${pageHeader("VEDHITA SCANNER", "Read a medicine label", "Take a clear photo of the box or strip. We’ll read the visible text for you to check.")}
    ${liveView || `<div class="scan-layout"><section class="scan-card"><span class="scan-icon">▦</span><h2>Use your camera</h2><p>Keep the medicine name and strength in focus, with good light and little glare.</p>
      <button class="button primary full" data-action="start-medicine-camera">Open camera</button></section>
      <section class="scan-card"><span class="scan-icon upload">↑</span><h2>Choose a photo</h2><p>Use a clear photo already on your phone or computer.</p>
      <label class="button secondary full upload-button" for="medicine-photo">Choose image</label><input id="medicine-photo" class="visually-hidden" type="file" accept="image/*" capture="environment" /></section>
      <section class="scan-card qr-card"><span class="scan-icon qr-icon">▧</span><h2>Scan a QR code</h2><p>Read the code printed on a medicine pack. A QR code does not confirm that a medicine is genuine.</p>
      <button class="button secondary full" data-action="start-qr-camera">Open QR scanner</button>
      <label class="text-button upload-qr" for="qr-photo">Or choose a QR image</label><input id="qr-photo" class="visually-hidden" type="file" accept="image/*" /></section></div>`}
    <div id="scan-message" class="scan-message" role="status" hidden></div>
    <div class="safety-strip"><span>✓</span><p><strong>Check before you act</strong><br>Image reading can be wrong. Always compare the result with your package and ask a pharmacist if anything is unclear.</p></div>
  </main>`);
}

function resultPage() {
  const result = state.scanResult || {};
  const details = [
    ["Name on label", result.name],
    ["Strength on label", result.strength],
    ["Active ingredient", result.activeIngredient],
    ["Manufacturer", result.manufacturer],
    ["Other text", result.otherText]
  ].filter(([, value]) => value);
  return shell(`<main class="page">${pageHeader("PLEASE CHECK THIS", "Text found on the label", "This is an AI reading of the photo, not a verified medicine identity.")}
    <div class="result-card">${details.length ? details.map(([label, value]) => `<div class="result-line"><small>${label}</small><strong>${escapeHtml(value)}</strong></div>`).join("") :
      `<div class="result-line"><strong>No clear medicine name was found.</strong><small>Try another photo in brighter light.</small></div>`}
      ${result.notes ? `<p class="result-note">${escapeHtml(result.notes)}</p>` : ""}
    </div>
    <div class="safety-strip warning-strip"><span>!</span><p><strong>Please confirm with a professional</strong><br>Do not use this reading to choose a medicine or dose. Match the package with your prescription or ask a pharmacist.</p></div>
    ${result.name ? `<button class="button primary full" data-action="save-scan">Save this name to My medicines</button>` : ""}
    <button class="button secondary full" data-action="scanner">Try another scan</button>
  </main>`);
}

function qrResultPage() {
  const content = escapeHtml(state.qrResult || "");
  const shortContent = content.length > 700 ? `${content.slice(0, 700)}…` : content;
  return shell(`<main class="page">${pageHeader("QR CODE READ", "Code contents", "This is the information encoded in the QR code. Vedhita cannot verify the code or its source.")}
    <div class="result-card"><div class="result-line"><small>Encoded content</small><strong class="qr-content">${shortContent || "No readable text in this code."}</strong></div></div>
    <div class="safety-strip warning-strip"><span>!</span><p><strong>A QR code is not proof of authenticity</strong><br>Check the medicine with your pharmacist or the manufacturer through their official contact details.</p></div>
    <button class="button primary full" data-action="scanner">Scan another code</button></main>`);
}

function checkinPage() {
  return shell(`<main class="page">${pageHeader("A QUICK CHECK-IN", "What’s going on?", "Answer a few questions to find a safe next step. This is not a diagnosis or a medicine recommendation.")}
    <form class="quiz-card" id="checkin-form">
      <label for="symptom">1. What would you like help with?</label><input id="symptom" name="symptom" maxlength="120" placeholder="For example, a headache or a new rash" required />
      <label for="duration">2. How long has this been happening?</label><select id="duration" name="duration" required><option value="">Choose one</option><option>Less than a day</option><option>1–3 days</option><option>More than 3 days</option><option>It keeps coming back</option></select>
      <label for="severity">3. How does it feel right now?</label><select id="severity" name="severity" required><option value="">Choose one</option><option>Mild — I can do my usual activities</option><option>Moderate — it is affecting my day</option><option>Severe — I am struggling to manage</option></select>
      <label>4. Are you experiencing any emergency warning signs?</label><div class="urgent-note">Examples: trouble breathing, chest pain, fainting, heavy bleeding, or sudden confusion.</div>
      <div class="radio-row"><label><input type="radio" name="urgent" value="yes" required /> Yes</label><label><input type="radio" name="urgent" value="no" /> No</label></div>
      <label for="context">5. Is there anything else a clinician should know?</label><textarea id="context" name="context" maxlength="240" rows="3" placeholder="Optional: medicines you already take or other health concerns"></textarea>
      <button class="button primary full" type="submit">See my next step <span>→</span></button>
      <p class="micro-copy">Your answers are used only to show this guidance and are not saved.</p>
    </form><div id="checkin-result" aria-live="polite"></div>
  </main>`);
}

function feedbackPage() {
  return shell(`<main class="page">${pageHeader("YOUR VOICE MATTERS", "Help us improve", "Tell us what felt clear, what felt confusing, or what would help you feel more at ease.")}
    <form class="quiz-card" id="feedback-form"><label for="feedback">Your feedback</label>
      <textarea id="feedback" name="feedback" maxlength="500" rows="4" placeholder="Write a note for the Vedhita team…" required></textarea>
      <button class="button primary full" type="submit">Share feedback <span>→</span></button>
      <p class="micro-copy">Feedback stays in this browser on this device. Please do not include private medical details.</p>
    </form><div class="section-title"><div><span class="overline">YOUR NOTES</span><h2>What you’ve shared</h2></div></div>
    ${state.feedback.length ? `<div class="feedback-list">${state.feedback.map(note => `<article class="feedback-card"><span class="feedback-mark">“</span><p>${escapeHtml(note.text)}</p><small>${escapeHtml(note.date)}</small></article>`).join("")}</div>` :
      `<div class="empty-state compact"><strong>Your notes will show up here</strong><p>They stay on this device, so only you can see them.</p></div>`}
  </main>`);
}

function profilePage() {
  return shell(`<main class="page">${pageHeader("YOUR SPACE", "Profile & privacy", "Vedhita keeps your information in this browser.")}
    <div class="result-card"><div class="result-line"><small>Your name</small><strong>${escapeHtml(state.name)}</strong></div>
      <div class="result-line"><small>Saved medicines</small><strong>${state.medicines.length}</strong></div>
      <div class="result-line"><small>Information storage</small><strong>This device only</strong></div></div>
    <label class="setting-label" for="profile-language">Voice language</label><select class="setting-select" id="profile-language"><option value="en-IN" ${state.language === "en-IN" ? "selected" : ""}>English</option><option value="hi-IN" ${state.language === "hi-IN" ? "selected" : ""}>हिंदी · Hindi</option><option value="pa-IN" ${state.language === "pa-IN" ? "selected" : ""}>ਪੰਜਾਬੀ · Punjabi</option></select>
    <button class="button secondary full" data-action="clear-data">Clear my saved details</button>
    <div class="safety-strip"><span>✓</span><p><strong>We won’t send your personal details to Gemini.</strong><br>Only the medicine photo you choose to scan is sent to the configured AI service for label reading.</p></div>
  </main>`);
}

function handleAction(action, button) {
  if (["home", "medicines", "scanner", "checkin", "feedback", "profile"].includes(action)) return go(action);
  if (action === "add-medicine") return go("add-medicine");
  if (action === "start-medicine-camera") return openCamera("medicine");
  if (action === "start-qr-camera") return openCamera("qr");
  if (action === "stop-camera") return go("scanner");
  if (action === "capture") return captureImage();
  if (action === "save-scan") return saveScannedMedicine();
  if (action === "remove-medicine") return removeMedicine(Number(button.dataset.index));
  if (action === "listen-medicine") return speakMedicine(state.medicines[Number(button.dataset.index)]);
  if (action === "clear-data") return clearData();
}

function saveProfile(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.name = String(form.get("name") || "").trim();
  state.language = String(form.get("language") || "en-IN");
  localStorage.setItem(storage.name, state.name);
  localStorage.setItem(storage.language, state.language);
  localStorage.setItem(storage.consent, "accepted");
  go("home");
}

function removeMedicine(index) {
  state.medicines.splice(index, 1);
  saveList(storage.medicines, state.medicines);
  render();
}

function saveScannedMedicine() {
  const result = state.scanResult || {};
  if (!result.name) return;
  go("add-medicine");
}

function saveMedicine(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const medicine = {
    name: String(form.get("name") || "").trim(),
    strength: String(form.get("strength") || "").trim(),
    time: String(form.get("time") || ""),
    instructions: String(form.get("instructions") || "").trim()
  };
  if (!medicine.name) return;
  state.medicines.unshift(medicine);
  saveList(storage.medicines, state.medicines);
  showMessage("Medicine saved. Follow your prescription.");
  go("medicines");
}

function speakMedicine(medicine) {
  if (!medicine) return;
  if (!("speechSynthesis" in window)) return showMessage("Voice is not available in this browser.");
  const name = medicine.name;
  const time = medicine.time ? formatTime(medicine.time) : "";
  const instructions = medicine.instructions || "";
  const text = state.language === "hi-IN"
    ? `आपकी दवा ${name}। ${time ? `समय ${time}।` : ""} ${instructions}`
    : state.language === "pa-IN"
      ? `ਤੁਹਾਡੀ ਦਵਾਈ ${name}। ${time ? `ਸਮਾਂ ${time}।` : ""} ${instructions}`
      : `Medicine ${name}. ${time ? `Reminder time ${time}.` : ""} ${instructions}`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.language;
  utterance.rate = 0.88;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function clearData() {
  const confirmed = window.confirm("Clear your name, saved medicines, and feedback from this browser?");
  if (!confirmed) return;
  [storage.name, storage.medicines, storage.feedback, storage.consent, storage.language].forEach(key => localStorage.removeItem(key));
  state.name = "";
  state.medicines = [];
  state.feedback = [];
  state.language = "en-IN";
  go("welcome");
}

function showCheckin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const result = document.querySelector("#checkin-result");
  const urgent = form.get("urgent") === "yes";
  const severe = String(form.get("severity")).startsWith("Severe");
  result.innerHTML = `<article class="guidance-card ${urgent || severe ? "guidance-urgent" : ""}">
    <span class="overline">${urgent ? "PLEASE GET HELP NOW" : severe ? "PLEASE CONTACT A PROFESSIONAL" : "A SAFE NEXT STEP"}</span>
    <h2>${urgent ? "Contact emergency services now." : severe ? "Please contact a healthcare professional today." : "Talk with a doctor or pharmacist."}</h2>
    <p>${urgent
      ? "Your answer may need urgent attention. Contact your local emergency number or go to the nearest emergency department. If possible, ask someone you trust to stay with you."
      : "Share how long this has been happening and how it affects you. A clinician can assess the cause and advise what to do. Vedhita cannot identify the cause or choose a medicine."}</p>
    <button class="button secondary full" data-action="feedback">Share feedback</button>
    <p class="micro-copy">If symptoms worsen or you feel unsafe, seek urgent medical care.</p>
  </article>`;
  result.querySelector("[data-action]").addEventListener("click", () => go("feedback"));
}

function saveFeedback(event) {
  event.preventDefault();
  const text = String(new FormData(event.currentTarget).get("feedback") || "").trim();
  if (!text) return;
  state.feedback.unshift({ text, date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date()) });
  saveList(storage.feedback, state.feedback);
  render();
  showMessage("Your note was saved on this device.");
}

async function openCamera(mode) {
  if (!navigator.mediaDevices?.getUserMedia) {
    showMessage("Camera access needs a supported browser and a secure (HTTPS) page.");
    return;
  }
  if (mode === "qr" && !("BarcodeDetector" in window)) {
    showMessage("QR scanning is not supported in this browser. Try the Chrome browser on your phone.");
    return;
  }
  state.cameraMode = mode;
  render();
  try {
    state.camera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    const video = document.querySelector("#camera-video");
    if (!video) return stopCamera();
    video.srcObject = state.camera;
    await video.play();
    if (mode === "qr") readQrFrame();
  } catch (error) {
    stopCamera();
    state.cameraMode = "";
    render();
    showMessage(error.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings." : "Could not open the camera. Check that it is connected and try again.");
  }
}

async function readQrFrame() {
  if (!state.camera) return;
  const video = document.querySelector("#camera-video");
  if (video?.readyState >= 2) {
    try {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(video);
      if (codes.length) {
        state.qrResult = codes[0].rawValue;
        state.cameraMode = "";
        stopCamera();
        return go("qr-result");
      }
    } catch {
      stopCamera();
      state.cameraMode = "";
      render();
      showMessage("Could not read that QR code. Try a clearer image.");
      return;
    }
  }
  if (state.camera) setTimeout(readQrFrame, 250);
}

async function captureImage() {
  const video = document.querySelector("#camera-video");
  if (!video || !video.videoWidth) return showMessage("Camera is not ready yet. Try again in a moment.");
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1600 / video.videoWidth);
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    state.cameraMode = "";
    stopCamera();
    scanMedicine(blob);
  }, "image/jpeg", 0.84);
}

async function scanMedicine(file) {
  if (!file) return;
  state.cameraMode = "";
  stopCamera();
  const message = document.querySelector("#scan-message");
  if (message) {
    message.hidden = false;
    message.textContent = "Reading the label… This can take a few seconds.";
  }
  try {
    const image = await prepareImage(file);
    const response = await fetch("/api/scan-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(image)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not read the image.");
    state.scanResult = data;
    go("scan-result");
  } catch (error) {
    if (message) {
      message.hidden = false;
      message.textContent = error.message || "Could not read the label. Please try again.";
    } else showMessage(error.message || "Could not read the label.");
  }
}

async function prepareImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.84));
  if (!blob) throw new Error("Could not prepare that photo. Try a different image.");
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.readAsDataURL(blob);
  });
  return { image: base64, mimeType: "image/jpeg" };
}

async function scanQrImage(file) {
  if (!file) return;
  if (!("BarcodeDetector" in window)) return showMessage("QR scanning is not supported in this browser. Try Chrome on your phone.");
  try {
    const bitmap = await createImageBitmap(file);
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const codes = await detector.detect(bitmap);
    bitmap.close();
    if (!codes.length) return showMessage("No QR code found. Try a closer, clearer image.");
    state.qrResult = codes[0].rawValue;
    go("qr-result");
  } catch {
    showMessage("Could not read that QR image. Try a clearer photo.");
  }
}

function render() {
  stopCamera();
  if (state.route === "welcome") app.innerHTML = welcomePage();
  else if (state.route === "home") app.innerHTML = homePage();
  else if (state.route === "medicines") app.innerHTML = medicinesPage();
  else if (state.route === "scanner") app.innerHTML = scannerPage();
  else if (state.route === "scan-result") app.innerHTML = resultPage();
  else if (state.route === "add-medicine") app.innerHTML = addMedicinePage();
  else if (state.route === "qr-result") app.innerHTML = qrResultPage();
  else if (state.route === "checkin") app.innerHTML = checkinPage();
  else if (state.route === "feedback") app.innerHTML = feedbackPage();
  else if (state.route === "profile") app.innerHTML = profilePage();

  app.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button));
  });
  app.querySelector("#welcome-form")?.addEventListener("submit", saveProfile);
  app.querySelector("#medicine-form")?.addEventListener("submit", saveMedicine);
  app.querySelector("#checkin-form")?.addEventListener("submit", showCheckin);
  app.querySelector("#feedback-form")?.addEventListener("submit", saveFeedback);
  app.querySelector("#profile-language")?.addEventListener("change", event => {
    state.language = event.target.value;
    localStorage.setItem(storage.language, state.language);
    showMessage("Voice language updated.");
  });
  app.querySelector("#medicine-photo")?.addEventListener("change", event => scanMedicine(event.target.files[0]));
  app.querySelector("#qr-photo")?.addEventListener("change", event => scanQrImage(event.target.files[0]));
}

render();
