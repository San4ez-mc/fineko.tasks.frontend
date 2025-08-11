import React, { useState, useEffect, useRef } from "react";
import Layout from "../../../components/layout/Layout";
import "./DailyTasksPage.css";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

import TaskFilters from "../components/TaskFilters";
import TaskItem from "../components/TaskItem";
import AddTaskRow from "../components/AddTaskRow";
import { formatMinutesToHours } from "../../../utils/timeFormatter";

export default function DailyTasksPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedTask, setExpandedTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddRow, setOpenAddRow] = useState(null);
    const [filters, setFilters] = useState({});
    const addRowRef = useRef(null);

    const formatDateForApi = (date) => date.toISOString().split("T")[0];

    /**
     * ✅ Завантаження задач із бекенду з фільтрами
     */
    const loadTasksFromBackend = (dateStr, filters = {}) => {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("date", dateStr);
        if (filters.type) params.append("type", filters.type);
        if (filters.assigned_to) params.append("assigned_to", filters.assigned_to);
        if (filters.creator) params.append("creator", filters.creator);
        if (filters.sort) params.append("sort", filters.sort);

        axios
            .get(
                `${API_BASE_URL}/task/filter?${params.toString()}`
            )
            .then((res) => {
                if (res.data && res.data.tasks) {
                    const backendTasks = res.data.tasks.map((t) => ({
                        id: t.id,
                        title: t.title,
                        description: t.expected_result || "",
                        manager: t.assigned_to || "Невідомо",
                        status: t.status,
                        dueDate: t.planned_date,
                        expected_result: t.expected_result,
                        actual_result: t.result,
                        type: t.type,
                        expected_time: Number(t.expected_time || 0),
                        actual_time: Number(t.actual_time || 0),
                        comments: [],
                    }));
                    setTasks(backendTasks);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Помилка завантаження задач:", err);
                setLoading(false);
            });
    };

    /**
     * ✅ Видалення задачі на бекенді
     */
    const deleteTask = async (id) => {
        try {
            await axios.delete(
                `${API_BASE_URL}/task/delete?id=${id}`
            );
            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (err) {
            console.error("Не вдалося видалити задачу:", err);
        }
    };

    /**
     * ✅ Оновлення одного поля на бекенді
     */
    const updateTaskField = async (id, field, value) => {
        try {
            const res = await axios.patch(
                `${API_BASE_URL}/task/update-field?id=${id}`,
                { field, value }
            );

            if (res.data?.success) {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === id ? { ...task, [field]: value } : task
                    )
                );
            } else {
                console.warn("Помилка оновлення:", res.data.message);
            }
        } catch (err) {
            console.error("Не вдалося оновити поле:", err);
        }
    };

    const goPrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    /**
     * ✅ При зміні дати – тягнемо задачі
     */
    useEffect(() => {
        const dateStr = formatDateForApi(selectedDate);
        loadTasksFromBackend(dateStr, filters);
    }, [selectedDate]);

    const handleTypeFilterChange = (type) => {
        const newFilters = { ...filters, type };
        setFilters(newFilters);
        loadTasksFromBackend(formatDateForApi(selectedDate), newFilters);
    };

    const handleAssigneeFilterChange = (assignee) => {
        const newFilters = { ...filters, assigned_to: assignee };
        setFilters(newFilters);
        loadTasksFromBackend(formatDateForApi(selectedDate), newFilters);
    };

    const handleSortChange = (sort) => {
        const newFilters = { ...filters, sort };
        setFilters(newFilters);
        loadTasksFromBackend(formatDateForApi(selectedDate), newFilters);
    };

    /**
     * ✅ Перемикаємо статус виконання задачі (бекенд-оновлення)
     */
    const toggleTaskCompletion = (id) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        const newStatus = task.status === "done" ? "new" : "done";
        updateTaskField(id, "status", newStatus);
    };

    const totalExpected = tasks.reduce((sum, t) => sum + (t.expected_time || 0), 0);
    const totalActual = tasks.reduce((sum, t) => sum + (t.actual_time || 0), 0);

    // ✅ Масив доступних задач для автокомпліту (поки статичний)
    const allAvailableTasks = [
        { id: 1001, title: "Перевірити звіт по фінансах" },
        { id: 1002, title: "Підготувати презентацію" },
        { id: 1003, title: "Зустріч з клієнтом" },
    ];

    // ✅ Додавання задачі між існуючими (поки тільки локально)
    const handleAddTask = (task, position) => {
        let updated = [...tasks];
        if (task.isNew) {
            const newTask = {
                id: Date.now(),
                title: task.title,
                status: "new",
                dueDate: selectedDate,
                expected_time: 0,
                actual_time: 0,
                comments: [],
            };
            updated.splice(position, 0, newTask);
        } else {
            updated.splice(position, 0, {
                ...task,
                expected_time: 0,
                actual_time: 0,
            });
        }
        setTasks(updated);
    };

    const formattedDate = selectedDate.toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Layout>
            <div className="page-header">
                <div className="page-header-title">
                    <h1>Мої задачі на {formattedDate}</h1>
                    {filters.assigned_to && (
                        <span className="page-header-assignee">
                            Виконавець: {filters.assigned_to}
                        </span>
                    )}
                </div>
                <div className="page-header-actions">
                    <button
                        className="btn-add"
                        onClick={() =>
                            addRowRef.current?.scrollIntoView({
                                behavior: "smooth",
                            })
                        }
                    >
                        Додати задачу
                    </button>
                    <button className="btn-move">
                        Перенести вибрані на іншу дату
                    </button>
                </div>
            </div>

            {/* ✅ Фільтри задач */}
            <TaskFilters
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onPrevDay={goPrevDay}
                onNextDay={goNextDay}
                onTypeFilterChange={handleTypeFilterChange}
                onCreatorFilterChange={handleAssigneeFilterChange}
                onSortChange={handleSortChange}
            />

            {loading && <p>Завантаження задач...</p>}

            <div className="tasks-table">
                {!loading && tasks.length === 0 && <p>На цю дату немає задач</p>}

                {tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                        <div className="task-with-add">
                            <TaskItem
                                task={task}
                                expandedTask={expandedTask}
                                onToggleExpand={setExpandedTask}
                                onToggleComplete={toggleTaskCompletion}
                                onUpdateField={(id, field, value) =>
                                    updateTaskField(id, field, value)
                                }
                                onDeleteTask={deleteTask}
                            />

                            {/* Іконка + в рядку */}
                            <AddTaskRow
                                taskOptions={allAvailableTasks}
                                isOpen={openAddRow === task.id}
                                onToggleOpen={(id) =>
                                    setOpenAddRow(id ? task.id : null)
                                }
                                onAddTask={(newTask) =>
                                    handleAddTask(newTask, index + 1)
                                }
                            />
                        </div>
                    </React.Fragment>
                ))}

                {/* ✅ Внизу після всіх задач завжди відкритий блок додавання */}
                <div ref={addRowRef}>
                    <AddTaskRow
                        taskOptions={allAvailableTasks}
                        collapsed={false}
                        onAddTask={(newTask) =>
                            handleAddTask(newTask, tasks.length)
                        }
                    />
                </div>
            </div>

            {/* ✅ Сумарний час */}
            <div className="tasks-summary">
                <p>
                    <b>Сумарний очікуваний час:</b>{" "}
                    {formatMinutesToHours(totalExpected)}
                </p>
                <p>
                    <b>Сумарний фактичний час:</b>{" "}
                    {formatMinutesToHours(totalActual)}
                </p>
            </div>
        </Layout>
    );
}
