import React from "react";

export default function TelegramGroupList({
    groups = [],
    onSelect,
    onRemove,
    onRefreshAdmins,
}) {
    return (
        <table className="table telegram-group-list">
            <thead>
                <tr>
                    <th>Назва</th>
                    <th>Telegram ID</th>
                    <th>Дата підключення</th>
                    <th>Учасники</th>
                    <th>Статус</th>
                    <th>Дії</th>
                </tr>
            </thead>
            <tbody>
                {groups.map((g) => (
                    <tr
                        key={g.id}
                        onClick={() => onSelect && onSelect(g)}
                        className="telegram-group-list__row"
                    >
                        <td>{g.title}</td>
                        <td>{g.chat_id}</td>
                        <td>{g.linked_at}</td>
                        <td>{g.users_count || g.user_count || 0}</td>
                        <td>{g.is_active ? "активна" : "неактивна"}</td>
                        <td>
                            {onRefreshAdmins && (
                                <button
                                    className="btn small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRefreshAdmins(g.id);
                                    }}
                                >
                                    Оновити адмінів
                                </button>
                            )}
                            {onSelect && (
                                <button
                                    className="btn small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(g);
                                    }}
                                >
                                    Відкрити
                                </button>
                            )}
                            {onRemove && (
                                <button
                                    className="btn small danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(g.id);
                                    }}
                                >
                                    Відключити
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                {groups.length === 0 && (
                    <tr>
                        <td colSpan="6">Немає груп</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
