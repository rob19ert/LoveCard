import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultCategories } from '../data/defaultData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [categories, setCategories] = useLocalStorage('deeptalk_categories', defaultCategories);
  const [currentView, setCurrentView] = useLocalStorage('deeptalk_view', 'home');
  const [activeCategoryId, setActiveCategoryId] = useLocalStorage('deeptalk_active_category', null);
  const [activeThemeId, setActiveThemeId] = useLocalStorage('deeptalk_theme', 'default');

  const resetToDefault = () => {
    setCategories(defaultCategories);
    setCurrentView('home');
    setActiveCategoryId(null);
    setActiveThemeId('default');
  };

  return (
    <AppContext.Provider value={{ 
      categories, 
      setCategories, 
      currentView, 
      setCurrentView, 
      activeCategoryId, 
      setActiveCategoryId,
      activeThemeId,
      setActiveThemeId,
      resetToDefault
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
