import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

/**
 * Composant SEO global
 * Permet de définir dynamiquement les balises <title>, <meta>, OpenGraph et Twitter
 * Utilisable sur toutes les pages : <Seo title="..." description="..." />
 */

const defaultMeta = {
  title: "BeautyConnect – Trouvez le professionnel beauté qui vous correspond",
  description:
    "BeautyConnect vous aide à découvrir et réserver les meilleurs professionnels de la beauté autour de vous.",
  url: "https://beautyconnect.fr",
  image: "/vite.svg",
};

const Seo = ({ title, description, image, url }) => {
  const metaTitle = title ? `${title} | BeautyConnect` : defaultMeta.title;
  const metaDescription = description || defaultMeta.description;
  const metaUrl = url || defaultMeta.url;
  const metaImage = image || defaultMeta.image;

  return (
    <HelmetProvider>
      <Helmet>
        {/* === Balises de base === */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={metaUrl} />

        {/* === Open Graph === */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={metaUrl} />

        {/* === Twitter === */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />

        {/* === Accessibilité / Couleur navigateur === */}
        <meta name="theme-color" content="#2563eb" />
      </Helmet>
    </HelmetProvider>
  );
};

export default Seo;
