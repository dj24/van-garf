import type { Metadata } from "next";
import "./globals.css";
import { businessStructuredData, site, siteUrl } from "./site";

export const metadata: Metadata = {
  ...(siteUrl && {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
  }),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    title: site.title,
    description: site.description,
    ...(siteUrl && {
      url: `${siteUrl}/`,
      images: [{ url: site.image, width: 4032, height: 3024, alt: site.imageAlt }],
    }),
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    ...(siteUrl && { images: [{ url: `${siteUrl}${site.image}`, alt: site.imageAlt }] }),
  },
  icons: { icon: { url: "/van-icon.png", type: "image/png" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600 sm:px-8">
          <p>
            Website by{" "}
            <a
              className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950"
              href="https://danieljackson.me"
            >
              Daniel Jackson
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
