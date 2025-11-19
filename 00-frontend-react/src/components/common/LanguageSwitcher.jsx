import React from 'react';
import { useLanguage } from '@/i18n';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
        <Globe className="h-4 w-4 text-white" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-transparent text-white text-sm font-medium cursor-pointer focus:outline-none"
        >
          <option value="vi" className="bg-slate-800 text-white">Tiếng Việt</option>
          <option value="en" className="bg-slate-800 text-white">English</option>
          <option value="ja" className="bg-slate-800 text-white">日本語</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
