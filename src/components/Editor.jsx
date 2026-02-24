import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Trash2, Plus, RefreshCw, Sparkles, Loader2, Download, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { IconRenderer } from './IconRenderer';
import { GoogleGenAI } from '@google/genai';
import { useNavigate } from 'react-router-dom';

export function Editor() {
  const { categories, setCategories, resetToDefault } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(categories[0]?.id || null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deeptalk-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (Array.isArray(parsedData) && window.confirm('Импортировать категории? Текущие данные будут перезаписаны.')) {
          setCategories(parsedData);
          if (parsedData.length > 0) {
            setActiveTab(parsedData[0].id);
          }
        } else if (!Array.isArray(parsedData)) {
           alert('Неверный формат файла: ожидается массив категорий.');
        }
      } catch (error) {
        console.error('Ошибка при импорте:', error);
        alert('Не удалось прочитать файл. Убедитесь, что это корректный JSON.');
      }
    };
    reader.readAsText(file);
    // Сбросить значение input, чтобы можно было загрузить тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateAIQuestions = async () => {
    if (!activeCategory) return;
    setIsGenerating(true);
    
    try {
      const prompt = `Сгенерируй 3 новых, интересных и глубоких вопроса для пары на тему '${activeCategory.name}'. Верни результат ТОЛЬКО в виде JSON массива строк, без форматирования, без маркдауна и без лишнего текста. Пример: ["Вопрос 1", "Вопрос 2", "Вопрос 3"]`;
      
      const ai = new GoogleGenAI({
        apiKey: 'jameshype',
        httpOptions: { baseUrl: 'https://gateway.ai.home.vadimrm.com/gemini'}
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      let textResponse = response.text || '';
      
      // Clean up the response to just get the JSON array
      textResponse = textResponse.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim();
      
      const newQuestionsText = JSON.parse(textResponse);
      
      if (Array.isArray(newQuestionsText)) {
        const newQuestions = newQuestionsText.map(text => ({ id: uuidv4(), text }));
        
        const updated = categories.map(cat => {
          if (cat.id === activeCategory.id) {
            return {
              ...cat,
              questions: [...cat.questions, ...newQuestions]
            };
          }
          return cat;
        });
        setCategories(updated);
      }
    } catch (error) {
      console.error('Ошибка при генерации вопросов:', error);
      alert('Не удалось сгенерировать вопросы. Попробуйте еще раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update active tab if categories change and activeTab is invalid
  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === activeTab)) {
      setActiveTab(categories[0].id);
    }
  }, [categories, activeTab]);

  const handleAddQuestion = (categoryId) => {
    if (!newQuestionText.trim()) return;
    
    const updated = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          questions: [...cat.questions, { id: uuidv4(), text: newQuestionText.trim() }]
        };
      }
      return cat;
    });
    setCategories(updated);
    setNewQuestionText('');
  };

  const handleDeleteQuestion = (categoryId, questionId) => {
    const updated = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, questions: cat.questions.filter(q => q.id !== questionId) };
      }
      return cat;
    });
    setCategories(updated);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: uuidv4(),
      name: newCatName.trim(),
      icon: "List", // Default icon for custom categories
      questions: []
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
    setActiveTab(newCat.id);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm("Точно удалить эту категорию со всеми вопросами?")) {
      const updated = categories.filter(cat => cat.id !== categoryId);
      setCategories(updated);
    }
  };

  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-3 text-stone-600 hover:text-stone-900 hover:bg-white/50 rounded-full transition-colors bg-white/30 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-stone-800">Редактор контента</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/40 text-stone-800 rounded-xl hover:bg-white hover:shadow-sm transition-all text-sm font-medium shadow-sm"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Импорт</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/40 text-stone-800 rounded-xl hover:bg-white hover:shadow-sm transition-all text-sm font-medium shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Экспорт</span>
          </button>
          <button 
            onClick={() => {
              if (window.confirm("Сбросить все настройки и вернуть стандартные вопросы? Ваши добавленные вопросы будут удалены.")) {
                resetToDefault();
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/40 text-stone-800 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm font-medium shadow-sm"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Сброс к заводским</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2 order-2 lg:order-1">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white/40">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-2">Категории</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    activeTab === cat.id ? 'bg-stone-800 text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <span className="truncate pr-2 font-medium">{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    activeTab === cat.id ? 'bg-white/20' : 'bg-stone-200 text-stone-500 group-hover:bg-white'
                  }`}>
                    {cat.questions.length}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-stone-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                  }}
                  placeholder="Новая категория..."
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
                <button 
                  onClick={handleAddCategory}
                  className="p-2.5 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors shrink-0"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {activeCategory ? (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-white/40 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                     <IconRenderer name={activeCategory.icon} size={24} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-800">{activeCategory.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleGenerateAIQuestions}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-2 text-rose-500 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-sm font-medium"
                    title="Сгенерировать вопросы с ИИ"
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    <span className="hidden sm:inline">{isGenerating ? 'Генерация...' : 'ИИ-вопросы'}</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(activeCategory.id)}
                    className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Удалить категорию"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-8 overflow-y-auto pr-2 custom-scrollbar">
                {activeCategory.questions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
                      <Plus size={32} />
                    </div>
                    <p className="text-stone-500 font-medium">В этой категории пока нет вопросов.</p>
                    <p className="text-stone-400 text-sm mt-1">Добавьте первый вопрос ниже.</p>
                  </div>
                ) : (
                  activeCategory.questions.map((q, idx) => (
                    <div key={q.id} className="flex gap-4 items-start group p-4 sm:p-5 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors border border-transparent hover:border-stone-200">
                      <span className="text-stone-400 font-medium w-6 text-right mt-0.5 shrink-0 select-none">
                        {idx + 1}.
                      </span>
                      <p className="flex-1 text-stone-700 font-medium leading-relaxed">{q.text}</p>
                      <button 
                        onClick={() => handleDeleteQuestion(activeCategory.id, q.id)}
                        className="p-2 text-stone-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Question */}
              <div className="bg-white/60 border border-white/50 p-2 pl-4 rounded-[1.25rem] flex items-center shadow-sm focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-white/50 transition-all">
                <input 
                  type="text" 
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddQuestion(activeCategory.id);
                  }}
                  placeholder="Напишите новый вопрос..."
                  className="flex-1 bg-transparent py-3 outline-none text-stone-800 placeholder:text-stone-500 font-medium"
                />
                <button 
                  onClick={() => handleAddQuestion(activeCategory.id)}
                  className="px-5 py-3 ml-2 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors flex items-center justify-center font-medium shrink-0 shadow-sm"
                >
                  <Plus size={20} className="sm:mr-2" />
                  <span className="hidden sm:inline">Добавить</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/40 flex flex-col items-center justify-center min-h-[500px] text-stone-500 shadow-sm">
              <IconRenderer name="Inbox" size={48} className="mb-4 opacity-50" />
              <p>Выберите или создайте категорию слева</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
