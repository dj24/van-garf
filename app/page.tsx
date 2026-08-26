"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";

const galleryImages = [
  { id: "painted-hills", alt: "Sunlit hills above a calm blue lake" },
  { id: "cobalt-wave", alt: "Blue ocean wave rolling toward shore" },
  { id: "field-notes", alt: "Wild grasses glowing in the afternoon light" },
  { id: "amber-rock", alt: "Warm sandstone formations in the desert" },
  { id: "morning-glass", alt: "Modern building reflected in still water" },
  { id: "soft-forest", alt: "Misty evergreen forest" },
  { id: "coral-sky", alt: "Pink clouds over a distant mountain range" },
  { id: "quiet-stone", alt: "Textured stones by the sea" },
  { id: "golden-hour", alt: "Golden sun passing through tree branches" },
];

type GalleryItem = (typeof galleryImages)[number] & { key: string };

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished?: Promise<void> };
};

function imageUrl(id: string) {
  return `https://picsum.photos/seed/${id}/720/1280`;
}

export default function Home() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [transitioningKey, setTransitioningKey] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedItem]);

  const runViewTransition = (update: () => void) => {
    const transitionDocument = document as ViewTransitionDocument;

    if (!transitionDocument.startViewTransition) {
      update();
      return;
    }

    const transition = transitionDocument.startViewTransition(update);
    void transition.finished?.finally(() => setTransitioningKey(null));
  };

  const openLightbox = (item: GalleryItem) => {
    setIsPaused(true);

    if (!(document as ViewTransitionDocument).startViewTransition) {
      setSelectedItem(item);
      return;
    }

    flushSync(() => setTransitioningKey(item.key));
    runViewTransition(() => flushSync(() => setSelectedItem(item)));
  };

  const closeLightbox = () => {
    if (!(document as ViewTransitionDocument).startViewTransition) {
      setSelectedItem(null);
      return;
    }

    flushSync(() => setTransitioningKey(selectedItem?.key ?? null));
    runViewTransition(() => flushSync(() => setSelectedItem(null)));
  };

  return (
    <main className="bg-white">
      <section
        aria-label="van-garf"
        className="relative isolate h-[100svh] overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/blue-paint.png')" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.08) 55%, white 100%)",
          }}
        />
        <div className="relative z-10 mx-auto flex h-[100svh] max-w-[90rem] flex-col px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
          <header className="flex items-center justify-between">
            <img alt="van-garf" className="h-auto w-24 sm:w-32" src="/van-garf.png" />
            <a
              className="impasto-button inline-flex h-11 w-36 items-center justify-center px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:h-12 sm:w-40"
              href="#contact"
            >
              Contact us
            </a>
          </header>

          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-8 text-center sm:py-10">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-display text-balance text-3xl font-normal tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                Making the everyday extraordinary.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-6 text-slate-800 sm:text-base sm:leading-7">
                A new perspective, shaped with intention.
              </p>
              <a
                className="impasto-button mt-5 inline-flex h-11 w-36 items-center justify-center px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:mt-6 sm:h-12 sm:w-40"
                href="#contact"
              >
                Contact us
              </a>
            </div>

            <section
              aria-label="Selected work gallery"
              className="gallery-shell mt-8 h-[clamp(12rem,32svh,26rem)] w-full overflow-hidden rounded-2xl border border-white/50 bg-slate-200/75 p-2 shadow-[0_24px_70px_rgb(15_23_42_/_0.16)] backdrop-blur-sm sm:mt-10 sm:rounded-3xl sm:p-3"
            >
              <div className={`gallery-track ${isPaused ? "gallery-track--paused" : ""}`}>
                {[0, 1].map((copy) => (
                  <div className="gallery-group" key={copy}>
                    {galleryImages.map((image) => {
                      const item = { ...image, key: `${image.id}-${copy}` };
                      const isTransitionSource =
                        transitioningKey === item.key && selectedItem === null;
                      const transitionStyle = isTransitionSource
                        ? ({ viewTransitionName: "gallery-image" } as CSSProperties)
                        : undefined;

                      return (
                        <button
                          aria-label={`Open ${image.alt}`}
                          className="gallery-card group relative h-full shrink-0 overflow-hidden rounded-xl text-left outline-none sm:rounded-2xl"
                          key={item.key}
                          onClick={() => openLightbox(item)}
                          type="button"
                        >
                          <img
                            alt={image.alt}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-focus-visible:scale-105"
                            loading={copy === 0 ? "eager" : "lazy"}
                            src={imageUrl(image.id)}
                            style={transitionStyle}
                          />
                          <span className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/10 group-focus-visible:bg-slate-950/10" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="pointer-events-none absolute sr-only">
                A continuously scrolling collection of images. Select an image to view it larger.
              </p>
            </section>
          </div>
        </div>
      </section>

      {selectedItem && (
        <div
          aria-label="Image preview"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
          role="dialog"
        >
          <div aria-hidden="true" className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
          <div className="relative flex max-h-full max-w-full items-center justify-center">
            <img
              alt={selectedItem.alt}
              className="max-h-[calc(100svh-2rem)] max-w-[calc(100vw-2rem)] rounded-2xl object-contain shadow-2xl sm:max-h-[calc(100svh-4rem)] sm:max-w-[min(80vw,42rem)] sm:rounded-3xl"
              src={imageUrl(selectedItem.id)}
              style={{ viewTransitionName: "gallery-image" } as CSSProperties}
            />
            <button
              aria-label="Close image preview"
              autoFocus
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl leading-none text-slate-900 shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4 sm:top-4"
              onClick={closeLightbox}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
