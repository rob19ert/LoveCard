import { AppProvider, useAppContext } from './context/AppContext';
import { MultiplayerProvider, useMultiplayer } from './context/MultiplayerContext';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { Editor } from './components/Editor';
import { ThemeSelector } from './components/ThemeSelector';
import { Background } from './components/Background';
import { Lobby } from './components/Lobby';
import { useEffect } from 'react';

function MainArea() {
  const { currentView, setCurrentView } = useAppContext();
  const { roomId } = useMultiplayer();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    if (!roomParam && (currentView === 'game' || currentView === 'lobby')) {
      setCurrentView('home');
    } else if (roomId && currentView !== 'game' && currentView !== 'lobby') {
      setCurrentView('lobby');
    }
  }, [roomId, currentView, setCurrentView]);

  switch (currentView) {
    case 'home':
      return <Home />;
    case 'game':
      return <Game />;
    case 'editor':
      return <Editor />;
    case 'themes':
      return <ThemeSelector />;
    case 'lobby':
      return <Lobby />;
    default:
      return <Home />;
  }
}

function AppContainer() {
  return (
    <div className="min-h-[100dvh] font-sans selection:bg-rose-200 selection:text-rose-900 text-stone-900 relative">
      <Background />
      <MainArea />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MultiplayerProvider>
        <AppContainer />
      </MultiplayerProvider>
    </AppProvider>
  );
}

export default App;
