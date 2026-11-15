import { useEffect, useState } from "react";

export type Frame = { t: number; url: string };

// Grabs `count` snapshots with a hidden video. Works for local files and for
// online videos whose server allows CORS (Mux does). On failure it returns [].
export function useFrames(src: string, count = 10, width = 160) {
  const [frames, setFrames] = useState<Frame[]>([]);

  useEffect(() => {
    let off = false;
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.crossOrigin = "anonymous";
    v.src = src;
    const c = document.createElement("canvas");

    v.onloadedmetadata = async () => {
      try {
        const h = Math.round((width * v.videoHeight) / v.videoWidth);
        c.width = width;
        c.height = h;
        const ctx = c.getContext("2d")!;
        const out: Frame[] = [];
        for (let i = 0; i < count && !off; i++) {
          const t = (v.duration * (i + 0.5)) / count;
          v.currentTime = t;
          await new Promise<void>((r) => { v.onseeked = () => r(); });
          ctx.drawImage(v, 0, 0, width, h);
          out.push({ t, url: c.toDataURL("image/jpeg", 0.6) });
        }
        if (!off) setFrames(out);
      } catch {
        /* CORS or unsupported: the strip shows decorative frames */
      }
    };

    return () => {
      off = true;
      v.removeAttribute("src");
      v.load();
    };
  }, [src, count, width]);

  return frames;
}
