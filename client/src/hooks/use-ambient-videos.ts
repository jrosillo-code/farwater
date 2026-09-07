import { useEffect } from "react";

// Ambient background and card videos are the single biggest source of jank on
// this site. An <video autoplay> starts decoding the moment it has data,
// whether or not it is anywhere near the viewport — so the expeditions grid
// was putting six 1080p streams through the decoder at once while you were
// still trying to scroll past the first card. Pausing them afterwards did not
// help much, because `autoplay` and a canplay handler kept starting them again
// on every rebuffer.
//
// This makes the viewport the ONLY thing that starts a video. Elements marked
// <video data-ambient> are:
//   · not fetched at all until they approach the viewport — a card left at
//     preload="metadata" is downgraded to "none" and the poster carries it
//   · played only while near the viewport, paused the moment they leave
//   · paused wholesale when the tab is hidden; a backgrounded tab costs nothing
//   · left on their poster entirely for reduced-motion users, and restored the
//     moment that preference is switched off
//
// Opting out: an element that ships preload="auto" is treated as EAGER and
// keeps its head start. That is for the above-the-fold page heroes, which are
// visible on arrival and should never wait on an observer callback.
//
// The observer follows the DOM rather than a snapshot taken at mount, so
// videos that appear later — a filtered grid, a lazily rendered section —
// are governed too.
export function useAmbientVideos() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tracked = new Set<HTMLVideoElement>();
    const near = new Set<HTMLVideoElement>();

    const shouldPlay = (v: HTMLVideoElement) =>
      near.has(v) && !reduced.matches && document.visibilityState === "visible";

    const sync = (v: HTMLVideoElement) => {
      if (shouldPlay(v)) {
        // Flipping preload here is what actually starts the download for a
        // lazy card; play() alone would do it too, but being explicit keeps
        // the intent readable.
        if (v.preload !== "auto") v.preload = "auto";
        void v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    };

    // One screen of lead time: enough for a card to be decoding by the time it
    // is actually looked at, not so much that scrolling past a section starts
    // everything below it.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) near.add(v);
          else near.delete(v);
          sync(v);
        }
      },
      { rootMargin: "200px 0px" }
    );

    // Phones are served a "-m" encode of each clip (lib/media.ts). If one is
    // ever missing from a deploy, fall back to the full-size file rather than
    // showing a broken player — a slow hero beats no hero.
    const onError = (event: Event) => {
      const v = event.currentTarget as HTMLVideoElement;
      const src = v.currentSrc || v.src;
      if (!src.includes("-m.mp4")) return;
      v.src = src.replace("-m.mp4", ".mp4");
      v.load();
      sync(v);
    };

    const adopt = (v: HTMLVideoElement) => {
      if (tracked.has(v)) return;
      tracked.add(v);
      if (v.preload !== "auto") v.preload = "none";
      v.addEventListener("error", onError);
      io.observe(v);
    };

    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLVideoElement>("video[data-ambient]").forEach(adopt);
    };

    scan(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("video[data-ambient]")) adopt(node as HTMLVideoElement);
          else scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const resync = () => tracked.forEach(sync);
    document.addEventListener("visibilitychange", resync);
    reduced.addEventListener("change", resync);

    return () => {
      io.disconnect();
      mo.disconnect();
      tracked.forEach((v) => v.removeEventListener("error", onError));
      document.removeEventListener("visibilitychange", resync);
      reduced.removeEventListener("change", resync);
    };
  }, []);
}
