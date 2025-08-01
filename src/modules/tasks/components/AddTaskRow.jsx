import React, { useState } from "react";

/**
 * Компонент для додавання задачі
 * 
 * @param {boolean} isOpen - чи відкритий блок
 * @param {function} onToggleOpen - функція, що відкриває/закриває блок
 * @param {function} onAddTask - викликається при додаванні нової задачі
 * @param {Array} taskOptions - список доступних шаблонів задач
 * @param {boolean} collapsed - якщо false – блок завжди відкритий
 */
export default function AddTaskRow({
    isOpen,
    onToggleOpen,
    onAddTask,
    taskOptions = [],
    collapsed = true
}) {
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const handleAddNew = () => {
        if (!newTaskTitle.trim()) return;
        onAddTask({ isNew: true, title: newTaskTitle.trim() });
        setNewTaskTitle("");
    };

    return (
        <div className="add-task-row">
            {/* Якщо блок можна згортати, показуємо іконку/кнопку */}
            {collapsed && (
                <button
                    className={`add-task-toggle ${isOpen ? "open" : ""}`}
                    onClick={() => onToggleOpen(isOpen ? null : true)} // ✅ не викликаємо напряму
                >
                    {isOpen ? "−" : "➕ Додати задачу"}
                </button>
            )}

            {/* Якщо блок завжди відкритий або зараз відкритий */}
            {(!collapsed || isOpen) && (
                <div className="add-task-content">
                    <div className="add-task-new">
                        <input
                            type="text"
                            value={newTaskTitle}
                            placeholder="Назва нової задачі..."
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <button onClick={handleAddNew}>Додати нову</button>
                    </div>

                    {taskOptions.length > 0 && (
                        <div className="add-task-templates">
                            <p>Або оберіть шаблон:</p>
                            <ul>
                                {taskOptions.map((t) => (
                                    <li key={t.id}>
                                        <button onClick={() => onAddTask(t)}>
                                            {t.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
