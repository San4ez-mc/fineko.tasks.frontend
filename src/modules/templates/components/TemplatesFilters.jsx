import React, { useEffect, useState } from "react";
import "./TemplatesFilters.css";

/**
 * props:
 *  - value: { q, resultId, priority, defaultAssigneeId, view } // view: 'list'|'by_result'|'by_assignee'
 *  - onChange(next)
 *  - onReset()
 */
export default function TemplatesFilters({ value, onChange, onReset }) {
  const [local, setLocal] = useState(
    value || { q: "", resultId: "any", priority: "any", defaultAssigneeId: "any", view: "list" }
  );

  useEffect(() => setLocal(value), [value]);

  const change = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange && onChange(next);
  };

  return (
    <div className="tpl-filters card">
      <div className="tf-row">
        <label className="tf-search" aria-label="Пошук по всіх полях">
          <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
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

        <div className="tf-group">
          <label className="tf-field">
            <span>Результат</span>
            <select
              value={local.resultId}
              onChange={(e) => change({ resultId: e.target.value })}
            >
              <option value="any">Будь‑який</option>
              {/* Підставити опції з пропів/стору */}
            </select>
          </label>

          <label className="tf-field">
            <span>Пріоритет/тип</span>
            <select
              value={local.priority}
              onChange={(e) => change({ priority: e.target.value })}
            >
              <option value="any">Будь‑який</option>
              <option value="critical">Важл.+термін.</option>
              <option value="important">Важлива</option>
              <option value="rush">Термінова</option>
              <option value="neutral">Звичайна</option>
            </select>
          </label>

          <label className="tf-field">
            <span>Виконавець (деф.)</span>
            <select
              value={local.defaultAssigneeId}
              onChange={(e) => change({ defaultAssigneeId: e.target.value })}
            >
              <option value="any">Будь‑хто</option>
              {/* Підставити опції з пропів/стору */}
            </select>
          </label>

          <label className="tf-field">
            <span>Вид</span>
            <select
              value={local.view}
              onChange={(e) => change({ view: e.target.value })}
            >
              <option value="list">Список</option>
              <option value="by_result">За результатом</option>
              <option value="by_assignee">За виконавцем</option>
            </select>
          </label>
        </div>

        <div className="tf-actions">
          <button className="btn ghost" onClick={() => onReset && onReset()}>Скинути фільтри</button>
        </div>
      </div>
    </div>
  );
}

