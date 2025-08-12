import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import "./BpListPage.css";

export default function BpListPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const processes = [
        {
            id: 1,
            name: "Онбординг співробітника",
            description: "Послідовність дій для прийому нового працівника",
            createdAt: "2024-08-01",
            updatedAt: "2024-09-15",
            elements: 12,
        },
        {
            id: 2,
            name: "Закупівлі",
            description: "Процес придбання обладнання та матеріалів",
            createdAt: "2024-07-10",
            updatedAt: "2024-08-20",
            elements: 8,
        },
    ];

    const filtered = processes.filter((p) => {
        const q = query.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    });

    const onEdit = (id) => {
        navigate(`/bp/${id}`);
    };

    const onClone = (id) => {
        window.alert(`Клонувати процес ${id}`);
    };

    const onDelete = (id) => {
        window.alert(`Видалити процес ${id}`);
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Бізнес-процеси</h1>
                    <input
                        type="search"
                        className="input"
                        placeholder="Пошук..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="page-header-actions">
                    <button
                        className="btn primary"
                        onClick={() => navigate("/bp/new")}
                    >
                        Додати процес
                    </button>
                </div>
            </div>

            <table className="table processes-table">
                <thead>
                    <tr>
                        <th>Назва процесу</th>
                        <th>Короткий опис</th>
                        <th>Дата створення</th>
                        <th>Дата останнього редагування</th>
                        <th style={{ textAlign: "right" }}>Кількість елементів</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((p) => (
                        <tr key={p.id} className="row-hover">
                            <td>
                                <button
                                    className="link-btn"
                                    onClick={() => onEdit(p.id)}
                                >
                                    {p.name}
                                </button>
                            </td>
                            <td>{p.description}</td>
                            <td>{p.createdAt}</td>
                            <td>{p.updatedAt}</td>
                            <td style={{ textAlign: "right" }}>{p.elements}</td>
                            <td className="actions">
                                <button className="btn" onClick={() => onEdit(p.id)}>
                                    Редагувати
                                </button>
                                <button className="btn" onClick={() => onClone(p.id)}>
                                    Клонувати
                                </button>
                                <button className="btn" onClick={() => onDelete(p.id)}>
                                    Видалити
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan="6">Нічого не знайдено</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    );
}

