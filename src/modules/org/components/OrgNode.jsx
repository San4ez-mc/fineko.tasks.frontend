import React, { useState } from "react";

/**
 * Рекурсивний вузол оргструктури.
 * node.type: 'division' | 'department' | 'position'
 */
export default function OrgNode({
  node, level, expanded, onToggleExpand, highlightIds,
  onUpdateUnit, onMove, onReplaceUser, employees = []
}) {
  const key = node.id;
  const isOpen = expanded.has(key);
  const isHighlighted = highlightIds?.has(key);
  const headInitials = node.head?.name
    ? node.head.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "";

  // DnD
  const [dragOverState, setDragOverState] = useState(null); // 'ok'|'deny'|null
  const dragStart = (e) => { e.dataTransfer.setData("text/plain", JSON.stringify({ entity: node.type, id: node.id })); };
  const dragOver = (e) => {
    e.preventDefault();
    // allow drop: position -> department; department -> division
    const data = JSON.parse(e.dataTransfer.getData("text/plain") || "{}");
    const ok = (data.entity === "position" && node.type === "department")
            || (data.entity === "department" && node.type === "division");
    setDragOverState(ok ? "ok" : "deny");
  };
  const drop = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain") || "{}");
    const ok = (data.entity === "position" && node.type === "department")
            || (data.entity === "department" && node.type === "division");
    if (ok) {
      onMove && onMove({ entity: data.entity, id: data.id, targetId: node.id });
    }
    setDragOverState(null);
  };
  const dragLeave = () => setDragOverState(null);

  return (
    <div
      className=
        {"org-node " +
        (node.type === "division" ? "is-division " : node.type === "department" ? "is-department " : "is-position ") +
        (isHighlighted ? "is-highlighted " : "") +
        (dragOverState === "ok" ? "droppable-ok " : dragOverState === "deny" ? "droppable-deny " : "")
      }
      draggable={node.type !== "division"}
      onDragStart={dragStart}
      onDragOver={dragOver}
      onDrop={drop}
      onDragLeave={dragLeave}
    >
      <div className="head">
        {node.type !== "position" && (
          <button className="caret" onClick={()=>onToggleExpand && onToggleExpand(key)}>{isOpen ? "▾" : "▸"}</button>
        )}
        <div className="title">{node.name || node.title}</div>
        {node.head && (node.type !== "position") && <span className="badge important">Керівник: {node.head.name}</span>}
      </div>

      {node.type === "position" && (
        <div className="pos-meta">
          <div className="muted">Працівник</div>
          <div className="user">{node.user?.name || "—"}</div>
          <div className="pos-actions">
            <a className="btn ghost" href={`/tasks?assignee_id=${node.user?.id || ""}`}>Задачі</a>
            <a className="btn ghost" href={`/results?assignee_id=${node.user?.id || ""}`}>Результати</a>
          </div>
          <label className="line">
            <span className="k">Старий</span>
            <input className="input" disabled value={node.user?.name || ""} />
          </label>
          <label className="line">
            <span className="k">Новий</span>
            <input className="input" placeholder="вибрати (демо)" onBlur={(e)=>onReplaceUser && onReplaceUser(node.id, { id: -1, name: e.target.value })} />
          </label>
        </div>
      )}

      {node.type !== "position" && (
        <div className="unit-meta">
          <label className="line">
            <span className="k">ЦКП</span>
            <textarea
              className="input"
              rows={2}
              defaultValue={node.productValue || ""}
              onBlur={(e)=>onUpdateUnit && onUpdateUnit(node.id, { productValue: e.target.value })}
            />
          </label>
          <label className="line">
            <span className="k">Відповідальний</span>
            <div className="resp-select">
              <div className="head-avatar">{headInitials || ""}</div>
              <select
                className="input"
                defaultValue=""
                onChange={(e)=>{
                  const u = employees.find(u => String(u.id) === e.target.value);
                  onUpdateUnit && onUpdateUnit(node.id, { head: u || null });
                }}
              >
                <option value="">—</option>
                {employees.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </label>
          <div className="unit-actions">
            <button className="btn ghost">+</button>
          </div>
        </div>
      )}

      {/* діти */}
      {node.type !== "position" && isOpen && (
        <div className="children">
          {node.type === "division" && (node.departments || []).map(dep => (
            <OrgNode
              key={dep.id}
              node={dep}
              level={level+1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              highlightIds={highlightIds}
              onUpdateUnit={onUpdateUnit}
              onMove={onMove}
              onReplaceUser={onReplaceUser}
              employees={employees}
            />
          ))}
          {node.type === "department" && (node.employees || []).map(p => (
            <OrgNode
              key={p.id}
              node={p}
              level={level+1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              highlightIds={highlightIds}
              onUpdateUnit={onUpdateUnit}
              onMove={onMove}
              onReplaceUser={onReplaceUser}
              employees={employees}
            />
          ))}
        </div>
      )}
    </div>
  );
}
