// Audio subsystem — chiptune3 for .xm music, Web Audio API for synth SFX

let audioCtx = null;
let masterGain = null;
let noiseBuffer = null;
let chiptunePlayer = null;
let musicReady = false;
let musicShouldPlay = false;
let initialized = false;

const MUSIC_VOLUME = 0.35;
const SFX_VOLUME = 0.6;
let muted = false;
const MUSIC_PATH = './Razor1911 - Soldier Of Fortune intro.xm';

// --- Init ---

export async function initAudio() {
  if (initialized) return;
  initialized = true;

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    // Pre-generate white noise buffer for crash SFX
    const len = audioCtx.sampleRate * 0.5;
    noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } catch (e) {
    console.warn('Web Audio not available:', e);
    return;
  }

  // Load chiptune player (non-blocking)
  try {
    const { ChiptuneJsPlayer } = await import('https://drsnuggles.github.io/chiptune/chiptune3.js');
    chiptunePlayer = new ChiptuneJsPlayer({ repeatCount: -1 });
    chiptunePlayer.onInitialized(() => {
      chiptunePlayer.setVol(MUSIC_VOLUME);
      loadMusic();
    });
    chiptunePlayer.onError((e) => {
      console.warn('Chiptune error:', e);
    });
  } catch (e) {
    console.warn('Could not load chiptune3.js, music disabled:', e);
  }
}

async function loadMusic() {
  try {
    const resp = await fetch(MUSIC_PATH);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buf = await resp.arrayBuffer();
    musicReady = true;
    if (musicShouldPlay) {
      chiptunePlayer.play(buf);
    }
    // Store buffer for replay
    chiptunePlayer._xmBuffer = buf;
  } catch (e) {
    console.warn('Could not load .xm file:', e);
  }
}

// --- Mute ---

export function toggleMute() {
  muted = !muted;
  if (!masterGain) return muted;
  masterGain.gain.value = muted ? 0 : 1;
  if (chiptunePlayer) {
    chiptunePlayer.setVol(muted ? 0 : MUSIC_VOLUME);
  }
  return muted;
}

export function isMuted() {
  return muted;
}

// --- Music control ---

export function startMusic() {
  musicShouldPlay = true;
  if (!chiptunePlayer) return;
  chiptunePlayer.setVol(MUSIC_VOLUME);
  if (musicReady && chiptunePlayer._xmBuffer) {
    chiptunePlayer.play(chiptunePlayer._xmBuffer);
  }
}

export function stopMusic() {
  musicShouldPlay = false;
  if (!chiptunePlayer || !musicReady) return;
  // Quick fade out
  try {
    let vol = MUSIC_VOLUME;
    const fade = setInterval(() => {
      vol -= 0.05;
      if (vol <= 0) {
        clearInterval(fade);
        chiptunePlayer.stop();
        chiptunePlayer.setVol(MUSIC_VOLUME);
      } else {
        chiptunePlayer.setVol(vol);
      }
    }, 30);
  } catch {
    chiptunePlayer.stop();
  }
}

// --- Sound effects ---

export function playBell() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.connect(masterGain);
  gain.gain.setValueAtTime(SFX_VOLUME, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  // Two sine tones for metallic shimmer
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2600, t);
  osc1.connect(gain);
  osc1.start(t);
  osc1.stop(t + 0.2);

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(3400, t);
  osc2.connect(gain);
  osc2.start(t);
  osc2.stop(t + 0.2);
}

export function playHonk() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.connect(masterGain);
  gain.gain.setValueAtTime(SFX_VOLUME * 0.7, t);
  gain.gain.setValueAtTime(SFX_VOLUME * 0.7, t + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

  const osc1 = audioCtx.createOscillator();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(220, t);
  osc1.frequency.linearRampToValueAtTime(200, t + 0.25);
  osc1.connect(gain);
  osc1.start(t);
  osc1.stop(t + 0.28);

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(280, t);
  osc2.frequency.linearRampToValueAtTime(260, t + 0.25);
  osc2.connect(gain);
  osc2.start(t);
  osc2.stop(t + 0.28);
}

export function playCrash() {
  if (!audioCtx || !noiseBuffer) return;
  const t = audioCtx.currentTime;

  // White noise burst
  const noiseGain = audioCtx.createGain();
  noiseGain.connect(masterGain);
  noiseGain.gain.setValueAtTime(SFX_VOLUME, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.connect(noiseGain);
  noise.start(t);
  noise.stop(t + 0.4);

  // Descending square wave sweep
  const sweepGain = audioCtx.createGain();
  sweepGain.connect(masterGain);
  sweepGain.gain.setValueAtTime(SFX_VOLUME * 0.5, t);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

  const sweep = audioCtx.createOscillator();
  sweep.type = 'square';
  sweep.frequency.setValueAtTime(300, t);
  sweep.frequency.exponentialRampToValueAtTime(80, t + 0.4);
  sweep.connect(sweepGain);
  sweep.start(t);
  sweep.stop(t + 0.4);
}
