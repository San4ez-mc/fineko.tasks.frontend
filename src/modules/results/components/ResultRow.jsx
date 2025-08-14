import React, { useState, useEffect } from "react";
import "./ResultRow.css";
import { toggleResultComplete } from "../api/results";

/**
 * result: {
 *  id, title, deadline, expected, dailyTasksCount,
 *  urgent: boolean, status: 'new'|'in_progress'|'done'|'postponed',
 *  ownerName
 * }
 * expanded: boolean
 * onToggleExpand(id)
 * onCreateTemplate(id)
 * onCreateTask(id)
 * onViewTasks(id)
 * onEdit(id)
 * onArchive(id)
 * onDelete(id)  // має перевіряти права вище
 * onMarkDone(id, isCompleted) // підтвердження робити вище
 */
export default function ResultRow({
  result, expanded,
  onToggleExpand, onCreateTemplate, onCreateTask, onViewTasks, onEdit, onArchive, onDelete, onMarkDone
}) {
  const [status, setStatus] = useState(result.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(result.status);
  }, [result.status]);

  const statusClass = mapStatus(status);

  const handleToggleDone = async () => {
    const newStatus = status === "done" ? "in_progress" : "done";
    setStatus(newStatus);
    setLoading(true);
    try {
      if (onMarkDone) {
        await onMarkDone(result.id, newStatus === "done");
      } else {
        await toggleResultComplete(result.id, newStatus === "done");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={`result-row ${expanded ? "expanded" : ""}`}>
      <button className="caret" aria-label="Розгорнути" onClick={() => onToggleExpand && onToggleExpand(result.id)}>
        {expanded ? "▾" : "▸"}
      </button>

      <a className="title" href={`/results/${result.id}`} title={result.title}>{result.title}</a>

      <div className="meta">
        {result.deadline && <span className="k">До</span>}
        {result.deadline && <span className="v">{result.deadline}</span>}
        <span className={`badge ${statusClass}`}>{humanStatus(status)}</span>
        {result.urgent && <span className="badge critical">Терміново</span>}
        <span className="badge neutral">Щоденних: {result.dailyTasksCount ?? 0}</span>
      </div>

      <div className="expected" title={result.expected || ""}>
        {result.expected || "—"}
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={() => onCreateTemplate && onCreateTemplate(result.id)}>Ств. шаблон</button>
        <button className="btn" onClick={() => onCreateTask && onCreateTask(result.id)}>Ств. задачу</button>
        <button className="btn ghost" onClick={() => onViewTasks && onViewTasks(result.id)}>Задачі</button>
        <button className="btn ghost" onClick={() => onEdit && onEdit(result.id)}>Редагувати</button>
        <button className="btn ghost" onClick={() => onArchive && onArchive(result.id)}>Архівувати</button>
        {onDelete && (
          <button className="btn ghost" onClick={() => onDelete(result.id)}>Видалити</button>
        )}
        <button
          className={`done-toggle ${status === "done" ? "checked" : ""}`}
          onClick={handleToggleDone}
          aria-label="Виконано"
          aria-pressed={status === "done"}
          title="Виконано"
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : status === "done" ? "✓" : ""}
        </button>
      </div>
    </div>
  );
}

function mapStatus(s){
  return s === "new" ? "status-new"
    : s === "in_progress" ? "status-progress"
    : s === "done" ? "status-done"
    : s === "postponed" ? "status-postponed"
    : "neutral";
}
function humanStatus(s){
  return s === "new" ? "Новий"
    : s === "in_progress" ? "В процесі"
    : s === "done" ? "Виконано"
    : s === "postponed" ? "Відкладено"
    : "—";
}
