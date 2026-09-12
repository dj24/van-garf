"use client";

import { useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes } from "react";

type FadeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad" | "onError"> & {
  placeholder: string;
  imageClassName?: string;
};

export function FadeImage(props: FadeImageProps) {
  // A new source must start hidden, even when navigating quickly in the lightbox.
  return <ImageWithPlaceholder key={`${props.src}|${props.srcSet}|${props.sizes}`} {...props} />;
}

function ImageWithPlaceholder({ placeholder, className = "", imageClassName = "", style, ...props }: FadeImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const image = imageRef.current!;
    let cancelled = false;
    let request = 0;

    const reveal = async () => {
      const version = ++request;
      const source = image.currentSrc;
      if (!image.complete || image.naturalWidth === 0) return;
      try {
        await image.decode();
        if (!cancelled && version === request && image.currentSrc === source) {
          setReady(true);
        }
      } catch {
        // Failed or superseded decodes keep the colour placeholder visible.
      }
    };
    const hide = () => {
      request++;
      setReady(false);
    };

    image.addEventListener("load", reveal);
    image.addEventListener("error", hide);
    // Covers cached images and loads that finish before hydration.
    void reveal();
    return () => {
      cancelled = true;
      image.removeEventListener("load", reveal);
      image.removeEventListener("error", hide);
    };
  }, []);

  return (
    <span
      className={`fade-image ${className}`}
      data-ready={ready}
      style={{ ...style, "--image-placeholder": placeholder } as CSSProperties}
    >
      <img
        {...props}
        ref={imageRef}
        className={`fade-image-content ${imageClassName}`}
        decoding="async"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </span>
  );
}
