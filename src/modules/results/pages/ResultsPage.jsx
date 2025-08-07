import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import "../../tasks/components/TaskItem.css";
import "../../tasks/components/TaskFilters.css";

// --- ResultFilters ---
function ResultFilters({ filters, onChange, search, onSearchChange }) {
    return (
        <div className="task-filters-wrapper">
            <div className="filters-row">
                <input
                    className="filter-select"
                    type="text"
                    placeholder="Пошук по назві/опису"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    style={{ minWidth: 200 }}
                />
                <input
                    className="filter-select"
                    type="date"
                    value={filters.deadline || ""}
                    onChange={e => onChange({ ...filters, deadline: e.target.value })}
                />
                <select
                    className="filter-select"
                    value={filters.creator || ""}
                    onChange={e => onChange({ ...filters, creator: e.target.value })}
                >
                    <option value="">Всі автори</option>
                    <option value="1">User 1</option>
                    <option value="2">User 2</option>
                </select>
                <select
                    className="filter-select"
                    value={filters.sort || ""}
                    onChange={e => onChange({ ...filters, sort: e.target.value })}
                >
                    <option value="">Без сортування</option>
                    <option value="asc">За типом ↑</option>
                    <option value="desc">За типом ↓</option>
                </select>
            </div>
        </div>
    );
}

// --- ResultItem ---
function ResultItem({ result, expanded, onToggleExpand, onCreateTask, onToggleComplete }) {
    return (
        <div className={`task-card ${result.isCompleted ? "task-done" : ""}`}>
            <div className="task-header">
                <button
                    className={`task-complete-btn ${result.isCompleted ? "completed" : ""}`}
                    style={{ background: "none" }}
                    onClick={() => onToggleComplete(result.id)}
                >
                    <span style={{ fontSize: 20 }}>✔</span>
                </button>
                <div className="task-title small-font task-title-center" style={{ flex: 1, textDecoration: result.isCompleted ? "line-through" : "none" }}>
                    {result.title}
                </div>
                <div className="task-right-meta">
                    {result.deadline && (
                        <span className="task-due-date">До {result.deadline}</span>
                    )}
                    <button className="toggle-description" onClick={() => onToggleExpand(result.id)}>
                        {expanded ? "▲" : "▼"}
                    </button>
                </div>
            </div>
            {expanded && (
                <div className="task-details">
                    <div style={{ marginBottom: 8, color: "#555" }}>{result.description}</div>
                    <div style={{ marginBottom: 8, color: "#888" }}><b>Очікуваний результат:</b> {result.expected_result}</div>
                    {/* Підрезультати (підготовка) */}
                    {/* <div>Subresults тут...</div> */}
                    <button className="task-timer-btn" style={{ marginRight: 10 }} onClick={() => onCreateTask(result)}>
                        Створити задачу з результату
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ deadline: "", creator: "", sort: "" });
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [creatingTask, setCreatingTask] = useState(null);

    // Локальний статус завершення (тимчасово, поки немає на бекенді)
    const [completedIds, setCompletedIds] = useState([]);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.deadline) params.append("date", filters.deadline);
        if (filters.creator) params.append("creator", filters.creator);
        if (filters.sort) params.append("sort", filters.sort);
        axios
            .get(`${API_BASE_URL}/result/index?${params.toString()}`)
            .then((res) => {
                setResults(res.data?.results || []);
                setLoading(false);
            })
            .catch((err) => {
                setError("Помилка завантаження результатів");
                setLoading(false);
            });
    }, [filters]);

    // Пошук по назві/опису
    const filteredResults = results
        .map(r => ({ ...r, isCompleted: completedIds.includes(r.id) }))
        .filter(r =>
        (!search ||
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase())
        )
        );

    // --- Дії ---
    const handleToggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };
    const handleCreateTask = (result) => {
        setCreatingTask(result);
        alert(`Відкрити форму створення задачі для результату: ${result.title}`);
    };
    const handleToggleComplete = (id) => {
        setCompletedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <Layout>
            <h2>Список результатів</h2>
            <ResultFilters
                filters={filters}
                onChange={setFilters}
                search={search}
                onSearchChange={setSearch}
            />
            {loading && <p>Завантаження результатів...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="tasks-table">
                {!loading && filteredResults.length === 0 && <p>Немає результатів</p>}
                {filteredResults.map((result) => (
                    <ResultItem
                        key={result.id}
                        result={result}
                        expanded={expandedId === result.id}
                        onToggleExpand={handleToggleExpand}
                        onCreateTask={handleCreateTask}
                        onToggleComplete={handleToggleComplete}
                    />
                ))}
            </div>
        </Layout>
    );
}

// --- Стилі Asana ---
// Для швидкого старту використовуйте TaskItem.css/TaskFilters.css, або додайте імпорт тут:
// import "../../tasks/components/TaskItem.css";
// import "../../tasks/components/TaskFilters.css";
