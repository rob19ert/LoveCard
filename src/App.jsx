import { AppProvider, useAppContext } from './context/AppContext';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { Editor } from './components/Editor';

function MainArea() {
  const { currentView } = useAppContext();

  switch (currentView) {
    case 'home':
      return <Home />;
    case 'game':
      return <Game />;
    case 'editor':
      return <Editor />;
    default:
      return <Home />;
  }
}

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-stone-50 font-sans selection:bg-rose-200 selection:text-rose-900">
        <MainArea />
      </div>
    </AppProvider>
  );
}

export default App;
