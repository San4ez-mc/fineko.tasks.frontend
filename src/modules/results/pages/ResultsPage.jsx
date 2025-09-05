import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import { getResults, getResultTasks } from '../api/results';
import ResultItem from '../components/ResultItem.jsx';

import ResultPanel from '../components/ResultPanel.jsx';

import ResultRow from '../components/ResultRow.jsx';
import ResultDetails from '../components/ResultDetails.jsx';

import ResultsEmpty from '../components/ResultsEmpty.jsx';
import ResultForm from '../components/ResultForm.jsx';
import './ResultsPage.css';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [parentId, setParentId] = useState(null);

  const [tasksLoading, setTasksLoading] = useState({});
  const [mode, setMode] = useState('my');
  const [view, setView] = useState('table');


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

  const openPanel = (id) => {
    if (!(results.find((r) => r.id === id) || {}).tasks) {
      fetchTasks(id);
    }
    setActiveId(id);
  };

  const closePanel = () => setActiveId(null);

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

          <div className="results-list">
            {results.map((r) => (
              <ResultItem
                key={r.id}
                result={r}
                expanded={activeId === r.id}
                onToggleExpand={openPanel}
              />
            ))}
          </div>

        )}

        <ResultPanel
          result={results.find((r) => r.id === activeId)}
          open={!!activeId}
          onClose={closePanel}
          tasksLoading={tasksLoading[activeId]}
          onAddSubresult={handleAddSubresult}
        />
      </div>
    </Layout>
  );
}
