import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import { getResults, getResultTasks } from '../api/results';
import ResultItem from '../components/ResultItem.jsx';
import ResultRow from '../components/ResultRow.jsx';
import ResultDetails from '../components/ResultDetails.jsx';
import ResultsEmpty from '../components/ResultsEmpty.jsx';
import ResultForm from '../components/ResultForm.jsx';
import './ResultsPage.css';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [mode, setMode] = useState('my');
  const [view, setView] = useState('table');
  const [, setTasksLoading] = useState({});

  const fetchResults = async (currentMode = mode) => {
    setLoading(true);
    try {
      const data = await getResults({ page: 1, mode: currentMode });
      const items = data.items || data || [];
      setResults(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(mode);
  }, [mode]);

  const handleSaved = () => {
    setShowAddForm(false);
    setParentId(null);
    fetchResults();
  };

  const fetchTasks = async (id) => {
    setTasksLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const tasks = await getResultTasks(id);
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, tasks } : r))
      );
    } catch (e) {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, tasks: [] } : r))
      );
    } finally {
      setTasksLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = prev === id ? null : id;
      if (next && !(results.find((r) => r.id === id) || {}).tasks) {
        fetchTasks(id);
      }
      return next;
    });
  };

  const handleAddSubresult = (id) => {
    setParentId(id);
    setShowAddForm(true);
  };

  return (
    <Layout>
      <div className="results-page">
        <div className="results-page__header">
          <h1>Результати</h1>
          {!showAddForm && (
            <button
              className="btn primary"
              onClick={() => {
                setParentId(null);
                setShowAddForm(true);
              }}
            >
              Додати результат
            </button>
          )}
        </div>

        <div className="results-page__controls">
          <div className="results-modes">
            <button
              className={`btn ${mode === 'my' ? 'primary' : 'ghost'}`}
              onClick={() => setMode('my')}
            >
              Мої
            </button>
            <button
              className={`btn ${mode === 'delegated' ? 'primary' : 'ghost'}`}
              onClick={() => setMode('delegated')}
            >
              Делеговані
            </button>
            <button
              className={`btn ${mode === 'subordinates' ? 'primary' : 'ghost'}`}
              onClick={() => setMode('subordinates')}
            >
              Підлеглих
            </button>
          </div>
          <div className="results-view">
            <button
              className={`btn ${view === 'table' ? 'primary' : 'ghost'}`}
              onClick={() => setView('table')}
            >
              Таблиця
            </button>
            <button
              className={`btn ${view === 'cards' ? 'primary' : 'ghost'}`}
              onClick={() => setView('cards')}
            >
              Картки
            </button>
          </div>
        </div>

        {showAddForm && (
          <ResultForm
            parentId={parentId}
            onSaved={handleSaved}
            onCancel={() => {
              setShowAddForm(false);
              setParentId(null);
            }}
          />
        )}

        {loading && <div className="results-loader">Завантаження…</div>}

        {!loading && results.length === 0 && (
          <ResultsEmpty
            onCreate={() => {
              setParentId(null);
              setShowAddForm(true);
            }}
          />
        )}

        {!loading && results.length > 0 && (
          view === 'cards' ? (
            <div className="results-list">
              {results.map((r) => (
                <React.Fragment key={r.id}>
                  <ResultItem
                    result={r}
                    expanded={expanded === r.id}
                    onToggleExpand={toggleExpand}
                  />
                  {expanded === r.id && (
                    <ResultDetails
                      result={r}
                      onAddSubresult={handleAddSubresult}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="results-table">
              {results.map((r) => (
                <React.Fragment key={r.id}>
                  <ResultRow
                    result={r}
                    expanded={expanded === r.id}
                    onToggleExpand={toggleExpand}
                  />
                  {expanded === r.id && (
                    <ResultDetails
                      result={r}
                      onAddSubresult={handleAddSubresult}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )
        )}
      </div>
    </Layout>
  );
}
