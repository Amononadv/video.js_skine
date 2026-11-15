type Props = { kicker: string; title: string; note: string; image?: string };

// Full-screen title card with a theatre marquee frame: chasing bulbs, double border,
// projector light from above, film-leader details and a perforated ticket.
export function CinemaCard({ kicker, title, note, image }: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden bg-ink"
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 grayscale"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(240,160,32,.25),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.7))]" />

      {/* marquee frame */}
      <div className="absolute inset-1.5 border-2 border-paper/60" />
      <div className="bulbs-x absolute inset-x-3 top-2.5 h-2" />
      <div className="bulbs-x absolute inset-x-3 bottom-2.5 h-2" />
      <div className="bulbs-y absolute inset-y-3 left-2.5 w-2" />
      <div className="bulbs-y absolute inset-y-3 right-2.5 w-2" />
      <div className="absolute inset-6 border border-paper/25" />

      {/* film-leader details (hidden on small players) */}
      <div className="absolute inset-6 hidden font-mono text-xs text-paper/70 @xs:block">
        <span className="absolute top-2 left-3">No. 01</span>
        <span className="absolute top-2 right-3">35mm</span>
      </div>

      <div className="cinema-body absolute inset-0 flex flex-col items-center justify-center gap-2 px-10 pb-0 text-center @lg:pb-24">
        <p className="hidden font-mono text-sm text-amber @xs:block">
          {kicker}
        </p>
        <h2 className="font-display text-[clamp(44px,15cqw,132px)] leading-[.85]">
          {title}
        </h2>
        <div className="ticket mt-3 hidden items-center border-2 border-dashed border-amber/70 bg-amber/10 px-7 py-1.5 font-mono text-xs text-amber @xs:flex @lg:px-9 @lg:py-2 @lg:text-sm">
          {note}
        </div>
      </div>
    </div>
  );
}
