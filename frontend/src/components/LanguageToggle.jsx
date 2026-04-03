import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageToggle = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[1];

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition">
        <Globe className="w-4 h-4" /><span>{currentLang.flag}</span><span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => { changeLanguage(lang.code); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition ${language === lang.code ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
              <span className="text-xl">{lang.flag}</span><span>{lang.name}</span>{language === lang.code && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default LanguageToggle;
