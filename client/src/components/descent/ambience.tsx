import { useEffect, useRef, useState } from "react";

// Sound, off by default. Nothing here is a recording: it is synthesised in
// the browser — filtered noise breathing slowly under a low tone — so the
// site never plays borrowed audio and never fetches a file. Browsers refuse
// autoplay anyway; the switch is the user's.
export function Ambience() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const start = () => {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = ctxRef.current ?? new AC();
    ctxRef.current = ctx;
    if (!gainRef.current) {
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      gainRef.current = master;

      // brown noise: integrated white noise, then a lowpass that breathes
      const len = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 260;
      lp.Q.value = 0.6;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 140;
      lfo.connect(lfoGain).connect(lp.frequency);
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.55;
      noise.connect(lp).connect(noiseGain).connect(master);

      // a low tone with a slow tremolo: the hull, or the blood in your ears
      const tone = ctx.createOscillator();
      tone.type = "sine";
      tone.frequency.value = 52;
      const trem = ctx.createOscillator();
      trem.frequency.value = 0.11;
      const tremGain = ctx.createGain();
      tremGain.gain.value = 0.05;
      const toneGain = ctx.createGain();
      toneGain.gain.value = 0.08;
      trem.connect(tremGain).connect(toneGain.gain);
      tone.connect(toneGain).connect(master);

      noise.start();
      lfo.start();
      tone.start();
      trem.start();
    }
    void ctx.resume();
    gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    gainRef.current.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.8);
  };

  const stop = () => {
    const ctx = ctxRef.current;
    const g = gainRef.current;
    if (!ctx || !g) return;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  };

  useEffect(() => () => { void ctxRef.current?.close(); }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    if (next) start();
    else stop();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title="Synthesised ambience — nothing recorded"
      className="fixed bottom-4 left-4 z-30 flex items-center gap-2 rounded-sm border border-[var(--sea-line)] bg-[rgba(13,24,28,.7)] px-3 py-1.5 backdrop-blur transition-colors hover:border-[var(--teal-bright)]"
      data-testid="button-ambience"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] bg-[var(--teal-bright)] ${on ? "ambience-bar" : ""}`}
            style={{ height: on ? undefined : 3, animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
      <span className="coord text-[10px] text-[var(--sea-text)]">{on ? "SOUND ON" : "SOUND OFF"}</span>
    </button>
  );
}
