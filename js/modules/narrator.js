/**
 * Text-to-speech service for Last Transmission, built on the browser's Web Speech API (speechSynthesis).
 * No external audio services. One shared instance, so only one narration can ever play at a time.
 *
 * Voice style: a warm, mature teen girl. Browsers do not say whether a voice is male or female,
 * so the voice is chosen by NAME from the lists below, then tuned with RATE and PITCH.
 *
 * Events (use narrator.on): 'state' (snapshot), 'ended', 'stopped', 'error' ({ reason }), 'pulse' (word boundary).
 * Every event that concerns one narration carries artifactId, so views can ignore other artifacts.
 */
const synth = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;
export const speechSupported = !!synth;

// ---- Voice tuning: change these to taste -------------------------------------------------------
const RATE = 1.0;            // 1 = normal. A little brisker than a "documentary" pace, so it sounds young and engaged
const PITCH = 1.12;          // 1 = normal. Slightly higher for a teen sound, but not so high that it loses maturity
const CLOSING_SLOWDOWN = 0.06;   // the last paragraph is slower and a touch lower, for a thoughtful, grown-up ending
const CLOSING_PITCH_DROP = 0.04;

// Preferred voices, best first. Matched against each voice's name (case-insensitive, partial match).
// Different devices ship different voices, so this lists good options for Edge/Windows, Chrome, macOS and iOS.
const PREFERRED_FEMALE = [
  'Jenny', 'Aria', 'Ava', 'Emma', 'Michelle', 'Libby', 'Sonia', 'Hazel', 'Zira',   // Windows / Edge (Microsoft "Natural" voices sound best)
  'Google US English', 'Google UK English Female',                                  // Chrome
  'Samantha', 'Allison', 'Tessa', 'Karen', 'Moira', 'Serena', 'Susan', 'Nicky',    // macOS / iOS
];
// Names that are probably male voices. They are avoided unless nothing else is available.
// Matched as whole words, so that "Female" is not mistaken for "Male".
const LIKELY_MALE = ['David', 'Mark', 'Guy', 'Ryan', 'Davis', 'Daniel', 'Alex', 'Fred', 'George', 'James', 'Thomas', 'Eric', 'Tony', 'Aaron', 'Rishi', 'Oliver', 'Christopher', 'Male'];

const MALE_RE = new RegExp(`\\b(${LIKELY_MALE.join('|')})\\b`, 'i');

const START_TIMEOUT_MS = 4000;       // if no voice starts in this time, report "no voice"
const SWITCH_DELAY_MS = 80;          // Chrome can drop speak() called right after cancel()

/** English voices, best first (warm female narrator voices first). Empty when the device has no English voice. */
function rankVoices(list) {
  const english = list.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const has = (name, w) => name.toLowerCase().includes(w.toLowerCase());
  const scored = [];
  for (const v of english) {
    const rank = PREFERRED_FEMALE.findIndex((w) => has(v.name, w));
    let score = rank >= 0 ? 200 - rank * 5 : 0;           // earlier in the preferred list = higher score
    if (MALE_RE.test(v.name)) score -= 150;           // avoid voices that are probably male
    if (/natural|online/i.test(v.name)) score += 20;      // neural voices sound far more human
    if (v.localService) score += 5;                       // works offline
    if (/en[-_](US|GB)/i.test(v.lang)) score += 3;
    if (v.default) score += 1;
    scored.push({ v, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((x) => x.v);
}
const isMale = (v) => MALE_RE.test(v.name);

class Narrator extends EventTarget {
  #state = 'idle';           // 'idle' | 'starting' | 'speaking' | 'paused'
  #id = null; #para = 0; #total = 0; #token = 0; #utts = []; #voice = null; #ranked = []; #used = null; #voiceCount = 0; #loaded = false; #watch = 0;

  constructor() {
    super();
    if (!synth) return;
    const load = () => { const list = synth.getVoices(); this.#voiceCount = list.length; this.#loaded ||= list.length > 0; this.#ranked = rankVoices(list); this.#voice = this.#ranked[0] ?? null; };
    load();
    synth.addEventListener?.('voiceschanged', load);
    addEventListener('pagehide', () => this.stop()); // never keep talking after the page is gone
  }

  get supported() { return speechSupported; }
  get voicesLoaded() { return this.#loaded; }
  get voiceCount() { return this.#voiceCount; }
  get state() { return this.#state; }
  get artifactId() { return this.#id; }
  snapshot() { return { state: this.#state, artifactId: this.#id, paragraph: this.#para, total: this.#total, voice: (this.#used ?? this.#voice)?.name ?? null }; }

  /**
   * Which voice a role uses. 'narrator' = the best warm female voice. 'alt' = a different voice, preferably male-sounding
   * (for a robot or a second speaker). 'young' = a second female voice. With only one voice installed, every role shares it
   * (callers vary pitch and rate to tell characters apart).
   */
  #voiceFor(role) {
    const r = this.#ranked, main = r[0] ?? null;
    if (role === 'alt') return r.find((v) => v !== main && isMale(v)) ?? r.find((v) => v !== main) ?? main;
    if (role === 'young') return r.find((v) => v !== main && !isMale(v)) ?? main;
    return main;
  }
  on(type, fn) { const h = (e) => fn(e.detail); this.addEventListener(type, h); return () => this.removeEventListener(type, h); }

  /** Start reading `paragraphs` for `id`. Any narration already playing is stopped first. opts: { role, rate, pitch } */
  speak(id, paragraphs, opts = {}) {
    if (!synth) return { ok: false, reason: 'unsupported' };
    const parts = (paragraphs ?? []).map((s) => String(s ?? '').trim()).filter(Boolean);
    if (!parts.length) return { ok: false, reason: 'empty' };

    const busy = this.#state !== 'idle' || synth.speaking || synth.pending;
    this.#reset();
    const token = this.#token;
    this.#id = id; this.#total = parts.length; this.#state = 'starting';
    const voice = this.#voiceFor(opts.role); this.#used = voice;
    const rate = opts.rate ?? RATE, pitch = opts.pitch ?? PITCH;

    // Paragraph-sized utterances avoid Chrome's habit of cutting off long ones, and give us progress for highlighting.
    this.#utts = parts.map((text, i) => {
      const closing = i === parts.length - 1 && parts.length > 1 && opts.rate === undefined;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang ?? 'en-US';
      if (voice) u.voice = voice;
      u.rate = closing ? rate - CLOSING_SLOWDOWN : rate;
      u.pitch = closing ? pitch - CLOSING_PITCH_DROP : pitch;
      u.onstart = () => {
        if (token !== this.#token) return;
        clearTimeout(this.#watch);
        this.#para = i;
        if (this.#state !== 'paused') this.#state = 'speaking';
        this.#emitState(); this.#emit('pulse');
      };
      u.onboundary = () => { if (token === this.#token) this.#emit('pulse'); };
      u.onend = () => { if (token === this.#token && i === parts.length - 1) this.#end('ended'); };
      u.onerror = (e) => {
        if (token !== this.#token || e.error === 'canceled' || e.error === 'interrupted') return;
        this.#end('error', e.error || 'synthesis-failed');
      };
      return u;
    });

    const run = () => { if (token === this.#token) this.#utts.forEach((u) => synth.speak(u)); };
    busy ? setTimeout(run, SWITCH_DELAY_MS) : run(); // run inside the click when possible (iOS needs the gesture)
    this.#watch = setTimeout(() => { if (token === this.#token && this.#state === 'starting') this.#end('error', 'no-voice'); }, START_TIMEOUT_MS);
    this.#emitState();
    return { ok: true };
  }

  pause() { if (synth && this.#state === 'speaking') { synth.pause(); this.#state = 'paused'; this.#emitState(); } }
  resume() { if (synth && this.#state === 'paused') { synth.resume(); this.#state = 'speaking'; this.#emitState(); } }

  stop() {
    if (!synth || (this.#state === 'idle' && !synth.speaking && !synth.pending)) return;
    const id = this.#id;
    this.#reset();
    if (id) this.#emit('stopped', { artifactId: id });
    this.#emitState();
  }

  // ---- internals ----
  #reset() {
    this.#token += 1; clearTimeout(this.#watch);
    synth?.cancel();
    this.#utts = []; this.#state = 'idle'; this.#id = null; this.#para = 0; this.#total = 0;
  }
  #end(kind, reason) {
    const id = this.#id;
    this.#reset();
    this.#emit(kind, { artifactId: id, reason });   // outcome first, so views know why we went idle
    this.#emitState();
  }
  #emit(type, detail = {}) { this.dispatchEvent(new CustomEvent(type, { detail: { artifactId: this.#id, ...detail } })); }
  #emitState() { this.dispatchEvent(new CustomEvent('state', { detail: this.snapshot() })); }
}

export const narrator = new Narrator();
