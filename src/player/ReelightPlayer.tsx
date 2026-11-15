import { useEffect, useRef, useState } from "react";
import { Container } from "@videojs/react";
import { Video, VideoPlayer, usePlayer } from "@videojs/react/video";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CinemaCard } from "./CinemaCard";
import { FilmStrip } from "./FilmStrip";
import { Reel } from "./Reel";
import { useFrames } from "./useFrames";
import { usePrefersReducedMotion } from "./useMomentum";

const btn =
  "grid size-12 shrink-0 place-items-center text-paper transition-transform hover:text-amber active:translate-y-0.5 active:scale-95 motion-reduce:transition-none focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-amber";
const playBtn =
  "rounded-full border-2 border-paper/60 shadow-[0_3px_0_#000] active:shadow-none";
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const run = (p: unknown) => void Promise.resolve(p).catch(() => {});

function Player({ src }: { src: string }) {
  const store = usePlayer();
  const storeRef = useRef(store);
  storeRef.current = store;

  const paused = usePlayer((s) => s.paused) ?? true;
  const ended = usePlayer((s) => s.ended) ?? false;
  const time = usePlayer((s) => s.currentTime) ?? 0;
  const rawDuration = usePlayer((s) => s.duration) ?? 0;
  const muted = usePlayer((s) => s.muted) ?? false;
  const volume = usePlayer((s) => s.volume) ?? 1;
  const full = usePlayer((s) => s.isFullscreen) ?? false;
  const duration = Number.isFinite(rawDuration) ? rawDuration : 0;
  const frames = useFrames(src);
  const playing = !paused && !ended;
  const reduced = usePrefersReducedMotion();

  const [count, setCount] = useState<number | null>(null); // film-leader countdown
  const [begun, setBegun] = useState(false); // false = still on the first screen
  const [error, setError] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const started = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const videoEl = useRef<HTMLVideoElement | null>(null);

  // listen to the real <video> element for load errors and stalls
  useEffect(() => {
    const v = stage.current?.querySelector("video") ?? null;
    videoEl.current = v;
    setError(false);
    setBuffering(false);
    if (!v) return;
    if (v.error) setError(true);
    const onError = () => setError(true);
    const onWait = () => setBuffering(true);
    const onOk = () => setBuffering(false);
    v.addEventListener("error", onError);
    v.addEventListener("waiting", onWait);
    for (const ev of ["playing", "canplay", "seeked", "pause"])
      v.addEventListener(ev, onOk);
    return () => {
      v.removeEventListener("error", onError);
      v.removeEventListener("waiting", onWait);
      for (const ev of ["playing", "canplay", "seeked", "pause"])
        v.removeEventListener(ev, onOk);
    };
  }, [src]);

  const retry = () => {
    setError(false);
    videoEl.current?.load();
  };

  useEffect(() => {
    if (playing) setBegun(true);
  }, [playing]);

  useEffect(() => {
    if (count === null) return;
    const id = setTimeout(() => {
      if (count > 1) setCount(count - 1);
      else {
        setCount(null);
        run(storeRef.current.play());
      }
    }, 800);
    return () => clearTimeout(id);
  }, [count]);

  const toggle = () => {
    const s = storeRef.current;
    if (count !== null) {
      setCount(null);
      started.current = false;
      return;
    }
    if (ended) {
      s.seek(0);
      run(s.play());
      return;
    }
    if (!paused) {
      s.pause();
      return;
    }
    setBegun(true);
    if (!started.current && !reduced) {
      started.current = true;
      setCount(3);
      return;
    }
    started.current = true;
    run(s.play());
  };

  const loading = duration === 0;
  const showIntro = !begun && count === null && !ended;

  return (
    <>
      {/* stage: the picture and everything drawn over it. Always 16:9 so the video never shrinks. */}
      <div ref={stage} className="rl-stage relative aspect-video w-full">
        <Video
          src={src}
          crossOrigin="anonymous"
          playsInline
          className="absolute inset-0 size-full object-contain"
        />

        {error ? (
          <div
            role="alert"
            className="absolute inset-0 z-[2] grid place-items-center bg-ink px-6 text-center"
          >
            <div className="max-w-sm">
              <Reel spinning={false} className="mx-auto size-14 opacity-60" />
              <h2 className="mt-3 font-display text-4xl">The reel snapped</h2>
              <p className="mt-2 text-sm text-smoke">
                This video could not be loaded. Check your connection, then try
                again.
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 min-h-12 border-2 border-amber px-6 text-amber transition-transform hover:bg-amber/15 active:translate-y-0.5 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-paper"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={toggle}
              className="absolute inset-0 z-[1] cursor-pointer"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.5))]"
            />
            <div
              aria-hidden
              data-playing={playing || undefined}
              className="grain pointer-events-none absolute inset-0 z-[2]"
            />

            {showIntro && (
              <CinemaCard
                kicker="Now showing"
                title="Reelight"
                note={
                  loading
                    ? "Threading the projector…"
                    : "Admit one · press play"
                }
                image={frames[0]?.url}
              />
            )}
            {ended && count === null && (
              <CinemaCard
                kicker="That's a wrap"
                title="The End"
                note="Admit one more · press replay"
                image={frames[frames.length - 1]?.url}
              />
            )}

            {buffering && playing && (
              <div
                role="status"
                className="pointer-events-none absolute inset-0 z-[2] grid place-items-center"
              >
                <div className="flex items-center gap-3 bg-ink/75 px-3 py-2">
                  <Reel spinning className="size-9 shrink-0" />
                  <span className="font-mono text-sm">Loading…</span>
                </div>
              </div>
            )}

            {count !== null && (
              <div
                role="status"
                aria-live="assertive"
                className="absolute inset-0 z-[4] grid place-items-center bg-ink/80"
              >
                <div className="leader relative grid aspect-square w-[min(46%,260px)] place-items-center rounded-full border-[3px] border-paper">
                  <span
                    key={count}
                    className="leader-num bg-ink px-3 font-display text-[clamp(72px,18cqw,150px)] leading-none"
                  >
                    {count}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* controls: under the picture on small players, floating over it from 512px up */}
      {!error && (
        <div className="rl-bar relative z-[3] flex flex-wrap items-center bg-ink px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] @lg:absolute @lg:inset-x-0 @lg:bottom-0 @lg:flex-nowrap @lg:gap-2 @lg:bg-ink/85 @lg:px-2">
          <Reel spinning={playing} />
          <button
            className={`${btn} ${playBtn}`}
            aria-label={ended ? "Replay" : playing ? "Pause" : "Play"}
            onClick={toggle}
          >
            {ended ? <RotateCcw /> : playing ? <Pause /> : <Play />}
          </button>
          <FilmStrip
            frames={frames}
            time={time}
            duration={duration}
            playing={playing}
            onSeek={(t) => store.seek(t)}
            className="order-first mb-1 w-full @lg:order-none @lg:mb-0 @lg:w-auto @lg:flex-1"
          />
          <span className="mr-auto px-2 font-mono text-sm tabular-nums @lg:mr-0">
            {fmt(time)} / {fmt(duration)}
          </span>
          <button
            className={btn}
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => store.setMuted(!muted)}
          >
            {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </button>
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              store.setVolume(Number(e.target.value));
              store.setMuted(false);
            }}
            className="hidden h-12 w-24 accent-amber focus-visible:outline-[3px] focus-visible:outline-amber @md:block"
          />
          <button
            className={btn}
            aria-label={full ? "Exit fullscreen" : "Fullscreen"}
            onClick={() =>
              full ? store.exitFullscreen() : store.requestFullscreen()
            }
          >
            {full ? <Minimize /> : <Maximize />}
          </button>
        </div>
      )}
    </>
  );
}

export function ReelightPlayer({ src }: { src: string }) {
  return (
    <VideoPlayer>
      <Container className="rl-root @container relative flex w-full flex-col overflow-hidden bg-black">
        <Player src={src} />
      </Container>
    </VideoPlayer>
  );
}
