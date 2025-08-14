import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import CheckToggle from "../../../components/ui/CheckToggle.jsx";
import { toggleResultComplete } from "../api/results.js";
import "./ResultItem.css";

export default function ResultItem({
  result,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) {
  const [status, setStatus] = useState(result.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(result.status);
  }, [result.status]);

  const statusClass = mapStatus(status);

  const handleCardClick = () => {
    onToggleExpand && onToggleExpand(result.id);
  };

  const handleToggleDone = async (e) => {
    e.stopPropagation();
    const prev = status;
    const next = status === "done" ? "new" : "done";
    setStatus(next);
    setLoading(true);
    try {
      await toggleResultComplete(result.id, next === "done");
    } catch (err) {
      setStatus(prev);
      alert("Не вдалося оновити статус");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`result-item ${expanded ? "expanded" : ""}`}
      onClick={handleCardClick}
    >
      <div className="ri-top">
        <span className="ri-title" title={result.title}>
          {result.title}
        </span>
        <div className="ri-actions">
          <div className={`ri-done-wrapper ${loading ? "loading" : ""}`}>
            <CheckToggle
              checked={status === "done"}
              onChange={handleToggleDone}
              ariaLabel="Виконано"
              title="Виконано"
            />
            {loading && <span className="ri-spinner" aria-hidden="true" />}
          </div>
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
          {humanStatus(status)}
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

