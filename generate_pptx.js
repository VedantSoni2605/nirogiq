const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

async function createDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Vedant Soni";
  pres.company = "NirogiQ";
  pres.title = "NirogiQ — Care, with clarity";

  // Color Palette
  const THEME = {
    bg: "0B132B",
    cardBg: "1C2541",
    cardBorder: "3A506B",
    primary: "38BDF8",     // Electric Blue
    primaryDark: "0284C7",
    accent: "34D399",      // Mint Green
    warning: "FBBF24",     // Amber
    white: "FFFFFF",
    muted: "94A3B8",
    lightSlate: "CBD5E1"
  };

  const videoPath = path.resolve(__dirname, "public/assets/demo_video.mp4");
  const hasVideo = fs.existsSync(videoPath);
  console.log("Video file exists:", hasVideo, videoPath);

  // Helper for Slide Background
  function setupSlide(slide, categoryText) {
    slide.background = { color: THEME.bg };

    // Top Category / Badge Pill
    if (categoryText) {
      slide.addText(categoryText.toUpperCase(), {
        x: 0.8, y: 0.45, w: 5.0, h: 0.35,
        fontSize: 10, bold: true, color: THEME.primary,
        fontFace: "Segoe UI", charSpacing: 3
      });
    }

    // Bottom Subtle Footer
    slide.addText("NirogiQ  ·  AI Medicine Companion  ·  nirogiq.vercel.app", {
      x: 0.8, y: 7.0, w: 8.0, h: 0.3,
      fontSize: 9, color: "64748B", fontFace: "Segoe UI"
    });
  }

  // ==========================================
  // SLIDE 1: TITLE & TECHNICAL THINGS USED
  // ==========================================
  {
    const slide = pres.addSlide();
    setupSlide(slide, "Slide 01 · System Architecture & Tech Stack");

    slide.addText("NirogiQ — Technical Foundation", {
      x: 0.8, y: 0.85, w: 11.5, h: 0.7,
      fontSize: 32, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("Production-grade architecture designed for sub-second vision inference, multilingual voice, and 100% on-device privacy.", {
      x: 0.8, y: 1.55, w: 11.5, h: 0.45,
      fontSize: 13, color: THEME.muted, fontFace: "Segoe UI"
    });

    const techCards = [
      {
        title: "1. Google Gemini 3.5 Flash Multimodal AI",
        desc: "Vision inference pipeline with automated model fallback (3.5-Flash, Flash-Lite). High-precision OCR extracts medicine brand, strength (mg/ml), active salt, and manufacturer from shiny blister packs.",
        badge: "AI VISION ENGINE",
        color: THEME.primary
      },
      {
        title: "2. Serverless Node.js Microservice (Vercel Edge)",
        desc: "Stateless /api/scan-image endpoint deployed globally with input validation, payload compression (max 8MB), strict CORS/CSP security headers, and zero key-exposure to client browsers.",
        badge: "BACKEND API",
        color: THEME.accent
      },
      {
        title: "3. Pure Client-Side QR Engine (jsQR)",
        desc: "In-browser QR code matrix extraction running directly on HTML5 Video canvas frames with zero external API dependencies or latency, enabling instant batch & product authenticity lookup.",
        badge: "SCANNING ENGINE",
        color: THEME.warning
      },
      {
        title: "4. Web Speech API (Multilingual TTS)",
        desc: "Native browser speech synthesis calibrated at a gentle 0.88x speed for elderly comprehension. Full localized pronunciation in English (en-IN), Hindi (hi-IN), and Punjabi (pa-IN).",
        badge: "ACCESSIBILITY",
        color: THEME.primary
      },
      {
        title: "5. Zero-Knowledge On-Device Storage",
        desc: "Personal profiles, medicine routines, dates, and feedback notes stay strictly inside the client's localStorage. Zero centralized database liabilities, zero risk of patient health record leaks.",
        badge: "PRIVACY FIRST",
        color: THEME.accent
      },
      {
        title: "6. Progressive Web App (PWA) Standard",
        desc: "Responsive mobile-first shell with Web Manifest, touch gestures, standalone display mode, and instant home-screen installability across iOS Safari, Android Chrome, and Desktop.",
        badge: "FRONTEND STACK",
        color: THEME.warning
      }
    ];

    techCards.forEach((c, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.8 + col * 3.95;
      const y = 2.2 + row * 2.3;

      slide.addShape(pres.ShapeType.roundRect, {
        x, y, w: 3.75, h: 2.15,
        fill: { color: THEME.cardBg },
        line: { color: THEME.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      slide.addText(c.badge, {
        x: x + 0.25, y: y + 0.2, w: 3.25, h: 0.25,
        fontSize: 9, bold: true, color: c.color, fontFace: "Segoe UI"
      });

      slide.addText(c.title, {
        x: x + 0.25, y: y + 0.5, w: 3.25, h: 0.45,
        fontSize: 12, bold: true, color: THEME.white, fontFace: "Segoe UI"
      });

      slide.addText(c.desc, {
        x: x + 0.25, y: y + 1.0, w: 3.25, h: 1.05,
        fontSize: 10, color: THEME.muted, fontFace: "Segoe UI", lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 2: INTEGRATED DEMO VIDEO
  // ==========================================
  {
    const slide = pres.addSlide();
    setupSlide(slide, "Slide 02 · Live Product Demonstration");

    slide.addText("See NirogiQ in Action", {
      x: 0.8, y: 0.85, w: 11.5, h: 0.6,
      fontSize: 30, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("Watch the real-time AI medicine label scanner extract packaging data in seconds.", {
      x: 0.8, y: 1.45, w: 11.5, h: 0.4,
      fontSize: 13, color: THEME.muted, fontFace: "Segoe UI"
    });

    // Embed Video on Left/Center
    if (hasVideo) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.75, y: 2.05, w: 7.5, h: 4.65,
        fill: { color: "000000" },
        line: { color: THEME.primary, width: 2 },
        rectRadius: 0.15
      });

      slide.addMedia({
        type: "video",
        path: videoPath,
        x: 0.8, y: 2.1, w: 7.4, h: 4.55
      });
    }

    // Side Cards with Explanations
    const sideX = 8.5;
    const cards = [
      {
        num: "01",
        title: "Snap or Upload Pack",
        desc: "User holds any blister foil or bottle in front of camera. Even shiny, crumpled, or curved foil is captured."
      },
      {
        num: "02",
        title: "Instant Gemini AI Extraction",
        desc: "Gemini 3.5 Flash identifies brand name, milligram strength, and active salt with readability confidence grading."
      },
      {
        num: "03",
        title: "1-Tap Routine Add",
        desc: "Extracted information is reviewed and saved straight to the patient's schedule without manual typing."
      }
    ];

    cards.forEach((item, idx) => {
      const y = 2.1 + idx * 1.55;
      slide.addShape(pres.ShapeType.roundRect, {
        x: sideX, y, w: 3.8, h: 1.4,
        fill: { color: THEME.cardBg },
        line: { color: THEME.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      slide.addText(item.num, {
        x: sideX + 0.2, y: y + 0.15, w: 0.5, h: 0.4,
        fontSize: 16, bold: true, color: THEME.primary, fontFace: "Segoe UI"
      });

      slide.addText(item.title, {
        x: sideX + 0.75, y: y + 0.15, w: 2.85, h: 0.4,
        fontSize: 12, bold: true, color: THEME.white, fontFace: "Segoe UI"
      });

      slide.addText(item.desc, {
        x: sideX + 0.2, y: y + 0.6, w: 3.4, h: 0.75,
        fontSize: 10, color: THEME.muted, fontFace: "Segoe UI", lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 3: KEEP IT VERY VERY SIMPLE (User Spec)
  // ==========================================
  {
    const slide = pres.addSlide();
    setupSlide(slide, "Slide 03 · User Flow & Alarm Function");

    slide.addText("How It Works — Simple as 1, 2, 3", {
      x: 0.8, y: 0.85, w: 11.5, h: 0.6,
      fontSize: 32, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("No account needed. No complex medical jargon. Clear everyday care in three quick steps.", {
      x: 0.8, y: 1.5, w: 11.5, h: 0.4,
      fontSize: 14, color: THEME.muted, fontFace: "Segoe UI"
    });

    const simpleSteps = [
      {
        step: "STEP 1",
        title: "Scan Medicine",
        iconText: "📸",
        desc: "Take a picture of your medicine box or scan its QR code.",
        detail: "The AI reads the exact name and dosage strength for you."
      },
      {
        step: "STEP 2",
        title: "Set Time & Alarm",
        iconText: "⏰",
        desc: "Choose the time on your prescription (e.g. 8:00 AM).",
        detail: "Add optional start and finish dates for short-term courses."
      },
      {
        step: "STEP 3",
        title: "Hear It & Never Miss",
        iconText: "🔊",
        desc: "Tap the speaker button to hear instructions read aloud.",
        detail: "The Home screen always shows your immediate NEXT dose."
      }
    ];

    simpleSteps.forEach((s, idx) => {
      const x = 0.8 + idx * 3.95;
      const y = 2.3;

      slide.addShape(pres.ShapeType.roundRect, {
        x, y, w: 3.75, h: 4.3,
        fill: { color: THEME.cardBg },
        line: { color: idx === 1 ? THEME.primary : THEME.cardBorder, width: idx === 1 ? 2 : 1 },
        rectRadius: 0.15
      });

      slide.addText(s.iconText, {
        x, y: y + 0.35, w: 3.75, h: 0.6,
        fontSize: 32, align: "center"
      });

      slide.addText(s.step, {
        x, y: y + 1.1, w: 3.75, h: 0.3,
        fontSize: 11, bold: true, color: THEME.primary, align: "center", fontFace: "Segoe UI", charSpacing: 2
      });

      slide.addText(s.title, {
        x, y: y + 1.45, w: 3.75, h: 0.5,
        fontSize: 20, bold: true, color: THEME.white, align: "center", fontFace: "Segoe UI"
      });

      slide.addText(s.desc, {
        x: x + 0.3, y: y + 2.15, w: 3.15, h: 0.8,
        fontSize: 12, color: THEME.lightSlate, align: "center", fontFace: "Segoe UI", lineSpacingMultiple: 1.2
      });

      slide.addShape(pres.ShapeType.line, {
        x: x + 0.8, y: y + 3.05, w: 2.15, h: 0,
        line: { color: THEME.cardBorder, width: 1 }
      });

      slide.addText(s.detail, {
        x: x + 0.3, y: y + 3.25, w: 3.15, h: 0.8,
        fontSize: 11, color: THEME.muted, align: "center", fontFace: "Segoe UI", lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 4: MULTILINGUAL ACCESSIBILITY
  // ==========================================
  {
    const slide = pres.addSlide();
    setupSlide(slide, "Slide 04 · Voice Accessibility & Inclusivity");

    slide.addText("Care That Speaks Your Language", {
      x: 0.8, y: 0.85, w: 11.5, h: 0.6,
      fontSize: 30, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("Bridging the literacy and language divide for elderly patients and rural households.", {
      x: 0.8, y: 1.45, w: 11.5, h: 0.4,
      fontSize: 13, color: THEME.muted, fontFace: "Segoe UI"
    });

    const langs = [
      {
        lang: "English (en-IN)",
        icon: "🇬🇧",
        sample: '"Medicine Paracetamol 500 mg. Reminder time 08:00 AM. Take after food as directed."',
        role: "Universal clear cadence for urban patients & caregivers."
      },
      {
        lang: "Hindi · हिंदी (hi-IN)",
        icon: "🇮🇳",
        sample: '"आपकी दवा पैरासिटामोल 500 मिलीग्राम। समय सुबह 08:00 बजे। भोजन के बाद लें।"',
        role: "Reaches 600M+ native Hindi speakers across India."
      },
      {
        lang: "Punjabi · ਪੰਜਾਬੀ (pa-IN)",
        icon: "🇮🇳",
        sample: '"ਤੁਹਾਡੀ ਦਵਾਈ ਪੈਰਾਸੀਟਾਮੋਲ 500 ਮਿਲੀਗ੍ਰਾਮ। ਸਮਾਂ ਸਵੇਰੇ 08:00 ਵਜੇ। ਖਾਣੇ ਤੋਂ ਬਾਅਦ ਲਵੋ।"',
        role: "Dedicated local dialect support for northern regions."
      }
    ];

    langs.forEach((l, idx) => {
      const x = 0.8 + idx * 3.95;
      const y = 2.1;

      slide.addShape(pres.ShapeType.roundRect, {
        x, y, w: 3.75, h: 4.5,
        fill: { color: THEME.cardBg },
        line: { color: THEME.cardBorder, width: 1 },
        rectRadius: 0.15
      });

      slide.addText(l.icon + "  " + l.lang, {
        x: x + 0.25, y: y + 0.3, w: 3.25, h: 0.4,
        fontSize: 14, bold: true, color: THEME.white, fontFace: "Segoe UI"
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: x + 0.25, y: y + 0.85, w: 3.25, h: 2.1,
        fill: { color: "0F172A" },
        line: { color: THEME.cardBorder, width: 1 },
        rectRadius: 0.1
      });

      slide.addText("AUDIO PREVIEW", {
        x: x + 0.4, y: y + 1.0, w: 2.95, h: 0.25,
        fontSize: 8, bold: true, color: THEME.primary, fontFace: "Segoe UI"
      });

      slide.addText(l.sample, {
        x: x + 0.4, y: y + 1.3, w: 2.95, h: 1.5,
        fontSize: 11, italic: true, color: THEME.lightSlate, fontFace: "Segoe UI", lineSpacingMultiple: 1.2
      });

      slide.addText(l.role, {
        x: x + 0.25, y: y + 3.15, w: 3.25, h: 1.1,
        fontSize: 10, color: THEME.muted, fontFace: "Segoe UI", lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 5: BUSINESS MODEL (User Spec)
  // ==========================================
  {
    const slide = pres.addSlide();
    setupSlide(slide, "Slide 05 · Sustainable Monetization");

    slide.addText("The Business Model & Revenue Strategy", {
      x: 0.8, y: 0.85, w: 11.5, h: 0.6,
      fontSize: 30, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("A high-margin B2B & B2C dual revenue model targeting pharmacies, hospitals, and family caregivers.", {
      x: 0.8, y: 1.45, w: 11.5, h: 0.4,
      fontSize: 13, color: THEME.muted, fontFace: "Segoe UI"
    });

    const revenueStreams = [
      {
        title: "1. B2B Pharmacy White-Label SDK",
        type: "PRIMARY REVENUE",
        target: "Pharmacy Chains (Apollo, Tata 1mg, CVS, Boots)",
        pricing: "SaaS API Subscription ($0.02 - $0.05 / scan)",
        desc: "Retail pharmacies embed NirogiQ's Gemini vision scanner into their customer apps, enabling automatic 1-tap refill scanning."
      },
      {
        title: "2. B2C Caregiver Premium (NirogiQ Family)",
        type: "SUBSCRIPTION",
        target: "Sons, Daughters & Remote Caregivers",
        pricing: "$2.99 / month or $24.99 / year",
        desc: "Free core app for patients. Premium tier unlocks remote adherence dashboard, SMS alerts when parents miss doses, and doctor export reports."
      },
      {
        title: "3. Hospital Discharge Integration",
        type: "ENTERPRISE CONTRACTS",
        target: "Private Hospitals & Post-Op Clinics",
        pricing: "Annual Site Licenses ($5k - $20k / hospital)",
        desc: "Hospitals provide NirogiQ QR cards in discharge summaries so post-op patients hear and track recovery regimens accurately at home."
      },
      {
        title: "4. Pharma Packaging Legibility Analytics",
        type: "DATA INSIGHTS",
        target: "Pharmaceutical Manufacturers",
        pricing: "Enterprise Anonymized Reports",
        desc: "Aggregated, privacy-compliant readability metrics highlight which medicine foil typography causes patient confusion in real-world usage."
      }
    ];

    revenueStreams.forEach((r, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 2.1 + row * 2.35;

      slide.addShape(pres.ShapeType.roundRect, {
        x, y, w: 5.75, h: 2.2,
        fill: { color: THEME.cardBg },
        line: { color: THEME.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      slide.addText(r.type, {
        x: x + 0.3, y: y + 0.2, w: 5.15, h: 0.25,
        fontSize: 9, bold: true, color: idx === 0 ? THEME.primary : THEME.accent, fontFace: "Segoe UI"
      });

      slide.addText(r.title, {
        x: x + 0.3, y: y + 0.45, w: 5.15, h: 0.4,
        fontSize: 14, bold: true, color: THEME.white, fontFace: "Segoe UI"
      });

      slide.addText("TARGET: " + r.target + "   |   MODEL: " + r.pricing, {
        x: x + 0.3, y: y + 0.9, w: 5.15, h: 0.35,
        fontSize: 9, bold: true, color: THEME.warning, fontFace: "Segoe UI"
      });

      slide.addText(r.desc, {
        x: x + 0.3, y: y + 1.25, w: 5.15, h: 0.8,
        fontSize: 10, color: THEME.muted, fontFace: "Segoe UI", lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 6: COMPETITIVE MOAT & MARKET FIT
  // ==========================================
  {
    const slide = pres.addSlide();
    setupSlide(slide, "Slide 06 · Market Traction & Competitive Advantage");

    slide.addText("Why NirogiQ Wins Over Generic Apps", {
      x: 0.8, y: 0.85, w: 11.5, h: 0.6,
      fontSize: 30, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("Removing friction and barriers that cause traditional healthcare apps to be abandoned.", {
      x: 0.8, y: 1.45, w: 11.5, h: 0.4,
      fontSize: 13, color: THEME.muted, fontFace: "Segoe UI"
    });

    const pillars = [
      {
        metric: "10x",
        label: "Faster than Manual Typing",
        detail: "Patients never have to spell difficult generic chemical names like 'Amoxicillin Trihydrate' or 'Levothyroxine Sodium'."
      },
      {
        metric: "0",
        label: "Account Barriers",
        detail: "No mandatory account creation, email passwords, or OTP verifications before emergency or daily medication checks."
      },
      {
        metric: "100%",
        label: "On-Device Data Sovereignty",
        detail: "Zero risk of patient health record leaks because sensitive prescription schedules never leave the patient's phone."
      },
      {
        metric: "$0",
        label: "Hardware Cost",
        detail: "Works on any existing Android or iOS smartphone browser without requiring expensive proprietary smart pillboxes."
      }
    ];

    pillars.forEach((p, idx) => {
      const x = 0.8 + idx * 2.95;
      const y = 2.2;

      slide.addShape(pres.ShapeType.roundRect, {
        x, y, w: 2.75, h: 4.4,
        fill: { color: THEME.cardBg },
        line: { color: THEME.cardBorder, width: 1 },
        rectRadius: 0.15
      });

      slide.addText(p.metric, {
        x, y: y + 0.4, w: 2.75, h: 0.8,
        fontSize: 36, bold: true, color: THEME.primary, align: "center", fontFace: "Segoe UI"
      });

      slide.addText(p.label, {
        x: x + 0.2, y: y + 1.3, w: 2.35, h: 0.6,
        fontSize: 13, bold: true, color: THEME.white, align: "center", fontFace: "Segoe UI"
      });

      slide.addShape(pres.ShapeType.line, {
        x: x + 0.5, y: y + 2.1, w: 1.75, h: 0,
        line: { color: THEME.cardBorder, width: 1 }
      });

      slide.addText(p.detail, {
        x: x + 0.2, y: y + 2.35, w: 2.35, h: 1.8,
        fontSize: 10, color: THEME.muted, align: "center", fontFace: "Segoe UI", lineSpacingMultiple: 1.2
      });
    });
  }

  // ==========================================
  // SLIDE 7: THANK YOU & Q/A (User Spec)
  // ==========================================
  {
    const slide = pres.addSlide();
    setupSlide(slide, "Slide 07 · Conclusion & Questions");

    slide.addText("Thank You!", {
      x: 0.8, y: 1.2, w: 11.5, h: 1.0,
      fontSize: 44, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("Care, with clarity. Empowering patients with intelligent vision, simple routines, and native voice care.", {
      x: 0.8, y: 2.25, w: 11.5, h: 0.5,
      fontSize: 16, color: THEME.primary, fontFace: "Segoe UI"
    });

    // Big Question Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 3.1, w: 6.8, h: 3.4,
      fill: { color: THEME.cardBg },
      line: { color: THEME.primary, width: 1.5 },
      rectRadius: 0.15
    });

    slide.addText("OPEN FOR JUDGES' QUESTIONS", {
      x: 1.1, y: 3.4, w: 6.2, h: 0.35,
      fontSize: 11, bold: true, color: THEME.accent, fontFace: "Segoe UI", charSpacing: 2
    });

    slide.addText("Any Doubts, Clinical Queries, or Feedback?", {
      x: 1.1, y: 3.8, w: 6.2, h: 0.6,
      fontSize: 22, bold: true, color: THEME.white, fontFace: "Segoe UI"
    });

    slide.addText("We welcome inquiries regarding clinical safety guardrails, offline deployment models, pilot partnerships with healthcare providers, and vision OCR benchmark data.", {
      x: 1.1, y: 4.5, w: 6.2, h: 1.6,
      fontSize: 12, color: THEME.muted, fontFace: "Segoe UI", lineSpacingMultiple: 1.25
    });

    // Links & Contacts on Right
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.9, y: 3.1, w: 4.4, h: 3.4,
      fill: { color: THEME.cardBg },
      line: { color: THEME.cardBorder, width: 1 },
      rectRadius: 0.15
    });

    slide.addText("PROJECT & LIVE DEMO LINKS", {
      x: 8.2, y: 3.4, w: 3.8, h: 0.35,
      fontSize: 10, bold: true, color: THEME.primary, fontFace: "Segoe UI", charSpacing: 1.5
    });

    const links = [
      { label: "LIVE WEB APPLICATION", val: "https://nirogiq.vercel.app" },
      { label: "SLIDE PRESENTATION", val: "https://nirogiq.vercel.app/slides.html" },
      { label: "GITHUB REPOSITORY", val: "github.com/VedantSoni2605/nirogiq" },
      { label: "FOUNDER & DEVELOPER", val: "Vedant Soni" }
    ];

    links.forEach((lk, idx) => {
      const y = 3.85 + idx * 0.62;
      slide.addText(lk.label, {
        x: 8.2, y, w: 3.8, h: 0.2,
        fontSize: 8, bold: true, color: THEME.muted, fontFace: "Segoe UI"
      });
      slide.addText(lk.val, {
        x: 8.2, y: y + 0.18, w: 3.8, h: 0.35,
        fontSize: 11, bold: true, color: THEME.white, fontFace: "Segoe UI"
      });
    });
  }

  // Save to multiple locations so the user has it on Desktop, project, and web
  const desktopPath = "C:/Users/Asus/OneDrive/Desktop/NirogiQ_Pitch_Deck.pptx";
  const projectPath = path.resolve(__dirname, "NirogiQ_Pitch_Deck.pptx");
  const publicPath = path.resolve(__dirname, "public/NirogiQ_Pitch_Deck.pptx");

  await pres.writeFile({ fileName: projectPath });
  console.log("Saved to:", projectPath);

  try {
    fs.copyFileSync(projectPath, desktopPath);
    console.log("Saved to Desktop:", desktopPath);
  } catch (e) {
    console.warn("Could not copy to desktop:", e.message);
  }

  try {
    fs.copyFileSync(projectPath, publicPath);
    console.log("Saved to public folder for web download:", publicPath);
  } catch (e) {
    console.warn("Could not copy to public:", e.message);
  }
}

createDeck().catch(console.error);
