import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultCategories } from '../data/defaultData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [categories, setCategories] = useLocalStorage('deeptalk_categories', defaultCategories);
  const [activeCategoryId, setActiveCategoryId] = useLocalStorage('deeptalk_active_category', null);
  const [activeThemeId, setActiveThemeId] = useLocalStorage('deeptalk_theme', 'default');

  useEffect(() => {
    setCategories(prevCategories => {
      let hasChanges = false;
      const mergedCategories = [...prevCategories];

      for (const defaultCat of defaultCategories) {
        if (!mergedCategories.some(cat => cat.name === defaultCat.name)) {
          mergedCategories.push(defaultCat);
          hasChanges = true;
        }
      }

      return hasChanges ? mergedCategories : prevCategories;
    });
  }, [setCategories]);

  const resetToDefault = () => {
    setCategories(defaultCategories);
    setActiveCategoryId(null);
    setActiveThemeId('default');
  };

  return (
    <AppContext.Provider value={{ 
      categories, 
      setCategories, 
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
