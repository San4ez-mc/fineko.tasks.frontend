import React, { useEffect, useState } from "react";
import { fetchUsers, updateGroupMembers } from "../api/telegram";
import { useCompany } from "../../../context/CompanyContext";

export default function TelegramGroupDetails({ group }) {
    const { activeCompany } = useCompany();
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState({});
    const [results, setResults] = useState({});

    useEffect(() => {
        if (!group?.id || !activeCompany?.id) return;
        loadMembers(group.id, activeCompany.id);
    }, [group, activeCompany]);

    const loadMembers = async (groupId, companyId) => {
        try {
            const data = await fetchUsers(companyId, { group_id: groupId });
            setMembers(data);
        } catch (e) {
            console.error("Помилка завантаження учасників", e);
        }
    };

    const handleSearch = async (memberId, value) => {
        setSearch((prev) => ({ ...prev, [memberId]: value }));
        if (!value || value.length < 2) {
            setResults((prev) => ({ ...prev, [memberId]: [] }));
            return;
        }
        try {
            const data = await fetchUsers(activeCompany?.id, { q: value });
            setResults((prev) => ({ ...prev, [memberId]: data }));
        } catch (e) {
            console.error("Помилка пошуку працівників", e);
        }
    };

    const linkMember = async (memberId, employee) => {
        try {
            await updateGroupMembers(group.id, {
                user_id: memberId,
                employee_id: employee.id,
            });
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === memberId
                        ? {
                              ...m,
                              employee_id: employee.id,
                              employee_name: employee.name || employee.display_name,
                          }
                        : m
                )
            );
            setSearch((prev) => ({ ...prev, [memberId]: "" }));
            setResults((prev) => ({ ...prev, [memberId]: [] }));
        } catch (e) {
            console.error("Помилка прив'язки", e);
        }
    };

    const removeMember = async (memberId) => {
        try {
            await updateGroupMembers(group.id, { user_id: memberId, remove: true });
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } catch (e) {
            console.error("Помилка видалення", e);
        }
    };

    if (!group) return null;

    return (
        <div>
            <h3>Учасники групи: {group.title}</h3>
            <ul>
                {members.map((m) => (
                    <li key={m.id} style={{ marginBottom: "1rem" }}>
                        <div>
                            {m.display_name || m.username}
                            {m.employee_id && m.employee_name && (
                                <span> — {m.employee_name}</span>
                            )}
                        </div>
                        {!m.employee_id && (
                            <div>
                                <input
                                    type="text"
                                    value={search[m.id] || ""}
                                    onChange={(e) => handleSearch(m.id, e.target.value)}
                                    placeholder="Пошук працівника"
                                />
                                {results[m.id] && results[m.id].length > 0 && (
                                    <ul>
                                        {results[m.id].map((emp) => (
                                            <li key={emp.id}>
                                                <button
                                                    className="btn"
                                                    onClick={() => linkMember(m.id, emp)}
                                                >
                                                    {emp.name || emp.display_name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        <button className="btn" onClick={() => removeMember(m.id)}>
                            Видалити
                        </button>
                    </li>
                ))}
                {members.length === 0 && <li>Учасників немає</li>}
            </ul>
        </div>
    );
}

