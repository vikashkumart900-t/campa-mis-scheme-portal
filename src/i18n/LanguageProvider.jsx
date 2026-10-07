import {
  useEffect,
  useMemo,
  useState
} from "react";
import LanguageContext from "./LanguageContext";

const DEFAULT_LANGUAGE = "en";

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("schemeMisLanguage");
    return savedLanguage || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem("schemeMisLanguage", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
