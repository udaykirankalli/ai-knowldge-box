import React, { useState, useEffect } from 'react';
import { Search, FileText, Link, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function KnowledgeInbox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [inputType, setInputType] = useState('note');
  const [inputContent, setInputContent] = useState('');
  const [ingesting, setIngesting] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [querying, setQuerying] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    setIngesting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: inputType,
          content: inputContent.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ingestion failed');
      }

      setSuccess(`Added successfully! Created ${data.chunksCreated} chunks.`);
      setInputContent('');
      fetchItems();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIngesting(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQuerying(true);
    setError(null);
    setAnswer(null);
    setSources([]);

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Query failed');
      }

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            AI Knowledge Inbox
          </h1>
          <p className="text-slate-600">
            Save notes and URLs, then ask questions over your knowledge base
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Content
            </h2>

            <form onSubmit={handleIngest} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputType('note')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    inputType === 'note'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Note
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    inputType === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Link className="w-4 h-4 inline mr-2" />
                  URL
                </button>
              </div>

              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={
                  inputType === 'note'
                    ? 'Enter your note here...'
                    : 'Enter URL (e.g., https://example.com/article)'
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
                disabled={ingesting}
              />

              <button
                type="submit"
                disabled={ingesting || !inputContent.trim()}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {ingesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add {inputType === 'note' ? 'Note' : 'URL'}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Ask Question
            </h2>

            <form onSubmit={handleQuery} className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to know?"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={querying}
              />

              <button
                type="submit"
                disabled={querying || !question.trim()}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {querying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Ask
                  </>
                )}
              </button>
            </form>

            {answer && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Answer</h3>
                <p className="text-blue-800 whitespace-pre-wrap">{answer}</p>
                
                {sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Sources ({sources.length})
                    </h4>
                    <div className="space-y-2">
                      {sources.map((source, idx) => (
                        <div key={idx} className="text-xs bg-white p-2 rounded border border-blue-100">
                          <p className="text-slate-600">{source.preview}</p>
                          <p className="text-slate-400 mt-1">
                            Similarity: {(source.similarity * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Saved Items ({items.length})
            </h2>
            <button
              onClick={fetchItems}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading items...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items yet. Add some content to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {item.type === 'url' ? (
                        <Link className="w-4 h-4 text-blue-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mb-1 block truncate"
                        >
                          {item.url}
                        </a>
                      )}
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {item.preview}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}