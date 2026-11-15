import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useMomentum } from "./useMomentum";
import type { Frame } from "./useFrames";

const PERIOD = 16; // px, matches the hole pattern below
const holes = (x: string): CSSProperties => ({
  backgroundImage: "linear-gradient(90deg,#d9d4c7 0 7px,transparent 7px 16px)",
  backgroundSize: `${PERIOD}px 100%`,
  backgroundRepeat: "repeat-x",
  backgroundPosition: `${x} 0`,
});
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

// unwatched frames are flat gray; once the film reaches them they turn to full color
const LOOK = {
  dark: "grayscale contrast-50 brightness-90",
  ahead: "brightness-[.7]",
  played: "brightness-100",
} as const;

type Props = {
  frames: Frame[];
  time: number;
  duration: number;
  playing: boolean;
  onSeek: (t: number) => void;
  className?: string;
};

export function FilmStrip({
  frames,
  time,
  duration,
  playing,
  onSeek,
  className = "",
}: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [touching, setTouching] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // furthest point the film has reached: frames "develop" up to here
  useEffect(() => setReached((r) => Math.max(r, time)), [time]);

  // sprocket holes drift while playing and coast to a stop on pause
  useMomentum(playing, 36, (d) => {
    offset.current = (offset.current + d) % PERIOD;
    film.current?.style.setProperty("--sx", `${-offset.current}px`);
  });

  const pct = duration ? clamp(time / duration, 0, 1) * 100 : 0;
  const n = frames.length || 10;
  const cells = Array.from({ length: n }, (_, i) => {
    const start = (duration * i) / n;
    const end = (duration * (i + 1)) / n;
    const state = start > reached ? "dark" : end <= time ? "played" : "ahead";
    return { i, state: state as keyof typeof LOOK, url: frames[i]?.url };
  });

  // preview: mouse hover, finger drag, or keyboard focus
  const pf = hover ?? (touching || focused ? pct / 100 : null);
  const pt = (pf ?? 0) * duration;
  const shot = frames.length
    ? frames.reduce((best, f) =>
        Math.abs(f.t - pt) < Math.abs(best.t - pt) ? f : best
      )
    : undefined;
  // same rule as the strip cells: a spot counts as watched once the film reached its cell
  const cellStart = duration
    ? (Math.min(n - 1, Math.floor((pt / duration) * n)) * duration) / n
    : 0;
  const watched = cellStart <= reached;
  const compact = width < 340;
  const pw = compact ? 96 : 192;
  const x = (pf ?? 0) * width;
  const left = clamp(x, pw / 2, Math.max(pw / 2, width - pw / 2));
  const arrow = clamp(x - left + pw / 2, 10, pw - 10);

  const fraction = (clientX: number) => {
    const r = film.current?.getBoundingClientRect();
    return r && r.width ? clamp((clientX - r.left) / r.width, 0, 1) : 0;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const step = e.shiftKey ? 10 : 5;
    let t: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") t = time + step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") t = time - step;
    else if (e.key === "PageUp") t = time + duration * 0.1;
    else if (e.key === "PageDown") t = time - duration * 0.1;
    else if (e.key === "Home") t = 0;
    else if (e.key === "End") t = duration;
    if (t === null) return;
    e.preventDefault();
    onSeek(clamp(t, 0, duration));
  };

  // save points, like checkpoints in a game
  const checkpoints = duration
    ? [0.2, 0.4, 0.6, 0.8].map((f) => duration * f)
    : [];

  return (
    <div ref={outer} className={`relative min-w-0 pt-5 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5">
        {checkpoints.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSeek(t)}
            aria-label={`Checkpoint ${i + 1}, ${fmt(t)}`}
            title={`Checkpoint ${i + 1}`}
            className="pointer-events-auto absolute -top-1.5 grid h-8 w-11 -translate-x-1/2 place-items-center text-amber transition-transform hover:text-paper active:translate-y-0.5 focus-visible:outline-[3px] focus-visible:outline-amber"
            style={{ left: `${(t / duration) * 100}%` }}
          >
            <svg viewBox="0 0 12 16" className="h-4 w-3" aria-hidden>
              <path d="M1 0h10v10L6 15 1 10z" fill="currentColor" />
            </svg>
          </button>
        ))}
      </div>

      <div
        ref={film}
        className="relative flex h-16 touch-pan-y select-none flex-col gap-1 bg-film py-1 has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-amber"
        onPointerMove={(e) =>
          e.pointerType === "mouse" && setHover(fraction(e.clientX))
        }
        onPointerLeave={() => setHover(null)}
        onPointerDown={() => setTouching(true)}
        onPointerUp={() => setTouching(false)}
        onPointerCancel={() => setTouching(false)}
      >
        <div
          className="h-1.5 shrink-0 opacity-70"
          style={holes("var(--sx,0px)")}
        />
        <div className="flex min-h-0 flex-1 gap-0.5 px-0.5">
          {cells.map(({ i, state, url }) => (
            <div
              key={i}
              className={`flex-1 bg-[#2a2926] bg-cover bg-center transition-[filter] duration-1000 motion-reduce:transition-none ${LOOK[state]}`}
              style={url ? { backgroundImage: `url(${url})` } : undefined}
            />
          ))}
        </div>
        <div
          className="h-1.5 shrink-0 opacity-70"
          style={holes("var(--sx,0px)")}
        />

        <div
          className="pointer-events-none absolute inset-y-0 left-0 border-r border-amber/50 bg-amber/15"
          style={{ width: `${pct}%` }}
        />
        <div
          className="pointer-events-none absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-amber shadow-[0_0_10px_rgba(240,160,32,.75)]"
          style={{ left: `${pct}%` }}
        >
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-x-[6px] border-t-[8px] border-x-transparent border-t-amber" />
        </div>

        <input
          type="range"
          aria-label="Seek"
          aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => onSeek(Number(e.target.value))}
          onKeyDown={onKeyDown}
          onFocus={(e) => setFocused(e.currentTarget.matches(":focus-visible"))}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </div>

      {pf !== null && duration > 0 && (
        <div
          aria-hidden
          className="preview-pop pointer-events-none absolute bottom-full z-20 mb-2 -translate-x-1/2 border border-paper/35 bg-black shadow-[0_8px_24px_rgba(0,0,0,.6)]"
          style={{ left, width: pw }}
        >
          {!compact && (
            <div className="h-1.5 opacity-70" style={holes("4px")} />
          )}
          <div
            className={`relative aspect-video bg-[repeating-linear-gradient(45deg,#1b1a18_0_6px,#141412_6px_12px)] bg-cover bg-center ${
              watched ? "" : LOOK.dark
            }`}
            style={shot ? { backgroundImage: `url(${shot.url})` } : undefined}
          >
            {compact && (
              <span className="absolute inset-x-0 bottom-0 bg-black/75 text-center font-mono text-xs text-amber">
                {fmt(pt)}
              </span>
            )}
          </div>
          {!compact && (
            <>
              <div className="h-1.5 opacity-70" style={holes("4px")} />
              <div className="py-1 text-center font-mono text-sm text-amber">
                {fmt(pt)}
              </div>
            </>
          )}
          <span
            className="absolute top-full -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-paper/35"
            style={{ left: arrow }}
          />
        </div>
      )}
    </div>
  );
}
