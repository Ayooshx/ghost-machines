/**
 * Text-to-speech service for Last Transmission, built on the browser's Web Speech API (speechSynthesis).
 * No external audio services. One shared instance, so only one narration can ever play at a time.
 *
 * Events (use narrator.on): 'state' (snapshot), 'ended', 'stopped', 'error' ({ reason }), 'pulse' (word boundary).
 * Every event that concerns one narration carries artifactId, so views can ignore other artifacts.
 */
const synth = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;
export const speechSupported = !!synth;

const RATE = 0.92, PITCH = 0.9;      // slightly slow and low for the documentary mood
const START_TIMEOUT_MS = 4000;       // if no voice starts in this time, report "no voice"
const SWITCH_DELAY_MS = 80;          // Chrome can drop speak() called right after cancel()

function pickVoice(list) {
  const en = list.filter((v) => /^en([-_]|$)/i.test(v.lang));
  return en.find((v) => v.default && v.localService) ?? en.find((v) => v.localService && /US|GB/i.test(v.lang))
    ?? en.find((v) => v.localService) ?? en.find((v) => v.default) ?? en[0] ?? null;
}

class Narrator extends EventTarget {
  #state = 'idle';           // 'idle' | 'starting' | 'speaking' | 'paused'
  #id = null; #para = 0; #total = 0; #token = 0; #utts = []; #voice = null; #voiceCount = 0; #loaded = false; #watch = 0;

  constructor() {
    super();
    if (!synth) return;
    const load = () => { const list = synth.getVoices(); this.#voiceCount = list.length; this.#loaded ||= list.length > 0; this.#voice = pickVoice(list); };
    load();
    synth.addEventListener?.('voiceschanged', load);
    addEventListener('pagehide', () => this.stop()); // never keep talking after the page is gone
  }

  get supported() { return speechSupported; }
  get voicesLoaded() { return this.#loaded; }
  get voiceCount() { return this.#voiceCount; }
  get state() { return this.#state; }
  get artifactId() { return this.#id; }
  snapshot() { return { state: this.#state, artifactId: this.#id, paragraph: this.#para, total: this.#total, voice: this.#voice?.name ?? null }; }
  on(type, fn) { const h = (e) => fn(e.detail); this.addEventListener(type, h); return () => this.removeEventListener(type, h); }

  /** Start reading `paragraphs` for artifact `id`. Any narration already playing is stopped first. */
  speak(id, paragraphs) {
    if (!synth) return { ok: false, reason: 'unsupported' };
    const parts = (paragraphs ?? []).map((s) => String(s ?? '').trim()).filter(Boolean);
    if (!parts.length) return { ok: false, reason: 'empty' };

    const busy = this.#state !== 'idle' || synth.speaking || synth.pending;
    this.#reset();
    const token = this.#token;
    this.#id = id; this.#total = parts.length; this.#state = 'starting';

    // Paragraph-sized utterances avoid Chrome's habit of cutting off long ones, and give us progress for highlighting.
    this.#utts = parts.map((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = this.#voice?.lang ?? 'en-US';
      if (this.#voice) u.voice = this.#voice;
      u.rate = RATE; u.pitch = PITCH;
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
