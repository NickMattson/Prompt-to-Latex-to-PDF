import React, { useState, useRef, useEffect } from 'react';
import { createChatSession, sendMessageToChat } from './services/geminiService';
import { GenerationState } from './types';
import LatexPreview from './components/LatexPreview';
import { IconSparkles } from './components/Icons';
import { Chat } from "@google/genai";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    latex: null,
    error: null,
  });

  // Keep the chat session active across renders
  const chatRef = useRef<Chat | null>(null);

  // Initialize chat on mount
  useEffect(() => {
    chatRef.current = createChatSession();
  }, []);

  const handleReset = () => {
    chatRef.current = createChatSession();
    setUserInput('');
    setState({ status: 'idle', latex: null, error: null });
  };

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    if (!chatRef.current) chatRef.current = createChatSession();

    setState(prev => ({ ...prev, status: 'loading', error: null }));

    try {
      const result = await sendMessageToChat(chatRef.current, userInput);
      setState({ status: 'success', latex: result, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleReset}>
            <div className="text-indigo-600">
               <IconSparkles className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              LatexGenius
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {state.status !== 'idle' && (
              <button 
                onClick={handleReset}
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                New Document
              </button>
            )}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">
              Gemini 3.0
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* Header - Only show when idle to reduce clutter during editing */}
        {state.status === 'idle' && (
          <div className="space-y-2 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-slate-900">
              What do you want to write?
            </h2>
            <p className="text-slate-500 text-lg">
               Enter your idea, and we'll generate a beautifully formatted LaTeX document for you.
            </p>
          </div>
        )}

        {/* Input Section */}
        <section className={`
          bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-2 
          focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 
          transition-all duration-300
          ${state.status === 'idle' ? '' : 'ring-4 ring-indigo-500/10 border-indigo-500/50'}
        `}>
          <div className="relative">
            <textarea
              id="prompt"
              className="w-full min-h-[120px] p-6 text-lg text-slate-800 placeholder:text-slate-300 resize-none outline-none bg-transparent rounded-xl disabled:opacity-100 disabled:text-slate-600"
              placeholder={state.latex ? "Refine your document (e.g., 'Make the title bigger' or 'Add a new section')..." : "E.g., A resume for a software engineer, a set of 5 calculus problems, or a formal business letter..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={state.status === 'loading'}
            />
            
            <div className="flex items-center justify-between px-6 pb-4 pt-2">
              <span className="text-xs font-medium text-slate-400">
                Press <span className="font-bold text-slate-500">Enter</span> to {state.latex ? 'update' : 'generate'}
              </span>
              <button
                onClick={handleGenerate}
                disabled={!userInput.trim() || state.status === 'loading'}
                className={`
                  flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all transform
                  ${!userInput.trim() || state.status === 'loading'
                    ? 'bg-slate-200 text-slate-400 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30'}
                `}
              >
                {state.status === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{state.latex ? 'Updating...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <span>{state.latex ? 'Update PDF' : 'Generate PDF'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Error State */}
        {state.status === 'error' && (
           <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 text-red-700 animate-fade-in">
             <div className="bg-red-100 p-2 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
             </div>
             <div>
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm opacity-90">{state.error}</p>
             </div>
           </div>
        )}

        {/* Result Section */}
        {state.status === 'success' && state.latex && (
          <section className="animate-fade-in-up">
             <LatexPreview latex={state.latex} />
          </section>
        )}
      </main>

      <footer className="py-6 mt-auto text-center">
         <p className="text-slate-400 text-sm">Powered by Gemini 3.0 Pro & Overleaf</p>
      </footer>
    </div>
  );
};

export default App;
