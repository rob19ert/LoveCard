import { useAppContext } from '../context/AppContext';
import { themes } from '../data/themes';
import { ArrowLeft, Check } from 'lucide-react';
import { IconRenderer } from './IconRenderer';

export function ThemeSelector() {
  const { activeThemeId, setActiveThemeId, setCurrentView } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 min-h-screen">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <button 
          onClick={() => setCurrentView('home')}
          className="p-3 text-stone-600 hover:text-stone-900 hover:bg-white/50 rounded-full transition-colors bg-white/30 backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-stone-800">Оформление</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setActiveThemeId(theme.id)}
            className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all overflow-hidden h-32 sm:h-40 ${
              activeThemeId === theme.id 
                ? 'border-rose-400 shadow-md ring-4 ring-rose-100' 
                : 'border-transparent shadow-sm hover:shadow-md hover:scale-105 bg-white/60 backdrop-blur-sm'
            }`}
          >
            {/* Preview background */}
            <div className="absolute inset-0 -z-10 opacity-70" style={theme.type === 'solid' || theme.type === 'gradient' ? theme.style : { backgroundColor: theme.bg }}>
              {theme.type === 'pattern' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <IconRenderer name={theme.icon} size={48} color={theme.color} />
                </div>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-stone-800 mt-auto shadow-sm">
              {theme.name}
            </div>

            {activeThemeId === theme.id && (
              <div className="absolute top-3 right-3 bg-rose-500 text-white p-1 rounded-full shadow-sm">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}