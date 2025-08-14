import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import { getResults } from '../api/results';
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
          <ResultForm
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
                <ResultItem
                  result={r}
                  expanded={expanded === r.id}
                  onToggleExpand={toggleExpand}
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
