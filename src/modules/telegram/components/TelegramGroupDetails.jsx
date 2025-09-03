import React, { useEffect, useState } from "react";
import {
    fetchGroup,
    updateGroup,
    updateGroupMembers,
} from "../api/telegram";
import "./TelegramGroupDetails.css";

export default function TelegramGroupDetails({ groupId, onClose }) {
    const [group, setGroup] = useState(null);
    const [name, setName] = useState("");

    useEffect(() => {
        if (!groupId) return;
        let ignore = false;
        const load = async () => {
            try {
                const data = await fetchGroup(groupId);
                if (!ignore) {
                    setGroup(data);
                    setName(data.title || "");
                }
            } catch (e) {
                console.error("Помилка завантаження групи", e);
            }
        };
        load();
        return () => {
            ignore = true;
        };
    }, [groupId]);

    const saveName = async () => {
        try {
            await updateGroup(groupId, { title: name });
            setGroup((prev) => ({ ...prev, title: name }));
        } catch (e) {
            console.error("Помилка оновлення назви", e);
        }
    };

    const changeRole = async (memberId, role) => {
        try {
            await updateGroupMembers(groupId, [{ id: memberId, role }]);
            setGroup((prev) => ({
                ...prev,
                members: prev.members.map((m) =>
                    (m.id === memberId || m.user_id === memberId)
                        ? { ...m, role }
                        : m
                ),
            }));
        } catch (e) {
            console.error("Помилка оновлення ролі", e);
        }
    };

    if (!group) return null;

    const members = group.members || group.users || [];

    return (
        <div className="tg-group-details">
            <div className="tg-group-details__header">
                <h3>Деталі групи</h3>
                {onClose && (
                    <button className="btn small" onClick={onClose}>
                        Закрити
                    </button>
                )}
            </div>
            <div className="tg-group-details__field">
                <label>Назва</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={saveName}
                />
            </div>
            <div className="tg-group-details__field">
                <label>Telegram ID</label>
                <span>{group.chat_id}</span>
            </div>
            <div className="tg-group-details__members">
                <h4>Учасники</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Нік</th>
                            <th>Ім'я</th>
                            <th>Роль</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => {
                            const id = m.id || m.user_id || m.telegram_user_id;
                            return (
                                <tr key={id}>
                                    <td>{m.username ? `@${m.username}` : ""}</td>
                                    <td>{m.name || m.first_name || m.display_name}</td>
                                    <td>
                                        <select
                                            value={m.role || "member"}
                                            onChange={(e) => changeRole(id, e.target.value)}
                                        >
                                            <option value="member">Учасник</option>
                                            <option value="manager">Постановник</option>
                                            <option value="admin">Адмін</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                        {members.length === 0 && (
                            <tr>
                                <td colSpan="3">Немає учасників</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {group.stats && (
                <div className="tg-group-details__stats">
                    <p>Задач створено: {group.stats.tasks}</p>
                    <p>Результатів створено: {group.stats.results}</p>
                </div>
            )}
        </div>
    );
}
