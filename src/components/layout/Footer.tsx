import { useTranslation } from "react-i18next";
import {
  Footer as FooterContainer,
  FooterGrid,
  FooterBrand,
  FooterLinkSection,
  FooterLink,
  FooterBottom,
  FooterCompact,
  FooterCompactLeft,
  FooterCompactRight,
  FooterVersion,
  FooterCopyright,
} from "@sudobility/components";
import { SystemStatusIndicator, useNetwork } from "@sudobility/devops-components";
import { CONSTANTS } from "../../config/constants";
import LocalizedLink from "./LocalizedLink";

interface FooterProps {
  variant?: "full" | "compact";
}

function Footer({ variant = "full" }: FooterProps) {
  const { t } = useTranslation("common");
  const currentYear = String(new Date().getFullYear());
  const { isOnline } = useNetwork();

  if (variant === "compact") {
    return (
      <FooterContainer variant="compact" sticky>
        <FooterCompact>
          <FooterCompactLeft>
            <FooterVersion version={CONSTANTS.APP_VERSION} />
            <FooterCopyright
              year={currentYear}
              companyName={CONSTANTS.COMPANY_NAME}
            />
            {CONSTANTS.STATUS_PAGE_URL && (
              <SystemStatusIndicator
                statusPageUrl={CONSTANTS.STATUS_PAGE_URL}
                apiEndpoint={CONSTANTS.STATUS_PAGE_API_URL}
                refreshInterval={60000}
                size="sm"
                version={CONSTANTS.APP_VERSION}
                isNetworkOnline={isOnline}
              />
            )}
          </FooterCompactLeft>
          <FooterCompactRight>
            <LocalizedLink
              to="/privacy"
              className="text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
            >
              {t("footer.privacyPolicy")}
            </LocalizedLink>
            <LocalizedLink
              to="/terms"
              className="text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
            >
              {t("footer.termsOfService")}
            </LocalizedLink>
          </FooterCompactRight>
        </FooterCompact>
      </FooterContainer>
    );
  }

  return (
    <FooterContainer variant="full">
      <FooterGrid className="md:grid-cols-3">
        <FooterLinkSection title="Product">
          <FooterLink>
            <LocalizedLink to="/docs">Documentation</LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/pricing">Pricing</LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/docs/api-reference">
              API Reference
            </LocalizedLink>
          </FooterLink>
        </FooterLinkSection>

        <FooterLinkSection title="Use Cases">
          <FooterLink>
            <LocalizedLink to="/docs/classification">
              Text Classification
            </LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/docs/extraction">Data Extraction</LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/docs/generation">
              Content Generation
            </LocalizedLink>
          </FooterLink>
        </FooterLinkSection>

        <FooterLinkSection title="Company">
          <FooterLink>
            <LocalizedLink to="/about">About</LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/contact">{t("footer.contact")}</LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/privacy">
              {t("footer.privacyPolicy")}
            </LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/terms">
              {t("footer.termsOfService")}
            </LocalizedLink>
          </FooterLink>
          <FooterLink>
            <LocalizedLink to="/sitemap">{t("footer.sitemap")}</LocalizedLink>
          </FooterLink>
        </FooterLinkSection>
      </FooterGrid>

      <FooterBottom>
        <FooterBrand
          description="Transform LLM outputs into structured APIs. Build reliable AI-powered endpoints with schema validation."
          className="flex flex-col items-center"
        >
          <LocalizedLink to="/">
            <img src="/logo.png" alt={CONSTANTS.APP_NAME} className="h-8" />
          </LocalizedLink>
        </FooterBrand>
        <FooterVersion version={CONSTANTS.APP_VERSION} />
        <FooterCopyright
          year={currentYear}
          companyName={CONSTANTS.COMPANY_NAME}
        />
        {CONSTANTS.STATUS_PAGE_URL && (
          <SystemStatusIndicator
            statusPageUrl={CONSTANTS.STATUS_PAGE_URL}
            apiEndpoint={CONSTANTS.STATUS_PAGE_API_URL}
            refreshInterval={60000}
            size="sm"
            version={CONSTANTS.APP_VERSION}
            isNetworkOnline={isOnline}
          />
        )}
      </FooterBottom>
    </FooterContainer>
  );
}

export default Footer;
