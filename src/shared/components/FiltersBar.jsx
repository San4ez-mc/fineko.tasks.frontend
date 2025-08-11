import React from "react";
import "./FiltersBar.css";

export default function FiltersBar({ q, status, onChange, onSubmit, onReset }) {
    return (
        <form
            className="filters-bar"
            onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
        >
            <input
                type="text"
                placeholder="Пошук (назва/опис/очікуваний)"
                value={q}
                onChange={(e) => onChange?.({ q: e.target.value })}
            />
            <select
                value={status}
                onChange={(e) => onChange?.({ status: e.target.value })}
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
