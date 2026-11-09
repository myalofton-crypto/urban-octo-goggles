/*
 * Interactive Cooking Assistant prototype.
 * No build step and no dependencies. Voice uses the browser's Web Speech API,
 * so recognition works best in Chrome and Edge. Every voice command also has
 * an on-screen button or can be typed into the command box.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "cookingAssistant.profile";
  const HANDS_FREE_KEY = "cookingAssistant.handsFree";

  const DEFAULT_PROFILE = { name: "", skill: "beginner", diet: [], allergy: [], speak: true };

  const state = {
    profile: loadProfile(),
    recipe: null,
    servings: 4,
    step: 0,
    timers: [],
    listening: false,
    handsFree: localStorage.getItem(HANDS_FREE_KEY) === "1",
    wakeLock: null
  };

  const $ = (id) => document.getElementById(id);

  // ---------- Profile ----------
  function loadProfile() {
    try {
      return Object.assign({}, DEFAULT_PROFILE, JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
    } catch (_) {
      return Object.assign({}, DEFAULT_PROFILE);
    }
  }

  function saveProfile(p) {
    state.profile = p;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  function openProfile() {
    const form = $("profileForm");
    const p = state.profile;
    form.name.value = p.name;
    form.querySelectorAll('[name="skill"]').forEach((el) => (el.checked = el.value === p.skill));
    form.querySelectorAll('[name="diet"]').forEach((el) => (el.checked = p.diet.includes(el.value)));
    form.querySelectorAll('[name="allergy"]').forEach((el) => (el.checked = p.allergy.includes(el.value)));
    form.speak.checked = p.speak;
    $("profileDialog").showModal();
  }

  function readProfileForm() {
    const form = $("profileForm");
    const checked = (name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map((el) => el.value);
    return {
      name: form.name.value.trim(),
      skill: (checked("skill")[0]) || "beginner",
      diet: checked("diet"),
      allergy: checked("allergy"),
      speak: form.speak.checked
    };
  }

  /** Returns the reasons an ingredient conflicts with the cook's profile. */
  function conflictsFor(ing) {
    const p = state.profile;
    const reasons = [];
    (ing.allergens || []).forEach((a) => { if (p.allergy.includes(a)) reasons.push(`${a} allergy`); });
    (ing.diet || []).forEach((d) => { if (p.diet.includes(d)) reasons.push(`not ${d}`); });
    return reasons;
  }

  // ---------- Formatting ----------
  const FRACTIONS = [[0, ""], [0.25, "¼"], [0.333, "⅓"], [0.5, "½"], [0.667, "⅔"], [0.75, "¾"], [1, ""]];
  const SPOKEN_FRACTIONS = { "¼": "a quarter", "⅓": "a third", "½": "a half", "⅔": "two thirds", "¾": "three quarters" };

  function formatQty(n) {
    if (n == null) return "";
    let whole = Math.floor(n);
    const rest = n - whole;
    let best = FRACTIONS[0];
    FRACTIONS.forEach((f) => { if (Math.abs(f[0] - rest) < Math.abs(best[0] - rest)) best = f; });
    if (best[0] === 1) { whole += 1; best = FRACTIONS[0]; }
    if (whole === 0 && !best[1]) return "a pinch of";
    return `${whole || ""}${best[1]}`;
  }

  function spokenQty(n) {
    const text = formatQty(n);
    return text.replace(/(\d*)([¼⅓½⅔¾])/, (_, w, f) => (w ? `${w} and ${SPOKEN_FRACTIONS[f]}` : SPOKEN_FRACTIONS[f]));
  }

  // Items counted whole (eggs, fillets, cans, cloves) round to a whole number.
  const COUNT_UNITS = ["", "cans", "cloves"];

  function scaled(ing) {
    if (ing.qty == null) return null;
    const q = (ing.qty * state.servings) / state.recipe.baseServings;
    return COUNT_UNITS.includes(ing.unit) ? Math.max(1, Math.round(q)) : q;
  }

  function ingredientLine(ing, spoken) {
    const q = scaled(ing);
    if (q == null) return ing.item;
    const qty = spoken ? spokenQty(q) : formatQty(q);
    return [qty, ing.unit, ing.item].filter(Boolean).join(" ");
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function spokenDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const parts = [];
    if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
    if (s) parts.push(`${s} second${s === 1 ? "" : "s"}`);
    return parts.join(" and ");
  }

  // ---------- Speech output ----------
  function speak(text, force) {
    if (!("speechSynthesis" in window)) return;
    if (!force && !state.profile.speak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  function hush() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  let toastTimer;
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 2600);
  }

  // ---------- Views ----------
  function show(view) {
    ["library", "overview", "cook"].forEach((v) => ($(`view-${v}`).hidden = v !== view));
    $("voiceDock").hidden = view !== "cook";
    if (view !== "cook") { stopListening(); hush(); }
    window.scrollTo(0, 0);
  }

  function renderLibrary() {
    const p = state.profile;
    $("greeting").textContent = p.name ? `Welcome back, ${p.name}` : "Welcome to the kitchen";
    $("recipeGrid").innerHTML = window.RECIPES.map((r) => {
      const flagged = r.ingredients.filter((i) => conflictsFor(i).length).length;
      return `
        <button class="card recipe-card" data-recipe="${r.id}">
          <p class="eyebrow">${r.difficulty} · ${r.time} min</p>
          <h2>${r.title}</h2>
          <p>${r.summary}</p>
          <div class="meta-row">
            ${r.tags.map((t) => `<span class="pill">${t}</span>`).join("")}
            ${flagged ? `<span class="pill pill-warn">${flagged} to swap for you</span>` : ""}
          </div>
        </button>`;
    }).join("");
  }

  function openRecipe(id) {
    const r = window.RECIPES.find((x) => x.id === id);
    if (!r) { location.hash = ""; return; }
    if (!state.recipe || state.recipe.id !== r.id) {
      state.recipe = r;
      state.servings = r.baseServings;
      state.step = 0;
    }
    renderOverview();
    show("overview");
  }

  function renderOverview() {
    const r = state.recipe;
    $("overviewMeta").textContent = `${r.difficulty} · ${r.time} minutes · ${r.steps.length} steps`;
    $("overviewTitle").textContent = r.title;
    $("overviewSummary").textContent = r.summary;
    $("servingsValue").textContent = state.servings;
    $("servingsDown").disabled = state.servings <= 1;

    $("ingredientList").innerHTML = r.ingredients.map((ing) => {
      const reasons = conflictsFor(ing);
      const q = scaled(ing);
      const qty = q == null ? "" : `<span class="qty">${formatQty(q)}${ing.unit ? " " + ing.unit : ""}</span> `;
      const flag = reasons.length
        ? `<span class="flag">Heads up: ${reasons.join(", ")}.${ing.swap ? ` Try <em>${ing.swap}</em>.` : ""}</span>`
        : "";
      return `<li>${qty}${ing.item}${flag}</li>`;
    }).join("");

    const flagged = r.ingredients.filter((i) => conflictsFor(i).length);
    const notes = $("profileNotes");
    if (flagged.length) {
      notes.hidden = false;
      notes.innerHTML = `<p><strong>Personalized for your kitchen.</strong> ${flagged.length} ingredient${flagged.length === 1 ? "" : "s"} ${flagged.length === 1 ? "needs" : "need"} a swap based on your profile. Suggestions appear in the list.</p>`;
    } else {
      notes.hidden = true;
    }
  }

  function setServings(n) {
    state.servings = Math.max(1, Math.min(24, n));
    renderOverview();
  }

  // ---------- Cook mode ----------
  function startCooking() {
    state.step = Math.min(state.step, state.recipe.steps.length - 1);
    $("cookTitle").textContent = state.recipe.title;
    show("cook");
    renderStep(true);
    if (state.handsFree) startListening();
  }

  function currentStep() { return state.recipe.steps[state.step]; }

  function tipFor(step) {
    const t = step.tips || {};
    return t[state.profile.skill] || t.all || null;
  }

  function renderStep(announce) {
    const r = state.recipe;
    const step = currentStep();
    const total = r.steps.length;
    $("stepCount").textContent = `Step ${state.step + 1} of ${total}`;
    $("stepText").textContent = step.text;
    $("progressBar").style.width = `${((state.step + 1) / total) * 100}%`;
    $("prevStep").disabled = state.step === 0;
    $("nextStep").textContent = state.step === total - 1 ? "Finish" : "Next";

    const tip = tipFor(step);
    $("tipStep").hidden = !tip;
    $("tipBox").hidden = true;

    const timerBtn = $("timerStep");
    timerBtn.hidden = !step.timer;
    if (step.timer) timerBtn.textContent = `Start ${formatTime(step.timer)} timer`;

    renderVideo(step);

    // Beginners see their tip without asking; others can request it.
    if (tip && state.profile.skill === "beginner") showTip(false);

    if (announce) speak(`Step ${state.step + 1}. ${step.text}`);
  }

  function showTip(say) {
    const tip = tipFor(currentStep());
    if (!tip) { if (say) speak("No extra tips for this step. You are doing great.", true); return; }
    $("tipText").textContent = tip;
    $("tipBox").hidden = false;
    if (say) speak(tip, true);
  }

  function goTo(i) {
    const total = state.recipe.steps.length;
    if (i >= total) { finish(); return; }
    state.step = Math.max(0, i);
    renderStep(true);
  }

  function finish() {
    const name = state.profile.name ? `, ${state.profile.name}` : "";
    speak(`That is everything${name}. Enjoy your ${state.recipe.title}.`, true);
    toast("Dinner is served. Enjoy!");
    state.step = 0;
    location.hash = `#/recipe/${state.recipe.id}`;
  }

  // ---------- Video ----------
  function youTubeId(url) {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function renderVideo(step) {
    const frame = $("videoFrame");
    if (!step.video) {
      frame.innerHTML = `
        <div class="video-placeholder">
          <div class="play" aria-hidden="true">▶</div>
          <p><strong>Technique video for step ${state.step + 1}</strong></p>
          <p>Add a clip URL to this step in data/recipes.js.</p>
        </div>`;
      return;
    }
    const yt = youTubeId(step.video);
    if (yt) {
      frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${yt}?enablejsapi=1&rel=0" title="Step ${state.step + 1} demonstration" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
      frame.innerHTML = `<video src="${step.video}" controls playsinline preload="metadata" aria-label="Step ${state.step + 1} demonstration"></video>`;
    }
  }

  function controlVideo(action) {
    const frame = $("videoFrame");
    const video = frame.querySelector("video");
    const iframe = frame.querySelector("iframe");
    if (video) { action === "play" ? video.play() : video.pause(); return true; }
    if (iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: action === "play" ? "playVideo" : "pauseVideo", args: [] }), "*");
      return true;
    }
    toast("No video for this step yet");
    return false;
  }

  // ---------- Timers ----------
  let timerTick;

  function addTimer(seconds, label) {
    const t = { id: Date.now() + Math.random(), label, end: Date.now() + seconds * 1000, done: false };
    state.timers.push(t);
    speak(`Timer set for ${spokenDuration(seconds)}.`, true);
    renderTimers();
    if (!timerTick) timerTick = setInterval(tickTimers, 250);
  }

  function cancelTimer(id) {
    state.timers = state.timers.filter((t) => t.id !== id);
    renderTimers();
  }

  function tickTimers() {
    const now = Date.now();
    state.timers.forEach((t) => {
      if (!t.done && now >= t.end) {
        t.done = true;
        chime();
        speak(`Your ${t.label} timer is done.`, true);
        toast(`${t.label}: time is up`);
      }
    });
    renderTimers();
    if (!state.timers.length) { clearInterval(timerTick); timerTick = null; }
  }

  function renderTimers() {
    $("timersCard").hidden = !state.timers.length;
    $("timerList").innerHTML = state.timers.map((t) => {
      const left = Math.max(0, Math.ceil((t.end - Date.now()) / 1000));
      return `
        <li class="timer ${t.done ? "done" : ""}">
          <div><div class="timer-time">${t.done ? "Done" : formatTime(left)}</div><small>${t.label}</small></div>
          <button class="btn btn-ghost btn-sm" data-cancel-timer="${t.id}">${t.done ? "Dismiss" : "Cancel"}</button>
        </li>`;
    }).join("");
  }

  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach((delay) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + delay);
        o.stop(ctx.currentTime + delay + 0.3);
      });
    } catch (_) { /* audio unavailable */ }
  }

  function startStepTimer() {
    const step = currentStep();
    if (!step.timer) { speak("This step has no timer. Say, set a timer for five minutes.", true); return; }
    addTimer(step.timer, `Step ${state.step + 1}`);
  }

  // ---------- Voice commands ----------
  const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, "forty-five": 45, sixty: 60, a: 1, an: 1 };

  function toNumber(word) {
    if (/^\d+$/.test(word)) return parseInt(word, 10);
    return NUMBER_WORDS[word] || null;
  }

  function findIngredient(text) {
    const words = text.replace(/how (much|many)|do i need|of|the|\?/g, " ").split(/\s+/).filter((w) => w.length > 2);
    let best = null;
    let bestScore = 0;
    state.recipe.ingredients.forEach((ing) => {
      const name = ing.item.toLowerCase();
      const score = words.filter((w) => name.includes(w.replace(/s$/, ""))).length;
      if (score > bestScore) { best = ing; bestScore = score; }
    });
    return best;
  }

  /** Interprets a spoken or typed phrase. Returns true when it matched. */
  function handleCommand(raw) {
    const text = raw.toLowerCase().trim().replace(/[.,!]/g, "");
    if (!text) return false;
    $("heard").textContent = `Heard: “${raw}”`;

    let m;
    if (/\b(stop talking|be quiet|quiet|silence|shh)\b/.test(text)) { hush(); return true; }
    if (/\b(help|what can i say|commands)\b/.test(text)) { $("helpDialog").showModal(); speak("Try next, back, repeat, tip, start timer, or how much of an ingredient.", true); return true; }
    if ((m = text.match(/(?:go to|jump to|skip to) step (\w+)/))) {
      const n = toNumber(m[1]);
      if (n) { goTo(n - 1); return true; }
    }
    if ((m = text.match(/timer for (\w+(?:-\w+)?) (minute|minutes|second|seconds|hour|hours)/))) {
      const n = toNumber(m[1]);
      if (n) {
        const mult = m[2].startsWith("hour") ? 3600 : m[2].startsWith("minute") ? 60 : 1;
        const unit = m[2].replace(/s$/, "");
        addTimer(n * mult, `${n} ${unit}${n === 1 ? "" : "s"}`);
        return true;
      }
    }
    if (/\b(stop|cancel|clear) (the )?timer/.test(text)) {
      const last = state.timers[state.timers.length - 1];
      if (last) { cancelTimer(last.id); speak("Timer cancelled.", true); } else speak("No timers are running.", true);
      return true;
    }
    if (/\b(start|begin|set) (the |a )?timer\b/.test(text)) { startStepTimer(); return true; }
    if (/\bhow (much|many)\b/.test(text)) {
      const ing = findIngredient(text);
      if (ing) speak(`You need ${ingredientLine(ing, true)}.`, true);
      else speak("I could not find that ingredient in this recipe.", true);
      return true;
    }
    if (/\b(ingredients|what do i need)\b/.test(text)) {
      speak(`For ${state.servings} servings you need: ${state.recipe.ingredients.map((i) => ingredientLine(i, true)).join("; ")}.`, true);
      return true;
    }
    if (/\b(play|show|start) (the )?(video|demo|me)\b/.test(text)) { controlVideo("play"); return true; }
    if (/\b(pause|stop) (the )?(video|demo)\b/.test(text)) { controlVideo("pause"); return true; }
    if (/\b(tip|advice|hint|any tips)\b/.test(text)) { showTip(true); return true; }
    if (/\b(repeat|again|say that|what was that|read)\b/.test(text)) { speak(`Step ${state.step + 1}. ${currentStep().text}`, true); return true; }
    if (/\b(back|previous|go back|last step)\b/.test(text)) { goTo(state.step - 1); return true; }
    if (/\b(next|continue|done|ready|okay next|move on)\b/.test(text)) { goTo(state.step + 1); return true; }
    if (/\b(exit|close|leave|quit)\b/.test(text)) { location.hash = `#/recipe/${state.recipe.id}`; return true; }

    $("heard").textContent = `Not sure about “${raw}”. Say “help” for commands.`;
    return false;
  }

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null;

  function startListening() {
    if (!Recognition) {
      toast("Voice input needs Chrome or Edge. Type commands below instead.");
      return;
    }
    if (state.listening) return;
    recognizer = new Recognition();
    recognizer.lang = "en-US";
    recognizer.continuous = true;
    recognizer.interimResults = false;
    recognizer.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      if (!result.isFinal) return;
      const phrase = result[0].transcript;
      // Ignore what the assistant hears of itself, except a request to stop.
      if (window.speechSynthesis && window.speechSynthesis.speaking && !/stop|quiet|silence/i.test(phrase)) return;
      handleCommand(phrase);
    };
    recognizer.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast("Microphone access was blocked");
        stopListening();
      }
    };
    recognizer.onend = () => { if (state.listening) { try { recognizer.start(); } catch (_) { /* restarting */ } } };
    state.listening = true;
    try { recognizer.start(); } catch (_) { /* already started */ }
    updateMic();
  }

  function stopListening() {
    state.listening = false;
    if (recognizer) { recognizer.onend = null; try { recognizer.stop(); } catch (_) { /* idle */ } recognizer = null; }
    updateMic();
  }

  function updateMic() {
    const btn = $("micToggle");
    btn.setAttribute("aria-pressed", String(state.listening));
    btn.setAttribute("aria-label", state.listening ? "Turn voice commands off" : "Turn voice commands on");
    $("micLabel").textContent = state.listening ? "Listening" : "Voice off";
  }

  // ---------- Hands-free ----------
  async function applyHandsFree() {
    document.body.classList.toggle("hands-free", state.handsFree);
    $("handsFreeToggle").setAttribute("aria-pressed", String(state.handsFree));
    localStorage.setItem(HANDS_FREE_KEY, state.handsFree ? "1" : "0");

    if (state.handsFree) {
      if ("wakeLock" in navigator) {
        try { state.wakeLock = await navigator.wakeLock.request("screen"); } catch (_) { /* not granted */ }
      }
      if (!$("view-cook").hidden) startListening();
    } else if (state.wakeLock) {
      state.wakeLock.release();
      state.wakeLock = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.handsFree) applyHandsFree();
  });

  // ---------- Routing ----------
  function route() {
    const [, view, id] = location.hash.split("/");
    if (view === "recipe" && id) openRecipe(id);
    else if (view === "cook" && id) {
      if (!state.recipe || state.recipe.id !== id) openRecipe(id);
      startCooking();
    } else { renderLibrary(); show("library"); }
  }

  // ---------- Wiring ----------
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-recipe]");
    if (card) location.hash = `#/recipe/${card.dataset.recipe}`;
    const nav = e.target.closest("[data-nav='library']");
    if (nav) location.hash = "";
    const cancel = e.target.closest("[data-cancel-timer]");
    if (cancel) cancelTimer(Number(cancel.dataset.cancelTimer));
  });

  $("startCooking").addEventListener("click", () => (location.hash = `#/cook/${state.recipe.id}`));
  $("exitCook").addEventListener("click", () => (location.hash = `#/recipe/${state.recipe.id}`));
  $("servingsUp").addEventListener("click", () => setServings(state.servings + 1));
  $("servingsDown").addEventListener("click", () => setServings(state.servings - 1));
  $("nextStep").addEventListener("click", () => goTo(state.step + 1));
  $("prevStep").addEventListener("click", () => goTo(state.step - 1));
  $("repeatStep").addEventListener("click", () => speak(`Step ${state.step + 1}. ${currentStep().text}`, true));
  $("tipStep").addEventListener("click", () => showTip(true));
  $("timerStep").addEventListener("click", startStepTimer);
  $("micToggle").addEventListener("click", () => (state.listening ? stopListening() : startListening()));
  $("helpOpen").addEventListener("click", () => $("helpDialog").showModal());
  $("profileOpen").addEventListener("click", openProfile);
  $("handsFreeToggle").addEventListener("click", () => { state.handsFree = !state.handsFree; applyHandsFree(); });

  $("commandForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("commandInput");
    handleCommand(input.value);
    input.value = "";
  });

  $("profileDialog").addEventListener("close", () => {
    if ($("profileDialog").returnValue !== "save") return;
    saveProfile(readProfileForm());
    toast("Your kitchen is saved");
    renderLibrary();
    if (state.recipe && !$("view-overview").hidden) renderOverview();
    if (state.recipe && !$("view-cook").hidden) renderStep(false);
  });

  // Keyboard shortcuts in cook mode: arrows to move, space to repeat.
  document.addEventListener("keydown", (e) => {
    if ($("view-cook").hidden || e.target.matches("input, textarea") || document.querySelector("dialog[open]")) return;
    if (e.key === "ArrowRight") goTo(state.step + 1);
    else if (e.key === "ArrowLeft") goTo(state.step - 1);
    else if (e.key === " ") { e.preventDefault(); speak(currentStep().text, true); }
  });

  window.addEventListener("hashchange", route);

  // Expose the parser for testing and future integrations.
  window.CookingAssistant = { handleCommand, state };

  applyHandsFree();
  route();
  if (!localStorage.getItem(STORAGE_KEY)) setTimeout(openProfile, 400);
})();
