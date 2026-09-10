"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";

const galleryImages = [
  {
    id: "grey-exterior",
    src: "/gallery/van-grey-exterior.jpeg",
    alt: "Grey Volkswagen camper van with roof awning",
  },
  {
    id: "black-camper",
    src: "/gallery/van-black-camper.jpeg",
    alt: "Black Volkswagen camper van parked by fields",
  },
  {
    id: "poptop",
    src: "/gallery/van-poptop.jpeg",
    alt: "Black camper van with its pop-top roof raised",
  },
  {
    id: "finished-kitchen",
    src: "/gallery/van-finished-kitchen.jpeg",
    alt: "Finished van interior with kitchen and seating",
  },
  {
    id: "cabin",
    src: "/gallery/van-cabin.jpeg",
    alt: "Finished camper van cabin and kitchen",
  },
  {
    id: "rear-fitout",
    src: "/gallery/van-rear-fitout.jpeg",
    alt: "Camper van rear storage and interior fit-out",
  },
  {
    id: "bed-platform",
    src: "/gallery/van-bed-platform.jpeg",
    alt: "Camper van bed platform and cabinets",
  },
  {
    id: "side-cabinet",
    src: "/gallery/van-side-cabinet.jpeg",
    alt: "Camper van side cabinet and fitted window",
  },
  {
    id: "rear-workspace",
    src: "/gallery/van-rear-workspace.jpeg",
    alt: "Camper van rear workspace with fitted storage",
  },
];

type GalleryItem = (typeof galleryImages)[number] & { key: string };

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished?: Promise<void> };
};

export default function Home() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [transitioningKey, setTransitioningKey] = useState<string | null>(null);

  const showAdjacentImage = (direction: -1 | 1) => {
    setSelectedItem((currentItem) => {
      if (!currentItem) return currentItem;

      const currentIndex = galleryImages.findIndex((image) => image.id === currentItem.id);
      const nextIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
      const nextImage = galleryImages[nextIndex];
      const copy = currentItem.key.endsWith("-1") ? 1 : 0;

      return { ...nextImage, key: `${nextImage.id}-${copy}` };
    });
  };

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showAdjacentImage(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showAdjacentImage(1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedItem]);

  const runViewTransition = (update: () => void, onFinish?: () => void) => {
    const transitionDocument = document as ViewTransitionDocument;

    if (!transitionDocument.startViewTransition) {
      update();
      return;
    }

    const transition = transitionDocument.startViewTransition(update);
    void transition.finished?.finally(() => {
      setTransitioningKey(null);
      onFinish?.();
    });
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
      setIsPaused(false);
      return;
    }

    flushSync(() => setTransitioningKey(selectedItem?.key ?? null));
    runViewTransition(
      () => flushSync(() => setSelectedItem(null)),
      () => setIsPaused(false),
    );
  };

  return (
    <main className="bg-white">
      <section
        aria-label="van-garf"
        className="relative isolate h-[100svh] overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/sky-paint.png')" }}
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
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                alt=""
                className="van-icon h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
                height={1230}
                src="/van-icon.png"
                width={1278}
              />
              <span className="font-display whitespace-nowrap text-2xl font-normal tracking-[-0.055em] text-slate-950 sm:text-3xl">
                VanGarf
              </span>
            </div>
            <a
              className="primary-button inline-flex h-11 w-36 items-center justify-center px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:h-12 sm:w-40"
              href="#contact"
            >
              Contact us
            </a>
          </header>

          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-8 text-center sm:py-10">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-display text-balance text-3xl font-normal tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                Care for your home on wheels.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-6 text-slate-800 sm:text-base sm:leading-7">
                Camper van &amp; motorhome habitation servicing and repairs in Ely.
                Boatbuilding experience, brought ashore.
              </p>
              <a
                className="primary-button mt-5 inline-flex h-11 w-36 items-center justify-center px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:mt-6 sm:h-12 sm:w-40"
                href="#contact"
              >
                Contact us
              </a>
            </div>

            <section
              aria-label="Selected work gallery"
              className="gallery-shell relative left-1/2 mt-8 h-[clamp(12rem,32svh,26rem)] w-screen -translate-x-1/2 overflow-hidden sm:mt-10"
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
                            loading={copy === 0 && image.id === "grey-exterior" ? "eager" : "lazy"}
                            src={image.src}
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

      <section
        aria-labelledby="contact-heading"
        className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20"
        id="contact"
      >
        <div>
          <h2
            className="font-display text-3xl tracking-[-0.04em] text-slate-950 sm:text-4xl"
            id="contact-heading"
          >
            Let’s talk about your van.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            Get in touch about habitation servicing, repairs, or your next project.
          </p>
          <address className="mt-8 space-y-6 text-base not-italic leading-7 text-slate-800">
            <p>
              1 Annesdale, Ely<br />
              Cambridgeshire<br />
              CB7 4BN
            </p>
            <div className="flex flex-col items-start gap-1">
              <a className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900" href="tel:01353668551">
                01353 668 551
              </a>
              <a className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900" href="tel:07775857878">
                0777 585 7878
              </a>
            </div>
          </address>
        </div>

        <form
          aria-label="Contact us"
          aria-describedby="contact-form-note"
          className="space-y-5 rounded-2xl bg-slate-50 p-6 sm:p-8"
          onSubmit={(event) => event.preventDefault()}
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="contact-name">Name</label>
            <input
              autoComplete="name"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              id="contact-name"
              name="name"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="contact-email">Email</label>
            <input
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              id="contact-email"
              name="email"
              type="email"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="contact-message">Message</label>
            <textarea
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              id="contact-message"
              name="message"
              rows={5}
            />
          </div>
          <p className="text-sm leading-6 text-slate-600" id="contact-form-note">
            Our contact form is coming soon. Please give us a call for now.
          </p>
          <button
            className="primary-button inline-flex h-12 w-40 cursor-not-allowed items-center justify-center px-4 text-sm font-semibold text-white opacity-60"
            disabled
            type="submit"
          >
            Send message
          </button>
        </form>
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
              className="max-h-[calc(100svh-2rem)] max-w-[calc(100vw-7.5rem)] rounded-2xl object-contain shadow-2xl sm:max-h-[calc(100svh-4rem)] sm:max-w-[min(calc(100vw-12rem),42rem)] sm:rounded-3xl"
              src={selectedItem.src}
              style={{ viewTransitionName: "gallery-image" } as CSSProperties}
            />
            <button
              aria-label="Previous image"
              className="absolute right-[calc(100%+0.75rem)] top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-[calc(100%+1rem)] sm:h-11 sm:w-11"
              onClick={() => showAdjacentImage(-1)}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              aria-label="Next image"
              className="absolute left-[calc(100%+0.75rem)] top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-[calc(100%+1rem)] sm:h-11 sm:w-11"
              onClick={() => showAdjacentImage(1)}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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
