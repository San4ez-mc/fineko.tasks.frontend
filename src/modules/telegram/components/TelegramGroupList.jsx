import React from "react";
import { Link } from "react-router-dom";

export default function TelegramGroupList({ groups = [], onRefreshAdmins }) {
    return (
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
                        <td>
                            <Link to={`/telegram/groups/${g.id}`}>{g.title}</Link>
                        </td>
                        <td>{g.chat_id}</td>
                        <td>{g.is_active ? "активна" : ""}</td>
                        <td>{g.linked_at}</td>
                        <td>
                            {onRefreshAdmins && (
                                <button
                                    className="btn"
                                    onClick={() => onRefreshAdmins(g.id)}
                                >
                                    Оновити адмінів
                                </button>
                            )}
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
    );
}
