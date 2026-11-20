const app = document.querySelector("#app");
const storage = {
  name: "nirogiq-name",
  medicines: "nirogiq-medicines",
  feedback: "nirogiq-feedback",
  consent: "nirogiq-consent",
  language: "nirogiq-language"
};

function migrateLegacyStorage() {
  // Keep saved data when an existing user upgrades from Vedhita.
  for (const [key, newKey] of Object.entries(storage)) {
    const oldKey = `vedhita-${key}`;
    if (localStorage.getItem(newKey) === null) {
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null) localStorage.setItem(newKey, oldValue);
    }
    localStorage.removeItem(oldKey);
  }
}

migrateLegacyStorage();

const state = {
  name: localStorage.getItem(storage.name) || "",
  language: localStorage.getItem(storage.language) || "en-IN",
  medicines: readList(storage.medicines),
  feedback: readList(storage.feedback),
  route: "splash",
  introStep: 0,
  camera: null,
  cameraMode: "",
  qrCanvas: null
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
  state.qrCanvas = null;
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

function icon(name, className = "") {
  return `<i class="icon ${className}" data-lucide="${name}" aria-hidden="true"></i>`;
}

function brand(clickable = true) {
  const tag = clickable ? "a" : "div";
  const action = clickable ? 'href="#" data-action="home"' : "";
  return `<${tag} class="brand" ${action} aria-label="NirogiQ app">
    <img src="assets/nirogiq-mark.svg" alt="" />
    <span>NirogiQ<small>MEDICINE SUPPORT</small></span>
  </${tag}>`;
}

function navigation() {
  const items = [
    ["home", "house", "Home"],
    ["medicines", "pill", "Medicines"],
    ["scanner", "scan-line", "Scan"],
    ["settings", "settings", "Settings"],
    ["feedback", "message-circle", "Feedback"]
  ];
  return `<nav class="navigation" aria-label="Main navigation">${items.map(([route, iconName, label]) =>
    `<button class="${state.route === route ? "active" : ""}" data-action="${route}" aria-current="${state.route === route ? "page" : "false"}">
      ${icon(iconName)}<small>${label}</small>
    </button>`
  ).join("")}</nav>`;
}

function shell(content) {
  const header = state.route === "home"
    ? `<header class="mobile-header home-mobile-header"><span>How can we help you today?</span></header>`
    : `<header class="mobile-header">${brand()}</header>`;
  return `<div class="layout"><section class="workspace">${header}${content}</section>
    <div class="mobile-nav">${navigation()}</div></div>`;
}

function splashPage() {
  return `<main class="splash-screen"><div class="splash-orbit orbit-one"></div><div class="splash-orbit orbit-two"></div>
    <div class="splash-content"><div class="splash-logo"><img src="assets/nirogiq-mark.svg" alt="" /></div>
      <p class="splash-name">NirogiQ <span>app</span></p><p class="splash-tagline">Care, with clarity.</p>
      <div class="loading-dots" role="status" aria-label="Opening the app"><i></i><i></i><i></i></div>
    </div><button class="skip-splash" data-action="finish-splash">Open now</button></main>`;
}

function welcomePage() {
  const step = state.introStep;
  const content = step === 0
    ? `<div class="intro-illustration"><img src="assets/nirogiq-mark.svg" alt="" /><span class="float-chip">Your care, one step at a time</span></div>
       <span class="overline">ABOUT THE APP</span><h1>Care support, made simple.</h1>
       <p>Scan medicine labels or QR codes, keep a routine, and hear saved details read aloud.</p>
       <div class="intro-points"><div><span>01</span><strong>Scan a pack</strong><small>Read printed text or a QR code.</small></div>
       <div><span>02</span><strong>Keep a routine</strong><small>Save times and prescription dates.</small></div></div>`
    : step === 1
      ? `<div class="intro-illustration privacy-art"><img src="assets/nirogiq-mark.svg" alt="" /><span class="float-chip">Private by default</span></div>
         <span class="overline">YOUR PRIVACY</span><h1>Your care stays yours.</h1>
         <p>Your name, saved medicines, and notes stay in this app on your device.</p>`
      : `<span class="overline">SET UP YOUR APP</span><h1>Let’s make it yours.</h1>
         <p>Just your name and preferred voice. You can change these later.</p>
         <form class="setup-form" id="welcome-form">
           <label for="name">What should we call you?</label><input id="name" name="name" maxlength="40" autocomplete="given-name" placeholder="Your first name" required />
           <label for="language">Voice language</label><select id="language" name="language"><option value="en-IN">English</option><option value="hi-IN">हिंदी · Hindi</option><option value="pa-IN">ਪੰਜਾਬੀ · Punjabi</option></select>
           <div class="consent-copy"><strong>Before you continue</strong><p>Your name, medicines, and notes stay in this browser. Camera access is requested only when scanning; read-aloud uses your speaker.</p></div>
           <div class="consent-actions"><button class="button primary" type="submit">Accept &amp; continue ${icon("arrow-right")}</button>
             <button class="button secondary" type="button" data-action="decline-consent">Decline</button></div>
         </form>`;

  return `<main class="intro-screen"><header class="intro-header">${brand(false)}<button class="skip-intro" data-action="skip-intro">Skip intro</button></header>
    <section class="intro-panel step-${step}">${content}</section>
    <footer class="intro-footer"><div class="step-dots" aria-label="Step ${step + 1} of 3">${[0, 1, 2].map(index => `<span class="${index === step ? "current" : ""}"></span>`).join("")}</div>
      <div class="intro-controls">${step ? `<button class="back-step" data-action="back-intro">Back</button>` : `<span></span>`}
      ${step < 2 ? `<button class="button primary" data-action="next-intro">Continue ${icon("arrow-right")}</button>` : ""}</div>
    </footer></main>`;
}

function pageHeader(kicker, title, description = "") {
  return `<header class="page-header"><div><span class="overline">${kicker}</span><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div></header>`;
}

function homePage() {
  const firstName = escapeHtml(state.name || "there");
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const scheduledMedicines = state.medicines
    .map((medicine, index) => ({ medicine, index }))
    .filter(({ medicine }) => /^\d{2}:\d{2}$/.test(medicine.time || ""))
    .sort((first, second) => first.medicine.time.localeCompare(second.medicine.time));
  const schedule = scheduledMedicines.length
    ? `<ol class="schedule-list">${scheduledMedicines.slice(0, 3).map(({ medicine, index }, position) =>
        `<li class="schedule-row"><div class="schedule-time">${position === 0 ? `<small>NEXT</small>` : ""}<strong>${escapeHtml(formatTime(medicine.time))}</strong></div>
          <span class="schedule-divider" aria-hidden="true"></span><div class="schedule-medicine"><strong>${escapeHtml(medicine.name)}</strong>
          <small>${escapeHtml([medicine.strength || "Use your prescription", medicinePeriod(medicine)].filter(Boolean).join(" · "))}</small></div>
          <button class="icon-button" data-action="listen-medicine" data-index="${index}" aria-label="Read ${escapeHtml(medicine.name)} aloud">${icon("volume-2")}</button></li>`
      ).join("")}</ol>`
    : `<div class="empty-schedule"><span class="empty-schedule-icon">${icon("clock-3")}</span>
        <div><strong>No medicine times yet</strong><small>Add the time written on your prescription.</small></div>
        <button class="button secondary" data-action="add-medicine">Add time</button></div>`;
  const moreCount = scheduledMedicines.length - 3;
  return shell(`<main class="page home-page">
    <div class="welcome-line"><div><span class="overline">${greeting.toUpperCase()}</span><h1>Hello, ${firstName} <span class="wave">${icon("sparkles")}</span></h1>
      <p>Let’s make today’s care a little easier.</p></div></div>
    <section class="schedule-card" aria-labelledby="schedule-title"><div class="schedule-heading"><div><span class="overline">YOUR MEDICINES</span>
      <h2 id="schedule-title">Medicine times</h2><p>Times you added from your prescription.</p></div>
      ${scheduledMedicines.length ? `<button class="text-button" data-action="medicines">See all</button>` : ""}</div>
      ${schedule}${moreCount > 0 ? `<button class="more-times" data-action="medicines">+${moreCount} more time${moreCount === 1 ? "" : "s"}</button>` : ""}
    </section>
    <section class="quick-actions" aria-labelledby="quick-actions-title"><div class="section-title"><div><span class="overline">QUICK ACTIONS</span>
      <h2 id="quick-actions-title">Choose a shortcut</h2></div></div>
    <div class="action-grid">
      <button class="action-card" data-action="medicines"><span class="action-icon blue">${icon("pill")}</span><strong>Medicines</strong><small>View your saved list</small></button>
      <button class="action-card" data-action="add-medicine"><span class="action-icon mint">${icon("plus")}</span><strong>Add medicine</strong><small>Add to your routine</small></button>
      <button class="action-card" data-action="scanner"><span class="action-icon lilac">${icon("scan-line")}</span><strong>Medicine scanner</strong><small>Read a label or QR code</small></button>
      <button class="action-card" data-action="feedback"><span class="action-icon peach">${icon("message-circle")}</span><strong>Share feedback</strong><small>Help us improve</small></button>
    </div></section>
    </main>`);
}

function medicineCard(medicine, index) {
  return `<article class="medicine-row"><span class="medicine-icon">${icon("pill")}</span><div class="medicine-info">
    <strong>${escapeHtml(medicine.name)}</strong><small>${escapeHtml([medicine.strength || "Strength not added", medicine.time ? formatTime(medicine.time) : "", medicinePeriod(medicine)].filter(Boolean).join(" · "))}</small>
    </div><button class="listen-button" data-action="listen-medicine" data-index="${index}" aria-label="Read ${escapeHtml(medicine.name)} aloud">${icon("volume-2")}</button>
    <button class="remove-button" data-action="remove-medicine" data-index="${index}" aria-label="Remove ${escapeHtml(medicine.name)}">${icon("x")}</button></article>`;
}

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function medicinePeriod(medicine) {
  if (!medicine.startDate || !medicine.endDate) return "";
  const start = formatDate(medicine.startDate);
  const end = formatDate(medicine.endDate);
  return start && end ? `${start}–${end}` : "";
}

function addMedicinePage() {
  const result = state.scanResult || {};
  return shell(`<main class="page">${pageHeader("SAVE TO YOUR ROUTINE", "Add a medicine", "Check the name against your package. Add schedule details only as written on your prescription.")}
    <form class="quiz-card" id="medicine-form">
      <label for="medicine-name">Name on the package</label><input id="medicine-name" name="name" maxlength="120" value="${escapeHtml(result.name || "")}" required />
      <label for="medicine-strength">Strength on the package</label><input id="medicine-strength" name="strength" maxlength="80" value="${escapeHtml(result.strength || "")}" placeholder="For example, 500 mg" />
      <label for="medicine-time">Reminder time (optional)</label><input id="medicine-time" name="time" type="time" />
      <div class="date-range">
        <label for="medicine-start-date">Start date (optional)<input id="medicine-start-date" name="startDate" type="date" /></label>
        <label for="medicine-end-date">End date (optional)<input id="medicine-end-date" name="endDate" type="date" /></label>
      </div>
      <p class="field-help">Choose both dates from your prescription, or leave both blank.</p>
      <label for="medicine-instructions">Your prescription instructions (optional)</label><textarea id="medicine-instructions" name="instructions" maxlength="180" rows="2" placeholder="Copy from your prescription, if you wish"></textarea>
      <div class="safety-strip"><span>${icon("circle-alert")}</span><p><strong>NirogiQ does not suggest a dose.</strong><br>Leave instructions blank if you are unsure. Ask your pharmacist to explain your prescription.</p></div>
      <button class="button primary full" type="submit">Save to My medicines ${icon("arrow-right")}</button>
    </form>
  </main>`);
}

function medicinesPage() {
  return shell(`<main class="page">${pageHeader("YOUR ROUTINE", "My medicines", "See the medicines you have saved, or add one with the schedule from your prescription.")}
    <div class="page-actions"><button class="button primary" data-action="scanner">${icon("scan-line")} Scan a label</button><button class="button secondary" data-action="add-medicine">${icon("plus")} Add manually</button></div>
    ${state.medicines.length ? `<div class="medicine-list full-list">${state.medicines.map(medicineCard).join("")}</div>` :
      `<div class="empty-state"><span class="empty-icon">${icon("pill")}</span><strong>No medicines saved yet</strong><p>You can add a medicine after scanning its label. A scan is only a reading aid, not a medical confirmation.</p><button class="button primary" data-action="scanner">${icon("scan-line")} Scan a label</button></div>`}
    <div class="safety-strip"><span>${icon("shield-check")}</span><p><strong>Use your prescription for instructions</strong><br>NirogiQ will never choose a dose or tell you to start or stop a medicine.</p></div>
  </main>`);
}

function scannerPage() {
  const liveView = state.cameraMode ? `<div class="camera-view"><video id="camera-video" autoplay playsinline muted></video><span class="camera-frame"></span></div>
    <div class="camera-controls">${state.cameraMode === "medicine" ? `<button class="button primary" data-action="capture">Capture label</button>` : `<span class="scan-hint">Point at a QR code. Keep it inside the frame.</span>`}
      <button class="button secondary" data-action="stop-camera">Stop camera</button></div>` : "";
  return shell(`<main class="page">${pageHeader("NIROGIQ SCANNER", "Read a medicine label", "Take a photo of the box or strip. We’ll read visible text for you to check.")}
    ${liveView || `<div class="scan-layout"><section class="scan-card"><span class="scan-icon">${icon("camera")}</span><h2>Use your camera</h2><p>Camera access starts when you tap Open camera. Tilt shiny foil slightly to reduce glare.</p>
      <button class="button primary full" data-action="start-medicine-camera">Open camera</button></section>
      <section class="scan-card"><span class="scan-icon upload">${icon("image-up")}</span><h2>Choose a photo</h2><p>Use a clear photo already on your phone or computer.</p>
      <label class="button secondary full upload-button" for="medicine-photo">Choose image</label><input id="medicine-photo" class="visually-hidden" type="file" accept="image/*" capture="environment" /></section>
      <section class="scan-card qr-card"><span class="scan-icon qr-icon">${icon("qr-code")}</span><h2>Scan a QR code</h2><p>Read the code printed on a medicine pack. A QR code does not confirm that a medicine is genuine.</p>
      <button class="button secondary full" data-action="start-qr-camera">Open QR scanner</button>
      <label class="text-button upload-qr" for="qr-photo">Or choose a QR image</label><input id="qr-photo" class="visually-hidden" type="file" accept="image/*" /></section></div>`}
    <div id="scan-message" class="scan-message" role="status" hidden></div>
    <div class="safety-strip"><span>${icon("shield-check")}</span><p><strong>Check before you act</strong><br>The reading may be unsure, especially on curved or damaged foil. Compare it with the package and ask a pharmacist if unclear.</p></div>
  </main>`);
}

function resultPage() {
  const result = state.scanResult || {};
  const isReadable = result.confidence === "high";
  const details = [
    ["Name on label", result.name],
    ["Strength on label", result.strength],
    ["Active ingredient", result.activeIngredient],
    ["Manufacturer", result.manufacturer],
    ["Other text", result.otherText]
  ].filter(([, value]) => value);
  return shell(`<main class="page">${pageHeader("PLEASE CHECK THIS", "Text found on the label", "This is an AI reading of the photo, not a verified medicine identity.")}
    <div class="scan-confidence ${isReadable ? "readable" : "uncertain"}"><span>${icon(isReadable ? "scan-line" : "circle-alert")}</span>
      <div><strong>${isReadable ? "Text looks readable — please verify it" : "Not sure — the text may be unclear"}</strong>
        <p>${isReadable ? "This estimate is about text readability only. It does not verify medicine identity or authenticity." : "Try another photo with less glare, or ask a pharmacist to read the package."}</p></div>
    </div>
    <div class="result-card">${details.length ? details.map(([label, value]) => `<div class="result-line"><small>${label}</small><strong>${escapeHtml(value)}</strong></div>`).join("") :
      `<div class="result-line"><strong>No clear medicine name was found.</strong><small>Try another photo in brighter light.</small></div>`}
      ${result.notes ? `<p class="result-note">${escapeHtml(result.notes)}</p>` : ""}
    </div>
    <div class="safety-strip warning-strip"><span>${icon("circle-alert")}</span><p><strong>Please confirm with a professional</strong><br>The selected model can read printed details but cannot independently confirm the product or its authenticity. Compare with your prescription or ask a pharmacist.</p></div>
    ${result.name && isReadable ? `<button class="button primary full" data-action="save-scan">Review text &amp; add to My medicines</button>` : ""}
    <button class="button secondary full" data-action="scanner">Try another scan</button>
  </main>`);
}

function qrResultPage() {
  const content = escapeHtml(state.qrResult || "");
  const shortContent = content.length > 700 ? `${content.slice(0, 700)}…` : content;
  return shell(`<main class="page">${pageHeader("QR CODE READ", "Code contents", "This is the information encoded in the QR code. NirogiQ cannot verify the code or its source.")}
    <div class="result-card"><div class="result-line"><small>Encoded content</small><strong class="qr-content">${shortContent || "No readable text in this code."}</strong></div></div>
    <div class="safety-strip warning-strip"><span>${icon("circle-alert")}</span><p><strong>A QR code is not proof of authenticity</strong><br>Check the medicine with your pharmacist or the manufacturer through their official contact details.</p></div>
    <button class="button primary full" data-action="scanner">Scan another code</button></main>`);
}

function feedbackPage() {
  return shell(`<main class="page">${pageHeader("YOUR VOICE MATTERS", "Help us improve", "Tell us what felt clear, what felt confusing, or what would help you feel more at ease.")}
    <form class="quiz-card" id="feedback-form"><label for="feedback">Your feedback</label>
      <textarea id="feedback" name="feedback" maxlength="500" rows="4" placeholder="Write a note for the NirogiQ team…" required></textarea>
      <button class="button primary full" type="submit">Share feedback ${icon("arrow-right")}</button>
      <p class="micro-copy">Feedback stays in this browser on this device. Please do not include private medical details.</p>
    </form><div class="section-title"><div><span class="overline">YOUR NOTES</span><h2>What you’ve shared</h2></div></div>
    ${state.feedback.length ? `<div class="feedback-list">${state.feedback.map(note => `<article class="feedback-card"><span class="feedback-mark">“</span><p>${escapeHtml(note.text)}</p><small>${escapeHtml(note.date)}</small></article>`).join("")}</div>` :
      `<div class="empty-state compact"><strong>Your notes will show up here</strong><p>They stay on this device, so only you can see them.</p></div>`}
  </main>`);
}

function settingsPage() {
  return shell(`<main class="page">${pageHeader("APP PREFERENCES", "Settings", "Make NirogiQ work for you.")}
    <section class="settings-section" aria-labelledby="settings-profile-title">
      <div class="settings-heading"><h2 id="settings-profile-title">Your profile</h2><p>Update your name and read-aloud language.</p></div>
      <form class="settings-form" id="settings-form">
        <label for="settings-name">Your name</label><input id="settings-name" name="name" maxlength="40" value="${escapeHtml(state.name)}" required />
        <label for="settings-language">Read-aloud language</label><select id="settings-language" name="language">
          <option value="en-IN" ${state.language === "en-IN" ? "selected" : ""}>English</option>
          <option value="hi-IN" ${state.language === "hi-IN" ? "selected" : ""}>हिंदी · Hindi</option>
          <option value="pa-IN" ${state.language === "pa-IN" ? "selected" : ""}>ਪੰਜਾਬੀ · Punjabi</option>
        </select>
        <button class="button primary full" type="submit">Save settings</button>
      </form>
    </section>
    <section class="settings-section" aria-labelledby="settings-privacy-title">
      <div class="settings-heading"><h2 id="settings-privacy-title">Privacy &amp; data</h2><p>Your name, medicines, and feedback stay in this browser. A label photo is sent to this app's server and Google Gemini only when you choose to scan.</p></div>
      <button class="button secondary full" data-action="clear-data">Clear my saved details</button>
    </section>
    <section class="settings-section" aria-labelledby="settings-about-title">
      <div class="settings-heading"><h2 id="settings-about-title">About</h2></div>
      <div class="settings-about"><strong>NirogiQ</strong><span>Medicine support app</span><small>Version 1.0.0</small></div>
    </section>
    <section class="settings-section" aria-labelledby="settings-support-title">
      <div class="settings-heading"><h2 id="settings-support-title">Support</h2><p>Share a note or suggestion with the NirogiQ team.</p></div>
      <button class="button secondary full" data-action="feedback">Share feedback ${icon("arrow-right")}</button>
    </section>
  </main>`);
}

function handleAction(action, button) {
  if (action === "decline-consent") {
    state.introStep = 0;
    go("welcome");
    showMessage("No account was created and no profile details were saved.");
    return;
  }
  if (action === "finish-splash") {
    state.route = localStorage.getItem(storage.consent) ? "home" : "welcome";
    return render();
  }
  if (action === "skip-intro") {
    state.introStep = 2;
    return render();
  }
  if (action === "back-intro") {
    state.introStep = Math.max(0, state.introStep - 1);
    return render();
  }
  if (action === "next-intro") {
    state.introStep = Math.min(2, state.introStep + 1);
    return render();
  }
  if (["home", "medicines", "scanner", "feedback", "settings"].includes(action)) return go(action);
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

function saveSettings(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  const language = String(form.get("language") || "");
  if (!name) return showMessage("Enter your name before saving.");
  if (!["en-IN", "hi-IN", "pa-IN"].includes(language)) return showMessage("Choose a supported read-aloud language.");
  state.name = name.slice(0, 40);
  state.language = language;
  localStorage.setItem(storage.name, state.name);
  localStorage.setItem(storage.language, state.language);
  render();
  showMessage("Settings saved.");
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
    startDate: String(form.get("startDate") || ""),
    endDate: String(form.get("endDate") || ""),
    instructions: String(form.get("instructions") || "").trim()
  };
  if (!medicine.name) return showMessage("Enter the medicine name.");
  if (Boolean(medicine.startDate) !== Boolean(medicine.endDate)) return showMessage("Choose both schedule dates or leave both blank.");
  if (medicine.startDate && medicine.endDate && medicine.endDate < medicine.startDate) {
    return showMessage("The end date must be on or after the start date.");
  }
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
  state.introStep = 0;
  go("welcome");
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
  state.cameraMode = mode;
  render();
  try {
    state.camera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    const video = document.querySelector("#camera-video");
    if (!video) {
      stopCamera();
      state.cameraMode = "";
      render();
      showMessage("The camera view could not be opened. Please try again.");
      return;
    }
    video.srcObject = state.camera;
    await video.play();
    if (mode === "qr") {
      state.qrCanvas = document.createElement("canvas");
      if (!state.qrCanvas.getContext("2d", { willReadFrequently: true })) {
        throw new Error("QR scanning is unavailable in this browser.");
      }
      readQrFrame();
    }
  } catch (error) {
    stopCamera();
    state.cameraMode = "";
    render();
    showMessage(error.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings." : error.message || "Could not open the camera. Check that it is connected and try again.");
  }
}

function readQrFrame() {
  if (!state.camera || state.cameraMode !== "qr") return;
  const video = document.querySelector("#camera-video");
  if (video?.readyState >= 2 && video.videoWidth) {
    try {
      const scale = Math.min(1, 1280 / video.videoWidth);
      state.qrCanvas.width = Math.round(video.videoWidth * scale);
      state.qrCanvas.height = Math.round(video.videoHeight * scale);
      const context = state.qrCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Could not prepare the QR scanner.");
      context.drawImage(video, 0, 0, state.qrCanvas.width, state.qrCanvas.height);
      const pixels = context.getImageData(0, 0, state.qrCanvas.width, state.qrCanvas.height);
      const code = jsQR(pixels.data, pixels.width, pixels.height);
      if (code) {
        state.qrResult = code.data;
        state.cameraMode = "";
        stopCamera();
        return go("qr-result");
      }
    } catch (error) {
      stopCamera();
      state.cameraMode = "";
      render();
      showMessage(error.message || "Could not read that QR code. Try a clearer image.");
      return;
    }
  }
  if (state.camera && state.cameraMode === "qr") setTimeout(readQrFrame, 250);
}

async function captureImage() {
  const video = document.querySelector("#camera-video");
  if (!video || !video.videoWidth) return showMessage("Camera is not ready yet. Try again in a moment.");
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1600 / video.videoWidth);
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) {
    state.cameraMode = "";
    stopCamera();
    render();
    showMessage("Could not prepare the camera image. Please try again.");
    return;
  }
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    if (!blob) {
      state.cameraMode = "";
      stopCamera();
      render();
      showMessage("Could not save the camera image. Please try again.");
      return;
    }
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
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Could not prepare that photo. Try a different image.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
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
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Could not prepare that QR image.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(pixels.data, pixels.width, pixels.height);
    if (!code) return showMessage("No QR code found. Try a closer, clearer image.");
    state.qrResult = code.data;
    go("qr-result");
  } catch (error) {
    showMessage(error.message || "Could not read that QR image. Try a clearer photo.");
  } finally {
    bitmap?.close();
  }
}

function render() {
  stopCamera();
  if (state.route === "splash") app.innerHTML = splashPage();
  else if (state.route === "welcome") app.innerHTML = welcomePage();
  else if (state.route === "home") app.innerHTML = homePage();
  else if (state.route === "medicines") app.innerHTML = medicinesPage();
  else if (state.route === "scanner") app.innerHTML = scannerPage();
  else if (state.route === "scan-result") app.innerHTML = resultPage();
  else if (state.route === "add-medicine") app.innerHTML = addMedicinePage();
  else if (state.route === "qr-result") app.innerHTML = qrResultPage();
  else if (state.route === "feedback") app.innerHTML = feedbackPage();
  else if (state.route === "settings") app.innerHTML = settingsPage();

  lucide.createIcons();
  app.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button));
  });
  app.querySelector("#welcome-form")?.addEventListener("submit", saveProfile);
  app.querySelector("#settings-form")?.addEventListener("submit", saveSettings);
  app.querySelector("#medicine-form")?.addEventListener("submit", saveMedicine);
  app.querySelector("#feedback-form")?.addEventListener("submit", saveFeedback);
  app.querySelector("#medicine-photo")?.addEventListener("change", event => scanMedicine(event.target.files[0]));
  app.querySelector("#qr-photo")?.addEventListener("change", event => scanQrImage(event.target.files[0]));
}

render();
setTimeout(() => {
  if (state.route !== "splash") return;
  state.route = localStorage.getItem(storage.consent) ? "home" : "welcome";
  render();
}, 1200);
