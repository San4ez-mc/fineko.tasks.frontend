import React, { useState, useEffect, useRef } from "react";
import { FiCheckCircle, FiPlayCircle, FiPauseCircle, FiCalendar } from "react-icons/fi";
import TaskComments from "./TaskComments";
import "./TaskItem.css";

export default function TaskItem({
    task,
    expandedTask,
    onToggleExpand,
    onToggleComplete,
    onUpdateField,
}) {
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(
        task.actual_time ? task.actual_time * 60 : 0
    );
    const [showTimer, setShowTimer] = useState(false);

    // поповер для перенесення
    const [showReschedule, setShowReschedule] = useState(false);
    const popoverRef = useRef(null);

    const intervalRef = useRef(null);

    // Якщо є фактичний час - стартуємо з нього
    useEffect(() => {
        if (task.actual_time) {
            setElapsedSeconds(task.actual_time * 60);
        }
    }, [task.actual_time]);

    // Таймер кожну секунду додає 1
    useEffect(() => {
        if (isTimerRunning) {
            intervalRef.current = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isTimerRunning]);

    // Закриття поповера по кліку поза ним
    useEffect(() => {
        const onDocClick = (e) => {
            if (showReschedule && popoverRef.current && !popoverRef.current.contains(e.target)) {
                setShowReschedule(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [showReschedule]);

    // Формат ГГ:ХХ:СС
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        return `${hours}:${minutes}:${secs}`;
    };

    const handleToggleTimer = () => {
        if (!showTimer) setShowTimer(true);
        setIsTimerRunning((prev) => !prev);
    };

    // При завершенні задачі зупиняємо таймер і записуємо фактичний час
    const handleComplete = () => {
        if (isTimerRunning) {
            setIsTimerRunning(false);
        }
        const minutes = Math.ceil(elapsedSeconds / 60);
        onUpdateField(task.id, "actual_time", minutes);
        onToggleComplete(task.id);
    };

    // Плашка для типу задачі
    const getTypeBadgeStyle = (type) => {
        if (!type) return {};
        const t = type.toLowerCase();
        if (t === "важлива термінова") return { background: "red", color: "white" };
        if (t === "важлива нетермінова") return { background: "blue", color: "white" };
        if (t === "неважлива термінова") return { background: "purple", color: "white" };
        return { background: "transparent", color: "inherit" };
    };

    return (
        <div className={`task-card ${task.status === "done" ? "task-done" : ""}`}>
            <div className="task-header">
                {/* Лівий блок - іконки */}
                <div className="task-left-icons">
                    <button
                        className={`task-complete-btn ${task.status === "done" ? "completed" : ""}`}
                        style={{ background: "none" }}
                        onClick={handleComplete}
                        title="Позначити як виконано"
                    >
                        <FiCheckCircle size={20} />
                    </button>

                    <button
                        className="task-timer-btn"
                        style={{ background: "none" }}
                        onClick={handleToggleTimer}
                        title={isTimerRunning ? "Пауза" : "Старт"}
                    >
                        {isTimerRunning ? (
                            <FiPauseCircle size={20} color="green" />
                        ) : (
                            <FiPlayCircle size={20} color="blue" />
                        )}
                    </button>
                </div>

                {/* Середина - назва задачі на всю ширину між лівим і правим блоком */}
                <input
                    type="text"
                    className="task-title small-font task-title-center"
                    value={task.title}
                    onChange={(e) => onUpdateField(task.id, "title", e.target.value)}
                    placeholder="Назва задачі"
                />

                {/* Правий блок - дата, тип, перенесення, кнопка розкриття */}
                <div className="task-right-meta" style={{ position: "relative" }}>
                    {/* Таймер */}
                    {showTimer && (
                        <span className="task-timer-info">{formatTime(elapsedSeconds)}</span>
                    )}

                    {/* Поточна дата дедлайну */}
                    {task.dueDate && (
                        <span className="task-due-date">До {task.dueDate}</span>
                    )}

                    {/* Іконка перенесення на іншу дату (перенести з “шапки” в кожну задачу) */}
                    <button
                        className="task-reschedule-btn"
                        onClick={() => setShowReschedule((p) => !p)}
                        title="Перенести на іншу дату"
                    >
                        <FiCalendar size={18} />
                    </button>

                    {showReschedule && (
                        <div className="reschedule-popover" ref={popoverRef}>
                            <input
                                type="date"
                                value={task.dueDate || ""}
                                onChange={(e) => {
                                    onUpdateField(task.id, "dueDate", e.target.value);
                                    setShowReschedule(false);
                                }}
                            />
                        </div>
                    )}

                    {/* Тип задачі */}
                    {task.type && (
                        <span
                            className="task-type-badge"
                            style={getTypeBadgeStyle(task.type)}
                        >
                            {task.type}
                        </span>
                    )}

                    {/* Розгорнути/згорнути */}
                    <button
                        className="toggle-description"
                        onClick={() =>
                            onToggleExpand(expandedTask === task.id ? null : task.id)
                        }
                        title={expandedTask === task.id ? "Згорнути" : "Розгорнути"}
                    >
                        {expandedTask === task.id ? "▲" : "▼"}
                    </button>
                </div>
            </div>

            {/* Посилання на результат (над назвою) */}
            {expandedTask === task.id && (
                <div className="task-result-link">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        {task.title}
                    </a>
                </div>
            )}

            {/* Розгорнута частина */}
            {expandedTask === task.id && (
                <div className="task-details">
                    <div className="task-results-row">
                        <label>
                            Очікуваний результат
                            <textarea
                                rows={4}
                                value={task.expected_result}
                                onChange={(e) =>
                                    onUpdateField(task.id, "expected_result", e.target.value)
                                }
                            />
                        </label>
                        <label>
                            Результат
                            <textarea
                                rows={4}
                                value={task.actual_result}
                                onChange={(e) =>
                                    onUpdateField(task.id, "actual_result", e.target.value)
                                }
                            />
                        </label>
                    </div>

                    {/* Поля в один рядок */}
                    <div className="task-fields-row" style={{ display: "flex", gap: "10px", flexWrap: "nowrap" }}>
                        <label>
                            Автор задачі:
                            <input
                                type="text"
                                value={task.manager}
                                onChange={(e) => onUpdateField(task.id, "manager", e.target.value)}
                            />
                        </label>

                        <label>
                            Тип:
                            <select
                                value={task.type || ""}
                                onChange={(e) => onUpdateField(task.id, "type", e.target.value)}
                            >
                                <option value="важлива термінова">важлива термінова</option>
                                <option value="важлива нетермінова">важлива нетермінова</option>
                                <option value="неважлива термінова">неважлива термінова</option>
                                <option value="неважлива нетермінова">неважлива нетермінова</option>
                            </select>
                        </label>

                        <label>
                            Очікуваний час (хв):
                            <input
                                type="number"
                                min="1"
                                value={task.expected_time || ""}
                                onChange={(e) => onUpdateField(task.id, "expected_time", parseInt(e.target.value) || 0)}
                            />
                        </label>

                        <label>
                            Фактичний час (хв):
                            <input
                                type="number"
                                min="0"
                                value={task.actual_time || ""}
                                onChange={(e) => onUpdateField(task.id, "actual_time", parseInt(e.target.value) || 0)}
                            />
                        </label>

                        <label>
                            Кінцевий термін:
                            <input
                                type="date"
                                value={task.dueDate || ""}
                                onChange={(e) => onUpdateField(task.id, "dueDate", e.target.value)}
                            />
                        </label>
                    </div>

                    {/* Коментарі */}
                    <TaskComments
                        taskId={task.id}
                        author="Я"
                        comments={task.comments}
                        onCommentsChange={(updated) => onUpdateField(task.id, "comments", updated)}
                    />
                </div>
            )}
        </div>
    );
}
