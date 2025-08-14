import React, { useState, useEffect, useRef } from "react";
import Layout from "../../../components/layout/Layout";
import "./DailyTasksPage.css";
import "../../templates/components/TemplatesFilters.css";
import api from "../../../services/api";
import { formatMinutesToHours } from "../../../utils/timeFormatter";
import { FiCalendar } from "react-icons/fi";
import { getResults } from "../../results/api/results";
import { useAuth } from "../../../context/AuthContext";

export default function DailyTasksPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [expandedTask, setExpandedTask] = useState(null);
    const [filters, setFilters] = useState({
        q: "",
        status: "any",
        priority: "any",
        timer: "any",
        result: "any",
    });
    const [timers, setTimers] = useState({});
    const [activeTimerId, setActiveTimerId] = useState(null);
    const dateInputRef = useRef(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskType, setNewTaskType] = useState("важлива термінова");
    const [plannedTime, setPlannedTime] = useState("00:00");
    const [newTaskExpectedResult, setNewTaskExpectedResult] = useState("");
    const [newTaskActualResult, setNewTaskActualResult] = useState("");
    const [taskManager, setTaskManager] = useState("");
    const [newTaskComments, setNewTaskComments] = useState("");
    const [newTaskResultId, setNewTaskResultId] = useState("");
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [results, setResults] = useState([]);
    const [titleError, setTitleError] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.name) {
            setTaskManager(user.name);
        }
    }, [user]);

    const priorityMap = {
        "важлива термінова": 1,
        "важлива нетермінова": 2,
        "неважлива термінова": 3,
        "неважлива нетермінова": 4,
    };
    const sortTasks = (arr) =>
        [...arr].sort((a, b) => {
            if (a.status === "done" && b.status !== "done") return 1;
            if (b.status === "done" && a.status !== "done") return -1;
            return (priorityMap[a.type] || 0) - (priorityMap[b.type] || 0);
        });

    const formatDateForApi = (date) => date.toISOString().split("T")[0];

    const loadTasks = (dateStr, flt = {}) => {
        const params = new URLSearchParams();
        params.append("date", dateStr);
        Object.entries(flt).forEach(([key, value]) => {
            if (value && value !== "any") params.append(key, value);
        });

        api
            .get(`/task/filter?${params.toString()}`)
            .then((res) => {
                const backendTasks = res.data?.tasks || [];
                const mapped = backendTasks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    status: t.status,
                    dueDate: t.planned_date,
                    type: t.type || "неважлива нетермінова",
                    expected_time: Number(t.expected_time || 0),
                    actual_time: Number(t.actual_time || 0),
                    expected_result: t.expected_result || "",
                    actual_result: t.result || "",
                    manager: t.manager || "",
                    comments: t.comments || "",
                }));
                setTasks(sortTasks(mapped));
            })
            .catch((err) => console.error("Помилка завантаження задач:", err));
    };

    useEffect(() => {
        loadTasks(formatDateForApi(selectedDate), filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const handleFilterChange = (patch) => {
        const next = { ...filters, ...patch };
        setFilters(next);
        loadTasks(formatDateForApi(selectedDate), next);
    };

    const resetFilters = () => {
        const base = {
            q: "",
            status: "any",
            priority: "any",
            timer: "any",
            result: "any",
        };
        setFilters(base);
        loadTasks(formatDateForApi(selectedDate), base);
    };

    const toggleTaskCompletion = (id) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        const newStatus = task.status === "done" ? "new" : "done";
        api
            .patch(`/task/update-field?id=${id}`, {
                field: "status",
                value: newStatus,
            })
            .catch(() => { });
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
    };

    useEffect(() => {
        let interval;
        if (activeTimerId) {
            interval = setInterval(() => {
                setTimers((prev) => ({
                    ...prev,
                    [activeTimerId]: (prev[activeTimerId] || 0) + 1,
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimerId]);

    const startTimer = (id) => setActiveTimerId(id);
    const pauseTimer = () => setActiveTimerId(null);
    const stopTimer = (id) => {
        setActiveTimerId(null);
        setTimers((prev) => ({ ...prev, [id]: 0 }));
    };

    const formatTimer = (seconds) => {
        const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const updateTaskField = (id, field, value) => {
        api
            .patch(`/task/update-field?id=${id}`, { field, value })
            .then(() => {
                setTasks((prev) =>
                    sortTasks(
                        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
                    )
                );
            })
            .catch(() => { });
    };

    const totalExpected = tasks.reduce(
        (sum, t) => sum + (t.expected_time || 0),
        0
    );

    const formattedDate = selectedDate.toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const goPrevDay = () =>
        setSelectedDate((d) => new Date(d.getTime() - 86400000));
    const goNextDay = () =>
        setSelectedDate((d) => new Date(d.getTime() + 86400000));
    const openDatePicker = () => dateInputRef.current?.showPicker();

    useEffect(() => {
        api
            .get(`/tasks/templates`)
            .then((r) => setTemplates(r.data?.templates || []))
            .catch(() => { });
        getResults({ status: "active" })
            .then((data) => setResults(data.results || []))
            .catch(() => { });
    }, []);

    const handleTemplateSelect = (id) => {
        setSelectedTemplate(id);
        const t = templates.find((tmp) => String(tmp.id) === String(id));
        if (t) {
            setNewTaskTitle(t.title || "");
            setNewTaskType(t.priority || t.type || "важлива термінова");
            if (t.plannedTime) setPlannedTime(t.plannedTime);
            else if (t.plannedMinutes !== undefined) {
                const h = String(Math.floor(t.plannedMinutes / 60)).padStart(2, "0");
                const m = String(t.plannedMinutes % 60).padStart(2, "0");
                setPlannedTime(`${h}:${m}`);
            }
            setNewTaskResultId(t.resultId || "");
        }
    };

    const handleCreateTask = () => {
        if (!newTaskTitle.trim()) {
            setTitleError(true);
            return;
        }
        setTitleError(false);
        const [h, m] = plannedTime.split(":").map((n) => parseInt(n, 10) || 0);
        const payload = {
            date: formatDateForApi(selectedDate),
            title: newTaskTitle.trim(),
            type: newTaskType,
            plannedMinutes: h * 60 + m,
            actualMinutes: 0,
            expected_result: newTaskExpectedResult.trim(),
            result: newTaskActualResult.trim(),
            manager: taskManager.trim(),
            comments: newTaskComments.trim(),
        };
        if (newTaskResultId) payload.resultId = newTaskResultId;
        api
            .post(`/tasks/daily`, payload)
            .then((res) => {
                const newTask = {
                    id: res.data?.id || Date.now(),
                    title: payload.title,
                    status: "new",
                    dueDate: formatDateForApi(selectedDate),
                    type: payload.type,
                    expected_time: payload.plannedMinutes,
                    actual_time: payload.actualMinutes,
                    expected_result: payload.expected_result,
                    actual_result: payload.result,
                    manager: payload.manager,
                    comments: payload.comments,
                };
                setTasks((prev) => sortTasks([...prev, newTask]));
                window.dispatchEvent(
                    new CustomEvent("today-task-added", { detail: newTask })
                );
                window.dispatchEvent(
                    new CustomEvent("toast", {
                        detail: { type: "success", message: "Додано" },
                    })
                );
                setIsFormOpen(false);
                setNewTaskTitle("");
                setNewTaskType("важлива термінова");
                setPlannedTime("00:00");
                setNewTaskExpectedResult("");
                setNewTaskActualResult("");
                setTaskManager(user?.name || "");
                setNewTaskComments("");
                setNewTaskResultId("");
                setSelectedTemplate("");
            })
            .catch((err) => console.error("Помилка створення задачі", err));
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="tasks-title">
                        Мої задачі на
                        <button className="btn ghost icon" onClick={goPrevDay}>
                            ←
                        </button>
                        <button
                            className="date-trigger"
                            onClick={openDatePicker}
                            title="Обрати дату"
                        >
                            {formattedDate}
                            <FiCalendar className="ico-calendar" aria-hidden />
                        </button>
                        <button className="btn ghost icon" onClick={goNextDay}>
                            →
                        </button>
                        <input
                            type="date"
                            ref={dateInputRef}
                            className="date-input"
                            value={formatDateForApi(selectedDate)}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        />
                    </h1>
                </div>
                <div className="page-header-actions">
                    <button
                        className="btn primary"
                        onClick={() => setIsFormOpen((o) => !o)}
                    >
                        {isFormOpen ? "Скасувати" : "Додати задачу"}
                    </button>
                    <button className="btn ghost">
                        Перенести вибрані на іншу дату
                    </button>
                </div>
            </div>

            <div className="tpl-filters card">
                <div className="tf-row">
                    <label className="tf-search" aria-label="Пошук по всіх полях">
                        <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
                            <circle
                                cx="11"
                                cy="11"
                                r="7"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                            />
                            <line
                                x1="21"
                                y1="21"
                                x2="16.5"
                                y2="16.5"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                        <input
                            type="search"
                            placeholder="Пошук по всіх полях…"
                            value={filters.q}
                            onChange={(e) => handleFilterChange({ q: e.target.value })}
                        />
                    </label>

                    <div className="tf-group">
                        <label className="tf-field">
                            <span>Статус</span>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange({ status: e.target.value })}
                            >
                                <option value="any">Будь‑який</option>
                                <option value="new">нове</option>
                                <option value="in_progress">в роботі</option>
                                <option value="done">виконано</option>
                                <option value="postponed">відкладено</option>
                            </select>
                        </label>

                        <label className="tf-field">
                            <span>Пріоритет/тип</span>
                            <select
                                value={filters.priority}
                                onChange={(e) =>
                                    handleFilterChange({ priority: e.target.value })
                                }
                            >
                                <option value="any">Будь‑який</option>
                                <option value="critical">critical</option>
                                <option value="important">important</option>
                                <option value="rush">rush</option>
                                <option value="neutral">neutral</option>
                            </select>
                        </label>

                        <label className="tf-field">
                            <span>Активний таймер</span>
                            <select
                                value={filters.timer}
                                onChange={(e) => handleFilterChange({ timer: e.target.value })}
                            >
                                <option value="any">будь‑який</option>
                                <option value="yes">є</option>
                                <option value="no">нема</option>
                            </select>
                        </label>

                        <label className="tf-field">
                            <span>Прив’язаний результат</span>
                            <select
                                value={filters.result}
                                onChange={(e) => handleFilterChange({ result: e.target.value })}
                            >
                                <option value="any">Будь‑який</option>
                            </select>
                        </label>

                    </div>

                    <div className="tf-actions">
                        <button className="btn ghost" onClick={resetFilters}>
                            Скинути фільтри
                        </button>
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <div className="add-task-form card">
                    <input
                        type="text"
                        className={`title-input ${titleError ? "error" : ""}`}
                        placeholder="Назва задачі*"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <textarea
                        className="full-width"
                        placeholder="Очікуваний результат"
                        value={newTaskExpectedResult}
                        onChange={(e) => setNewTaskExpectedResult(e.target.value)}
                    />
                    <textarea
                        className="full-width"
                        placeholder="Результат"
                        value={newTaskActualResult}
                        onChange={(e) => setNewTaskActualResult(e.target.value)}
                    />
                    <select
                        value={newTaskType}
                        onChange={(e) => setNewTaskType(e.target.value)}
                    >
                        <option value="важлива термінова">Важлива - термінова</option>
                        <option value="важлива нетермінова">Важлива - не термінова</option>
                        <option value="неважлива термінова">Неважлива - термінова</option>
                        <option value="неважлива нетермінова">Неважлива - нетермінова</option>
                    </select>
                    <input
                        type="time"
                        value={plannedTime}
                        onChange={(e) => setPlannedTime(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Хто назначив задачу"
                        value={taskManager}
                        disabled
                    />
                    <textarea
                        className="full-width"
                        placeholder="Коментарі"
                        value={newTaskComments}
                        onChange={(e) => setNewTaskComments(e.target.value)}
                    />
                    <select
                        value={newTaskResultId}
                        onChange={(e) => setNewTaskResultId(e.target.value)}
                    >
                        <option value="">Без результату</option>
                        {results.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.title}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                        <option value="">З шаблону…</option>
                        {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.title}
                            </option>
                        ))}
                    </select>
                    <button className="btn primary" onClick={handleCreateTask}>
                        Створити
                    </button>
                </div>
            )}

            <div className="tasks-list">
                {tasks.map((task) => (
                    <React.Fragment key={task.id}>
                        <div
                            className={`task-row ${task.status === "done" ? "is-completed" : ""
                                }`}
                        >
                            <input
                                type="checkbox"
                                className="chk"
                                checked={task.status === "done"}
                                onChange={() => toggleTaskCompletion(task.id)}
                            />

                            <div className="title-cell">
                                <a className="title" href={`/tasks/${task.id}`}>
                                    {task.title}
                                </a>
                                {task.type && <span className="badge">{task.type}</span>}
                                {task.result_id && (
                                    <a className="link" href={`/results/${task.result_id}`}>
                                        Результат: {task.result_title || task.result_id}
                                    </a>
                                )}
                            </div>

                            <span className="badge neutral">
                                {formatMinutesToHours(task.expected_time)}
                            </span>

                            <span className="task-date">{task.dueDate}</span>

                            <div className="timer-cell">
                                {activeTimerId === task.id ? (
                                    <button
                                        className="btn ghost"
                                        onClick={() => pauseTimer(task.id)}
                                    >
                                        ⏸
                                    </button>
                                ) : (
                                    <button
                                        className="btn ghost"
                                        onClick={() => startTimer(task.id)}
                                    >
                                        ▶
                                    </button>
                                )}
                                <button
                                    className="btn ghost"
                                    onClick={() => stopTimer(task.id)}
                                >
                                    ⏹
                                </button>
                                <span className="timer">
                                    {formatTimer(timers[task.id] || 0)}
                                </span>
                            </div>

                            <div className="actions">
                                <button className="btn ghost">Перенести</button>
                                <button
                                    className="caret"
                                    onClick={() =>
                                        setExpandedTask(expandedTask === task.id ? null : task.id)
                                    }
                                >
                                    {expandedTask === task.id ? "▾" : "▸"}
                                </button>
                            </div>
                        </div>

                        {expandedTask === task.id && (
                            <div className="task-details">
                                <label className="td-line">
                                    <span className="k">Очікуваний результат</span>
                                    <textarea
                                        className="input"
                                        defaultValue={task.expected_result}
                                        onBlur={(e) =>
                                            updateTaskField(
                                                task.id,
                                                "expected_result",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className="td-line">
                                    <span className="k">Результат</span>
                                    <textarea
                                        className="input"
                                        defaultValue={task.actual_result}
                                        onBlur={(e) =>
                                            updateTaskField(
                                                task.id,
                                                "actual_result",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className="td-line">
                                    <span className="k">Тип</span>
                                    <select
                                        className="input"
                                        defaultValue={task.type}
                                        onChange={(e) =>
                                            updateTaskField(task.id, "type", e.target.value)
                                        }
                                    >
                                        <option value="важлива термінова">Важлива - термінова</option>
                                        <option value="важлива нетермінова">Важлива - не термінова</option>
                                        <option value="неважлива термінова">Неважлива - термінова</option>
                                        <option value="неважлива нетермінова">Неважлива - нетермінова</option>
                                    </select>
                                </label>

                                <label className="td-line">
                                    <span className="k">Очікуваний час (хв)</span>
                                    <input
                                        type="number"
                                        className="input"
                                        defaultValue={task.expected_time}
                                        onBlur={(e) =>
                                            updateTaskField(
                                                task.id,
                                                "expected_time",
                                                parseInt(e.target.value, 10) || 0
                                            )
                                        }
                                    />
                                </label>

                                <label className="td-line">
                                    <span className="k">Фактичний час (хв)</span>
                                    <input
                                        type="number"
                                        className="input"
                                        defaultValue={task.actual_time}
                                        onBlur={(e) =>
                                            updateTaskField(
                                                task.id,
                                                "actual_time",
                                                parseInt(e.target.value, 10) || 0
                                            )
                                        }
                                    />
                                </label>

                                <label className="td-line">
                                    <span className="k">Хто призначив</span>
                                    <input
                                        type="text"
                                        className="input"
                                        defaultValue={task.manager}
                                        onBlur={(e) =>
                                            updateTaskField(task.id, "manager", e.target.value)
                                        }
                                    />
                                </label>

                                <label className="td-line">
                                    <span className="k">Коментарі</span>
                                    <textarea
                                        className="input"
                                        defaultValue={task.comments}
                                        onBlur={(e) =>
                                            updateTaskField(task.id, "comments", e.target.value)
                                        }
                                    />
                                </label>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="card tasks-summary">
                Сумарний очікуваний час: {formatMinutesToHours(totalExpected)}
            </div>
        </Layout>
    );
}

