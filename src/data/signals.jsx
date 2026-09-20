// src/data/signals.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";
import { isEnglish } from "./variables";

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const browserLang = typeof window !== "undefined"
    ? (localStorage.getItem("lang") || document.documentElement.lang || "en")
    : "en"; // Cambio: "en" en servidor también

  const [lang, setLang] = useState(browserLang);

  const t = translations[lang] || translations.en; // Cambio: fallback a translations.en

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    isEnglish.set(newLang === "en");
  };

  useEffect(() => {
    isEnglish.set(lang === "en");
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
