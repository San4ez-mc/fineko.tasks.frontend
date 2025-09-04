import React, { useEffect, useState } from "react";
import "./ResultDetails.css";
import { replyToComment } from "../api/results.js";

/**
 * Пропси:
 * - result: {
 *    id, description, points, status, urgent, ownerName, assigneeName,
 *    subtasks?: Array<subResult>, // підрезультати
 *    tasks?: Array<{id, title, date, status}>,
 *    comments?: Array<{id, author, text, date, replies?: Array<{id, author, text, date}>}>
 *  }
 * - onAddSubresult(parentId)
 * - onCreateTemplate(id)
 * - onCreateTask(id)
 */
export default function ResultDetails({ result, tasksLoading, onAddSubresult, onCreateTemplate, onCreateTask }) {
  const [comments, setComments] = useState(result.comments || []);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    setComments(result.comments || []);
  }, [result.comments]);

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const newReply = await replyToComment(result.id, commentId, replyText);
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      );
      setReplyText("");
      setReplyTo(null);
    } catch (e) {
      console.error("Не вдалося додати відповідь", e);
    }
  };

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
            {tasksLoading ? (
              <div>Завантаження…</div>
            ) : result.tasks && result.tasks.length > 0 ? (
              result.tasks.map(t => (
                <a key={t.id} href={`/tasks/${t.id}`} className="rd-task">
                  <span className="t-title">{t.title}</span>
                  <span className="t-date">{t.date || ""}</span>
                  <span className={`badge ${t.status === "done" ? "status-done" : "neutral"}`}>{t.status === "done" ? "виконано" : "активна"}</span>
                </a>
              ))
            ) : (
              <div className="rd-no-tasks">Пов’язаних задач не знайдено</div>
            )}
          </div>
        </div>

        <div className="rd-block">
          <h4>Коментарі</h4>
          <div className="rd-comments">
            {(comments || []).map(c => (
              <div key={c.id} className="rd-comment">
                <div className="c-head"><b>{c.author}</b> <span className="c-date">{c.date}</span></div>
                <div className="c-text">{c.text}</div>
                {c.replies && c.replies.length > 0 && (
                  <div className="rd-replies">
                    {c.replies.map(r => (
                      <div key={r.id || r.date} className="rd-comment rd-reply">
                        <div className="c-head"><b>{r.author}</b> <span className="c-date">{r.date}</span></div>
                        <div className="c-text">{r.text}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="rd-reply-btn"
                  onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                >
                  {replyTo === c.id ? "Скасувати" : "Відповісти"}
                </button>
                {replyTo === c.id && (
                  <form
                    className="rd-reply-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleReply(c.id);
                    }}
                  >
                    <input
                      type="text"
                      className="input"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Ваша відповідь"
                    />
                    <button className="btn">Надіслати</button>
                  </form>
                )}
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
