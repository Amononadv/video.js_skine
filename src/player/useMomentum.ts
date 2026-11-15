import { useEffect, useRef, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

// Spins up fast when `active` turns on, winds down slowly when it turns off.
// onTick gets the distance travelled this frame. With reduced motion, nothing moves.
export function useMomentum(active: boolean, maxSpeed: number, onTick: (distance: number) => void) {
  const reduced = usePrefersReducedMotion();
  const velocity = useRef(0);
  const tick = useRef(onTick);
  tick.current = onTick;

  useEffect(() => {
    const target = active && !reduced ? maxSpeed : 0;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const rate = target > velocity.current ? 5 : 2.2;
      velocity.current += (target - velocity.current) * (1 - Math.exp(-rate * dt));
      if (target === 0 && velocity.current < 0.05) {
        velocity.current = 0;
        return;
      }
      tick.current(velocity.current * dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, maxSpeed]);
}
