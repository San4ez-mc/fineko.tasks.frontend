import React, { useState } from "react";

/**
 * Рекурсивний вузол оргструктури.
 * node.type: 'division' | 'department' | 'position'
 */
export default function OrgNode({
  node, level, expanded, onToggleExpand, highlightIds,
  onUpdateUnit, onMove, onReplaceUser,
  onAddPosition, onAddDepartment, onEditUnit, onDeleteUnit,
  onOpenTasks, onOpenResults
}) {
  const key = node.id;
  const isOpen = expanded.has(key);
  const isHighlighted = highlightIds?.has(key);

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
            <button className="btn ghost" onClick={()=>onOpenTasks && onOpenTasks(node.user?.id)}>👤</button>
            <button className="btn ghost" onClick={()=>onOpenResults && onOpenResults(node.user?.id)}>📈</button>
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
          <div className="unit-actions">
            <button className="btn ghost" onClick={()=>onAddPosition && onAddPosition(node.id)}>+ Посада</button>
            <button className="btn ghost" onClick={()=>onAddDepartment && onAddDepartment(node.id)}>+ Відділ</button>
            <button className="btn ghost" onClick={()=>onEditUnit && onEditUnit(node.id)}>Редагувати</button>
            <button className="btn ghost" onClick={()=>onDeleteUnit && onDeleteUnit(node.id)}>Видалити</button>
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
              onAddPosition={onAddPosition}
              onAddDepartment={onAddDepartment}
              onEditUnit={onEditUnit}
              onDeleteUnit={onDeleteUnit}
              onOpenTasks={onOpenTasks}
              onOpenResults={onOpenResults}
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
              onAddPosition={onAddPosition}
              onAddDepartment={onAddDepartment}
              onEditUnit={onEditUnit}
              onDeleteUnit={onDeleteUnit}
              onOpenTasks={onOpenTasks}
              onOpenResults={onOpenResults}
            />
          ))}
        </div>
      )}
    </div>
  );
}
