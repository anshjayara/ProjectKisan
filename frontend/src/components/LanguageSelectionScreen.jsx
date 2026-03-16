import { useLanguage } from "../context/LanguageContext";

function LanguageSelectionScreen() {
  const { setLanguage, t } = useLanguage();

  return (
    <div className="app-shell language-shell">
      <div className="top-strip" aria-hidden="true" />

      <main className="language-card" role="main" aria-label={t("languageSelection.continueAria")}>
        <section className="brand-block language-brand">
          <div className="logo" aria-hidden="true">
            <span className="leaf-icon" />
          </div>
          <h1>{t("languageSelection.heading")}</h1>
          <p className="brand-subtitle">{t("languageSelection.subtitle")}</p>
        </section>

        <div className="language-options" role="group" aria-label={t("languageSelection.continueAria")}>
          <button
            type="button"
            className="language-option-btn"
            onClick={() => setLanguage("en")}
          >
            {t("common.language.english")}
          </button>

          <button
            type="button"
            className="language-option-btn"
            onClick={() => setLanguage("hi")}
          >
            {t("common.language.hindi")}
          </button>
        </div>
      </main>
    </div>
  );
}

export default LanguageSelectionScreen;
