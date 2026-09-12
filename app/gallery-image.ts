import { images } from "../vercel.json";

// Vercel's optimizer is hosted; local builds keep using the source images.
export function galleryImageProps(src: string, sizes: string) {
  if (!process.env.NEXT_PUBLIC_VERCEL_IMAGES) return { src };

  const url = (width: number) =>
    `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;

  return {
    src: url(640),
    srcSet: images.sizes.map((width) => `${url(width)} ${width}w`).join(", "),
    sizes,
  };
}
