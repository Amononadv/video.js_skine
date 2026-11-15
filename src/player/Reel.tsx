import { useRef } from "react";
import { useMomentum } from "./useMomentum";

export function Reel({ spinning, className = "size-12 shrink-0" }: { spinning: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const angle = useRef(0);

  useMomentum(spinning, 260, (d) => {
    angle.current = (angle.current + d) % 360;
    ref.current?.style.setProperty("transform", `rotate(${angle.current}deg)`);
  });

  return (
    <svg ref={ref} viewBox="0 0 64 64" aria-hidden className={className}>
      <circle cx="32" cy="32" r="30" fill="#2a2926" stroke="#8d887c" strokeWidth="2" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx="32" cy="14" r="6.5" fill="#0d0d0c" transform={`rotate(${a} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="6" fill="#f0a020" />
      <circle cx="32" cy="32" r="2" fill="#0d0d0c" />
    </svg>
  );
}
