import { LocalizedLink as SharedLocalizedLink } from "@sudobility/components";
import type { LocalizedLinkProps as SharedLocalizedLinkProps } from "@sudobility/components";
import { isLanguageSupported } from "../../config/constants";

type LocalizedLinkProps = Omit<
  SharedLocalizedLinkProps,
  "isLanguageSupported" | "defaultLanguage"
>;

function LocalizedLink(props: LocalizedLinkProps) {
  return (
    <SharedLocalizedLink
      {...props}
      isLanguageSupported={isLanguageSupported}
      defaultLanguage="en"
    />
  );
}

export default LocalizedLink;
