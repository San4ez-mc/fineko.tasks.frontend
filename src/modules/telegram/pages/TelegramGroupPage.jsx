import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { useCompany } from "../../../context/CompanyContext";
import api from "../../../services/api";
import "./TelegramGroupPage.css";

export default function TelegramGroupPage() {
    const { user } = useAuth();
    const { activeCompany, setActiveCompany } = useCompany();

    const [inviteCode, setInviteCode] = useState("");
    const [companyId, setCompanyId] = useState(activeCompany?.id || "");
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);

    const companies = user?.companies || [];

    useEffect(() => {
        setCompanyId(activeCompany?.id || "");
    }, [activeCompany]);

    useEffect(() => {
        if (!companyId) return;
        loadGroups(companyId);
        loadUsers(companyId);
        loadEmployees(companyId);
    }, [companyId]);

    const loadGroups = async (cid) => {
        try {
            const { data } = await api.get(`/telegram/groups?company_id=${cid}`);
            setGroups(data || []);
        } catch (e) {
            console.error("Помилка завантаження груп", e);
        }
    };

    const loadUsers = async (cid) => {
        try {
            const { data } = await api.get(`/telegram/users?company_id=${cid}`);
            const items = data?.items || data || [];
            setUsers(
                items.map((u) => ({
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

    const handleLink = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post("/telegram/link/by-code", {
                invite_code: inviteCode,
                company_id: Number(companyId),
            });
            window.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        type: "success",
                        message: `Групу прив'язано: ${data.title}`,
                    },
                })
            );
            setInviteCode("");
            loadGroups(companyId);
        } catch (err) {
            console.error("Помилка прив'язки групи", err);
        }
    };

    const refreshAdmins = async (id) => {
        try {
            await api.post(`/telegram/groups/${id}/refresh-admins`);
            window.dispatchEvent(
                new CustomEvent("toast", {
                    detail: { type: "success", message: "Адмінів оновлено" },
                })
            );
        } catch (e) {
            console.error("Помилка оновлення адмінів", e);
        }
    };

    const updateEmployee = async (id, employee_id) => {
        try {
            await api.put(`/telegram/users/${id}`, { employee_id });
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === id ? { ...u, employee_id } : u
                )
            );
        } catch (e) {
            console.error("Помилка оновлення працівника", e);
        }
    };

    const handleSynonymsChange = (id, value) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === id ? { ...u, synonymsInput: value } : u
            )
        );
    };

    const saveSynonyms = async (id, value) => {
        const synonyms = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        try {
            await api.put(`/telegram/users/${id}`, { synonyms });
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === id ? { ...u, synonyms } : u
                )
            );
        } catch (e) {
            console.error("Помилка збереження синонімів", e);
        }
    };

    const onCompanyChange = (e) => {
        const id = e.target.value;
        setCompanyId(id);
        const company = companies.find((c) => String(c.id) === id);
        setActiveCompany(company || null);
    };

    return (
        <Layout>
            <div className="telegram-page">
                <h2>Telegram</h2>

                <section>
                    <h3>Прив'язка за кодом</h3>
                    <form onSubmit={handleLink} className="link-form">
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) =>
                                setInviteCode(e.target.value.toUpperCase())
                            }
                            placeholder="Код запрошення"
                            required
                        />
                        <select
                            value={companyId}
                            onChange={onCompanyChange}
                            required
                        >
                            <option value="">Оберіть компанію</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <button className="btn primary" type="submit">
                            Прив'язати
                        </button>
                    </form>
                </section>

                {companyId && (
                    <>
                        <section>
                            <h3>Групи компанії</h3>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Назва</th>
                                        <th>chat_id</th>
                                        <th>Статус</th>
                                        <th>Дата прив'язки</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map((g) => (
                                        <tr key={g.id}>
                                            <td>{g.title}</td>
                                            <td>{g.chat_id}</td>
                                            <td>{g.is_active ? "активна" : ""}</td>
                                            <td>{g.linked_at}</td>
                                            <td>
                                                <button
                                                    className="btn"
                                                    onClick={() =>
                                                        refreshAdmins(g.id)
                                                    }
                                                >
                                                    Оновити адмінів
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {groups.length === 0 && (
                                        <tr>
                                            <td colSpan="5">Немає груп</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        <section>
                            <h3>Користувачі Telegram (мапінг)</h3>
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
                                                        <option
                                                            key={emp.id}
                                                            value={emp.id}
                                                        >
                                                            {emp.name ||
                                                                emp.display_name}
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
                                                        saveSynonyms(
                                                            u.id,
                                                            e.target.value
                                                        )
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
                    </>
                )}
            </div>
        </Layout>
    );
}

