import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./ResultItem.css";

export default function ResultItem({
  result,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) {
  const statusClass = mapStatus(result.status);

  const handleCardClick = () => {
    onToggleExpand && onToggleExpand(result.id);
  };

  return (
    <div
      className={`result-item ${expanded ? "expanded" : ""}`}
      onClick={handleCardClick}
    >
      <div className="ri-top">
        <a
          className="ri-title"
          href={`/results/${result.id}`}
          title={result.title}
          onClick={(e) => e.stopPropagation()}
        >
          {result.title}
        </a>
        <div className="ri-actions">
          {onEdit && (
            <button
              className="ri-action"
              aria-label="Редагувати"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(result.id);
              }}
            >
              <FiEdit2 />
            </button>
          )}
          {onDelete && (
            <button
              className="ri-action"
              aria-label="Видалити"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(result.id);
              }}
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>
      <div className="ri-bottom">
        {result.deadline && (
          <span className="ri-deadline">До {result.deadline}</span>
        )}
        <span className={`badge ${statusClass}`}>
          {humanStatus(result.status)}
        </span>
        {result.urgent && <span className="badge critical">Терміново</span>}
        <span className="badge neutral">
          Щоденних: {result.dailyTasksCount ?? 0}
        </span>
      </div>
    </div>
  );
}

function mapStatus(s) {
  return s === "new"
    ? "status-new"
    : s === "in_progress"
    ? "status-progress"
    : s === "done"
    ? "status-done"
    : s === "postponed"
    ? "status-postponed"
    : "neutral";
}

function humanStatus(s) {
  return s === "new"
    ? "Новий"
    : s === "in_progress"
    ? "В процесі"
    : s === "done"
    ? "Виконано"
    : s === "postponed"
    ? "Відкладено"
    : "—";
}

