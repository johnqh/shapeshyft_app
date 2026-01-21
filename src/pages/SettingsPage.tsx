import { useTranslation } from "react-i18next";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import { useTheme } from "../context/ThemeContext";
import { GlobalSettingsPage } from "@sudobility/building_blocks";
import { Theme, FontSize } from "@sudobility/types";
import { CONSTANTS } from "../config/constants";

function SettingsPage() {
  const { t } = useTranslation("settings");
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const appName = CONSTANTS.APP_NAME;

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/settings"
        title={t("seo.title", { appName })}
        description={t("seo.description", { appName })}
        keywords="ShapeShyft settings, preferences, theme, language settings, appearance settings"
      />

      <GlobalSettingsPage
        theme={theme}
        fontSize={fontSize}
        onThemeChange={(value) => setTheme(value as Theme)}
        onFontSizeChange={(value) => setFontSize(value as FontSize)}
        t={(key, fallback) => t(key, { defaultValue: fallback })}
        appearanceT={(key, fallback) =>
          t(`appearance.${key}`, { defaultValue: fallback })
        }
        showAppearanceInfoBox={true}
      />
    </ScreenContainer>
  );
}

export default SettingsPage;
