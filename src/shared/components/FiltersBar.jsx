import React from "react";

export default function FiltersBar({ q, status, onChange, onSubmit, onReset }) {
    return (
        <form
            onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
            style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}
        >
            <input
                type="text"
                placeholder="Пошук (назва/опис/очікуваний)"
                value={q}
                onChange={(e) => onChange?.({ q: e.target.value })}
                style={{ flex: '1 1 280px', padding: '8px 10px' }}
            />
            <select
                value={status}
                onChange={(e) => onChange?.({ status: e.target.value })}
                style={{ padding: '8px 10px' }}
            >
                <option value="">Всі</option>
                <option value="active">Активні</option>
                <option value="done">Виконані</option>
            </select>
            <button type="submit">Фільтрувати</button>
            <button type="button" onClick={onReset}>Скинути</button>
        </form>
    );
}
