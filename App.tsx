
import React, { useState, useEffect, useCallback } from 'react';
import { Document, SearchResult, AppStatus } from './types';
import { KnowledgeService } from './services/geminiService';
import DocumentList from './components/DocumentList';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  const knowledgeService = React.useMemo(() => new KnowledgeService(), []);

  // Persistent storage mock
  useEffect(() => {
    const saved = localStorage.getItem('kq_docs');
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved documents");
      }
    } else {
      // Seed initial data for a friendly start
      const seed: Document[] = [
        {
          id: 'seed-1',
          title: 'Company Remote Policy',
          content: 'Employees are allowed to work remotely 3 days a week. Mondays and Fridays are mandatory office days for all staff. Office hours are 9 AM to 5 PM.',
          category: 'Technical',
          updatedAt: Date.now()
        },
        {
          id: 'seed-2',
          title: 'Gemini 3 Features',
          content: 'Gemini 3 includes advanced reasoning capabilities, multimodal inputs, and an expanded thinking budget for complex tasks. It excels at coding, math, and long-context processing.',
          category: 'Technical',
          updatedAt: Date.now()
        }
      ];
      setDocuments(seed);
      localStorage.setItem('kq_docs', JSON.stringify(seed));
    }
  }, []);

  const saveDocs = (newDocs: Document[]) => {
    setDocuments(newDocs);
    localStorage.setItem('kq_docs', JSON.stringify(newDocs));
  };

  const handleAddDoc = (title: string, content: string, category: string) => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title,
      content,
      category,
      updatedAt: Date.now()
    };
    saveDocs([newDoc, ...documents]);
  };

  const handleDeleteDoc = (id: string) => {
    saveDocs(documents.filter(d => d.id !== id));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setStatus(AppStatus.SEARCHING);
    setError(null);
    setResult(null);

    try {
      // In a real full-stack app, this would be a fetch('/api/search')
      // For this demo, we simulate the backend logic here
      const res = await knowledgeService.queryKnowledgeBase(query, documents);
      setResult(res);
      setStatus(AppStatus.IDLE);
    } catch (err: any) {
      setError(err.message || "An error occurred during search.");
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="fa-solid fa-magnifying-glass-chart text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                KnowledgeQuest AI
              </span>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-blue-600">Home</a>
              <a href="#" className="hover:text-blue-600">Library</a>
              <a href="#" className="hover:text-blue-600">Settings</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Management */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <DocumentList 
              documents={documents} 
              onAdd={handleAddDoc} 
              onDelete={handleDeleteDoc} 
            />
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-indigo-900 font-semibold text-sm mb-2 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb"></i>
                Pro Tip
              </h3>
              <p className="text-indigo-700 text-xs leading-relaxed">
                Add meeting notes, research snippets, or policy documents. The AI will cross-reference them to give you accurate answers.
              </p>
            </div>
          </div>

          {/* Main Area - Search & Results */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
            
            {/* Search Bar Container */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Search Your Knowledge</h1>
              <p className="text-slate-500 text-sm mb-6">Ask questions across all your stored documents using AI reasoning.</p>
              
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  placeholder="e.g., What are the office hours on Fridays?"
                  className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg shadow-inner"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <i className="fa-solid fa-magnifying-glass text-xl"></i>
                </div>
                <button 
                  type="submit"
                  disabled={status === AppStatus.SEARCHING}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center gap-2 shadow-md"
                >
                  {status === AppStatus.SEARCHING ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>Ask AI</>
                  )}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Empty State / Initial View */}
            {!result && status === AppStatus.IDLE && !error && (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <i className="fa-solid fa-comments-dollar text-6xl text-slate-200 mb-4"></i>
                <p className="text-slate-400 font-medium italic">Type a query above to start exploring your knowledge base.</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">AI Synthesis</span>
                    <span className="text-xs text-slate-400">Response generated by Gemini Flash</span>
                  </div>
                  
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                      {result.answer}
                    </p>
                  </div>
                </div>

                {/* Footnote: Sources Used */}
                <div className="bg-slate-50 border-t border-slate-100 p-6">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-link text-blue-500"></i>
                    Sources referenced ({result.relevantDocs.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.relevantDocs.map(doc => (
                      <div key={doc.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-2 shadow-sm">
                        <i className="fa-solid fa-file-lines text-slate-400"></i>
                        {doc.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Mobile/Sticky Controls (Simulation of full-stack persistence status) */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-slate-200 py-3 px-6 flex justify-between items-center z-40">
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Knowledge Engine Online
          </div>
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-database"></i>
            {documents.length} Docs Indexed
          </div>
        </div>
        <div className="text-[10px] text-slate-400 italic">
          v1.0.0-stable
        </div>
      </footer>
    </div>
  );
};

export default App;
