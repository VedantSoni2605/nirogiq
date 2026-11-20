const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
loadEnvFile();

const PORT = Number(process.env.PORT) || 3000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function loadEnvFile() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(data));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    let tooLarge = false;
    request.setEncoding("utf8");
    request.on("data", chunk => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_IMAGE_BYTES * 1.5) tooLarge = true;
      else if (!tooLarge) body += chunk;
    });
    request.on("end", () => {
      if (tooLarge) return reject(new Error("Image is too large. Choose a smaller photo."));
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("The scan request was not valid."));
      }
    });
    request.on("error", reject);
  });
}

function safeText(value, maxLength = 400) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function scanImage(request, response) {
  if (!process.env.GEMINI_API_KEY) {
    return sendJson(response, 503, { error: "Gemini is not configured. Add GEMINI_API_KEY to your local .env file and restart Vedhita." });
  }
  if (!request.headers["content-type"]?.includes("application/json")) {
    return sendJson(response, 415, { error: "The scan must be sent as JSON." });
  }

  let input;
  try {
    input = await readJson(request);
  } catch (error) {
    return sendJson(response, 400, { error: error.message });
  }

  const image = typeof input.image === "string" ? input.image : "";
  const mimeType = input.mimeType;
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType) || !image || image.length > MAX_IMAGE_BYTES * 1.4) {
    return sendJson(response, 400, { error: "Choose a JPG, PNG, or WebP image smaller than 8 MB." });
  }

  try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Read only the text that is visibly printed on this medicine package. Do not identify pills from appearance, guess missing details, give medical advice, recommend a medicine, or recommend a dose. Return one JSON object with string fields name, strength, activeIngredient, manufacturer, otherText, notes. Use an empty string for anything unreadable. In notes, briefly say if the image is blurry or information is uncertain. This is label transcription only." },
            { inline_data: { mime_type: mimeType, data: image } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    if (!result.ok) {
      console.error(`Gemini request failed with status ${result.status}.`);
      return sendJson(response, 502, { error: "Gemini could not read this photo. Please try again with a clearer image." });
    }

    const payload = await result.json();
    const text = payload.candidates?.[0]?.content?.parts?.find(part => part.text)?.text;
    if (!text) return sendJson(response, 502, { error: "Gemini did not return readable label information. Please try again." });
    const parsed = JSON.parse(text);
    return sendJson(response, 200, {
      name: safeText(parsed.name, 120),
      strength: safeText(parsed.strength, 80),
      activeIngredient: safeText(parsed.activeIngredient, 160),
      manufacturer: safeText(parsed.manufacturer, 120),
      otherText: safeText(parsed.otherText, 400),
      notes: safeText(parsed.notes, 240)
    });
  } catch (error) {
    console.error("Medicine label scan failed:", error.name || "UnknownError");
    const message = error.name === "TimeoutError"
      ? "The scan took too long. Check your connection and try again."
      : "Could not connect to Gemini. Check your connection and try again.";
    return sendJson(response, 502, { error: message });
  }
}

function serveFile(request, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith("."))) {
    response.writeHead(404).end("Not found");
    return;
  }

  fs.stat(filePath, (error, info) => {
    if (error || !info.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'self'; img-src 'self' blob: data:; media-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    });
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/scan-image") return scanImage(request, response);
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD, POST" }).end("Method not allowed");
    return;
  }
  serveFile(request, response);
});

server.listen(PORT, () => {
  console.log(`Vedhita is running at http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) console.log("Gemini is not configured. Add a GEMINI_API_KEY to .env to enable label reading.");
});
