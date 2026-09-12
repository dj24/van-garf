"use client";

import { addTransitionType, startTransition, useEffect, useRef, useState, ViewTransition, type FormEvent } from "react";
import { galleryImageProps } from "./gallery-image";
import { FadeImage } from "./fade-image";

// The JPEGs have EXIF orientation 6: their displayed dimensions are 3024 × 4032.
const galleryImages = [
  {
    id: "grey-exterior",
    placeholder: "#818385",
    src: "/gallery/van-grey-exterior.jpeg",
    alt: "Grey Volkswagen camper van with roof awning",
  },
  {
    id: "black-camper",
    placeholder: "#868584",
    src: "/gallery/van-black-camper.jpeg",
    alt: "Black Volkswagen camper van parked by fields",
  },
  {
    id: "poptop",
    placeholder: "#7c7a78",
    src: "/gallery/van-poptop.jpeg",
    alt: "Black camper van with its pop-top roof raised",
  },
  {
    id: "finished-kitchen",
    placeholder: "#6e6759",
    src: "/gallery/van-finished-kitchen.jpeg",
    alt: "Finished van interior with kitchen and seating",
  },
  {
    id: "cabin",
    placeholder: "#676254",
    src: "/gallery/van-cabin.jpeg",
    alt: "Finished camper van cabin and kitchen",
  },
  {
    id: "rear-fitout",
    placeholder: "#6d675d",
    src: "/gallery/van-rear-fitout.jpeg",
    alt: "Camper van rear storage and interior fit-out",
  },
  {
    id: "bed-platform",
    placeholder: "#787362",
    src: "/gallery/van-bed-platform.jpeg",
    alt: "Camper van bed platform and cabinets",
  },
  {
    id: "side-cabinet",
    placeholder: "#74726e",
    src: "/gallery/van-side-cabinet.jpeg",
    alt: "Camper van side cabinet and fitted window",
  },
  {
    id: "rear-workspace",
    placeholder: "#767368",
    src: "/gallery/van-rear-workspace.jpeg",
    alt: "Camper van rear workspace with fitted storage",
  },
];

type GalleryItem = (typeof galleryImages)[number] & { key: string };
const GALLERY_RESUME_DELAY = 5000;
const GALLERY_CYCLE_DURATION = 110000;

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<"success" | "error" | null>(null);
  const submissionPending = useRef(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const contactDetailsRef = useRef<HTMLDivElement>(null);
  const galleryResumeAt = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = [contactDetailsRef.current];
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        if (element) element.dataset.revealReady = "true";
      });
      return;
    }

    const animations = new Map<Element, Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animations.get(entry.target)?.play();
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15 });

    const revealOnFocus = (event: FocusEvent) => {
      const element = event.currentTarget as HTMLDivElement;
      animations.get(element)?.cancel();
      observer.unobserve(element);
    };
    for (const element of elements) {
      if (!element) continue;
      const animation = element.animate([
        { opacity: 0, transform: "translateY(24px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], {
        duration: 900,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "backwards",
      });
      animation.pause();
      // The paused animation now keeps the server-hidden text invisible.
      element.dataset.revealReady = "true";
      animations.set(element, animation);
      observer.observe(element);
      element.addEventListener("focusin", revealOnFocus);
    }

    const stopAnimations = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
    reducedMotion.addEventListener("change", stopAnimations);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      reducedMotion.removeEventListener("change", stopAnimations);
      elements.forEach((element) => {
        if (!element) return;
        element.removeEventListener("focusin", revealOnFocus);
        delete element.dataset.revealReady;
      });
    };
  }, []);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 0);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousTime = performance.now();
    let expectedScrollLeft = gallery.scrollLeft;
    let position = gallery.scrollLeft;
    let pointerDown = false;
    const pause = () => {
      galleryResumeAt.current = performance.now() + GALLERY_RESUME_DELAY;
    };
    const onScroll = () => {
      // Auto-advance also emits scroll events; only manual movement resets the delay.
      if (Math.abs(gallery.scrollLeft - expectedScrollLeft) > 0.5) {
        position = gallery.scrollLeft;
        expectedScrollLeft = position;
        pause();
      }
    };
    const onPointerDown = () => { pointerDown = true; pause(); };
    const onPointerUp = () => {
      if (pointerDown) pause();
      pointerDown = false;
    };
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && event.deltaX !== 0) pause();
    };
    const advance = (now: number) => {
      const elapsed = Math.min(now - previousTime, 50);
      previousTime = now;
      // Detect input before its queued scroll event so animation cannot overwrite it.
      onScroll();
      if (!isPaused && !pointerDown && !reducedMotion.matches && now >= galleryResumeAt.current) {
        const cycleWidth = gallery.firstElementChild?.firstElementChild?.getBoundingClientRect().width ?? 0;
        if (cycleWidth > 0) {
          position = (position + cycleWidth * elapsed / GALLERY_CYCLE_DURATION) % cycleWidth;
          gallery.scrollLeft = position;
          expectedScrollLeft = gallery.scrollLeft;
        }
      }
      frame = requestAnimationFrame(advance);
    };

    gallery.addEventListener("scroll", onScroll, { passive: true });
    gallery.addEventListener("wheel", onWheel, { passive: true });
    gallery.addEventListener("pointerdown", onPointerDown);
    gallery.addEventListener("keydown", pause);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    frame = requestAnimationFrame(advance);
    return () => {
      cancelAnimationFrame(frame);
      gallery.removeEventListener("scroll", onScroll);
      gallery.removeEventListener("wheel", onWheel);
      gallery.removeEventListener("pointerdown", onPointerDown);
      gallery.removeEventListener("keydown", pause);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [isPaused]);

  useEffect(() => {
    if (!formMessage) return;
    const timer = setTimeout(() => setFormMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [formMessage]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionPending.current) return;

    submissionPending.current = true;
    setIsSubmitting(true);
    setFormMessage(null);
    const data = new URLSearchParams();
    new FormData(event.currentTarget).forEach((value, key) => {
      if (typeof value === "string") data.append(key, value);
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch(
        `https://6a2w999i96.execute-api.eu-west-1.amazonaws.com/default/send-garf-email?${data.toString()}`,
        { method: "POST" },
      );
      setFormMessage(response.status === 200 ? "success" : "error");
    } catch {
      setFormMessage("error");
    } finally {
      submissionPending.current = false;
      setIsSubmitting(false);
    }
  };

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
    if (!selectedItem) {
      // React defers this effect until the closing view transition finishes.
      setIsPaused(false);
      return;
    }

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

  const openLightbox = (item: GalleryItem) => {
    setIsPaused(true);
    startTransition(() => {
      addTransitionType("lightbox-open");
      setSelectedItem(item);
    });
  };

  const closeLightbox = () => {
    startTransition(() => {
      addTransitionType("lightbox-close");
      setSelectedItem(null);
    });
  };

  return (
    <main className="bg-white">
      <header data-scrolled={isScrolled} className="hero-nav mx-auto flex h-[64px] max-w-[90rem] items-center justify-between px-4 py-3 sm:h-[68px] sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            alt=""
            className="van-icon h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11"
            height={512}
            src="/van-icon.png"
            width={512}
          />
          <span className="font-display whitespace-nowrap text-3xl font-normal tracking-[-0.055em] text-slate-950 sm:text-4xl">
            VanGarf
          </span>
        </div>
        <a
          className="primary-button inline-flex h-10 w-32 items-center justify-center px-3 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:h-11 sm:w-36"
          href="#contact"
        >
          Contact us
        </a>
      </header>
      <section
        aria-label="van-garf"
        className="relative isolate h-[80svh] overflow-hidden sm:aspect-[21/9] sm:h-auto lg:aspect-[26/9]"
      >
        <FadeImage
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full"
          imageClassName="h-full w-full object-cover object-bottom"
          placeholder="#5b7f97"
          src="/van-bg.png"
          width={1916}
          height={821}
          fetchPriority="high"
        />
        <div
          aria-hidden="true"
          className="hero-bottom-blur pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-24"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-white/0 to-white sm:h-24"
        />
        <div className="relative z-10 mx-auto flex h-full max-w-[90rem] flex-col px-4 pb-6 pt-[64px] sm:px-6 sm:pb-8 sm:pt-[68px]">
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-8 text-center sm:py-10">
            <div className="hero-copy mx-auto max-w-3xl">
              <h1 className="font-display text-balance text-2xl font-normal tracking-[-0.055em] text-slate-950 sm:text-4xl lg:text-5xl">
                Care for your home on wheels.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-6 text-slate-800 sm:text-base sm:leading-7">
                Camper van &amp; motorhome habitation servicing and repairs in Ely.
                Boatbuilding experience, brought ashore.
              </p>
              <a
                className="primary-button mt-5 inline-flex h-10 w-32 items-center justify-center px-3 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:mt-6 sm:h-11 sm:w-36"
                href="#contact"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Selected work gallery"
        className="gallery-shell relative -mt-8 h-[clamp(12rem,32svh,26rem)] w-full overflow-hidden sm:-mt-10"
      >
        <div className="gallery-scroller" ref={galleryRef} tabIndex={0} role="region" aria-label="Scroll gallery" >
        <div className="gallery-track">
          {[0, 1].map((copy) => (
            <div className="gallery-group" key={copy}>
              {galleryImages.map((image) => {
                const item = { ...image, key: `${image.id}-${copy}` };

                return (
                  <button
                    aria-label={`Open ${image.alt}`}
                    className="gallery-card group relative h-full shrink-0 overflow-hidden rounded-[var(--gallery-radius)] text-left outline-none"
                    key={item.key}
                    onClick={() => openLightbox(item)}
                    type="button"
                  >
                    {selectedItem?.key !== item.key && (
                      <ViewTransition name={`gallery-${item.key}`} default="none" share="gallery-image">
                        <FadeImage
                          alt={image.alt}
                          placeholder={image.placeholder}
                          className="h-full w-full rounded-[inherit]"
                          imageClassName="h-full w-full object-cover duration-500 group-hover:scale-105 group-focus-visible:scale-105"
                          width={3024}
                          height={4032}
                          loading={copy === 0 && image.id === "grey-exterior" ? "eager" : "lazy"}
                          {...galleryImageProps(image.src, "clamp(9rem, 24svh, 19.5rem)")}
                          decoding="async"
                        />
                      </ViewTransition>
                    )}
                    <span className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/10 group-focus-visible:bg-slate-950/10" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        </div>
        <p className="pointer-events-none absolute sr-only">
          Scroll to explore the images. Automatic scrolling resumes after five seconds of inactivity. Select an image to view it larger.
        </p>
      </section>

      <section
        aria-labelledby="contact-heading"
        className="mt-16 grid w-full border-t border-slate-200 bg-white sm:mt-24 lg:grid-cols-2"
        id="contact"
      >
        <div ref={contactDetailsRef} className="viewport-reveal contact-details px-6 py-10 sm:px-8 sm:py-16 lg:pr-16">
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
          aria-busy={isSubmitting}
          className="contact-form space-y-5 bg-neutral-100 px-6 py-10 sm:px-8 sm:py-16 lg:pl-16"
          id="contact-form"
          onSubmit={submit}
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
          <p
            className="text-sm leading-6 text-green-700"
            id="contact-form-success"
            role="status"
            style={{ display: formMessage === "success" ? "flex" : "none" }}
          >
            Thank you! Your message has been sent.
          </p>
          <p
            className="text-sm leading-6 text-red-700"
            id="contact-form-error"
            role="alert"
            style={{ display: formMessage === "error" ? "flex" : "none" }}
          >
            Your message could not be sent. Please try again or give us a call.
          </p>
          <button
            className="primary-button inline-flex h-11 w-36 items-center justify-center px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            id="submit-button"
            type="submit"
          >
            {isSubmitting ? "Sending…" : "Send message"}
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
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
          <div className="relative flex max-h-full max-w-full items-center justify-center">
            <ViewTransition key={selectedItem.key} name={`gallery-${selectedItem.key}`} default="none" share="gallery-image">
              <FadeImage
                alt={selectedItem.alt}
                placeholder={selectedItem.placeholder}
                className="lightbox-image rounded-[var(--lightbox-radius)] shadow-2xl"
                imageClassName="h-full w-full object-contain"
                width={3024}
                height={4032}
                {...galleryImageProps(selectedItem.src, "(min-width: 640px) min(calc(100vw - 12rem), 42rem), calc(100vw - 7.5rem)")}
              />
            </ViewTransition>
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
