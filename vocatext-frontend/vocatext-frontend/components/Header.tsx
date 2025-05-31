"use client";

import { Languages, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import { SupportedLanguage } from "@/lib/translations";

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export default function Header() {
  const { language: selectedLanguage, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-emerald-200/60 dark:border-emerald-700/60 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            VocaText
          </h2>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-200 dark:border-emerald-700">
            <Languages className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-emerald-700 dark:text-emerald-300 text-sm font-medium focus:outline-none cursor-pointer"
            >
              {languageOptions.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Sun className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
