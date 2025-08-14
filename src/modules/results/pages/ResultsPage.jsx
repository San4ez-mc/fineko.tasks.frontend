import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import { getResults, getResultTasks } from '../api/results';
import ResultItem from '../components/ResultItem.jsx';
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
  const [tasksLoading, setTasksLoading] = useState({});

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await getResults({ page: 1 });
      const items = data.items || data || [];
      setResults(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

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
        )}
      </div>
    </Layout>
  );
}
