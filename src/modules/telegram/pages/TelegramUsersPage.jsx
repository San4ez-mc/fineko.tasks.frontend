import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { useCompany } from "../../../context/CompanyContext";
import { fetchUsers, updateUser } from "../api/telegram";
import api from "../../../services/api";
import "./TelegramGroupPage.css";

export default function TelegramUsersPage() {
    const { user } = useAuth();
    const { activeCompany, setActiveCompany } = useCompany();

    const [companyId, setCompanyId] = useState(activeCompany?.id || "");
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);

    const companies = user?.companies || [];

    useEffect(() => {
        setCompanyId(activeCompany?.id || "");
    }, [activeCompany]);

    useEffect(() => {
        if (!companyId) return;
        loadUsers(companyId);
        loadEmployees(companyId);
    }, [companyId]);

    const loadUsers = async (cid) => {
        try {
            const data = await fetchUsers(cid);
            setUsers(
                data.map((u) => ({
                    ...u,
                    synonymsInput: (u.synonyms || []).join(", "),
                }))
            );
        } catch (e) {
            console.error("Помилка завантаження користувачів", e);
        }
    };

    const loadEmployees = async (cid) => {
        try {
            const { data } = await api.get(`/employees?company_id=${cid}`);
            setEmployees(data || []);
        } catch (e) {
            console.error("Помилка завантаження співробітників", e);
        }
    };

    const onCompanyChange = (id) => {
        setCompanyId(id);
        const company = companies.find((c) => String(c.id) === id);
        setActiveCompany(company || null);
    };

    const updateEmployee = async (id, employee_id) => {
        try {
            await updateUser(id, { employee_id });
            setUsers((prev) =>
                prev.map((u) => (u.id === id ? { ...u, employee_id } : u))
            );
        } catch (e) {
            console.error("Помилка оновлення працівника", e);
        }
    };

    const handleSynonymsChange = (id, value) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, synonymsInput: value } : u))
        );
    };

    const saveSynonyms = async (id, value) => {
        const synonyms = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        try {
            await updateUser(id, { synonyms });
            setUsers((prev) =>
                prev.map((u) => (u.id === id ? { ...u, synonyms } : u))
            );
        } catch (e) {
            console.error("Помилка збереження синонімів", e);
        }
    };

    return (
        <Layout>
            <div className="telegram-page">
                <h2>Користувачі Telegram</h2>
                <div className="link-form">
                    <select value={companyId} onChange={(e) => onCompanyChange(e.target.value)} required>
                        <option value="">Оберіть компанію</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                {companyId && (
                    <section>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>display_name</th>
                                    <th>@username</th>
                                    <th>telegram_user_id</th>
                                    <th>employee</th>
                                    <th>synonyms</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.display_name}</td>
                                        <td>{u.username ? `@${u.username}` : ""}</td>
                                        <td>{u.telegram_user_id}</td>
                                        <td>
                                            <select
                                                value={u.employee_id || ""}
                                                onChange={(e) =>
                                                    updateEmployee(
                                                        u.id,
                                                        e.target.value || null
                                                    )
                                                }
                                            >
                                                <option value="">—</option>
                                                {employees.map((emp) => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.name || emp.display_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={u.synonymsInput || ""}
                                                onChange={(e) =>
                                                    handleSynonymsChange(
                                                        u.id,
                                                        e.target.value
                                                    )
                                                }
                                                onBlur={(e) =>
                                                    saveSynonyms(u.id, e.target.value)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5">Немає користувачів</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </section>
                )}
            </div>
        </Layout>
    );
}
