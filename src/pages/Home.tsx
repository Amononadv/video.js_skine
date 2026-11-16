import { Link } from "react-router";
import { ReelightPlayer } from "../player/ReelightPlayer";

// Set VITE_MUX_PLAYBACK_ID in .env to switch from the local file to Mux.
const mux = import.meta.env.VITE_MUX_PLAYBACK_ID as string | undefined;
//console.log(import.meta.env);
const SRC = mux
  ? `https://stream.mux.com/${mux}.m3u8/highest.mp4`
  : "/Build a Mindblowing 3D Portfolio Website __ Three.js Beginner_s Tutorial(480P)(1).mp4";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-14">
      {/*<h1 className="font-display hidden text-7xl leading-none tracking-wide sm:text-9xl">
        Reelight
      </h1>
      <p className="mt-3 max-w-md text-smoke hidden">
        Every video runs through a projector. Press play and watch the reel
        turn.
      </p>*/}
      <div className="mt-8 overflow-hidden rounded-md border border-film">
        <ReelightPlayer src={SRC} />
      </div>
      {/* <Link to="/notes" className="mt-6 inline-block py-3 text-amber underline underline-offset-4 focus-visible:outline-[3px] focus-visible:outline-amber">
        Read the design notes
      </Link>*/}
    </main>
  );
}
