import React from "react";
import "./TemplateRow.css";

/**
 * template: {
 *  id, title, plannedTime, priority, defaultAssigneeName,
 *  result: { id, title } | null,
 *  scheduleHuman // читабельна періодичність (напр. "щотижня у понеділок")
 * }
 * onExpand(id)
 * expanded: boolean
 * onCreateTask(id)
 * onEdit(id)
 * onArchive(id)
 * onDelete(id) // тільки власник
 */
export default function TemplateRow({
  template, expanded,
  onExpand, onCreateTask, onEdit, onArchive, onDelete
}) {
  return (
    <div className={`tpl-row ${expanded ? "expanded" : ""}`}>
      <button className="caret" aria-label="Розгорнути" onClick={() => onExpand && onExpand(template.id)}>
        {expanded ? "▾" : "▸"}
      </button>

      <a className="title" href={`/templates/${template.id}`} title={template.title}>{template.title}</a>

      <div className="meta">
        {template.result ? (
          <a className="link" href={`/results/${template.result.id}`}>{template.result.title}</a>
        ) : <span className="muted">Без результату</span>}
        <span className={`badge ${mapPriority(template.priority)}`}>{humanPriority(template.priority)}</span>
        <span className="badge neutral">{template.plannedTime || "00:00"}</span>
        {template.scheduleHuman && <span className="muted">{template.scheduleHuman}</span>}
        <span className="muted">Виконавець: {template.defaultAssigneeName || "—"}</span>
      </div>

      <div className="actions">
        <button className="btn" onClick={() => onCreateTask && onCreateTask(template.id)}>Створити задачу</button>
        <button className="btn ghost" onClick={() => onEdit && onEdit(template.id)}>Редагувати</button>
        <button className="btn ghost" onClick={() => onArchive && onArchive(template.id)}>Архівувати</button>
        <button className="btn ghost" onClick={() => onDelete && onDelete(template.id)}>Видалити</button>
      </div>
    </div>
  );
}

function mapPriority(p){
  return p === "critical" ? "critical"
    : p === "important" ? "important"
    : p === "rush" ? "rush"
    : "neutral";
}
function humanPriority(p){
  return p === "critical" ? "важл.+термін."
    : p === "important" ? "важлива"
    : p === "rush" ? "термінова"
    : "звичайна";
}
