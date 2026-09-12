# van-garf

This project was created with create-vinext-app.

## Scripts

- `pnpm run dev` starts the vinext dev server.
- `pnpm run build` builds production output.
- `pnpm run start` starts the production server locally.

## Gallery image optimization

Vercel builds serve responsive carousel and lightbox images through
`/_vercel/image`, using quality 75 and AVIF/WebP negotiation. Allowed widths,
gallery paths, and the one-day minimum cache lifetime are configured in
`vercel.json`; Vite also passes those settings to Nitro's Build Output API config.
The originals remain in `public/gallery`.

Optimization is enabled when building on Vercel (`VERCEL=1`) or with
`NITRO_PRESET=vercel`. Local development and ordinary local builds serve originals,
since the hosted optimization endpoint is unavailable locally. To inspect the
deployment output, build with `NITRO_PRESET=vercel` and check the `images` field in
`.vercel/output/config.json`. After deployment, gallery requests should use
`/_vercel/image?url=...&w=...&q=75` and return resized images.

## SEO configuration

Set `SITE_URL` to the site's public production origin (including `https://`) in
the deployment environment. Use the same value for builds and runtime. This
enables canonical URLs, absolute social preview images, business URLs, and the
homepage entry in `/sitemap.xml`, linked from `/robots.txt`.

Without `SITE_URL`, domain-dependent metadata is omitted and the sitemap is empty
to avoid publishing an incorrect production URL. Business details and shared
search/social copy live in `app/site.ts`.
