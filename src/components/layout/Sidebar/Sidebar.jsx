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
    FiGitBranch,
} from "react-icons/fi";
import CheckToggle from "../../ui/CheckToggle";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useCompany } from "../../../context/CompanyContext";

export default function Sidebar({
    isOpen,
    onToggle,
    resultsCount = 0,
    telegramCount = 0,
}) {
    const [isResultsOpen, setIsResultsOpen] = useState(true);
    const location = useLocation();
    const resultsActive = location.pathname.startsWith("/results");
    const { activeCompany } = useCompany();

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
                        <li className={resultsActive ? "active" : ""}>
                            <button
                                className="menu-link"
                                onClick={() => setIsResultsOpen(!isResultsOpen)}
                                aria-expanded={isResultsOpen}
                            >
                                <FiBarChart2 className="menu-icon" />
                                {isOpen && (
                                    <>
                                        <span className="menu-text">Результати</span>
                                        <span className="badge menu-badge">{resultsCount}</span>
                                        <FiChevronDown
                                            className={`submenu-arrow ${
                                                isResultsOpen ? "open" : ""
                                            }`}
                                        />
                                    </>
                                )}
                            </button>
                            {isOpen && isResultsOpen && (
                                <ul className="submenu">
                                    <li>
                                        <NavLink
                                            to="/results"
                                            className={({ isActive }) =>
                                                `${isActive ? "active" : ""} nav-subitem`
                                            }
                                        >
                                            <span className="menu-text">
                                                Результати
                                            </span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/templates"
                                            className={({ isActive }) =>
                                                `${isActive ? "active" : ""} nav-subitem`
                                            }
                                        >
                                            <span className="menu-text">
                                                Шаблони
                                            </span>
                                        </NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <NavLink
                                to="/tasks"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                <FiCheckSquare className="menu-icon" />
                                {isOpen && (
                                    <span className="menu-text">
                                        Щоденні задачі
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
                            >
                                <FiGitBranch className="menu-icon" />
                                {isOpen && (
                                    <span className="menu-text">
                                        Бізнес-процеси
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
                                to="/instructions"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
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
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: "Перевірити звіт",
            type: "critical",
            planned: 90,
            status: "new",
        },
        {
            id: 2,
            title: "Підготувати презентацію",
            type: "important",
            planned: 60,
            status: "in_progress",
            timer: 0,
        },
        {
            id: 3,
            title: "Зустріч з клієнтом",
            type: "other",
            planned: 30,
            status: "done",
        },
    ]);
    const [search, setSearch] = useState("");

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
                    type: t.type,
                    planned: t.expected_time,
                    status: t.status,
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
            await axios.patch(
                `${API_BASE_URL}/task/update-field?id=${id}`,
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
