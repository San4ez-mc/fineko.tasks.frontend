import React, { useState } from "react";

/**
 * props:
 * - positions: [{id,title,user,managers[],departmentId,divisionId,departmentName,divisionName}]
 * - divisions: []
 * - departments: []
 * - filters: { q, divisionId, departmentId, role }
 * - onFiltersChange(next)
 * - onSearch(q)
 * - onUpdatePosition(id, patch) // { managers:[], departmentId }
 * - onCreatePosition(data)
 * - onCreateDepartment(data)
 * - onFocusPosition(id)
 */
export default function OrgLeftPanel({
  positions, divisions, departments, filters,
  onFiltersChange, onSearch, onUpdatePosition,
  onCreatePosition, onCreateDepartment, onFocusPosition,
  canEdit = false
}) {
  const [showPosForm, setShowPosForm] = useState(false);
  const [showDepForm, setShowDepForm] = useState(false);
  const [posForm, setPosForm] = useState({ title: "", departmentId: departments[0]?.id || "", managers: "" });
  const [depForm, setDepForm] = useState({ name: "", divisionId: divisions[0]?.id || "", head: "" });
  const [savingPos, setSavingPos] = useState(false);
  const [savingDep, setSavingDep] = useState(false);

  const submitPos = async (e) => {
    e.preventDefault();
    if (!onCreatePosition) return;
    setSavingPos(true);
    try {
      const managers = posForm.managers
        .split(",")
        .map((s, i) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({ id: `tmp-${i}`, name }));
      await onCreatePosition({ title: posForm.title, departmentId: posForm.departmentId, managers });
      setPosForm({ title: "", departmentId: departments[0]?.id || "", managers: "" });
      setShowPosForm(false);
    } catch {
      alert("Помилка створення посади");
    } finally {
      setSavingPos(false);
    }
  };

  const submitDep = async (e) => {
    e.preventDefault();
    if (!onCreateDepartment) return;
    setSavingDep(true);
    try {
      const head = depForm.head ? { name: depForm.head } : null;
      await onCreateDepartment({ name: depForm.name, divisionId: depForm.divisionId, head });
      setDepForm({ name: "", divisionId: divisions[0]?.id || "", head: "" });
      setShowDepForm(false);
    } catch {
      alert("Помилка створення відділу");
    } finally {
      setSavingDep(false);
    }
  };

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
              {departments.filter(d=> filters.divisionId === "any" || d.divisionId === filters.divisionId)
                .map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
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

      {canEdit && (
        <div className="olp-actions">
          <button className="btn ghost" onClick={()=>{ setShowPosForm(p=>!p); setShowDepForm(false); }}>Додати посаду</button>
          <button className="btn ghost" onClick={()=>{ setShowDepForm(p=>!p); setShowPosForm(false); }}>Додати відділ</button>
        </div>
      )}

      <div className="olp-table">
        <div className="olp-th">
          <div>Посада</div>
          <div>Керівник(и)</div>
          <div>Відділ</div>
          <div>Дії</div>
        </div>

        {canEdit && showPosForm && (
          <form className="olp-tr" onSubmit={submitPos}>
            <div className="name">
              <input className="input" required value={posForm.title} onChange={(e)=>setPosForm({...posForm,title:e.target.value})} />
            </div>
            <div className="managers">
              <input className="input" placeholder="ПІБ керівників" value={posForm.managers} onChange={(e)=>setPosForm({...posForm,managers:e.target.value})} />
            </div>
            <div className="dept">
              <select className="input" required value={posForm.departmentId} onChange={(e)=>setPosForm({...posForm,departmentId:e.target.value})}>
                {departments.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="actions">
              <button className="btn" type="submit" disabled={savingPos}>{savingPos?"…":"Зберегти"}</button>
            </div>
          </form>
        )}

        {canEdit && showDepForm && (
          <form className="olp-tr" onSubmit={submitDep}>
            <div className="name">
              <input className="input" required value={depForm.name} onChange={(e)=>setDepForm({...depForm,name:e.target.value})} />
            </div>
            <div className="managers">
              <input className="input" placeholder="Керівник" value={depForm.head} onChange={(e)=>setDepForm({...depForm,head:e.target.value})} />
            </div>
            <div className="dept">
              <select className="input" required value={depForm.divisionId} onChange={(e)=>setDepForm({...depForm,divisionId:e.target.value})}>
                {divisions.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="actions">
              <button className="btn" type="submit" disabled={savingDep}>{savingDep?"…":"Зберегти"}</button>
            </div>
          </form>
        )}

        {positions.map(p => (
          <div className="olp-tr" key={p.id}>
            <div className="name">
              <div className="title" onClick={()=>onFocusPosition && onFocusPosition(p.id)} style={{cursor:"pointer"}}>{p.title}</div>
              <div className="muted">{p.user?.name || "—"}</div>
            </div>

            <div className="managers">
              <input className="input" placeholder="введіть ПІБ (демо)" defaultValue={(p.managers||[]).map(m=>m.name).join(", ")}
                onBlur={(e)=>onUpdatePosition && onUpdatePosition(p.id, { managersText: e.target.value })} disabled={!canEdit} />
            </div>

            <div className="dept">
              <select className="input" defaultValue={p.departmentId} onChange={(e)=>onUpdatePosition && onUpdatePosition(p.id, { departmentId: e.target.value })} disabled={!canEdit}>
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

