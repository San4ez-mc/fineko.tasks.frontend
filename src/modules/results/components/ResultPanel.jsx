import React from "react";
import ResultDetails from "./ResultDetails.jsx";
import "./ResultPanel.css";

export default function ResultPanel({
  result,
  open,
  onClose,
  tasksLoading,
  onAddSubresult,
  onCreateTemplate,
  onCreateTask,
}) {
  return (
    <>
      <div
        className={`result-panel-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />
      <div className={`result-panel ${open ? "open" : ""}`} role="dialog">
        <div className="rp-header">
          <h3 className="rp-title">{result?.title || "Результат"}</h3>
          <button className="rp-close" onClick={onClose} aria-label="Закрити">
            ×
          </button>
        </div>
        <div className="rp-body">
          {result && (
            <ResultDetails
              result={result}
              tasksLoading={tasksLoading}
              onAddSubresult={onAddSubresult}
              onCreateTemplate={onCreateTemplate}
              onCreateTask={onCreateTask}
            />
          )}
        </div>
      </div>
    </>
  );
}
