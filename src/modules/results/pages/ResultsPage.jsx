import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import {
  getResults,
  getResult,
  deleteResult,
  toggleResultComplete,
} from '../api/results';
import ResultsFilters from '../components/ResultsFilters.jsx';
import ResultRow from '../components/ResultRow.jsx';
import ResultDetails from '../components/ResultDetails.jsx';
import ResultsEmpty from '../components/ResultsEmpty.jsx';
import './ResultsPage.css';

const defaultFilters = {
  q: '',
  status: 'all',
  hasTemplates: 'any',
  hasActiveTasks: 'any',
  view: 'list',
};

export default function ResultsPage() {
  const [list, setList] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageCount: 1, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filters.q) params.q = filters.q;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.hasTemplates && filters.hasTemplates !== 'any') params.hasTemplates = filters.hasTemplates;
      if (filters.hasActiveTasks && filters.hasActiveTasks !== 'any') params.hasActiveTasks = filters.hasActiveTasks;
      if (filters.view) params.view = filters.view;
      const data = await getResults(params);
      const items = (data.items || []).map((r) => ({
        ...r,
        expected: r.expected_result || r.expected,
        dailyTasksCount: r.daily_tasks_count ?? r.tasks_total ?? 0,
        urgent: r.is_urgent || r.urgent,
        ownerName: r.owner_name || r.ownerName,
        assigneeName: r.assignee_name || r.assigneeName,
      }));
      setList(items);
      setPagination(data.pagination || { page, pageCount: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const onFiltersChange = (next) => {
    setFilters(next);
    setPage(1);
  };
  const onFiltersReset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const toggleExpand = async (id) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next) {
      const idx = list.findIndex((r) => r.id === id);
      if (idx >= 0 && !list[idx].detailsLoaded) {
        try {
          const full = await getResult(id);
          setList((prev) =>
            prev.map((x) =>
              x.id === id
                ? {
                    ...x,
                    ...full,
                    expected: full.expected_result || full.expected,
                    dailyTasksCount: full.daily_tasks_count ?? x.dailyTasksCount,
                    urgent: full.is_urgent || full.urgent,
                    ownerName: full.owner_name || full.ownerName,
                    assigneeName: full.assignee_name || full.assigneeName,
                    detailsLoaded: true,
                  }
                : x
            )
          );
        } catch (_) {
          /* ignore */
        }
      }
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Видалити результат?')) return;
    await deleteResult(id);
    fetchList();
  };

  const onMarkDone = async (id) => {
    const r = list.find((x) => x.id === id);
    if (!r) return;
    const ok = window.confirm(
      'Позначити результат виконаним? Це каскадно закриє усі підрезультати та задачі.'
    );
    if (!ok) return;
    await toggleResultComplete(id, true);
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'done' } : x)));
  };

  const rows = (items) =>
    items.map((r) => (
      <React.Fragment key={r.id}>
        <ResultRow
          result={r}
          expanded={expanded === r.id}
          onToggleExpand={toggleExpand}
          onCreateTemplate={() => {}}
          onCreateTask={() => {}}
          onViewTasks={() => {}}
          onEdit={() => {}}
          onArchive={() => {}}
          onDelete={r.is_owner ? onDelete : undefined}
          onMarkDone={onMarkDone}
        />
        {expanded === r.id && (
          <ResultDetails
            result={r}
            onAddSubresult={() => {}}
            onCreateTemplate={() => {}}
            onCreateTask={() => {}}
          />
        )}
      </React.Fragment>
    ));

  const grouped = () => {
    const groups = {};
    list.forEach((r) => {
      const key = r.ownerName || '—';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups).map(([owner, items]) => (
      <div key={owner} className="results-group">
        <h3 className="group-title">{owner}</h3>
        {rows(items)}
      </div>
    ));
  };

  return (
    <Layout>
      <div className="results-page">
        <div className="results-page__header">
          <h1>Результати</h1>
          <button className="btn primary" onClick={() => (window.location.href = '/results/new')}>
            Додати результат
          </button>
        </div>

        <ResultsFilters value={filters} onChange={onFiltersChange} onReset={onFiltersReset} />

        {loading && <div className="results-loader">Завантаження…</div>}

        {!loading && list.length === 0 && <ResultsEmpty onCreate={() => (window.location.href = '/results/new')} />}

        {!loading && list.length > 0 && (
          <div className="results-list">
            {filters.view === 'owner' ? grouped() : rows(list)}
          </div>
        )}

        <div className="results-pagination">
          <button
            className="btn ghost"
            disabled={page <= 1}
            onClick={() => page > 1 && setPage((p) => p - 1)}
          >
            Назад
          </button>
          <span className="page-info">
            Сторінка {pagination.page || 1} з {pagination.pageCount || 1}
          </span>
          <button
            className="btn ghost"
            disabled={page >= pagination.pageCount}
            onClick={() => page < pagination.pageCount && setPage((p) => p + 1)}
          >
            Далі
          </button>
        </div>
      </div>
    </Layout>
  );
}
