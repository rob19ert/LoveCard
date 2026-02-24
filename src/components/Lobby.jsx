import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { ArrowLeft, Copy, Check, Users, Loader2 } from 'lucide-react';
import { IconRenderer } from './IconRenderer';

export function Lobby() {
  const { categories, setCurrentView, setActiveCategoryId } = useAppContext();
  const { roomId, isHost, peerId, broadcastState, leaveRoom, sharedState, setSharedState } = useMultiplayer();
  const [copied, setCopied] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);

  const inviteLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  useEffect(() => {
    // Guest transitions to game when host sends START_GAME
    if (sharedState?.type === 'START_GAME') {
      setCurrentView('game');
    }
  }, [sharedState, setCurrentView]);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    const category = categories.find(c => c.id === selectedCatId);
    if (!category || !peerId) return;

    setActiveCategoryId(selectedCatId);
    
    // Broadcast initial state
    const initialState = {
      type: 'START_GAME',
      categoryName: category.name,
      questions: category.questions,
      currentIndex: 0,
      isFlipped: false,
      direction: 1
    };
    
    broadcastState(initialState);
    setSharedState(initialState);

    setCurrentView('game');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8 pt-4">
        <button 
          onClick={leaveRoom}
          className="p-3 text-stone-600 hover:text-stone-900 hover:bg-white/50 rounded-full transition-colors bg-white/30 backdrop-blur-sm shadow-sm"
          title="Выйти из комнаты"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-stone-800">Онлайн комната</h1>
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Status Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-sm border border-white/40 text-center flex flex-col items-center">
          <div className={`p-4 rounded-full mb-4 transition-colors ${peerId ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
            <Users size={32} />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            {peerId ? 'Партнер подключился!' : 'Ожидание партнера...'}
          </h2>
          {!peerId && isHost && (
            <p className="text-stone-500 text-sm mb-6">
              Отправьте ссылку-приглашение другому человеку, чтобы он смог присоединиться к игре.
            </p>
          )}

          {isHost && (
            <div className="flex items-center gap-2 w-full bg-stone-50/50 border border-stone-200 p-2 rounded-2xl">
              <input 
                type="text" 
                readOnly 
                value={inviteLink}
                className="flex-1 bg-transparent text-sm text-stone-600 outline-none px-2 truncate"
              />
              <button 
                onClick={copyLink}
                className="p-2.5 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors flex shrink-0"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          )}
        </div>

        {/* Host controls */}
        {isHost && (
          <div className="w-full max-w-2xl text-center">
            <h3 className="text-lg font-medium text-stone-700 mb-4">Выберите тему для игры:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 text-left">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    selectedCatId === cat.id 
                      ? 'border-rose-400 bg-white shadow-sm ring-2 ring-rose-100' 
                      : 'border-transparent bg-white/60 hover:bg-white/80 backdrop-blur-sm'
                  }`}
                >
                  <IconRenderer name={cat.icon} size={20} className={selectedCatId === cat.id ? 'text-rose-500' : 'text-stone-500'} />
                  <span className={`font-medium text-sm sm:text-base ${selectedCatId === cat.id ? 'text-stone-900' : 'text-stone-700'}`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleStartGame}
              disabled={!peerId || !selectedCatId}
              className="px-8 py-4 bg-rose-500 text-white rounded-2xl text-lg font-medium hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
            >
              Начать игру
            </button>
          </div>
        )}

        {/* Guest waiting message */}
        {!isHost && (
          <div className="text-center text-stone-600 flex flex-col items-center">
            {peerId ? (
              <>
                <Loader2 size={32} className="animate-spin text-rose-400 mb-4" />
                <p className="font-medium text-lg">Ожидаем, пока организатор выберет тему и начнет игру...</p>
              </>
            ) : (
              <p className="font-medium text-lg">Подключение к комнате...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
