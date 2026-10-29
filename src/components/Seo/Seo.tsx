import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description?: string;
  /** Pages that shouldn't be indexed (login, settings, private pages). */
  noIndex?: boolean;
}

const SITE_NAME = "Wesal";
const DEFAULT_DESCRIPTION =
  "Wesal is a social platform to share posts, follow friends, and stay connected.";

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  noIndex = false,
}: SeoProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
