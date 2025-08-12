import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import {
  getResults,
  getResult,
  deleteResult,
  toggleResultComplete,
  createResult,
  createSubresult,
} from '../api/results';
import { getUsers } from '../../../services/api/users';
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
  const [showForm, setShowForm] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', finalResult: '', urgent: false, description: '', responsibleId: '' });
  const [errors, setErrors] = useState({});

  const mapItem = (r) => ({
    ...r,
    expected: r.final_result || r.expected_result || r.expected,
    dailyTasksCount: r.daily_tasks_count ?? r.tasks_total ?? 0,
    urgent: r.urgent || r.is_urgent,
    ownerName: r.owner_name || r.ownerName,
    assigneeName: r.assignee_name || r.assigneeName || r.responsible_name,
  });

  const userLabel = (u) => {
    const first = u.first_name || u.firstName || u.name || '';
    const last = u.last_name || u.lastName || '';
    const full = `${first} ${last}`.trim();
    return full || u.username || `ID ${u.id}`;
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        const items = Array.isArray(data) ? data : data.items || [];
        setUsers(items);
      } catch (_) {
        /* ignore */
      }
    };
    loadUsers();
  }, []);

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
      const items = (data.items || []).map(mapItem);
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

  const openForm = (pid = null) => {
    setParentId(pid);
    setForm({ title: '', finalResult: '', urgent: false, description: '', responsibleId: '' });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title) errs.title = 'Обов\'язково';
    if (!form.finalResult) errs.finalResult = 'Обов\'язково';
    if (!form.responsibleId) errs.responsibleId = 'Обов\'язково';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const payload = {
      title: form.title,
      final_result: form.finalResult,
      urgent: form.urgent,
      description: form.description,
      responsible_id: Number(form.responsibleId),
    };
    try {
      const data = parentId
        ? await createSubresult(parentId, payload)
        : await createResult(payload);
      const mapped = mapItem(data);
      if (parentId) {
        setList((prev) =>
          prev.map((r) =>
            r.id === parentId
              ? { ...r, subtasks: [mapped, ...(r.subtasks || [])] }
              : r
          )
        );
      } else {
        setList((prev) => [mapped, ...prev]);
      }
      setShowForm(false);
      setParentId(null);
      alert('Створено');
    } catch (e) {
      const apiErrors = e.response?.data?.errors || {};
      setErrors(apiErrors);
      const msg = e.response?.data?.message || 'Сталася помилка при збереженні результату';
      alert(msg);
    }
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
            onAddSubresult={openForm}
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
          {!showForm && (
            <button className="btn primary" onClick={() => openForm(null)}>
              Додати результат
            </button>
          )}
        </div>

        <ResultsFilters value={filters} onChange={onFiltersChange} onReset={onFiltersReset} />

        {showForm && (
          <div className="results-create card">
            <form onSubmit={handleSubmit}>
              <label className="rc-field">
                <span>Назва*</span>
                <input
                  type="text"
                  className={`input ${errors.title ? 'error' : ''}`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && <div className="field-error">{errors.title}</div>}
              </label>
              <div className="rc-row">
                <label className="rc-field">
                  <span>Кінцевий результат*</span>
                  <input
                    type="text"
                    className={`input ${errors.finalResult ? 'error' : ''}`}
                    value={form.finalResult}
                    onChange={(e) => setForm({ ...form, finalResult: e.target.value })}
                  />
                  {errors.finalResult && <div className="field-error">{errors.finalResult}</div>}
                </label>
                <label className="rc-check">
                  <input
                    type="checkbox"
                    checked={form.urgent}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                  />
                  <span>Терміново</span>
                </label>
              </div>
              <label className="rc-field">
                <span>Опис</span>
                <textarea
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <label className="rc-field">
                <span>Відповідальний*</span>
                <select
                  className={`input ${errors.responsibleId ? 'error' : ''}`}
                  value={form.responsibleId}
                  onChange={(e) => setForm({ ...form, responsibleId: e.target.value })}
                >
                  <option value="">Оберіть користувача</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {userLabel(u)}
                    </option>
                  ))}
                </select>
                {errors.responsibleId && <div className="field-error">{errors.responsibleId}</div>}
              </label>
              <div className="rc-actions">
                <button type="submit" className="btn primary">Зберегти</button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setShowForm(false);
                    setParentId(null);
                  }}
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <div className="results-loader">Завантаження…</div>}

        {!loading && list.length === 0 && <ResultsEmpty onCreate={() => openForm(null)} />}

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
