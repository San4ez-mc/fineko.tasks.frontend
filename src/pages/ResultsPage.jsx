import React, { useEffect, useMemo, useState } from 'react';
import {
    getResults,
    createResult,
    updateResult,
    deleteResult,
    toggleResultComplete,
    getResult,
} from '../api/results';

const initialForm = {
    title: '',
    description: '',
    expected_result: '',
    deadline: '', // YYYY-MM-DD
    parent_id: null, // для підрезультатів
};

export default function ResultsPage() {
    const [list, setList] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pageCount: 1, pageSize: 25, totalCount: 0 });
    const [loading, setLoading] = useState(false);
    const [createForm, setCreateForm] = useState(initialForm);
    const [expanded, setExpanded] = useState({}); // id -> true/false
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(initialForm);
    const [q, setQ] = useState('');
    const [status, setStatus] = useState(''); // '', 'active', 'done'

    const pageNumbers = useMemo(() => Array.from({ length: pagination.pageCount || 1 }, (_, i) => i + 1), [pagination]);

    const fetchPage = async (page = 1) => {
        setLoading(true);
        try {
            const data = await getResults({ page, q: q || undefined, status: status || undefined });
            setList(data.items || []);
            setPagination(data.pagination || {});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshCurrent = () => fetchPage(pagination.page || 1);

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
        // якщо створюємо підрезультат — розгортаємо батька
        if (createForm.parent_id) {
            setExpanded((s) => ({ ...s, [createForm.parent_id]: true }));
        }
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

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(initialForm);
    };

    const saveEdit = async () => {
        await updateResult(editingId, editForm);
        setEditingId(null);
        refreshCurrent();
    };

    const toggleExpand = async (id) => {
        const next = !expanded[id];
        setExpanded((s) => ({ ...s, [id]: next }));
        // при розгортанні підвантажимо свіжі деталі (діти/задачі-лічильники у нас уже є в полях, але view може знадобитись пізніше)
        if (next) {
            try { await getResult(id); } catch (_) { }
        }
    };

    const onSearch = async (e) => {
        e.preventDefault();
        await fetchPage(1);
    };

    return (
        <div style={{ padding: 20, maxWidth: 1100, margin: '0 auto' }}>
            <h1 style={{ marginBottom: 12 }}>Результати</h1>

            {/* Фільтри */}
            <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Пошук (назва/опис/очікуваний)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ flex: '1 1 280px', padding: '8px 10px' }}
                />
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 10px' }}>
                    <option value="">Всі</option>
                    <option value="active">Активні</option>
                    <option value="done">Виконані</option>
                </select>
                <button type="submit">Фільтрувати</button>
                <button type="button" onClick={() => { setQ(''); setStatus(''); fetchPage(1); }}>
                    Скинути
                </button>
            </form>

            {/* Форма створення */}
            <form onSubmit={onCreate} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
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
                    title="Підрезультат для..."
                >
                    <option value="">Без батька</option>
                    {list.map((r) => (
                        <option key={r.id} value={r.id}>{`#${r.id} ${r.title}`}</option>
                    ))}
                </select>
                <button type="submit" style={{ gridColumn: '1 / -1' }}>Додати</button>
            </form>

            {/* Таблиця результатів */}
            {loading ? (
                <p>Завантаження...</p>
            ) : (
                <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#fafafa' }}>
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
                                        <button onClick={() => toggleExpand(r.id)} style={{ marginRight: 8 }}>
                                            {expanded[r.id] ? '▾' : '▸'}
                                        </button>
                                        {r.title}
                                    </td>
                                    <td>{r.deadline || '—'}</td>
                                    <td>{`${r.tasks_done}/${r.tasks_total}`}</td>
                                    <td>{r.is_completed ? '✅ Виконано' : '❌ Активний'}</td>
                                    <td>
                                        <button onClick={() => onToggle(r)}>{r.is_completed ? 'Зняти виконання' : 'Позначити виконаним'}</button>
                                        <button onClick={() => openEdit(r)} style={{ marginLeft: 8 }}>Редагувати</button>
                                        <button onClick={() => onDelete(r.id)} style={{ marginLeft: 8, color: 'crimson' }}>Видалити</button>
                                    </td>
                                </tr>

                                {/* Розгортання */}
                                {expanded[r.id] && (
                                    <tr>
                                        <td colSpan={6} style={{ background: '#fcfcff' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <div>
                                                    <h4 style={{ margin: '8px 0' }}>Деталі</h4>
                                                    <div><b>Опис:</b> {r.description || '—'}</div>
                                                    <div><b>Очікуваний результат:</b> {r.expected_result || '—'}</div>
                                                    <div><b>Дедлайн:</b> {r.deadline || '—'}</div>
                                                    <div><b>Підрезультатів:</b> {r.children_count}</div>
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: '8px 0' }}>Додати підрезультат</h4>
                                                    <SubresultInlineForm parentId={r.id} onAdded={refreshCurrent} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Редагування */}
                                {editingId === r.id && (
                                    <tr>
                                        <td colSpan={6} style={{ background: '#fff9f2' }}>
                                            <h4 style={{ margin: '8px 0' }}>Редагувати результат</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 140px 1fr', gap: 8 }}>
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
                                                    title="Підрезультат для..."
                                                >
                                                    <option value="">Без батька</option>
                                                    {list.filter(x => x.id !== r.id).map((x) => (
                                                        <option key={x.id} value={x.id}>{`#${x.id} ${x.title}`}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ marginTop: 10 }}>
                                                <button onClick={saveEdit}>Зберегти</button>
                                                <button onClick={cancelEdit} style={{ marginLeft: 8 }}>Скасувати</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Пагінація */}
            {pagination.pageCount > 1 && (
                <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {pageNumbers.map((p) => (
                        <button
                            key={p}
                            disabled={p === pagination.page}
                            onClick={() => fetchPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
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
        <form onSubmit={createSub} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr auto', gap: 8 }}>
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
            <button type="submit">Додати</button>
        </form>
    );
}
