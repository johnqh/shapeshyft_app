import { Link, useParams } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { isLanguageSupported } from '../../config/constants';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

function LocalizedLink({ to, children, ...props }: LocalizedLinkProps) {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang && isLanguageSupported(lang) ? lang : 'en';

  // Add language prefix if not already present
  const localizedTo = to.startsWith(`/${currentLang}`)
    ? to
    : `/${currentLang}${to.startsWith('/') ? to : `/${to}`}`;

  return (
    <Link to={localizedTo} {...props}>
      {children}
    </Link>
  );
}

export default LocalizedLink;
