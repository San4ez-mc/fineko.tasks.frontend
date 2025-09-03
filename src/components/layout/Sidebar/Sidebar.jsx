import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import {
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    FiMenu,
    FiBarChart2,
    FiCheckSquare,
    FiGrid,
    FiSend,
    FiChevronDown,
    FiBook,
    FiExternalLink,
    FiUsers,
} from "react-icons/fi";
import CheckToggle from "../../ui/CheckToggle";
import api from "../../../services/api";
import { useCompany } from "../../../context/CompanyContext";

export default function Sidebar({
    isOpen,
    onToggle,
    resultsCount = 0,
    telegramCount = 0,
}) {
    const [isTasksOpen, setIsTasksOpen] = useState(true);
    const location = useLocation();
    const tasksActive =
        location.pathname.startsWith("/results") ||
        location.pathname.startsWith("/tasks");
    const { activeCompany } = useCompany();

    const handleNavClick = () => {
        if (isOpen) {
            onToggle();
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
            <div className="sidebar-content">
                {/* Верхня панель з кнопкою */}
                <div className="sidebar-top">
                    <button className="sidebar-toggle" onClick={onToggle}>
                        <FiMenu size={22} />
                    </button>

                    {/* Логотип тільки коли меню відкрите */}
                    {isOpen && (
                        <div className="sidebar-logo">
                            <img
                                src="https://app.fineko.space//img/logo_.png"
                                alt="Logo"
                            />
                        </div>
                    )}
                </div>

                {/* Пункти меню */}
                <nav>
                    <ul>
                        <li className={tasksActive ? "active" : ""}>
                            <button
                                className="menu-link"
                                onClick={() => setIsTasksOpen(!isTasksOpen)}
                                aria-expanded={isTasksOpen}
                            >
                                <FiCheckSquare className="menu-icon" />
                                {isOpen && (
                                    <>
                                        <span className="menu-text">Задачі</span>
                                        <FiChevronDown
                                            className={`submenu-arrow ${
                                                isTasksOpen ? "open" : ""
                                            }`}
                                        />
                                    </>
                                )}
                            </button>
                            {isOpen && isTasksOpen && (
                                <ul className="submenu">
                                    <li>
                                        <NavLink
                                            to="/results"
                                            className={({ isActive }) =>
                                                `${isActive ? "active" : ""} nav-subitem`
                                            }
                                            onClick={handleNavClick}
                                        >
                                            <FiBarChart2 className="submenu-icon" />
                                            <span className="menu-text">
                                                Результати
                                            </span>
                                            <span className="badge menu-badge">{resultsCount}</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/tasks"
                                            className={({ isActive }) =>
                                                `${isActive ? "active" : ""} nav-subitem`
                                            }
                                            onClick={handleNavClick}
                                        >
                                            <FiCheckSquare className="submenu-icon" />
                                            <span className="menu-text">
                                                Щоденні задачі
                                            </span>
                                        </NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <NavLink
                                to="/templates"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                                onClick={handleNavClick}
                            >
                                <FiGrid className="menu-icon" />
                                {isOpen && (
                                    <span className="menu-text">
                                        Шаблони
                                    </span>
                                )}
                            </NavLink>
                        </li>
                        <li className="sidebar-divider" aria-hidden="true"></li>
                        <li>
                            <NavLink
                                to="/business-processes"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                                onClick={handleNavClick}
                            >
                                <span className="menu-icon">🧩</span>
                                {isOpen && (
                                    <span className="menu-text">
                                        Бізнес процеси
                                    </span>
                                )}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/org"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                                onClick={handleNavClick}
                            >
                                <FiGrid className="menu-icon" />
                                {isOpen && (
                                    <span className="menu-text">
                                        Орг. структура
                                    </span>
                                )}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/company"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                                onClick={handleNavClick}
                            >
                                <FiUsers className="menu-icon" />
                                {isOpen && (
                                    <span className="menu-text">
                                        Компанія
                                    </span>
                                )}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/instructions"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                                onClick={handleNavClick}
                            >
                                <FiBook className="menu-icon" />
                                {isOpen && (
                                    <span className="menu-text">
                                        Інструкції
                                    </span>
                                )}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/telegram-group"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                                onClick={handleNavClick}
                            >
                                <FiSend className="menu-icon" />
                                {isOpen && (
                                    <>
                                        <span className="menu-text">
                                            Телеграм
                                        </span>
                                        <span className="badge menu-badge">
                                            {telegramCount}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="active-company">
                {activeCompany?.name || "Компанія не вибрана"}
            </div>
        </aside>
    );
}

export function RightSidebar() {
    const navigate = useNavigate();
    const mapType = (raw) => {
        switch (raw) {
            case "важлива термінова":
                return "critical";
            case "важлива нетермінова":
                return "important";
            default:
                return "other";
        }
    };

    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        api
            .get(`/task/filter?date=${today}`)
            .then((res) => {
                const backendTasks = res.data?.tasks || [];
                const mapped = backendTasks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    type: mapType(t.type),
                    planned: Number(t.expected_time || 0),
                    status: t.status || "new",
                    timer: Number(t.actual_time || 0),
                }));
                setTasks(mapped);
            })
            .catch((err) =>
                console.error("Помилка завантаження задач:", err)
            );
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTasks((prev) =>
                prev.map((t) =>
                    t.status === "in_progress"
                        ? { ...t, timer: (t.timer || 0) + 1 }
                        : t
                )
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const t = e.detail;
            setTasks((prev) => [
                ...prev,
                {
                    id: t.id,
                    title: t.title,
                    type: mapType(t.type),
                    planned: t.expected_time,
                    status: t.status,
                    timer: Number(t.actual_time || 0),
                },
            ]);
        };
        window.addEventListener("today-task-added", handler);
        return () => window.removeEventListener("today-task-added", handler);
    }, []);

    const toggleComplete = async (id) => {
        const current = tasks.find((t) => t.id === id);
        const newStatus = current.status === "done" ? "new" : "done";
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, status: newStatus } : t
            )
        );
        try {
            await api.patch(
                `/task/update-field?id=${id}`,
                { field: "status", value: newStatus }
            );
        } catch (e) {
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, status: current.status } : t
                )
            );
        }
    };

    const priority = (type) => {
        if (type === "critical") return 0;
        if (type === "important") return 1;
        return 2;
    };

    const sorted = [...tasks].sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (b.status === "done" && a.status !== "done") return -1;
        return priority(a.type) - priority(b.type);
    });

    const filtered = sorted.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPlanned = filtered.reduce(
        (sum, t) => sum + (t.planned || 0),
        0
    );

    const formatMinutes = (mins) => {
        const h = Math.floor(mins / 60)
            .toString()
            .padStart(2, "0");
        const m = (mins % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    };

    const formatSeconds = (secs) => {
        const m = Math.floor(secs / 60)
            .toString()
            .padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <aside className="right-sidebar">
            <div className="right-sidebar-content">
                <input
                    type="text"
                    className="task-filter"
                    placeholder="Пошук..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {filtered.map((task) => (
                    <div
                        key={task.id}
                        className={`today-task ${
                            task.status === "done" ? "completed" : ""
                        }`}
                    >
                        <CheckToggle
                            checked={task.status === "done"}
                            onChange={() => toggleComplete(task.id)}
                        />
                        <button
                            className="task-title-btn"
                            onClick={() => navigate("/tasks")}
                        >
                            {task.title}
                        </button>
                        {task.status === "in_progress" && (
                            <span className="task-timer">
                                {formatSeconds(task.timer || 0)}
                            </span>
                        )}
                        <span
                            className={`task-type-badge ${
                                task.type === "critical"
                                    ? "critical"
                                    : task.type === "important"
                                    ? "important"
                                    : "other"
                            }`}
                        >
                            {task.type}
                        </span>
                        <span className="task-planned">
                            {formatMinutes(task.planned || 0)}
                        </span>
                        <button
                            className="task-open-btn"
                            onClick={() => navigate("/tasks")}
                        >
                            <FiExternalLink />
                        </button>
                    </div>
                ))}
            </div>
            <div className="right-sidebar-summary">
                Плановано: {formatMinutes(totalPlanned)}
            </div>
        </aside>
    );
}
