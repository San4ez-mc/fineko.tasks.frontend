import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import { getResults, toggleResultComplete } from '../api/results';
import ResultRow from '../components/ResultRow.jsx';
import ResultDetails from '../components/ResultDetails.jsx';
import ResultsEmpty from '../components/ResultsEmpty.jsx';
import AddResultForm from '../components/AddResultForm.jsx';
import './ResultsPage.css';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
    fetchResults();
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const handleToggleDone = async (id, done) => {
    const prevDone = results.find((r) => r.id === id)?.done;
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, done } : r)));
    try {
      await toggleResultComplete(id, done);
    } catch (e) {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, done: prevDone } : r))
      );
      const msg = e.response?.data?.message || 'Не вдалося зберегти';
      window.dispatchEvent(
        new CustomEvent('toast', { detail: { type: 'error', message: msg } })
      );
    }
  };

  return (
    <Layout>
      <div className="results-page">
        <div className="results-page__header">
          <h1>Результати</h1>
          {!showAddForm && (
            <button className="btn primary" onClick={() => setShowAddForm(true)}>
              Додати результат
            </button>
          )}
        </div>

        {showAddForm && (
          <AddResultForm
            onSaved={handleSaved}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {loading && <div className="results-loader">Завантаження…</div>}

        {!loading && results.length === 0 && <ResultsEmpty onCreate={() => setShowAddForm(true)} />}

        {!loading && results.length > 0 && (
          <div className="results-list">
            {results.map((r) => (
              <React.Fragment key={r.id}>
                <ResultRow
                  result={r}
                  expanded={expanded === r.id}
                  onToggleExpand={toggleExpand}
                  onToggleDone={handleToggleDone}
                />
                {expanded === r.id && <ResultDetails result={r} />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
