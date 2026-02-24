import { AppProvider } from './context/AppContext';
import { MultiplayerProvider, useMultiplayer } from './context/MultiplayerContext';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { Editor } from './components/Editor';
import { ThemeSelector } from './components/ThemeSelector';
import { Background } from './components/Background';
import { Lobby } from './components/Lobby';
import { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

function AppContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useMultiplayer();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    // Prevent access to lobby if not in a room
    if (!roomParam && !roomId && location.pathname === '/lobby') {
      navigate('/');
    } 
    // Automatically open lobby if connected to a room but outside
    else if (roomId && location.pathname !== '/game' && location.pathname !== '/lobby') {
      navigate('/lobby');
    }
  }, [roomId, location.pathname, navigate]);

  return (
    <div className="min-h-[100dvh] font-sans selection:bg-rose-200 selection:text-rose-900 text-stone-900 relative">
      <Background />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/themes" element={<ThemeSelector />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppProvider>
        <MultiplayerProvider>
          <AppContainer />
        </MultiplayerProvider>
      </AppProvider>
    </HashRouter>
  );
}

export default App;
