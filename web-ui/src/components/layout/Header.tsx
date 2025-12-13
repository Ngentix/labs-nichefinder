import { Search, Moon, Sun, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <header className="bg-gray-900 border-b border-gray-800/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-gray-300" />
          <h1 className="text-xl font-semibold text-gray-100">
            NicheFinder Platform Demo Console
          </h1>
          <span className="text-sm text-gray-400">v2.0</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-800/60 transition-all duration-200 hover:brightness-110"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-300" />
            )}
          </button>

          <button
            className="p-2 rounded-lg hover:bg-gray-800/60 transition-all duration-200 hover:brightness-110"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}

