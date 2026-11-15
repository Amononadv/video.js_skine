import { Link } from "react-router";

export default function Notes() {
  return (
    <main className="mx-auto max-w-xl px-4 py-14">
      <h1 className="font-display text-6xl">Design notes</h1>
      <p className="mt-4 leading-relaxed">
        Reelight treats the timeline as a strip of 35mm film. Each frame is a
        real snapshot of the video. Frames start dark and develop as the film
        reaches them, and the sprocket holes drift along while you watch.
      </p>
      <p className="mt-3 leading-relaxed">
        A film reel sits beside the play button. It spins up when the video
        plays and winds down slowly when you pause. Before the first play, a
        film-leader countdown runs 3, 2, 1.
      </p>
      <p className="mt-3 leading-relaxed">
        Point at the strip, drag a finger along it, or focus it with the
        keyboard and a framed preview with its timecode floats above. Four amber
        checkpoints work like save points in a game: press one to jump there.
      </p>
      <p className="mt-3 leading-relaxed">
        Black, paper white and one amber accent keep the controls readable over
        bright and dark footage. Every control is at least 48px and shows an
        amber outline on keyboard focus. With reduced motion on, the reel,
        holes, grain and countdown stay still.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block py-3 text-amber underline underline-offset-4 focus-visible:outline-[3px] focus-visible:outline-amber"
      >
        Back to the player
      </Link>
    </main>
  );
}
