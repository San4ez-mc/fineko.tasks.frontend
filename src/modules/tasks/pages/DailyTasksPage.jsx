import React, { useState, useEffect, useRef } from "react";
import Layout from "../../../components/layout/Layout";
import "./DailyTasksPage.css";
import "../../templates/components/TemplatesFilters.css";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { formatMinutesToHours } from "../../../utils/timeFormatter";
import { FiCalendar } from "react-icons/fi";

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
    assignee: "any",
  });
  const [timers, setTimers] = useState({});
  const [activeTimerId, setActiveTimerId] = useState(null);
  const dateInputRef = useRef(null);

  const formatDateForApi = (date) => date.toISOString().split("T")[0];

  const loadTasks = (dateStr, flt = {}) => {
    const params = new URLSearchParams();
    params.append("date", dateStr);
    Object.entries(flt).forEach(([key, value]) => {
      if (value && value !== "any") params.append(key, value);
    });

    axios
      .get(`${API_BASE_URL}/task/filter?${params.toString()}`)
      .then((res) => {
        const backendTasks = res.data?.tasks || [];
        const mapped = backendTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.planned_date,
          type: t.type || "neutral",
          expected_time: Number(t.expected_time || 0),
          description: t.expected_result || "",
          expected_result: t.expected_result || "",
          actual_result: t.result || "",
        }));
        setTasks(mapped);
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
      assignee: "any",
    };
    setFilters(base);
    loadTasks(formatDateForApi(selectedDate), base);
  };

  const toggleTaskCompletion = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "new" : "done";
    axios
      .patch(`${API_BASE_URL}/task/update-field?id=${id}`, {
        field: "status",
        value: newStatus,
      })
      .catch(() => {});
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
    axios
      .patch(`${API_BASE_URL}/task/update-field?id=${id}`, { field, value })
      .then(() => {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        );
      })
      .catch(() => {});
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

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="tasks-title">
            <button className="btn ghost icon" onClick={goPrevDay}>
              ←
            </button>
            Мої задачі на
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
          {filters.assignee !== "any" && filters.assignee !== "" && (
            <span className="muted">Виконавець: {filters.assignee}</span>
          )}
        </div>
        <div className="page-header-actions">
          <button className="btn primary">Додати задачу</button>
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

            <label className="tf-field">
              <span>Виконавець</span>
              <select
                value={filters.assignee}
                onChange={(e) =>
                  handleFilterChange({ assignee: e.target.value })
                }
              >
                <option value="any">Будь‑хто</option>
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

      <div className="tasks-list">
        {tasks.map((task) => (
          <React.Fragment key={task.id}>
            <div
              className={`task-row ${
                task.status === "done" ? "is-completed" : ""
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
                {task.type && <span className={`badge ${task.type}`}></span>}
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
                  <span className="k">Опис</span>
                  <textarea
                    className="input"
                    defaultValue={task.description}
                    onBlur={(e) =>
                      updateTaskField(task.id, "description", e.target.value)
                    }
                  />
                </label>

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
                  <span className="k">Фактичний результат</span>
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

