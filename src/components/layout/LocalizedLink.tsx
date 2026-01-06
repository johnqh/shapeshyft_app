import { Link, useParams } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import {
  isLanguageSupported,
  type SupportedLanguage,
} from "../../config/constants";

interface LocalizedLinkProps extends Omit<LinkProps, "to"> {
  to: string;
  language?: SupportedLanguage; // Optional specific language override
}

function LocalizedLink({
  to,
  language,
  children,
  ...props
}: LocalizedLinkProps) {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang && isLanguageSupported(lang) ? lang : "en";

  // Use provided language or fall back to current
  const targetLang = language || currentLang;

  // Add language prefix if not already present
  const localizedTo = to.startsWith(`/${targetLang}`)
    ? to
    : `/${targetLang}${to.startsWith("/") ? to : `/${to}`}`;

  return (
    <Link to={localizedTo} {...props}>
      {children}
    </Link>
  );
}

export default LocalizedLink;
