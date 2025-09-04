import React, { useState, useEffect, useRef } from "react";
import Layout from "../../../components/layout/Layout";
import "./DailyTasksPage.css";
import "../../templates/components/TemplatesFilters.css";
import api from "../../../services/api";
import { formatMinutesToHours } from "../../../utils/timeFormatter";
import { FiCalendar, FiPlus } from "react-icons/fi";
import { getResults } from "../../results/api/results";
import { useAuth } from "../../../context/AuthContext";
import TaskComments from "../components/TaskComments";
import VoiceInput from "../../../shared/components/VoiceInput";

export default function DailyTasksPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [expandedTask, setExpandedTask] = useState(null);
    const [filters, setFilters] = useState({
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
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [taskManager, setTaskManager] = useState("");
    const [newTaskComments, setNewTaskComments] = useState("");
    const [newTaskResultId, setNewTaskResultId] = useState("");
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);
    const [newTaskExecutorId, setNewTaskExecutorId] = useState("");
    const [titleError, setTitleError] = useState(false);
    const [quickTaskTitle, setQuickTaskTitle] = useState("");

    // popover перенесення
    const [rescheduleForId, setRescheduleForId] = useState(null);
    const [rescheduleValue, setRescheduleValue] = useState("");
    const rescheduleRef = useRef(null);

    const { user } = useAuth();

    const userLabel = (u) => {
        if (!u) return "";
        if (u.first_name || u.last_name)
            return [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
        return u.name || u.username || `ID ${u.id}`;
    };

    useEffect(() => {
        if (user) {
            setTaskManager(userLabel(user));
            if (user.id) setNewTaskExecutorId(String(user.id));
        }
    }, [user]);

    const priorityMap = {
        "важлива термінова": 1,
        "важлива нетермінова": 2,
        "неважлива термінова": 3,
        "неважлива нетермінова": 4,
    };

    const priorityStyles = {
        critical: { background: "red", color: "#fff" },
        important: { background: "blue", color: "#fff" },
        rush: { background: "purple", color: "#fff" },
        neutral: { background: "transparent", color: "inherit" },
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
                    dueDate: t.planned_date || "",
                    type: t.type || "неважлива нетермінова",
                    expected_time: Number(t.expected_time || 0),
                    actual_time: Number(t.actual_time || 0),
                    expected_result: t.expected_result || "",
                    actual_result: t.result || "",
                    description: t.description || "",
                    manager: t.manager || "",
                    result_id: t.result_id ?? t.resultId ?? null,
                    result_title: t.result_title ?? t.resultTitle ?? "",
                    comments: (() => {
                        try {
                            return Array.isArray(t.comments)
                                ? t.comments
                                : JSON.parse(t.comments || "[]");
                        } catch {
                            return [];
                        }
                    })(),
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
            sortTasks(
                prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
            )
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
        const s = String(seconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const getTypeClass = (type) => {
        if (type === "важлива термінова") return "type-important-urgent";
        if (type === "важлива нетермінова") return "type-important-not-urgent";
        if (type === "неважлива термінова") return "type-not-important-urgent";
        if (type === "неважлива нетермінова") return "type-not-important-not-urgent";
        return "";
    };

    const updateTaskField = (id, field, value) => {
        const payloadValue = field === "comments" ? JSON.stringify(value) : value;
        api
            .patch(`/task/update-field?id=${id}`, { field, value: payloadValue })
            .then(() => {
                setTasks((prev) =>
                    sortTasks(
                        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
                    )
                );
            })
            .catch(() => { });
    };

    const totalExpected = tasks.reduce((sum, t) => sum + (t.expected_time || 0), 0);

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
        api
            .get("/users", { params: { active: 1 } })
            .then((r) => setUsers(r.data || []))
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

    const handleVoiceTask = (data) => {
        if (data.title) setNewTaskTitle(data.title);
        if (data.description) setNewTaskDescription(data.description);
        if (data.expected_result) setNewTaskExpectedResult(data.expected_result);
        if (data.type) setNewTaskType(data.type);
        if (data.planned_time) setPlannedTime(data.planned_time);
        if (data.manager) setTaskManager(data.manager);
        if (data.comments) setNewTaskComments(data.comments);
        if (data.resultId) setNewTaskResultId(String(data.resultId));
    };

    // ✅ ВАЖЛИВО: правильні назви полів + правильний ендпоінт
    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) {
            setTitleError(true);
            return;
        }
        setTitleError(false);

        const [h, m] = plannedTime.split(":").map((n) => parseInt(n, 10) || 0);
        const payload = {
            planned_date: formatDateForApi(selectedDate), // <—
            title: newTaskTitle.trim(),
            type: newTaskType,
            expected_time: h * 60 + m, // <—
            actual_time: 0,            // <—
            expected_result: newTaskExpectedResult.trim(),
            description: newTaskDescription.trim(),
            manager: taskManager.trim(),
            executor_id: newTaskExecutorId ? Number(newTaskExecutorId) : null,
            result_id: newTaskResultId || null, // <—
            comments: newTaskComments
                ? JSON.stringify([
                    {
                        author: taskManager.trim() || userLabel(user) || "Я",
                        text: newTaskComments.trim(),
                        replies: [],
                    },
                ])
                : JSON.stringify([]),
        };

        try {
            console.log("POST /task/daily →", payload);
            await api.post(`/task/daily`, payload); // <— було /tasks/daily
            // reset форми
            setIsFormOpen(false);
            setNewTaskTitle("");
            setNewTaskType("важлива термінова");
            setPlannedTime("00:00");
            setNewTaskExpectedResult("");
            setNewTaskDescription("");
            setTaskManager(userLabel(user) || "");
            setNewTaskExecutorId(user?.id ? String(user.id) : "");
            setNewTaskComments("");
            setNewTaskResultId("");
            setSelectedTemplate("");
            // перезавантажити список
            loadTasks(formatDateForApi(selectedDate), filters);
        } catch (err) {
            console.error("Помилка створення задачі", err);
        }
    };

    const handleQuickTaskKeyDown = async (e) => {
        if (e.key !== "Enter" || !quickTaskTitle.trim()) return;
        const payload = {
            planned_date: formatDateForApi(selectedDate),
            title: quickTaskTitle.trim(),
            type: "важлива нетермінова",
            expected_time: 30,
            actual_time: 0,
            expected_result: "",
            description: "",
            manager: userLabel(user) || "",
            executor_id: user?.id || null,
            result_id: null,
            comments: JSON.stringify([]),
        };
        try {
            await api.post(`/tasks`, payload);
            setQuickTaskTitle("");
            loadTasks(formatDateForApi(selectedDate), filters);
        } catch (err) {
            console.error("Помилка створення задачі", err);
        }
    };

    // закриття поповера “перенести” по кліку поза ним
    useEffect(() => {
        const onDocClick = (e) => {
            if (
                rescheduleForId &&
                rescheduleRef.current &&
                !rescheduleRef.current.contains(e.target)
            ) {
                setRescheduleForId(null);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [rescheduleForId]);

    return (
        <Layout>
            {/* Заголовок + календар по центру */}
            <div className="page-header">
                <h1 className="tasks-title">
                    Мої задачі
                    <button className="btn ghost icon" onClick={goPrevDay} aria-label="Попередній день">←</button>
                    <button
                        className="date-trigger"
                        onClick={openDatePicker}
                        title="Обрати дату"
                    >
                        {formattedDate}
                        <FiCalendar className="ico-calendar" aria-hidden />
                    </button>
                    <button className="btn ghost icon" onClick={goNextDay} aria-label="Наступний день">→</button>
                    <input
                        type="date"
                        ref={dateInputRef}
                        className="date-input"
                        value={formatDateForApi(selectedDate)}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />
                </h1>
            </div>

            {/* Кнопка додавання по центру під заголовком */}
            <div className="page-header-actions">
                <button
                    type="button"
                    className="btn primary"
                    onClick={() => setIsFormOpen((o) => !o)}
                >
                    {isFormOpen ? "Скасувати" : "Додати задачу"}
                </button>
            </div>

            {/* Фільтри */}
            <div className="tpl-filters card">
                <div className="tf-row">
                    <div className="tf-group">
                        <label className="tf-field">
                            <span>Статус</span>
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    handleFilterChange({ status: e.target.value })
                                }
                            >
                                <option value="any">Будь‑який</option>
                                <option value="new">нове</option>
                                <option value="in_progress">в роботі</option>
                                <option value="done">виконано</option>
                                <option value="postponed">відкладено</option>
                            </select>
                        </label>

                        <label className="tf-field">
                            <span>Тип</span>
                            <select
                                value={filters.priority}
                                onChange={(e) =>
                                    handleFilterChange({ priority: e.target.value })
                                }
                                style={priorityStyles[filters.priority] || {}}
                            >
                                <option value="any">Будь‑який</option>
                                <option value="critical" style={priorityStyles.critical}>
                                    Важлива термінова
                                </option>
                                <option value="important" style={priorityStyles.important}>
                                    Важлива нетермінова
                                </option>
                                <option value="rush" style={priorityStyles.rush}>
                                    Неважлива термінова
                                </option>
                                <option value="neutral" style={priorityStyles.neutral}>
                                    Неважлива нетермінова
                                </option>
                            </select>
                        </label>

                        <label className="tf-field">
                            <span>Активний таймер</span>
                            <select
                                value={filters.timer}
                                onChange={(e) =>
                                    handleFilterChange({ timer: e.target.value })
                                }
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
                                onChange={(e) =>
                                    handleFilterChange({ result: e.target.value })
                                }
                            >
                                <option value="any">Будь‑який</option>
                                {results.map((r) => (
                                    <option key={r.id} value={String(r.id)}>
                                        {r.title}
                                    </option>
                                ))}
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
                    <VoiceInput endpoint="/tasks/voice" onResult={handleVoiceTask} />
                    <label className="at-field">
                        <span>Назва задачі*</span>
                        <input
                            type="text"
                            className={`title-input ${titleError ? "error" : ""}`}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                    </label>

                    {/* Опис задачі — 4 рядки */}
                    <label className="at-field full-width">
                        <span>Опис задачі</span>
                        <textarea
                            rows={4}
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                        />
                    </label>

                    <label className="at-field full-width">
                        <span>Очікуваний результат</span>
                        <textarea
                            rows={4}
                            value={newTaskExpectedResult}
                            onChange={(e) => setNewTaskExpectedResult(e.target.value)}
                        />
                    </label>

                    <label className="at-field">
                        <span>Тип</span>
                        <select
                            value={newTaskType}
                            onChange={(e) => setNewTaskType(e.target.value)}
                        >
                            <option value="важлива термінова">Важлива - термінова</option>
                            <option value="важлива нетермінова">Важлива - не термінова</option>
                            <option value="неважлива термінова">Неважлива - термінова</option>
                            <option value="неважлива нетермінова">Неважлива - нетермінова</option>
                        </select>
                    </label>

                    <label className="at-field">
                        <span>Очікуваний час</span>
                        <input
                            type="time"
                            value={plannedTime}
                            onChange={(e) => setPlannedTime(e.target.value)}
                        />
                    </label>

                    <label className="at-field">
                        <span>Хто призначив</span>
                        <input type="text" value={taskManager} disabled />
                    </label>

                    <label className="at-field">
                        <span>Виконавець</span>
                        <select
                            value={newTaskExecutorId}
                            onChange={(e) => setNewTaskExecutorId(e.target.value)}
                        >
                            <option value="">Оберіть виконавця</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {userLabel(u)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="at-field full-width">
                        <span>Коментарі</span>
                        <textarea
                            value={newTaskComments}
                            onChange={(e) => setNewTaskComments(e.target.value)}
                        />
                    </label>

                    <label className="at-field">
                        <span>Результат</span>
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
                    </label>

                    <label className="at-field">
                        <span>Шаблон</span>
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
                    </label>

                    <div className="at-actions">
                        <button type="button" className="btn primary" onClick={handleCreateTask}>
                            Створити
                        </button>
                    </div>
                </div>
            )}

            <input
                type="text"
                className="input new-task-input"
                placeholder="Нова задача…"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={handleQuickTaskKeyDown}
            />

            {tasks.length === 0 ? (
                <div className="tasks-empty">Задач на сьогодні не додано</div>
            ) : (
                <div className="tasks-list">
                    {tasks.map((task) => (
                        <React.Fragment key={task.id}>
                            <div
                                className={`task-row ${task.status === "done" ? "is-completed" : ""}`}
                                onClick={() =>
                                    setExpandedTask(expandedTask === task.id ? null : task.id)
                                }
                            >
                                <input
                                    type="checkbox"
                                    className="chk"
                                    checked={task.status === "done"}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        toggleTaskCompletion(task.id);
                                    }}
                                />

                                <div className="title-cell">
                                    <span className="title">{task.title}</span>
                                    {task.type && (
                                        <span className={`badge ${getTypeClass(task.type)}`}>
                                            {task.type}
                                        </span>
                                    )}
                                    {task.result_id && (
                                        <a
                                            className="link"
                                            href={`/results/${task.result_id}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                pauseTimer(task.id);
                                            }}
                                        >
                                            ⏸
                                        </button>
                                    ) : (
                                        <button
                                            className="btn ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startTimer(task.id);
                                            }}
                                        >
                                            ▶
                                        </button>
                                    )}
                                    <button
                                        className="btn ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            stopTimer(task.id);
                                        }}
                                    >
                                        ⏹
                                    </button>
                                    <span className="timer">
                                        {formatTimer(timers[task.id] || 0)}
                                    </span>
                                </div>

                                {/* Іконка перенесення дати + поповер */}
                                <div className="actions" style={{ position: "relative" }}>
                                    <button
                                        className="icon-btn"
                                        title="Перенести на іншу дату"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRescheduleForId(
                                                rescheduleForId === task.id ? null : task.id
                                            );
                                            setRescheduleValue(task.dueDate || "");
                                        }}
                                    >
                                        <FiCalendar size={18} />
                                    </button>

                                    {rescheduleForId === task.id && (
                                        <div className="reschedule-popover" ref={rescheduleRef}>
                                            <input
                                                type="date"
                                                value={rescheduleValue || ""}
                                                onChange={(e) => setRescheduleValue(e.target.value)}
                                            />
                                            <button
                                                className="btn primary small"
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    // ✅ бек чекає planned_date
                                                    updateTaskField(task.id, "planned_date", rescheduleValue);
                                                    setRescheduleForId(null);
                                                }}
                                                disabled={!rescheduleValue}
                                            >
                                                Ок
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {expandedTask === task.id && (
                                <div className="task-details">
                                    {/* Опис — 4 рядки */}
                                    <label className="td-line">
                                        <span className="k">Опис</span>
                                        <textarea
                                            className="input description-input"
                                            defaultValue={task.description}
                                            rows={4}
                                            onBlur={(e) =>
                                                updateTaskField(
                                                    task.id,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </label>

                                    <label className="td-line">
                                        <span className="k">Очікуваний результат</span>
                                        <textarea
                                            className="input"
                                            defaultValue={task.expected_result}
                                            rows={2}
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
                                            rows={2}
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

                                    <TaskComments
                                        taskId={task.id}
                                        author={user?.name || "Я"}
                                        comments={task.comments}
                                        onCommentsChange={(updated) =>
                                            setTasks((prev) =>
                                                sortTasks(
                                                    prev.map((t) =>
                                                        t.id === task.id
                                                            ? { ...t, comments: updated }
                                                            : t
                                                    )
                                                )
                                            )
                                        }
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    {totalExpected > 0 && (
                        <div className="task-row tasks-summary">
                            <span></span>
                            <div className="title-cell">Сумарний очікуваний час</div>
                            <span className="badge neutral">
                                {formatMinutesToHours(totalExpected)}
                            </span>
                            <span className="task-date"></span>
                            <div className="timer-cell"></div>
                            <div className="actions"></div>
                        </div>
                    )}
                </div>
            )}

            {/* За бажанням можна повернути плаваючу FAB: */}
            <button type="button" className="fab-add" onClick={() => setIsFormOpen(true)}><FiPlus size={24} /></button>
        </Layout>
    );
}
