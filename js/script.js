/* ==========================================================
   For My Pappa — behaviour
   ========================================================== */

/* ✏️ Easy customisation -------------------------------------
   photo:        path to a photo, e.g. "images/pappa.jpg" ("" = no photo)
   photoCaption: short line shown under the photo ("" = none)
   music:        path to an audio file, e.g. "music/soft-piano.mp3".
                 Leave "" to use the gentle built-in piano melody.
   musicStart:   second the song starts (and loops back to) — 86 is just
                 before the middle chorus of "Shower".
------------------------------------------------------------- */
const CONFIG = {
  photo: "",
  photoCaption: "",
  music: "music/shower.mp3",
  musicStart: 86,
  floatingHearts: 12,
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- floating hearts ---------- */
function createFloatingHearts() {
  if (reduceMotion) return;
  const layer = document.querySelector(".floating-hearts");
  const colors = ["#c98483", "#e3a9a4", "#c9a24a", "#d9b8a0"];
  const count = window.innerWidth < 600 ? Math.ceil(CONFIG.floatingHearts / 2) : CONFIG.floatingHearts;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    const duration = 16 + Math.random() * 12;
    heart.className = "floating-heart";
    heart.textContent = "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${10 + Math.random() * 14}px`;
    heart.style.color = colors[i % colors.length];
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${-Math.random() * duration}s`;
    heart.style.setProperty("--alpha", (0.18 + Math.random() * 0.2).toFixed(2));
    heart.style.setProperty("--drift", `${(Math.random() * 60 - 30).toFixed(0)}px`);
    layer.appendChild(heart);
  }
}

/* ---------- optional photo ---------- */
function setupPhoto() {
  if (!CONFIG.photo) return;
  const frame = document.getElementById("photoFrame");
  const img = document.getElementById("photo");
  img.addEventListener("load", () => { frame.hidden = false; });
  img.src = CONFIG.photo;
  document.getElementById("photoCaption").textContent = CONFIG.photoCaption;
}

/* ---------- reveal the letter ---------- */
function setupReveal() {
  const btn = document.getElementById("revealBtn");
  const letter = document.getElementById("letter");

  btn.addEventListener("click", () => {
    if (letter.hidden) {
      letter.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      // next frame so the animations start from their hidden state
      requestAnimationFrame(() => {
        requestAnimationFrame(() => letter.classList.add("is-open"));
      });
    }
    letter.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
}

/* ---------- reveal sections on scroll ---------- */
function setupScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  items.forEach((el) => observer.observe(el));
}

/* ---------- built-in soft piano (Web Audio, no files needed) ---------- */
class SoftPiano {
  constructor() {
    this.ctx = null;
    this.timer = null;
    this.step = 0;
    this.nextTime = 0;
    this.noteLength = 60 / 66 / 2; // eighth notes at 66 bpm
    // C – Am – F – G, each as MIDI notes [bass, …]
    this.chords = [
      [48, 55, 60, 64, 67],
      [45, 52, 57, 60, 64],
      [41, 48, 53, 57, 60],
      [43, 50, 55, 59, 62],
    ];
    this.pattern = [0, 1, 2, 3, 4, 3, 2, 1];
  }

  init() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1800;

    // a touch of echo for warmth
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.38;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.28;

    this.master.connect(lowpass);
    lowpass.connect(this.ctx.destination);
    lowpass.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.ctx.destination);
  }

  freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  playNote(midi, time, volume) {
    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = this.freq(midi);
    overtone.type = "triangle";
    overtone.frequency.value = this.freq(midi) * 2;
    overtoneGain.gain.value = 0.15;

    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(volume, time + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 2.6);

    osc.connect(env);
    overtone.connect(overtoneGain).connect(env);
    env.connect(this.master);

    osc.start(time);
    overtone.start(time);
    osc.stop(time + 2.7);
    overtone.stop(time + 2.7);
  }

  schedule() {
    while (this.nextTime < this.ctx.currentTime + 0.3) {
      const chord = this.chords[Math.floor(this.step / 16) % this.chords.length];
      const index = this.pattern[this.step % this.pattern.length];
      this.playNote(chord[index], this.nextTime, index === 0 ? 0.5 : 0.32);
      this.nextTime += this.noteLength;
      this.step++;
    }
  }

  async play() {
    if (!this.ctx) this.init();
    await this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.14, now + 2);
    this.nextTime = now + 0.1;
    this.timer = setInterval(() => this.schedule(), 100);
  }

  pause() {
    clearInterval(this.timer);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.6);
    setTimeout(() => this.ctx.suspend(), 700);
  }
}

/* ---------- audio file player (when CONFIG.music is set) ---------- */
class FilePlayer {
  constructor(src, start = 0) {
    this.start = start;
    this.started = false;
    this.volume = 0.6;
    this.audio = new Audio(src);
    this.audio.preload = "auto";
    // loop back to the chosen moment, not the very beginning
    this.audio.addEventListener("ended", () => {
      this.audio.currentTime = this.start;
      this.audio.play();
    });
  }

  async play() {
    if (!this.started) {
      if (this.audio.readyState < 1) {
        await new Promise((resolve) =>
          this.audio.addEventListener("loadedmetadata", resolve, { once: true }));
      }
      this.audio.currentTime = this.start;
      this.started = true;
    }
    this.audio.volume = 0;
    await this.audio.play();
    this.fade(this.volume, 2000);
  }

  pause() {
    this.fade(0, 600, () => this.audio.pause());
  }

  fade(target, ms, done) {
    clearInterval(this.fadeTimer);
    const from = this.audio.volume;
    const t0 = performance.now();
    this.fadeTimer = setInterval(() => {
      const k = Math.min((performance.now() - t0) / ms, 1);
      this.audio.volume = from + (target - from) * k;
      if (k === 1) {
        clearInterval(this.fadeTimer);
        if (done) done();
      }
    }, 30);
  }
}

/* ---------- music button ---------- */
function setupMusic() {
  const btn = document.getElementById("musicBtn");
  let player = null;
  let playing = false;

  btn.addEventListener("click", async () => {
    // Created only on first press, so nothing ever plays by itself
    if (!player) player = CONFIG.music ? new FilePlayer(CONFIG.music, CONFIG.musicStart) : new SoftPiano();

    try {
      if (playing) {
        player.pause();
      } else {
        await player.play();
      }
      playing = !playing;
      btn.setAttribute("aria-pressed", String(playing));
      btn.setAttribute("aria-label", playing ? "Pause music" : "Play soft music");
    } catch (err) {
      console.warn("Music could not start:", err);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createFloatingHearts();
  setupPhoto();
  setupReveal();
  setupScrollReveal();
  setupMusic();
});
