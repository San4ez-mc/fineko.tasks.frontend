import React, { useState, useEffect } from "react";
import "./ResultsFilters.css";

/**
 * Пропси:
 * - value: { q, status, hasTemplates, hasActiveTasks, view }  // view: 'list' | 'owner'
 * - onChange(next)
 * - onReset()
 */
export default function ResultsFilters({ value, onChange, onReset }) {
  const [local, setLocal] = useState(value || { q: "", status: "all", hasTemplates: "any", hasActiveTasks: "any", view: "list" });

  useEffect(() => setLocal(value), [value]);

  const change = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange && onChange(next);
  };

  return (
    <div className="results-filters card">
      <div className="rf-row">
        <label className="rf-search">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="ico">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            type="search"
            placeholder="Пошук по всіх полях…"
            value={local.q}
            onChange={(e) => change({ q: e.target.value })}
          />
        </label>

        <div className="rf-group">
          <label className="rf-field">
            <span>Статус</span>
            <select
              value={local.status}
              onChange={(e) => change({ status: e.target.value })}
            >
              <option value="all">Усі</option>
              <option value="new">Новий</option>
              <option value="in_progress">В процесі</option>
              <option value="done">Виконано</option>
              <option value="postponed">Відкладено</option>
            </select>
          </label>

          <label className="rf-field">
            <span>Шаблони</span>
            <select
              value={local.hasTemplates}
              onChange={(e) => change({ hasTemplates: e.target.value })}
            >
              <option value="any">Неважливо</option>
              <option value="yes">Є</option>
              <option value="no">Немає</option>
            </select>
          </label>

          <label className="rf-field">
            <span>Активні задачі</span>
            <select
              value={local.hasActiveTasks}
              onChange={(e) => change({ hasActiveTasks: e.target.value })}
            >
              <option value="any">Неважливо</option>
              <option value="yes">Є активність</option>
              <option value="no">Нема активності</option>
            </select>
          </label>

          <label className="rf-field">
            <span>Подання</span>
            <select
              value={local.view}
              onChange={(e) => change({ view: e.target.value })}
            >
              <option value="list">Список</option>
              <option value="owner">Групувати за постановником</option>
            </select>
          </label>
        </div>

        <div className="rf-actions">
          <button className="btn ghost" onClick={() => onReset && onReset()}>Скинути фільтри</button>
        </div>
      </div>
    </div>
  );
}
