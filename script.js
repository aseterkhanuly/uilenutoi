/*
  Негізгі параметрлер:
  1) Фондық музыка: audio/music.mp3
  2) Мейрамхана суреті: images/venue.jpg
  3) Google Maps сілтемесін index.html ішінде екі жерден ауыстырыңыз.
  4) RSVP-ті Google Sheets-ке жазу үшін FORM_ENDPOINT-ке Apps Script Web App URL қойыңыз.
*/

const FORM_ENDPOINT = ""; // мысалы: https://script.google.com/macros/s/XXXXX/exec

const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("formStatus");

let musicStarted = false;

musicBtn.addEventListener("click", async () => {
  try {
    if (music.paused) {
      await music.play();
      musicStarted = true;
      musicBtn.classList.add("playing");
      musicBtn.setAttribute("aria-label", "Музыканы өшіру");
    } else {
      music.pause();
      musicBtn.classList.remove("playing");
      musicBtn.setAttribute("aria-label", "Музыканы қосу");
    }
  } catch {
    // Браузер autoplay-ды бұғаттаса, қолданушы батырманы қайта баса алады.
  }
});

// Бірінші touch/click кезінде музыканы ақырын бастау.
async function startMusicOnce() {
  if (musicStarted) return;
  try {
    music.volume = 0.65;
    await music.play();
    musicStarted = true;
    musicBtn.classList.add("playing");
  } catch {}
}
document.addEventListener("pointerdown", startMusicOnce, { once: true });

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((el, index) => {
  if (index === 0) {
    requestAnimationFrame(() => el.classList.add("visible"));
  } else {
    observer.observe(el);
  }
});

// RSVP
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitBtn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());

  data.createdAt = new Date().toISOString();

  submitBtn.disabled = true;
  statusEl.textContent = "Жіберіліп жатыр...";

  try {
    // Endpoint көрсетілмесе, тест режимінде браузерге сақтаймыз.
    if (!FORM_ENDPOINT) {
      const saved = JSON.parse(localStorage.getItem("wedding_rsvp") || "[]");
      saved.push(data);
      localStorage.setItem("wedding_rsvp", JSON.stringify(saved));

      statusEl.textContent = "Рақмет! Жауабыңыз сақталды.";
      form.reset();
      return;
    }

    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    statusEl.textContent = "Рақмет! Жауабыңыз жіберілді.";
    form.reset();
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Қате шықты. Кейінірек қайталап көріңіз.";
  } finally {
    submitBtn.disabled = false;
  }
});
