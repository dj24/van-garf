// Set this to the public production origin, never a preview deployment URL.
const configuredUrl = process.env.SITE_URL;
export const siteUrl = configuredUrl ? new URL(configuredUrl).origin : undefined;

export const site = {
  name: "VanGarf",
  title: "VanGarf | Camper Van & Motorhome Habitation Servicing in Ely",
  description:
    "Camper van and motorhome habitation servicing and repairs in Ely, Cambridgeshire. Boatbuilding experience, brought ashore. Call VanGarf about your next project.",
  image: "/gallery/van-grey-exterior.jpeg",
  imageAlt: "Grey Volkswagen camper van with roof awning",
};

export const businessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  ...(siteUrl && {
    "@id": `${siteUrl}/#business`,
    url: `${siteUrl}/`,
    image: `${siteUrl}${site.image}`,
    logo: `${siteUrl}/van-icon.png`,
  }),
  telephone: "+441353668551",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+447775857878",
    contactType: "customer service",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "1 Annesdale",
    addressLocality: "Ely",
    addressRegion: "Cambridgeshire",
    postalCode: "CB7 4BN",
    addressCountry: "GB",
  },
};
