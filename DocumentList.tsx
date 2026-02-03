
import React, { useState } from 'react';
import { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  onAdd: (title: string, content: string, category: string) => void;
  onDelete: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      onAdd(title, content, category);
      setTitle('');
      setContent('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <i className="fa-solid fa-book-open text-blue-500"></i>
          Knowledge Base ({documents.length})
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isAdding ? 'Cancel' : 'Add Document'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-slate-100 bg-blue-50/30">
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Document Title"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea 
              placeholder="Paste content here..."
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <select 
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Technical">Technical</option>
                <option value="Finance">Finance</option>
                <option value="Personal">Personal</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Save Snippet
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm italic">
            Your knowledge base is empty. Add documents to begin.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-slate-50 group">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{doc.title}</h3>
                <button 
                  onClick={() => onDelete(doc.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                {doc.content}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                  {doc.category}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentList;
