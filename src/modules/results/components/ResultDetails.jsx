import React from "react";
import "./ResultDetails.css";

/**
 * Пропси:
 * - result: {
 *    id, description, points, status, urgent, ownerName, assigneeName,
 *    subtasks?: Array<subResult>, // підрезультати
 *    tasks?: Array<{id, title, date, status}>,
 *    comments?: Array<{id, author, text, date}>
 *  }
 * - onAddSubresult(parentId)
 * - onCreateTemplate(id)
 * - onCreateTask(id)
 */
export default function ResultDetails({ result, onAddSubresult, onCreateTemplate, onCreateTask }) {
  return (
    <div className="result-details">
      <div className="rd-col">
        <div className="rd-block">
          <h4>Деталі</h4>
          <div className="rd-line"><span className="k">Постановник:</span><span className="v">{result.ownerName || "—"}</span></div>
          <div className="rd-line"><span className="k">Відповідальний:</span><span className="v">{result.assigneeName || "—"}</span></div>
          <div className="rd-line"><span className="k">Статус:</span><span className="v">{humanStatus(result.status)}</span></div>
          <div className="rd-line"><span className="k">Терміновість:</span><span className="v">{result.urgent ? "Так" : "Ні"}</span></div>
          {typeof result.points === "number" && (
            <div className="rd-line"><span className="k">Бали:</span><span className="v">+{result.points}</span></div>
          )}
          {result.description && (
            <div className="rd-desc">{result.description}</div>
          )}
          <div className="rd-actions">
            <button className="btn ghost" onClick={() => onCreateTemplate && onCreateTemplate(result.id)}>Ств. шаблон</button>
            <button className="btn" onClick={() => onCreateTask && onCreateTask(result.id)}>Ств. задачу</button>
          </div>
        </div>

        <div className="rd-block">
          <h4>Підрезультати</h4>
          <div className="rd-sublist">
            {(result.subtasks || []).map(sr => (
              <div className="rd-subitem" key={sr.id}>
                <a href={`/results/${sr.id}`} className="title">{sr.title}</a>
                <span className="who">{sr.assigneeName || "—"}</span>
              </div>
            ))}
          </div>
          <button className="btn ghost" onClick={() => onAddSubresult && onAddSubresult(result.id)}>Додати підрезультат</button>
        </div>
      </div>

      <div className="rd-col">
        <div className="rd-block">
          <h4>Пов’язані задачі</h4>
          <div className="rd-tasks">
            {(result.tasks || []).map(t => (
              <a key={t.id} href={`/tasks/${t.id}`} className="rd-task">
                <span className="t-title">{t.title}</span>
                <span className="t-date">{t.date || ""}</span>
                <span className={`badge ${t.status === "done" ? "status-done" : "neutral"}`}>{t.status === "done" ? "виконано" : "активна"}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rd-block">
          <h4>Коментарі</h4>
          <div className="rd-comments">
            {(result.comments || []).map(c => (
              <div key={c.id} className="rd-comment">
                <div className="c-head"><b>{c.author}</b> <span className="c-date">{c.date}</span></div>
                <div className="c-text">{c.text}</div>
              </div>
            ))}
          </div>
          <form className="rd-add-comment" onSubmit={(e)=>e.preventDefault()}>
            <input type="text" className="input" placeholder="Додати коментар…" />
            <button className="btn">Надіслати</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function humanStatus(s){
  return s === "new" ? "Новий"
    : s === "in_progress" ? "В процесі"
    : s === "done" ? "Виконано"
    : s === "postponed" ? "Відкладено"
    : "—";
}
