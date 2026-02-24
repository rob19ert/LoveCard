import { useAppContext } from '../context/AppContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { IconRenderer } from './IconRenderer';
import { Settings, Palette, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { categories, setActiveCategoryId } = useAppContext();
  const { createRoom } = useMultiplayer();
  const navigate = useNavigate();

  const handleCategoryClick = (id) => {
    setActiveCategoryId(id);
    navigate('/game');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">DeepTalk</h1>
          <p className="text-stone-600 font-medium mt-1">Темы для глубоких разговоров</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              createRoom();
              navigate('/lobby');
            }}
            className="p-3 text-rose-600 hover:text-rose-900 hover:bg-white/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white/50 backdrop-blur-sm shadow-sm"
            title="Играть онлайн"
            aria-label="Играть онлайн"
          >
            <Globe size={24} />
          </button>
          <button 
            onClick={() => navigate('/themes')}
            className="p-3 text-stone-600 hover:text-stone-900 hover:bg-white/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white/30 backdrop-blur-sm shadow-sm"
            title="Оформление"
            aria-label="Оформление"
          >
            <Palette size={24} />
          </button>
          <button 
            onClick={() => navigate('/editor')}
            className="p-3 text-stone-600 hover:text-stone-900 hover:bg-white/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white/30 backdrop-blur-sm shadow-sm"
            title="Редактор"
            aria-label="Редактор"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((category) => {
          const count = category.questions.length;
          const label = count === 1 ? 'вопрос' : (count >= 2 && count <= 4) ? 'вопроса' : 'вопросов';
          
          return (
            <div 
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 cursor-pointer hover:shadow-md hover:border-rose-300 transition-all duration-300 active:scale-[0.98] group flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                  <IconRenderer name={category.icon} size={28} />
                </div>
                <h2 className="text-xl font-semibold text-stone-800">{category.name}</h2>
              </div>
              <div className="mt-4 text-stone-400 text-sm font-medium">
                {count} {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
