import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout.jsx';
import {
    getResults, getResult, createResult, updateResult, deleteResult, toggleResultComplete,
} from '../api/results';
import Pagination from '../../../shared/components/Pagination';
import FiltersBar from '../../../shared/components/FiltersBar';
import './ResultsPage.css';

const initialForm = { title: '', description: '', expected_result: '', deadline: '', parent_id: null };

export default function ResultsPage() {
    const [list, setList] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pageCount: 1, pageSize: 25, totalCount: 0 });
    const [loading, setLoading] = useState(false);
    const [createForm, setCreateForm] = useState(initialForm);
    const [expanded, setExpanded] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(initialForm);
    const [filters, setFilters] = useState({ q: '', status: '' });

    const fetchPage = async (page = 1) => {
        setLoading(true);
        try {
            const data = await getResults({ page, q: filters.q || undefined, status: filters.status || undefined });
            setList(data.items || []);
            setPagination(data.pagination || {});
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchPage(1); /* eslint-disable-line */ }, []);
    const refreshCurrent = () => fetchPage(pagination.page || 1);

    const onFiltersSubmit = () => fetchPage(1);
    const onFiltersReset = () => { setFilters({ q: '', status: '' }); fetchPage(1); };
    const onFiltersChange = (patch) => setFilters((s) => ({ ...s, ...patch }));

    const onCreate = async (e) => {
        e.preventDefault();
        if (!createForm.title.trim()) return;
        await createResult({
            title: createForm.title.trim(),
            description: createForm.description || null,
            expected_result: createForm.expected_result || null,
            deadline: createForm.deadline || null,
            parent_id: createForm.parent_id || null,
        });
        setCreateForm(initialForm);
        if (createForm.parent_id) setExpanded((s) => ({ ...s, [createForm.parent_id]: true }));
        refreshCurrent();
    };

    const onDelete = async (id) => {
        if (!window.confirm('Видалити результат?')) return;
        await deleteResult(id);
        refreshCurrent();
    };

    const onToggle = async (r) => {
        await toggleResultComplete(r.id, !r.is_completed);
        refreshCurrent();
    };

    const openEdit = (r) => {
        setEditingId(r.id);
        setEditForm({
            title: r.title || '',
            description: r.description || '',
            expected_result: r.expected_result || '',
            deadline: r.deadline || '',
            parent_id: r.parent_id || null,
        });
    };
    const cancelEdit = () => { setEditingId(null); setEditForm(initialForm); };
    const saveEdit = async () => { await updateResult(editingId, editForm); setEditingId(null); refreshCurrent(); };

    const toggleExpand = async (id) => {
        const next = !expanded[id];
        setExpanded((s) => ({ ...s, [id]: next }));
        if (next) { try { await getResult(id); } catch (_) { } }
    };

    return (
        <Layout>
            <div className="results-page">
                <div className="results-page__header">
                    <h1>Результати</h1>
                </div>

                <div className="results-page__filters">
                    <FiltersBar
                        q={filters.q}
                        status={filters.status}
                        onChange={onFiltersChange}
                        onSubmit={onFiltersSubmit}
                        onReset={onFiltersReset}
                    />
                </div>

                <form className="results-create-form" onSubmit={onCreate}>
                    <input
                        type="text"
                        placeholder="Назва *"
                        value={createForm.title}
                        onChange={(e) => setCreateForm((s) => ({ ...s, title: e.target.value }))}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Опис"
                        value={createForm.description}
                        onChange={(e) => setCreateForm((s) => ({ ...s, description: e.target.value }))}
                    />
                    <input
                        type="text"
                        placeholder="Очікуваний результат"
                        value={createForm.expected_result}
                        onChange={(e) => setCreateForm((s) => ({ ...s, expected_result: e.target.value }))}
                    />
                    <input
                        type="date"
                        value={createForm.deadline}
                        onChange={(e) => setCreateForm((s) => ({ ...s, deadline: e.target.value }))}
                    />
                    <select
                        value={createForm.parent_id || ''}
                        onChange={(e) => setCreateForm((s) => ({ ...s, parent_id: e.target.value ? Number(e.target.value) : null }))}
                    >
                        <option value="">Без батька</option>
                        {list.map((r) => <option key={r.id} value={r.id}>{`#${r.id} ${r.title}`}</option>)}
                    </select>
                    <button type="submit" className="btn-primary">Додати</button>
                </form>

                {loading ? (
                    <p className="results-loader">Завантаження...</p>
                ) : (
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>ID</th>
                                <th>Назва</th>
                                <th style={{ width: 120 }}>Дедлайн</th>
                                <th style={{ width: 140 }}>Задачі (вик/всього)</th>
                                <th style={{ width: 100 }}>Статус</th>
                                <th style={{ width: 280 }}>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((r) => (
                                <React.Fragment key={r.id}>
                                    <tr>
                                        <td>#{r.id}</td>
                                        <td>
                                            <button className="expander" onClick={() => toggleExpand(r.id)}>
                                                {expanded[r.id] ? '▾' : '▸'}
                                            </button>
                                            {r.title}
                                        </td>
                                        <td>{r.deadline || '—'}</td>
                                        <td>{`${r.tasks_done}/${r.tasks_total}`}</td>
                                        <td>{r.is_completed ? '✅ Виконано' : '❌ Активний'}</td>
                                        <td className="actions">
                                            <button className="btn-secondary" onClick={() => onToggle(r)}>
                                                {r.is_completed ? 'Зняти виконання' : 'Позначити виконаним'}
                                            </button>
                                            <button className="btn-secondary" onClick={() => openEdit(r)}>Редагувати</button>
                                            <button className="btn-danger" onClick={() => onDelete(r.id)}>Видалити</button>
                                        </td>
                                    </tr>

                                    {expanded[r.id] && (
                                        <tr className="row-expanded">
                                            <td colSpan={6}>
                                                <div className="expanded-grid">
                                                    <div>
                                                        <h4>Деталі</h4>
                                                        <div><b>Опис:</b> {r.description || '—'}</div>
                                                        <div><b>Очікуваний результат:</b> {r.expected_result || '—'}</div>
                                                        <div><b>Дедлайн:</b> {r.deadline || '—'}</div>
                                                        <div><b>Підрезультатів:</b> {r.children_count}</div>
                                                    </div>
                                                    <div>
                                                        <h4>Додати підрезультат</h4>
                                                        <SubresultInlineForm parentId={r.id} onAdded={refreshCurrent} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {editingId === r.id && (
                                        <tr className="row-edit">
                                            <td colSpan={6}>
                                                <h4>Редагувати результат</h4>
                                                <div className="edit-grid">
                                                    <input
                                                        type="text"
                                                        placeholder="Назва *"
                                                        value={editForm.title}
                                                        onChange={(e) => setEditForm((s) => ({ ...s, title: e.target.value }))}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Опис"
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm((s) => ({ ...s, description: e.target.value }))}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Очікуваний результат"
                                                        value={editForm.expected_result}
                                                        onChange={(e) => setEditForm((s) => ({ ...s, expected_result: e.target.value }))}
                                                    />
                                                    <input
                                                        type="date"
                                                        value={editForm.deadline || ''}
                                                        onChange={(e) => setEditForm((s) => ({ ...s, deadline: e.target.value }))}
                                                    />
                                                    <select
                                                        value={editForm.parent_id || ''}
                                                        onChange={(e) => setEditForm((s) => ({ ...s, parent_id: e.target.value ? Number(e.target.value) : null }))}
                                                    >
                                                        <option value="">Без батька</option>
                                                        {list.filter(x => x.id !== r.id).map((x) => (
                                                            <option key={x.id} value={x.id}>{`#${x.id} ${x.title}`}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="edit-actions">
                                                    <button className="btn-primary" onClick={saveEdit}>Зберегти</button>
                                                    <button className="btn-secondary" onClick={cancelEdit}>Скасувати</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="results-page__pagination">
                    <Pagination page={pagination.page} pageCount={pagination.pageCount} onChange={(p) => fetchPage(p)} />
                </div>
            </div>
        </Layout>
    );
}

function SubresultInlineForm({ parentId, onAdded }) {
    const [form, setForm] = useState({ title: '', description: '', expected_result: '', deadline: '' });
    const createSub = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        await createResult({
            title: form.title.trim(),
            description: form.description || null,
            expected_result: form.expected_result || null,
            deadline: form.deadline || null,
            parent_id: parentId,
        });
        setForm({ title: '', description: '', expected_result: '', deadline: '' });
        onAdded?.();
    };
    return (
        <form className="subresult-form" onSubmit={createSub}>
            <input
                type="text"
                placeholder="Назва *"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                required
            />
            <input
                type="text"
                placeholder="Опис"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
            <input
                type="text"
                placeholder="Очікуваний результат"
                value={form.expected_result}
                onChange={(e) => setForm((s) => ({ ...s, expected_result: e.target.value }))}
            />
            <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((s) => ({ ...s, deadline: e.target.value }))}
            />
            <button type="submit" className="btn-secondary">Додати</button>
        </form>
    );
}
