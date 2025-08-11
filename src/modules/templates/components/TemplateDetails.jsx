import React from "react";
import "./TemplateDetails.css";

/**
 * props:
 * - template: {
 *    id, title, description, plannedTime, priority, scheduleHuman,
 *    defaultAssigneeName, result: { id, title } | null,
 *    usage?: Array<{ id, taskId, taskTitle, date }>,
 *    comments?: Array<{ id, author, text, date }>
 *  }
 * - onInlineUpdate(id, patch) // {field: value}
 * - onCreateTask(id)
 * - onLinkResult(id) / onUnlinkResult(id)
 * - onDuplicate(id)
 */
export default function TemplateDetails({
  template, onInlineUpdate, onCreateTask, onLinkResult, onUnlinkResult, onDuplicate
}) {
  return (
    <div className="tpl-details">
      <div className="td-col">
        <div className="td-block">
          <h4>Опис та параметри</h4>

          <label className="td-line">
            <span className="k">Назва</span>
            <input
              className="input"
              defaultValue={template.title}
              onBlur={(e)=>onInlineUpdate && onInlineUpdate(template.id, { title: e.target.value })}
            />
          </label>

          <label className="td-line">
            <span className="k">Опис</span>
            <textarea
              className="input"
              rows={3}
              defaultValue={template.description || ""}
              onBlur={(e)=>onInlineUpdate && onInlineUpdate(template.id, { description: e.target.value })}
            />
          </label>

          <div className="td-grid">
            <label className="td-line">
              <span className="k">План. час</span>
              <input
                className="input"
                defaultValue={template.plannedTime || "00:00"}
                onBlur={(e)=>onInlineUpdate && onInlineUpdate(template.id, { plannedTime: e.target.value })}
              />
            </label>

            <label className="td-line">
              <span className="k">Пріоритет</span>
              <select
                className="input"
                defaultValue={template.priority || "neutral"}
                onChange={(e)=>onInlineUpdate && onInlineUpdate(template.id, { priority: e.target.value })}
              >
                <option value="critical">Важл.+термін.</option>
                <option value="important">Важлива</option>
                <option value="rush">Термінова</option>
                <option value="neutral">Звичайна</option>
              </select>
            </label>

            <label className="td-line">
              <span className="k">Періодичність</span>
              <input
                className="input"
                defaultValue={template.scheduleHuman || ""}
                onBlur={(e)=>onInlineUpdate && onInlineUpdate(template.id, { scheduleHuman: e.target.value })}
                title="Внутрішній формат збережіть у моделі; тут редагується читабельний підпис"
              />
            </label>

            <label className="td-line">
              <span className="k">Виконавець (деф.)</span>
              <input
                className="input"
                defaultValue={template.defaultAssigneeName || ""}
                onBlur={(e)=>onInlineUpdate && onInlineUpdate(template.id, { defaultAssigneeName: e.target.value })}
              />
            </label>
          </div>

          <div className="td-line">
            <span className="k">Результат</span>
            {template.result ? (
              <div className="td-row">
                <a className="link" href={`/results/${template.result.id}`}>{template.result.title}</a>
                <button className="btn ghost" onClick={()=>onUnlinkResult && onUnlinkResult(template.id)}>Відв’язати</button>
              </div>
            ) : (
              <button className="btn ghost" onClick={()=>onLinkResult && onLinkResult(template.id)}>Прив’язати</button>
            )}
          </div>

          <div className="td-actions">
            <button className="btn" onClick={()=>onCreateTask && onCreateTask(template.id)}>Створити задачу</button>
            <button className="btn ghost" onClick={()=>onDuplicate && onDuplicate(template.id)}>Дублювати</button>
          </div>
        </div>

        <div className="td-block">
          <h4>Коментарі</h4>
          <div className="td-comments">
            {(template.comments || []).map(c=>(
              <div key={c.id} className="td-comment">
                <div className="c-head"><b>{c.author}</b> <span className="c-date">{c.date}</span></div>
                <div className="c-text">{c.text}</div>
              </div>
            ))}
          </div>
          <form className="td-add-comment" onSubmit={(e)=>e.preventDefault()}>
            <input type="text" className="input" placeholder="Додати коментар…" />
            <button className="btn">Надіслати</button>
          </form>
        </div>
      </div>

      <div className="td-col">
        <div className="td-block">
          <h4>Історія використання</h4>
          <div className="td-usage">
            {(template.usage || []).map(u=>(
              <a key={u.id} className="td-usage-item" href={`/tasks/${u.taskId}`}>
                <span className="t-title">{u.taskTitle}</span>
                <span className="t-date">{u.date}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
