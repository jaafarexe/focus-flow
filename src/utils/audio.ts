import { SoundEffect } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(effect: SoundEffect, volumePercent = 80): void {
  if (effect === 'none' || volumePercent <= 0) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const vol = Math.max(0, Math.min(1, volumePercent / 100));
    masterGain.gain.setValueAtTime(vol * 0.4, now);
    masterGain.connect(ctx.destination);

    switch (effect) {
      case 'bell': {
        // Crystalline cathedral bell chime: fundamental + harmonic overtones
        const freqs = [880, 1760, 2640];
        const decays = [1.8, 1.2, 0.7];
        const gains = [0.6, 0.3, 0.15];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(gains[idx], now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + decays[idx]);
        });
        break;
      }

      case 'chime': {
        // Pleasant 3-note ascending chord (E5 -> G#5 -> B5)
        const notes = [659.25, 830.61, 987.77];
        notes.forEach((freq, index) => {
          const noteStart = now + index * 0.16;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);

          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.4, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.2);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(noteStart);
          osc.stop(noteStart + 1.25);
        });
        break;
      }

      case 'bowl': {
        // Warm Tibetan singing bowl with subtle binaural frequency beating
        const baseFreq = 432;
        const offsets = [0, 1.5, 3.2];
        offsets.forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq + offset, now);

          const initialGain = idx === 0 ? 0.6 : 0.25;
          gain.gain.setValueAtTime(initialGain, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 3.1);
        });
        break;
      }

      case 'marimba': {
        // Organic wooden chime with warm fast attack
        const arpeggio = [523.25, 659.25, 783.99, 1046.5];
        arpeggio.forEach((freq, idx) => {
          const noteStart = now + idx * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);

          gain.gain.setValueAtTime(0.5, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.6);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(noteStart);
          osc.stop(noteStart + 0.65);
        });
        break;
      }

      case 'digital': {
        // Clean modern double-pip notification
        [0, 0.18].forEach((timeOffset) => {
          const t = now + timeOffset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.5, t); // C6

          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.15);
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Web Audio playback error:', err);
  }
}

export function playTick(volumePercent = 30): void {
  if (volumePercent <= 0) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    const vol = (volumePercent / 100) * 0.08;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // Audio context may not be unlocked yet
  }
}
