import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { ChevronLeft, ChevronRight, Shuffle, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Game() {
  const { categories, activeCategoryId } = useAppContext();
  const { roomId, sharedState, broadcastState, leaveRoom, isHost, setSharedState, chatMessages, sendChatMessage } = useMultiplayer();
  const navigate = useNavigate();
  
  const category = categories.find(c => c.id === activeCategoryId);
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isFlipped && roomId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isFlipped, roomId, currentIndex]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (chatInput.trim() && currentQuestion) {
      sendChatMessage(chatInput.trim(), currentQuestion.id);
      setChatInput('');
    }
  };

  // Initialize questions
  useEffect(() => {
    if (roomId && sharedState?.type === 'START_GAME') {
      setQuestions(sharedState.questions || []);
      setCurrentIndex(sharedState.currentIndex || 0);
      setIsFlipped(sharedState.isFlipped || false);
    } else if (!roomId && category && category.questions) {
      setQuestions([...category.questions]);
      setCurrentIndex(0);
    }
  }, [category, roomId, sharedState?.type]);

  // Sync state from remote
  useEffect(() => {
    if (roomId && sharedState?.type === 'SYNC') {
      if (sharedState.questions) setQuestions(sharedState.questions);
      if (sharedState.currentIndex !== undefined) setCurrentIndex(sharedState.currentIndex);
      if (sharedState.isFlipped !== undefined) setIsFlipped(sharedState.isFlipped);
      if (sharedState.direction !== undefined) setDirection(sharedState.direction);
    }
  }, [roomId, sharedState]);

  const syncState = (newState) => {
    if (roomId) {
      const stateUpdate = {
        type: 'SYNC',
        currentIndex: newState.currentIndex !== undefined ? newState.currentIndex : currentIndex,
        isFlipped: newState.isFlipped !== undefined ? newState.isFlipped : isFlipped,
        direction: newState.direction !== undefined ? newState.direction : direction,
        questions: newState.questions || questions,
        categoryName: sharedState?.categoryName || category?.name
      };
      
      broadcastState(stateUpdate);
      if (isHost) {
        setSharedState(stateUpdate);
      }
    }
  };

  const currentCategoryName = roomId && sharedState ? sharedState.categoryName : category?.name;

  if (!currentCategoryName || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-stone-500 mb-4">В этой категории пока нет вопросов.</p>
        <button 
          onClick={() => roomId ? leaveRoom() : navigate('/')}
          className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      syncState({ direction: 1, currentIndex: currentIndex + 1, isFlipped: false });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      syncState({ direction: -1, currentIndex: currentIndex - 1, isFlipped: false });
    }
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setDirection(1);
    setIsFlipped(false);
    syncState({ questions: shuffled, currentIndex: 0, direction: 1, isFlipped: false });
  };

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    syncState({ isFlipped: newFlipped });
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentIndex < questions.length - 1) {
      handleNext();
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      handlePrev();
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotateY: isFlipped ? 180 : 0
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: 'spring', bounce: 0.3 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.4 }
    })
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center p-4 relative overflow-hidden">
      {/* Header section (fixed at top) */}
      <div className="w-full max-w-md flex items-center justify-center pt-2 pb-4 relative z-10 shrink-0 mt-2 sm:mt-6">
        <button 
          onClick={() => roomId ? leaveRoom() : navigate('/')}
          className="absolute left-0 p-3 text-stone-600 hover:text-stone-900 hover:bg-white/50 rounded-full transition-all flex items-center justify-center bg-white/30 backdrop-blur-sm shadow-sm"
          title="Назад"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-stone-800 tracking-tight">{currentCategoryName}</h2>
          <div className="flex items-center justify-center mt-1.5">
            <div className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-full px-3 py-0.5 text-xs font-medium text-stone-700 shadow-sm">
               {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Card Area (flexible) */}
      <div className="flex-1 w-full max-w-sm sm:max-w-md flex items-center justify-center min-h-0" style={{ perspective: 1200 }}>
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] max-h-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of the card */}
              <motion.div 
                className="absolute inset-0 bg-white rounded-[2rem] shadow-xl border border-stone-100 p-6 sm:p-10 flex flex-col items-center justify-center text-center overflow-hidden"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
                style={{ backfaceVisibility: 'hidden' }}
                onClick={() => !isFlipped && handleFlip()}
              >
                <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col px-2">
                  <div className="m-auto w-full">
                    <h3 className="text-xl sm:text-3xl font-medium text-stone-800 leading-snug py-4">
                      {currentQuestion.text}
                    </h3>
                  </div>
                </div>
              </motion.div>
              
              {/* Back of the card */}
              <motion.div 
                className="absolute inset-0 bg-rose-50 rounded-[2rem] shadow-xl border border-rose-100 p-0 overflow-hidden"
                initial={{ rotateY: -180 }}
                animate={{ rotateY: isFlipped ? 0 : -180 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {roomId ? (
                  <div className="w-full h-full flex flex-col pt-4 relative">
                    <div className="absolute top-3 left-4 right-4 z-20 flex justify-between items-center" onPointerDownCapture={(e) => e.stopPropagation()}>
                      <button 
                        onClick={handleFlip}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-white rounded-full transition-colors bg-white/50 backdrop-blur-sm shadow-sm"
                        title="Вернуться к вопросу"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <button 
                        onClick={handleNext}
                        className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-full transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        Дальше <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-2 text-left mt-8" onPointerDownCapture={(e) => e.stopPropagation()}>
                      {chatMessages.filter(m => m.questionId === currentQuestion?.id).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-rose-300 opacity-70">
                          <Shuffle size={32} strokeWidth={1.5} className="mb-2" />
                          <p className="text-sm font-medium text-center">Нет сообщений.<br/>Поделитесь своими мыслями!</p>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-3 pt-6">
                          {chatMessages.filter(m => m.questionId === currentQuestion?.id).map((msg, idx) => (
                            <div key={idx} className={`flex w-full ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'me' ? 'bg-rose-500 text-white rounded-br-sm' : 'bg-white border border-rose-100 text-stone-700 rounded-bl-sm shadow-sm'}`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleSendChat} className="p-3 bg-white/50 backdrop-blur-md border-t border-rose-100" onPointerDownCapture={(e) => e.stopPropagation()}>
                      <div className="relative flex items-center">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ваш ответ..."
                          className="w-full bg-white border border-rose-200 rounded-full py-2.5 pl-4 pr-12 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-stone-700"
                        />
                        <button 
                          type="submit"
                          disabled={!chatInput.trim()}
                          className="absolute right-1.5 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:hover:bg-rose-500"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col relative" onPointerDownCapture={(e) => e.stopPropagation()}>
                    <div className="absolute top-3 left-4 right-4 z-20 flex justify-between items-center">
                      <button 
                        onClick={handleFlip}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-white rounded-full transition-colors bg-white/50 backdrop-blur-sm shadow-sm"
                        title="Вернуться к вопросу"
                      >
                        <ArrowLeft size={18} />
                      </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col px-6 pt-16 pb-6">
                      <p className="text-rose-700 font-medium text-center text-lg mb-4">Поделитесь своими мыслями...</p>
                      
                      <textarea 
                        className="flex-1 w-full p-4 bg-white/60 border border-rose-200 rounded-2xl resize-none outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-stone-700 custom-scrollbar mb-4"
                        placeholder="Начните печатать здесь..."
                      />

                      <button 
                        onClick={handleNext}
                        className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        Закончить обсуждение <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer controls (fixed at bottom) */}
      <div className="flex items-center space-x-6 sm:space-x-8 z-10 py-6 sm:py-8 shrink-0">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-4 sm:p-5 rounded-full bg-white shadow-sm border border-stone-100 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Предыдущий"
        >
          <ChevronLeft size={28} />
        </button>

        <button 
          onClick={handleShuffle}
          className="p-4 sm:p-5 rounded-full bg-stone-800 shadow-lg shadow-stone-200 text-white hover:bg-stone-700 transition-all active:scale-95"
          title="Перемешать"
          aria-label="Перемешать"
        >
          <Shuffle size={24} />
        </button>

        <button 
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="p-4 sm:p-5 rounded-full bg-white shadow-sm border border-stone-100 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Следующий"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
