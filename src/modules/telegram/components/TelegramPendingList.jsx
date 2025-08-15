import React from "react";

export default function TelegramPendingList({ groups = [] }) {
    if (!groups.length) {
        return <p>Немає очікуючих груп</p>;
    }
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Назва</th>
                    <th>chat_id</th>
                    <th>Код</th>
                </tr>
            </thead>
            <tbody>
                {groups.map((g) => (
                    <tr key={g.id}>
                        <td>{g.title}</td>
                        <td>{g.chat_id}</td>
                        <td>{g.invite_code}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
