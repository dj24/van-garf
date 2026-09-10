# van-garf

This project was created with create-vinext-app.

## Scripts

- `pnpm run dev` starts the vinext dev server.
- `pnpm run build` builds production output.
- `pnpm run start` starts the production server locally.

## SEO configuration

Set `SITE_URL` to the site's public production origin (including `https://`) in
the deployment environment. Use the same value for builds and runtime. This
enables canonical URLs, absolute social preview images, business URLs, and the
homepage entry in `/sitemap.xml`, linked from `/robots.txt`.

Without `SITE_URL`, domain-dependent metadata is omitted and the sitemap is empty
to avoid publishing an incorrect production URL. Business details and shared
search/social copy live in `app/site.ts`.
