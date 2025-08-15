import React from "react";

export default function PendingGroupList({ groups = [] }) {
    if (!groups.length) {
        return <p>Немає запрошень</p>;
    }

    return (
        <ul>
            {groups.map((g) => (
                <li key={g.id || g.link || g.username}>
                    {g.title || g.name || g.username || g.id}
                </li>
            ))}
        </ul>
    );
}
