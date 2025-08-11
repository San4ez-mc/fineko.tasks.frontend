import React from "react";

/**
 * props:
 * - positions: [{id,title,user,managers[],departmentId,divisionId,departmentName,divisionName}]
 * - allPositions: [] (для селектів)
 * - filters: { q, divisionId, departmentId, role }
 * - onFiltersChange(next)
 * - onSearch(q)
 * - onUpdatePosition(id, patch) // { managers:[], departmentId }
 */
export default function OrgLeftPanel({
  positions, allPositions, filters, onFiltersChange, onSearch, onUpdatePosition
}) {
  const divisions = uniquePairs(allPositions.map(p => ({ id: p.divisionId, name: p.divisionName })));
  const departments = uniquePairs(allPositions.map(p => ({ id: p.departmentId, name: p.departmentName })));

  return (
    <div className="org-left-panel">
      <div className="olp-filters">
        <label className="rf-search" aria-label="Пошук">
          <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            className="input"
            type="search"
            placeholder="Пошук ПІБ/посади/відділу…"
            value={filters.q}
            onChange={(e)=>{ onSearch && onSearch(e.target.value); }}
          />
        </label>

        <div className="olp-row">
          <label className="rf-field">
            <span>Відділення</span>
            <select className="input" value={filters.divisionId} onChange={(e)=>onFiltersChange({...filters, divisionId: e.target.value})}>
              <option value="any">Усі</option>
              {divisions.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>

          <label className="rf-field">
            <span>Відділ</span>
            <select className="input" value={filters.departmentId} onChange={(e)=>onFiltersChange({...filters, departmentId: e.target.value})}>
              <option value="any">Усі</option>
              {departments.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>

          <label className="rf-field">
            <span>Роль</span>
            <select className="input" value={filters.role} onChange={(e)=>onFiltersChange({...filters, role: e.target.value})}>
              <option value="any">Будь‑яка</option>
              <option value="manager">Керівник</option>
              <option value="employee">Співробітник</option>
            </select>
          </label>

          <button className="btn ghost" onClick={()=>onFiltersChange({ q:"", divisionId:"any", departmentId:"any", role:"any" })}>Скинути</button>
        </div>
      </div>

      <div className="olp-table">
        <div className="olp-th">
          <div>Посада</div>
          <div>Керівник(и)</div>
          <div>Відділ</div>
          <div>Дії</div>
        </div>

        {positions.map(p => (
          <div className="olp-tr" key={p.id}>
            <div className="name">
              <div className="title">{p.title}</div>
              <div className="muted">{p.user?.name || "—"}</div>
            </div>

            <div className="managers">
              <input className="input" placeholder="введіть ПІБ (демо)" defaultValue={(p.managers||[]).map(m=>m.name).join(", ")}
                onBlur={(e)=>onUpdatePosition && onUpdatePosition(p.id, { managersText: e.target.value })} />
            </div>

            <div className="dept">
              <select className="input" defaultValue={p.departmentId} onChange={(e)=>onUpdatePosition && onUpdatePosition(p.id, { departmentId: e.target.value })}>
                {departments.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="actions">
              <a className="btn ghost" href={`/tasks?assignee_id=${p.user?.id || ""}`}>Задачі</a>
              <a className="btn ghost" href={`/results?assignee_id=${p.user?.id || ""}`}>Результати</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function uniquePairs(arr){
  const map = new Map();
  arr.forEach(({id,name}) => { if(id && !map.has(id)) map.set(id, name); });
  return [...map.entries()].map(([id,name]) => ({id,name}));
}
